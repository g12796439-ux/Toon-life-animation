import React from 'react';
import { AudioClip, Keyframe } from './types';
import SoundEffectsControls from './components/SoundEffectsControls';
import BackgroundMusicControls from './components/BackgroundMusicControls';
import VoiceRecorder from './components/VoiceRecorder';

interface AudioControlsProps {
    onAddAudioClip: (clip: Omit<AudioClip, 'id'>) => void;
    activeKeyframe: Keyframe;
}

const AudioControls: React.FC<AudioControlsProps> = ({ onAddAudioClip, activeKeyframe }) => {
    return (
        <div className="space-y-6 p-3 bg-slate-900/50 rounded-md border border-slate-700">
            <h3 className="text-sm font-semibold text-gray-400 text-center">Audio Library</h3>
            <VoiceRecorder onAddAudioClip={onAddAudioClip} activeKeyframe={activeKeyframe} />
            <div className="w-full h-px bg-slate-700"></div>
            <SoundEffectsControls onAddAudioClip={onAddAudioClip} />
            <div className="w-full h-px bg-slate-700"></div>
            <BackgroundMusicControls onAddAudioClip={onAddAudioClip} />
        </div>
    );
};

export default AudioControls;
