import React, { useRef } from 'react';
import { AudioClip } from '../types';
import { UploadIcon } from '../constants';

interface BackgroundMusicControlsProps {
    onAddAudioClip: (clip: Omit<AudioClip, 'id'>) => void;
}

// FIX: Cast window to any to access vendor-prefixed webkitAudioContext.
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

const BackgroundMusicControls: React.FC<BackgroundMusicControlsProps> = ({ onAddAudioClip }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const url = URL.createObjectURL(file);
                const arrayBuffer = await file.arrayBuffer();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                const duration = audioBuffer.duration;

                onAddAudioClip({
                    name: file.name,
                    url,
                    trackId: 'music',
                    start: 0,
                    duration,
                    offset: 0,
                    sourceDuration: duration,
                });

            } catch (error) {
                console.error("Error processing audio file:", error);
                alert("Failed to process audio file. It might be corrupted or in an unsupported format.");
            }
        }
        // Reset file input to allow uploading the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-400">Background Music</h4>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="audio/mpeg, audio/wav, audio/ogg"
                className="hidden"
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 p-2 bg-slate-700 rounded-md text-sm font-semibold hover:bg-slate-600 transition-colors"
            >
                <UploadIcon /> Upload Music
            </button>
        </div>
    );
}

export default BackgroundMusicControls;