import React from 'react';
import { SceneCharacter, AnimationPreset } from '../types';

interface AnimationPresetsProps {
  character: SceneCharacter;
  onApplyAnimation: (preset: AnimationPreset) => void;
}

const AnimationPresets: React.FC<AnimationPresetsProps> = ({ character, onApplyAnimation }) => {
  if (!character.animations || character.animations.length === 0) {
    return null;
  }

  return (
    <div>
      <h4 className="text-xs font-bold text-gray-400 mb-2">Animation Presets</h4>
      <div className="flex flex-wrap gap-2">
        {character.animations.map((anim) => (
          <button
            key={anim.name}
            onClick={() => onApplyAnimation(anim)}
            className="px-3 py-1.5 bg-slate-700 rounded-md text-sm font-semibold hover:bg-slate-600 transition-colors"
          >
            {anim.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AnimationPresets;
