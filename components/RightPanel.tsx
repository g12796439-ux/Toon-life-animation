import React from 'react';
import {
  SceneItem,
  SceneCharacter,
  TextItem,
  ScenePhoto,
  AudioClip,
  AnimationPreset,
  Keyframe,
} from '../types';
import PoseSelector from './PoseSelector';
import AnimationPresets from './AnimationPresets';
import TextControls from './TextControls';
import ScriptGenerator from './ScriptGenerator';
import AudioControls from './AudioControls';
import { FlipIcon, TrashIcon, BringForwardIcon, SendBackwardIcon } from '../constants';

interface RightPanelProps {
  selectedItem: SceneItem | null;
  activeKeyframe: Keyframe;
  // FIX: Widen the type of 'updates' to accept properties from all concrete SceneItem types.
  onItemUpdate: (id: string, updates: Partial<SceneCharacter & TextItem & ScenePhoto>) => void;
  onItemDelete: (id: string) => void;
  onLayerChange: (id: string, direction: 'forward' | 'backward') => void;
  onAddText: (text: string) => void;
  onAddAudioClip: (clip: Omit<AudioClip, 'id'>) => void;
  sceneDuration: number;
  onDurationChange: (duration: number) => void;
  onApplyAnimationPreset: (preset: AnimationPreset) => void;
  onAddScriptToScene: (script: string) => void;
}

const isCharacter = (item: SceneItem): item is SceneCharacter => 'poses' in item;
const isText = (item: SceneItem): item is TextItem => 'text' in item;
const isPhoto = (item: SceneItem): item is ScenePhoto => 'url' in item && !('poses' in item);

const RightPanel: React.FC<RightPanelProps> = ({
  selectedItem,
  activeKeyframe,
  onItemUpdate,
  onItemDelete,
  onLayerChange,
  onAddText,
  onAddAudioClip,
  sceneDuration,
  onDurationChange,
  onApplyAnimationPreset,
  onAddScriptToScene,
}) => {

  // FIX: Widen the type of 'updates' to accept properties from all concrete SceneItem types.
  const handleUpdate = (updates: Partial<SceneCharacter & TextItem & ScenePhoto>) => {
    if (selectedItem) {
      const id = 'instanceId' in selectedItem ? selectedItem.instanceId : selectedItem.id;
      onItemUpdate(id, updates);
    }
  };

  const handleDelete = () => {
    if (selectedItem) {
        const id = 'instanceId' in selectedItem ? selectedItem.instanceId : selectedItem.id;
        onItemDelete(id);
    }
  }

  const allItems = activeKeyframe ? [...activeKeyframe.characters, ...activeKeyframe.photos, ...activeKeyframe.textItems] : [];
  const zIndices = allItems.map(i => i.zIndex);
  const maxZ = zIndices.length > 0 ? Math.max(...zIndices) : 0;
  const minZ = zIndices.length > 0 ? Math.min(...zIndices) : 0;

  const canBringForward = selectedItem ? selectedItem.zIndex < maxZ : false;
  const canSendBackward = selectedItem ? selectedItem.zIndex > minZ : false;


  const renderSelectedItemControls = () => {
    if (!selectedItem) return null;
    const id = 'instanceId' in selectedItem ? selectedItem.instanceId : selectedItem.id;

    return (
      <div className="space-y-6">
        <div className="p-3 bg-slate-900/50 rounded-md border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-300">
              {isCharacter(selectedItem) ? 'Character Properties' : isText(selectedItem) ? 'Text Properties' : 'Photo Properties'}
            </h3>
          </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                    <label className="text-xs text-gray-400 flex justify-between">Scale <span>{selectedItem.scale.toFixed(2)}</span></label>
                    <input type="range" min="0.1" max="5" step="0.05" value={selectedItem.scale} onChange={e => handleUpdate({ scale: parseFloat(e.target.value) })} className="w-full" />
                </div>
                 <div>
                    <label className="text-xs text-gray-400 flex justify-between">Rotation <span>{selectedItem.rotation}°</span></label>
                    <input type="range" min="0" max="360" step="1" value={selectedItem.rotation} onChange={e => handleUpdate({ rotation: parseInt(e.target.value) })} className="w-full" />
                </div>
            </div>
            
            {isCharacter(selectedItem) && (
              <div className="space-y-4">
                <PoseSelector character={selectedItem} onPoseChange={(poseUrl) => handleUpdate({ pose: poseUrl })} />
                <AnimationPresets character={selectedItem} onApplyAnimation={onApplyAnimationPreset} />
              </div>
            )}

            {isText(selectedItem) && (
              <TextControls selectedText={selectedItem} onTextUpdate={onItemUpdate} />
            )}
        </div>

        <div className="p-3 bg-slate-900/50 rounded-md border border-slate-700">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Layering & Actions</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => onLayerChange(id, 'forward')} disabled={!canBringForward} className="p-2 bg-slate-700 rounded hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Bring Forward"><BringForwardIcon /></button>
            <button onClick={() => onLayerChange(id, 'backward')} disabled={!canSendBackward} className="p-2 bg-slate-700 rounded hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Send Backward"><SendBackwardIcon /></button>
            {isCharacter(selectedItem) && <button onClick={() => handleUpdate({ flipH: !selectedItem.flipH })} className="p-2 bg-slate-700 rounded hover:bg-slate-600 transition-colors" title="Flip Horizontal"><FlipIcon /></button>}
            <button onClick={handleDelete} className="p-2 bg-red-800/80 text-white rounded hover:bg-red-700 transition-colors" title="Delete Item"><TrashIcon /></button>
          </div>
        </div>
      </div>
    );
  }

  const renderStudioControls = () => (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-center text-gray-300 border-b border-slate-700 pb-2">Studio Controls</h2>

      <div className="p-3 bg-slate-900/50 rounded-md border border-slate-700">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Scene Settings</h3>
        <div>
            <label htmlFor="scene-duration" className="block text-xs font-medium text-gray-300 mb-1">
                Duration (seconds)
            </label>
            <input
                type="number"
                id="scene-duration"
                value={sceneDuration}
                onChange={(e) => onDurationChange(parseFloat(e.target.value) || 1)}
                min="1"
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
        </div>
      </div>

      <div className="p-3 bg-slate-900/50 rounded-md border border-slate-700">
        <ScriptGenerator onAddScriptToScene={onAddScriptToScene} />
      </div>
      <div className="p-3 bg-slate-900/50 rounded-md border border-slate-700">
        <TextControls onTextAdd={onAddText} />
      </div>
       <AudioControls onAddAudioClip={onAddAudioClip} activeKeyframe={activeKeyframe} />
    </div>
  );

  return (
    <aside className="w-80 bg-slate-800/60 flex flex-col border-l border-slate-700/80">
      <div className="flex-1 overflow-y-auto p-4">
        {selectedItem ? renderSelectedItemControls() : renderStudioControls()}
      </div>
    </aside>
  );
};

export default RightPanel;