import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Keyframe, AudioClip } from '../types';
import { PlayIcon, PauseIcon } from '../constants';

interface TimelineProps {
    keyframes: Keyframe[];
    activeKeyframeIndex: number;
    onSelectKeyframe: (index: number) => void;
    onAddKeyframe: () => void;
    onDeleteKeyframe: (index: number) => void;
    audioClips: AudioClip[];
    onUpdateAudioClip: (id: string, updates: Partial<AudioClip>) => void;
    onRemoveAudioClip: (id: string) => void;
    currentTime: number;
    onTimeChange: (time: number) => void;
    isPlaying: boolean;
    onTogglePlay: () => void;
    duration: number;
}

const Timeline: React.FC<TimelineProps> = ({
    keyframes,
    activeKeyframeIndex,
    onSelectKeyframe,
    onAddKeyframe,
    onDeleteKeyframe,
    audioClips,
    onUpdateAudioClip,
    onRemoveAudioClip,
    currentTime,
    onTimeChange,
    isPlaying,
    onTogglePlay,
    duration
}) => {
    const audioContextRef = useRef(new (window.AudioContext || (window as any).webkitAudioContext)());
    const activeSourcesRef = useRef(new Map<string, AudioBufferSourceNode>());
    const audioBuffersRef = useRef(new Map<string, AudioBuffer>());
    const timelineRef = useRef<HTMLDivElement>(null);
    const [draggingClip, setDraggingClip] = useState<{ id: string, type: 'move' | 'trim-start' | 'trim-end', startX: number, originalClip: AudioClip } | null>(null);
    const previewSourceRef = useRef<AudioBufferSourceNode | null>(null);


    useEffect(() => {
        const loadAudio = async () => {
            for (const clip of audioClips) {
                if (!audioBuffersRef.current.has(clip.id)) {
                    try {
                        const response = await fetch(clip.url);
                        const arrayBuffer = await response.arrayBuffer();
                        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
                        audioBuffersRef.current.set(clip.id, audioBuffer);
                    } catch (e) {
                        console.error(`Failed to load audio for clip ${clip.name}`, e);
                    }
                }
            }
        };
        loadAudio();
    }, [audioClips]);

    useEffect(() => {
        activeSourcesRef.current.forEach(source => {
            try { source.stop(); } catch (e) {}
        });
        activeSourcesRef.current.clear();
        
        if (isPlaying) {
            const clipsToPlay = audioClips.filter(clip => {
                const clipEnd = clip.start + clip.duration;
                return currentTime >= clip.start && currentTime < clipEnd;
            });

            clipsToPlay.forEach(clip => {
                const audioBuffer = audioBuffersRef.current.get(clip.id);
                if (audioBuffer) {
                    const source = audioContextRef.current.createBufferSource();
                    source.buffer = audioBuffer;
                    
                    if (clip.pitch) {
                        source.playbackRate.value = Math.pow(2, clip.pitch / 12);
                    }

                    source.connect(audioContextRef.current.destination);
                    const offsetInClip = (currentTime - clip.start) + clip.offset;
                    source.start(0, offsetInClip);
                    activeSourcesRef.current.set(clip.id, source);
                }
            });
        }

        return () => {
            activeSourcesRef.current.forEach(source => {
                try { source.stop(); } catch (e) {}
            });
            activeSourcesRef.current.clear();
        };
    }, [isPlaying, currentTime, audioClips]);


    const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
        if (timelineRef.current) {
            const rect = timelineRef.current.getBoundingClientRect();
            const newTime = ((e.clientX - rect.left) / rect.width) * duration;
            onTimeChange(Math.max(0, Math.min(duration, newTime)));
        }
    };
    
    const pixelsPerSecond = timelineRef.current ? timelineRef.current.getBoundingClientRect().width / duration : 0;

    const handleClipMouseDown = (e: React.MouseEvent, clip: AudioClip, type: 'move' | 'trim-start' | 'trim-end') => {
        e.stopPropagation();
        setDraggingClip({ id: clip.id, type, startX: e.clientX, originalClip: clip });
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!draggingClip || !pixelsPerSecond) return;

        const deltaX = e.clientX - draggingClip.startX;
        const deltaTime = deltaX / pixelsPerSecond;
        const { originalClip, type } = draggingClip;

        if (type === 'move') {
            const newStart = Math.max(0, originalClip.start + deltaTime);
            onUpdateAudioClip(originalClip.id, { start: newStart });
        } else if (type === 'trim-start') {
            const newStart = Math.max(0, originalClip.start + deltaTime);
            const newDuration = Math.max(0.1, originalClip.duration - (newStart - originalClip.start));
            const newOffset = Math.max(0, originalClip.offset + (newStart - originalClip.start));
             if (newOffset + newDuration <= originalClip.sourceDuration) {
                onUpdateAudioClip(originalClip.id, { start: newStart, duration: newDuration, offset: newOffset });
            }
        } else if (type === 'trim-end') {
            const newDuration = Math.max(0.1, originalClip.duration + deltaTime);
            if (originalClip.offset + newDuration <= originalClip.sourceDuration) {
                onUpdateAudioClip(originalClip.id, { duration: newDuration });
            }
        }
    }, [draggingClip, pixelsPerSecond, onUpdateAudioClip]);

    const handleMouseUp = useCallback(() => {
        setDraggingClip(null);
    }, []);

    const handlePreviewPlay = (clip: AudioClip) => {
        // Stop any existing preview
        if (previewSourceRef.current) {
            try { previewSourceRef.current.stop(); } catch (e) {}
            previewSourceRef.current = null;
        }

        const audioBuffer = audioBuffersRef.current.get(clip.id);
        if (audioBuffer) {
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;

            if (clip.pitch) {
                source.playbackRate.value = Math.pow(2, clip.pitch / 12);
            }

            source.connect(audioContextRef.current.destination);
            source.start(0, clip.offset, clip.duration);
            previewSourceRef.current = source;
        }
    };

    const handlePreviewStop = () => {
        if (previewSourceRef.current) {
            try { previewSourceRef.current.stop(); } catch (e) {}
            previewSourceRef.current = null;
        }
    };
    
    useEffect(() => {
        if(draggingClip) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
    }, [draggingClip, handleMouseMove, handleMouseUp]);

    return (
        <footer className="bg-slate-800/80 border-t border-slate-700/80 p-3 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-4">
                <button onClick={onTogglePlay} className="p-2 bg-slate-700 rounded-md hover:bg-slate-600">
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
                 <span className="text-xs text-slate-400 font-mono w-24 text-center">
                    {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
                </span>
                <div className="flex-1" onMouseDown={handleScrub}>
                    <div className="relative h-20 bg-slate-900 rounded-md p-2 space-y-1 overflow-hidden cursor-pointer" ref={timelineRef}>
                        {/* Keyframe track */}
                        <div className="flex items-center h-8">
                            <div className="text-xs w-20 pr-2 text-slate-400 font-semibold">Keyframes</div>
                            <div className="relative flex-1 h-full bg-slate-700/50 rounded flex items-center">
                                {keyframes.map((kf, index) => (
                                    <div key={kf.id}
                                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                                        style={{ left: `${(index / (Math.max(1, keyframes.length - 1)) * 100)}%` }}
                                    >
                                    <button
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={(e) => { e.stopPropagation(); onSelectKeyframe(index); }}
                                        onDoubleClick={(e) => { e.stopPropagation(); if (keyframes.length > 1) onDeleteKeyframe(index); }}
                                        className={`h-5 w-5 rounded-sm transform rotate-45 ${activeKeyframeIndex === index ? 'bg-cyan-400' : 'bg-slate-500 hover:bg-slate-400'}`}
                                        title={`Keyframe ${index + 1}`}
                                    />
                                    </div>
                                ))}
                                <button onClick={(e) => {e.stopPropagation(); onAddKeyframe();}} className="absolute -right-3 top-1/2 -translate-y-1/2 text-xs w-6 h-6 flex items-center justify-center font-bold bg-slate-600 rounded-full hover:bg-slate-500">+</button>
                            </div>
                        </div>

                         {/* Audio tracks */}
                         <div className="flex items-center h-8">
                           <div className="text-xs w-20 pr-2 text-slate-400 font-semibold">Audio</div>
                           <div className="relative flex-1 h-full bg-slate-700/50 rounded">
                               {audioClips.map(clip => (
                                   <div key={clip.id}
                                       className="absolute top-0 h-full bg-purple-500/70 rounded text-xs text-white px-2 flex items-center overflow-hidden border border-purple-400 select-none hover:bg-purple-400/80 transition-colors"
                                       style={{
                                           left: `${(clip.start / duration) * 100}%`,
                                           width: `${(clip.duration / duration) * 100}%`
                                       }}
                                       title={clip.name}
                                       onMouseDown={(e) => handleClipMouseDown(e, clip, 'move')}
                                       onDoubleClick={(e) => { e.stopPropagation(); onRemoveAudioClip(clip.id); }}
                                       onMouseEnter={() => handlePreviewPlay(clip)}
                                       onMouseLeave={handlePreviewStop}
                                   >
                                     <div className="absolute left-0 top-0 h-full w-2 cursor-ew-resize" onMouseDown={(e) => handleClipMouseDown(e, clip, 'trim-start')} />
                                     <span className="truncate pointer-events-none">{clip.name}</span>
                                     <div className="absolute right-0 top-0 h-full w-2 cursor-ew-resize" onMouseDown={(e) => handleClipMouseDown(e, clip, 'trim-end')} />
                                   </div>
                               ))}
                           </div>
                        </div>

                        {/* Playhead */}
                        <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none" style={{ left: `${(currentTime / duration) * 100}%` }}>
                             <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Timeline;