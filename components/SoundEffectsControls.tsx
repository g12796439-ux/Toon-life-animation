import React from 'react';
import { SOUND_EFFECTS } from '../constants';
import { AudioClip, SoundEffect } from '../types';

interface SoundEffectsControlsProps {
    onAddAudioClip: (clip: Omit<AudioClip, 'id'>) => void;
}

// FIX: Cast window to any to access vendor-prefixed webkitAudioContext.
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
const sfxDurationCache = new Map<string, number>();

const getAudioDuration = async (url: string): Promise<number> => {
    if (sfxDurationCache.has(url)) {
        return sfxDurationCache.get(url)!;
    }
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const duration = audioBuffer.duration;
        sfxDurationCache.set(url, duration);
        return duration;
    } catch (error) {
        console.error("Failed to get audio duration:", error);
        return 0;
    }
};

const SoundEffectsControls: React.FC<SoundEffectsControlsProps> = ({ onAddAudioClip }) => {

  const handleAddSfx = async (sfx: SoundEffect) => {
    const duration = await getAudioDuration(sfx.url);
    if (duration > 0) {
        onAddAudioClip({
            name: sfx.name,
            url: sfx.url,
            trackId: 'sfx',
            start: 0,
            duration: duration,
            offset: 0,
            sourceDuration: duration,
        });
    }
  };

  const handlePlaySfx = (url: string) => {
    const audio = new Audio(url);
    audio.play();
  };

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-bold text-gray-400">Sound Effects</h4>
      <div className="max-h-32 overflow-y-auto pr-2">
        <ul className="space-y-1">
          {SOUND_EFFECTS.map((sfx) => (
            <li key={sfx.name} className="flex items-center justify-between p-1.5 bg-slate-700/50 rounded-md text-sm">
              <span className="truncate">{sfx.name}</span>
              <div className="flex items-center gap-1">
                 <button 
                    onClick={() => handlePlaySfx(sfx.url)}
                    className="px-2 py-1 text-xs bg-slate-600 rounded hover:bg-slate-500"
                    aria-label={`Play ${sfx.name}`}
                >
                    Play
                </button>
                <button 
                    onClick={() => handleAddSfx(sfx)}
                    className="px-2 py-1 text-xs bg-cyan-700 rounded hover:bg-cyan-600"
                    aria-label={`Add ${sfx.name}`}
                >
                    Add
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SoundEffectsControls;