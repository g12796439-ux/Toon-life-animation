import React from 'react';
import { SceneCharacter } from '../types';

interface PoseSelectorProps {
  character: SceneCharacter;
  onPoseChange: (poseUrl: string) => void;
}

const PoseSelector: React.FC<PoseSelectorProps> = ({ character, onPoseChange }) => {
  return (
    <div>
      <h4 className="text-xs font-bold text-gray-400 mb-2">Select Pose</h4>
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(character.poses).map(([poseName, poseUrl]) => (
          <div
            key={poseName}
            onClick={() => onPoseChange(poseUrl)}
            className={`p-1 rounded-md cursor-pointer transition-all ${
              character.pose === poseUrl ? 'bg-cyan-500/30 ring-2 ring-cyan-400' : 'bg-slate-700/50 hover:bg-slate-600'
            }`}
          >
            <img src={poseUrl} alt={poseName} className="w-full h-16 object-contain" />
            <p className="text-xs text-center mt-1 capitalize truncate">{poseName}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PoseSelector;
