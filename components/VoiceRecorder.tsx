import React, { useState, useRef, useEffect } from 'react';
import { AudioClip, Keyframe } from '../types';
import { MicIcon, StopIcon, PlayIcon, TrashIcon } from '../constants';

interface VoiceRecorderProps {
    onAddAudioClip: (clip: Omit<AudioClip, 'id'>) => void;
    activeKeyframe: Keyframe;
}

const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onAddAudioClip, activeKeyframe }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedClip, setRecordedClip] = useState<{ url: string, blob: Blob, duration: number } | null>(null);
    const [pitch, setPitch] = useState(0); // In semitones
    const [selectedCharId, setSelectedCharId] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const activePreviewSourceRef = useRef<AudioBufferSourceNode | null>(null);

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };
    
    const startRecording = async () => {
        try {
            if (recordedClip) {
                URL.revokeObjectURL(recordedClip.url);
                setRecordedClip(null);
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                
                const audio = new Audio(audioUrl);
                audio.onloadedmetadata = () => {
                    setRecordedClip({ url: audioUrl, blob: audioBlob, duration: audio.duration });
                    audioChunksRef.current = [];
                };
                stream.getTracks().forEach(track => track.stop());
                setIsRecording(false);
            };

            mediaRecorder.start();
            setIsRecording(true);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please check your browser permissions.");
            setIsRecording(false);
        }
    };

    const handleToggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const handlePlayPreview = async () => {
        if (!recordedClip) return;
        if (activePreviewSourceRef.current) {
            try { activePreviewSourceRef.current.stop(); } catch(e){}
        }
        
        const arrayBuffer = await recordedClip.blob.arrayBuffer();
        // Use a new AudioContext instance for decoding to avoid issues with closed contexts
        const tempAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await tempAudioContext.decodeAudioData(arrayBuffer);
        const source = tempAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.playbackRate.value = Math.pow(2, pitch / 12);
        source.connect(tempAudioContext.destination);
        source.start(0);
        activePreviewSourceRef.current = source;
    };

    const handleAdd = () => {
        if (!recordedClip) return;
        onAddAudioClip({
            name: `Recording ${new Date().toLocaleTimeString()}`,
            url: recordedClip.url,
            trackId: 'voiceover',
            start: 0,
            duration: recordedClip.duration,
            sourceDuration: recordedClip.duration,
            offset: 0,
            pitch: pitch,
            characterInstanceId: selectedCharId || undefined,
        });
        setRecordedClip(null);
        setPitch(0);
        setSelectedCharId(null);
    };

    const handleDiscard = () => {
        if (recordedClip) {
            URL.revokeObjectURL(recordedClip.url);
        }
        setRecordedClip(null);
        setPitch(0);
        setSelectedCharId(null);
    };

    useEffect(() => {
        return () => {
            stopRecording();
            if (recordedClip) {
                URL.revokeObjectURL(recordedClip.url);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if(recordedClip) {
        return (
            <div className="space-y-3 p-2 bg-slate-700/50 rounded-md">
                <h4 className="text-xs font-bold text-gray-400">Recording Preview</h4>
                <div className="space-y-3">
                     <div>
                        <label className="text-xs text-gray-400 flex justify-between">Pitch <span>{pitch > 0 ? '+' : ''}{pitch}</span></label>
                        <input type="range" min="-12" max="12" step="1" value={pitch} onChange={e => setPitch(parseInt(e.target.value))} className="w-full" />
                    </div>
                     {activeKeyframe.characters.length > 0 && (
                        <div>
                            <label className="text-xs text-gray-400 mb-2 block">Assign to Character (for lip-sync)</label>
                            <div className="flex flex-wrap gap-2">
                                {activeKeyframe.characters.map(char => {
                                    const previewPose = char.poses.idle || Object.values(char.poses)[0];
                                    if (!previewPose) return null;
                                    return (
                                        <button 
                                            key={char.instanceId} 
                                            onClick={() => setSelectedCharId(prev => prev === char.instanceId ? null : char.instanceId)}
                                            className={`p-1 rounded-md transition-all ${selectedCharId === char.instanceId ? 'bg-cyan-500/30 ring-2 ring-cyan-400' : 'bg-slate-800/50 hover:bg-slate-600'}`}
                                        >
                                            <img src={previewPose} alt={char.name} className="w-12 h-12 object-contain" />
                                            <p className="text-xs text-center mt-1 w-12 truncate">{char.name}</p>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                     )}
                    <button onClick={handlePlayPreview} className="w-full flex items-center justify-center gap-2 p-2 rounded-md text-sm font-semibold bg-slate-600 hover:bg-slate-500 transition-colors">
                        <PlayIcon/> Preview
                    </button>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleDiscard} className="w-full flex items-center justify-center gap-2 p-2 rounded-md text-sm font-semibold bg-slate-600 hover:bg-slate-500 transition-colors">
                        <TrashIcon/> Discard
                    </button>
                    <button onClick={handleAdd} className="w-full p-2 bg-cyan-600 rounded-md text-sm font-semibold hover:bg-cyan-500 transition-colors">
                        Add to Timeline
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-400">Voice Over</h4>
            <button
                onClick={handleToggleRecording}
                className={`w-full flex items-center justify-center gap-2 p-2 rounded-md text-sm font-semibold transition-colors ${
                    isRecording 
                        ? 'bg-red-600 hover:bg-red-500 animate-pulse' 
                        : 'bg-slate-700 hover:bg-slate-600'
                }`}
            >
                {isRecording ? <StopIcon /> : <MicIcon />}
                {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
        </div>
    );
};

export default VoiceRecorder;