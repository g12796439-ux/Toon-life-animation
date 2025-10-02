import React, { useState, useEffect, useCallback } from 'react';

import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import Canvas from './components/Canvas';
import Timeline from './components/Timeline';
import Header from './components/Header';
import { Scene, UserProfile, Keyframe, SceneItem, SceneCharacter, TextItem, ScenePhoto, AudioClip, AnimationPreset } from './types';
import { CHARACTERS } from './constants';

// Helper to decode JWT payload. NOTE: This does not validate the signature.
const decodeJwt = (token: string): any => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to decode JWT", e);
        return null;
    }
};

const uuidv4 = () => {
    if (crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


const createInitialKeyframe = (): Keyframe => ({
  id: uuidv4(),
  characters: [],
  textItems: [],
  photos: [],
});

const createInitialScene = (): Scene => ({
  id: uuidv4(),
  background: '/assets/backgrounds/space-station.jpg',
  keyframes: [createInitialKeyframe()],
  audioClips: [],
  duration: 10,
});


const App: React.FC = () => {
    const [scene, setScene] = useState<Scene>(createInitialScene());
    const [user, setUser] = useState<UserProfile | null>(null);
    const [activeKeyframeIndex, setActiveKeyframeIndex] = useState(0);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [uploadedPhotos, setUploadedPhotos] = useState<{ id: string, name: string, url: string }[]>([]);
    
    // Undo/Redo state
    const [history, setHistory] = useState<Scene[]>([createInitialScene()]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const updateScene = useCallback((newScene: Scene, fromHistory: boolean = false) => {
        if (!fromHistory) {
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(newScene);
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        }
        setScene(newScene);
        // Clear selection when scene updates to avoid stale state
        setSelectedItemId(null);
    }, [history, historyIndex]);

    const handleUndo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            updateScene(history[newIndex], true);
        }
    };
    
    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            updateScene(history[newIndex], true);
        }
    };

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;
    
    const activeKeyframe = scene.keyframes[activeKeyframeIndex];
    const selectedItem = activeKeyframe ? 
        [...activeKeyframe.characters, ...activeKeyframe.textItems, ...activeKeyframe.photos].find(
            item => (item.instanceId || item.id) === selectedItemId
        ) || null : null;

    const handleGoogleLogin = useCallback((response: any) => {
        try {
            const decoded: UserProfile = decodeJwt(response.credential);
            if (decoded) {
                setUser(decoded);
                localStorage.setItem('userProfile', JSON.stringify(decoded));
            }
        } catch (error) {
            console.error("Error decoding JWT:", error);
        }
    }, []);

    useEffect(() => {
        window.handleGoogleLogin = handleGoogleLogin;
        const storedUser = localStorage.getItem('userProfile');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem('userProfile');
            }
        }
    }, [handleGoogleLogin]);

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('userProfile');
        if (window.google) {
            window.google.accounts.id.disableAutoSelect();
        }
    };
    
    const modifyActiveKeyframe = (modifier: (keyframe: Keyframe) => Keyframe) => {
        if (!activeKeyframe) return;
        const newKeyframe = modifier(activeKeyframe);
        const newKeyframes = [...scene.keyframes];
        newKeyframes[activeKeyframeIndex] = newKeyframe;
        updateScene({ ...scene, keyframes: newKeyframes });
    };

    const findMaxZIndex = (keyframe: Keyframe) => {
        const allItems = [...keyframe.characters, ...keyframe.textItems, ...keyframe.photos];
        return allItems.length > 0 ? Math.max(...allItems.map(i => i.zIndex)) : -1;
    };
    
    const addCharacterToKeyframe = (characterId: string) => {
        const charTemplate = CHARACTERS.find(c => c.id === characterId);
        if (!charTemplate) return;

        modifyActiveKeyframe(kf => {
            const newCharacter: SceneCharacter = {
                id: charTemplate.id,
                instanceId: uuidv4(),
                name: charTemplate.name,
                poses: charTemplate.poses,
                pose: Object.values(charTemplate.poses)[0],
                animations: charTemplate.animations,
                x: 50, y: 50, width: 150, height: 300,
                rotation: 0, scale: 1, zIndex: findMaxZIndex(kf) + 1, flipH: false,
            };
            return { ...kf, characters: [...kf.characters, newCharacter] };
        });
    };
    
    const addPhotoToKeyframe = (photoUrl: string) => {
        const photoTemplate = uploadedPhotos.find(p => p.url === photoUrl);
        if(!photoTemplate) return;
        
        modifyActiveKeyframe(kf => {
            const newPhoto: ScenePhoto = {
                id: photoTemplate.id,
                instanceId: uuidv4(),
                name: photoTemplate.name,
                url: photoTemplate.url,
                x: 50, y: 50, width: 200, height: 200,
                rotation: 0, scale: 1, zIndex: findMaxZIndex(kf) + 1, flipH: false,
            };
            return { ...kf, photos: [...kf.photos, newPhoto] };
        });
    };

    const handleItemUpdate = (id: string, updates: Partial<SceneCharacter & TextItem & ScenePhoto>) => {
        modifyActiveKeyframe(kf => {
            const mapItem = (item: any) => (item.instanceId || item.id) === id ? { ...item, ...updates } : item;
            return {
                ...kf,
                characters: kf.characters.map(mapItem),
                textItems: kf.textItems.map(mapItem),
                photos: kf.photos.map(mapItem),
            };
        });
    };

    const handleItemDelete = (id: string) => {
        modifyActiveKeyframe(kf => {
            const filterItem = (item: any) => (item.instanceId || item.id) !== id;
            return {
                ...kf,
                characters: kf.characters.filter(filterItem),
                textItems: kf.textItems.filter(filterItem),
                photos: kf.photos.filter(filterItem),
            };
        });
        setSelectedItemId(null);
    };
    
    const handleAddText = (text: string) => {
        modifyActiveKeyframe(kf => {
             const newTextItem: TextItem = {
                id: uuidv4(),
                instanceId: uuidv4(),
                text,
                x: 100, y: 100, width: 300, height: 100,
                rotation: 0, scale: 1, zIndex: findMaxZIndex(kf) + 1, flipH: false,
                color: '#FFFFFF', fontSize: 48, fontFamily: 'Arial'
            };
            return { ...kf, textItems: [...kf.textItems, newTextItem] };
        });
    };
    
    const handleAddScriptToScene = (script: string) => {
        const lines = script.split('\n').filter(line => line.trim() !== '');
        const dialogueLines = lines.map(line => {
            const parts = line.split(':');
            return parts.length > 1 ? parts.slice(1).join(':').trim() : line.trim();
        }).filter(dialogue => dialogue);
    
        if (dialogueLines.length === 0) return;
    
        modifyActiveKeyframe(kf => {
            let currentZIndex = findMaxZIndex(kf);
            const newTextItems: TextItem[] = dialogueLines.map((text, index) => {
                currentZIndex++;
                return {
                    id: uuidv4(),
                    instanceId: uuidv4(),
                    text,
                    x: 50 + index * 10,
                    y: 50 + index * 10,
                    width: 300,
                    height: 50,
                    rotation: 0,
                    scale: 1,
                    zIndex: currentZIndex,
                    flipH: false,
                    color: '#FFFFFF',
                    fontSize: 24,
                    fontFamily: 'Arial'
                };
            });
            return { ...kf, textItems: [...kf.textItems, ...newTextItems] };
        });
    };

    const handleAddKeyframe = () => {
        const newKeyframe = JSON.parse(JSON.stringify(activeKeyframe));
        newKeyframe.id = uuidv4();

        const newKeyframes = [...scene.keyframes];
        newKeyframes.splice(activeKeyframeIndex + 1, 0, newKeyframe);
        
        updateScene({ ...scene, keyframes: newKeyframes });
        setActiveKeyframeIndex(activeKeyframeIndex + 1);
    };
    
    const handleDeleteKeyframe = (index: number) => {
        if (scene.keyframes.length <= 1) return;

        const newKeyframes = scene.keyframes.filter((_, i) => i !== index);
        const newActiveIndex = Math.min(Math.max(0, activeKeyframeIndex), newKeyframes.length - 1);
        if (index <= activeKeyframeIndex && activeKeyframeIndex > 0) {
            setActiveKeyframeIndex(activeKeyframeIndex - 1);
        } else {
             setActiveKeyframeIndex(newActiveIndex);
        }

        updateScene({ ...scene, keyframes: newKeyframes });
    };

    const handleBackgroundSelect = (backgroundUrl: string) => {
        updateScene({ ...scene, background: backgroundUrl });
    };
    
    const handlePhotoUpload = (file: File) => {
        const newPhoto = {
            id: uuidv4(),
            name: file.name,
            url: URL.createObjectURL(file),
        };
        setUploadedPhotos(prev => [...prev, newPhoto]);
    };

    const handleAddAudioClip = (clip: Omit<AudioClip, 'id'>) => {
        const newClip = { ...clip, id: uuidv4() };
        updateScene({ ...scene, audioClips: [...scene.audioClips, newClip] });
    }
    
    const handleUpdateAudioClip = (id: string, updates: Partial<AudioClip>) => {
        const newClips = scene.audioClips.map(clip => clip.id === id ? { ...clip, ...updates } : clip);
        updateScene({ ...scene, audioClips: newClips });
    };

    const handleRemoveAudioClip = (id: string) => {
        const newClips = scene.audioClips.filter(clip => clip.id !== id);
        updateScene({ ...scene, audioClips: newClips });
    };

    const handleLayerChange = (id: string, direction: 'forward' | 'backward') => {
        modifyActiveKeyframe(kf => {
            const allItems = [...kf.characters, ...kf.textItems, ...kf.photos]
                .sort((a, b) => a.zIndex - b.zIndex);
    
            const currentItemIndex = allItems.findIndex(item => (item.instanceId || item.id) === id);
            if (currentItemIndex === -1) return kf;
    
            const swapIndex = direction === 'forward' ? currentItemIndex + 1 : currentItemIndex - 1;
    
            if (swapIndex >= 0 && swapIndex < allItems.length) {
                const itemA = allItems[currentItemIndex];
                const itemB = allItems[swapIndex];
                const tempZ = itemA.zIndex;
                itemA.zIndex = itemB.zIndex;
                itemB.zIndex = tempZ;

                const itemMap = new Map(allItems.map(i => [(i.instanceId || i.id), i]));
                
                return {
                    ...kf,
                    characters: kf.characters.map(c => itemMap.get(c.instanceId) as SceneCharacter || c),
                    textItems: kf.textItems.map(t => itemMap.get(t.instanceId) as TextItem || t),
                    photos: kf.photos.map(p => itemMap.get(p.instanceId) as ScenePhoto || p),
                };
            }
            return kf;
        });
    };

    const handleApplyAnimationPreset = (preset: AnimationPreset) => {
        console.log("Applying preset", preset);
    };

    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        let timer: number;
        if (isPlaying) {
            timer = window.setInterval(() => {
                setCurrentTime(prev => {
                    const nextTime = prev + 0.05;
                    if (nextTime >= scene.duration) {
                        setIsPlaying(false);
                        return 0; // Loop back
                    }
                    return nextTime;
                });
            }, 50);
        }
        return () => clearInterval(timer);
    }, [isPlaying, scene.duration]);

    if (!activeKeyframe) {
        return <div>Loading scene...</div>;
    }

    return (
        <div className="h-screen w-screen bg-slate-900 text-white flex flex-col font-sans overflow-hidden">
            <Header
                user={user}
                onLogout={handleLogout}
                scene={scene}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={canUndo}
                canRedo={canRedo}
            />
            <main className="flex-1 flex overflow-hidden">
                <LeftPanel
                    onCharacterSelect={addCharacterToKeyframe}
                    onBackgroundSelect={handleBackgroundSelect}
                    uploadedPhotos={uploadedPhotos}
                    onPhotoUpload={handlePhotoUpload}
                    onPhotoSelect={addPhotoToKeyframe}
                />
                <div className="flex-1 flex flex-col">
                    <Canvas
                        keyframe={activeKeyframe}
                        background={scene.background}
                        selectedItemId={selectedItemId}
                        onSelect={setSelectedItemId}
                        onUpdate={handleItemUpdate}
                        currentTime={currentTime}
                        isPlaying={isPlaying}
                        audioClips={scene.audioClips}
                    />
                </div>
                <RightPanel
                    selectedItem={selectedItem}
                    activeKeyframe={activeKeyframe}
                    onItemUpdate={handleItemUpdate}
                    onItemDelete={handleItemDelete}
                    onLayerChange={handleLayerChange}
                    onAddText={handleAddText}
                    onAddAudioClip={handleAddAudioClip}
                    sceneDuration={scene.duration}
                    onDurationChange={(d) => updateScene({ ...scene, duration: d })}
                    onApplyAnimationPreset={handleApplyAnimationPreset}
                    onAddScriptToScene={handleAddScriptToScene}
                />
            </main>
             <Timeline
                keyframes={scene.keyframes}
                activeKeyframeIndex={activeKeyframeIndex}
                onSelectKeyframe={setActiveKeyframeIndex}
                onAddKeyframe={handleAddKeyframe}
                onDeleteKeyframe={handleDeleteKeyframe}
                audioClips={scene.audioClips}
                onUpdateAudioClip={handleUpdateAudioClip}
                onRemoveAudioClip={handleRemoveAudioClip}
                currentTime={currentTime}
                onTimeChange={setCurrentTime}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying(!isPlaying)}
                duration={scene.duration}
            />
        </div>
    );
};

export default App;