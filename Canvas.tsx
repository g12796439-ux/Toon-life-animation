import React from 'react';
import { Rnd } from 'react-rnd';
import { Keyframe, SceneItem, SceneCharacter, TextItem, ScenePhoto, AudioClip } from './types';

interface CanvasProps {
  keyframe: Keyframe;
  background: string;
  selectedItemId: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<SceneCharacter & TextItem & ScenePhoto>) => void;
  currentTime: number;
  isPlaying: boolean;
  audioClips: AudioClip[];
}

const Canvas: React.FC<CanvasProps> = ({
  keyframe,
  background,
  selectedItemId,
  onSelect,
  onUpdate,
  currentTime,
  isPlaying,
  audioClips
}) => {
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onSelect(null);
    }
  };

  const allItems = [
    ...keyframe.characters,
    ...keyframe.photos,
    ...keyframe.textItems
  ].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div 
      className="flex-1 bg-gray-800 relative overflow-hidden"
      onClick={handleCanvasClick}
      onDragOver={handleDragOver}
    >
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${background})` }}
      />
      
      {allItems.map(item => {
        const id = 'instanceId' in item ? item.instanceId : item.id;
        const isSelected = selectedItemId === id;
        
        const isCharacter = (i: SceneItem): i is SceneCharacter => 'poses' in i;
        const isText = (i: SceneItem): i is TextItem => 'text' in i;
        const isPhoto = (i: SceneItem): i is ScenePhoto => 'url' in i && !('poses' in i);

        let poseToRender = isCharacter(item) ? item.pose : '';

        if (isCharacter(item) && isPlaying) {
          const talkingPoseUrl = item.poses['talking'];
          if (talkingPoseUrl) {
            const isTalking = audioClips.some(clip =>
                clip.characterInstanceId === item.instanceId &&
                clip.trackId === 'voiceover' &&
                currentTime >= clip.start &&
                currentTime < (clip.start + clip.duration)
            );

            if (isTalking) {
                poseToRender = talkingPoseUrl;
            }
          }
        }

        return (
          <Rnd
            key={id}
            size={{ width: item.width, height: item.height }}
            position={{ x: item.x, y: item.y }}
            onDragStart={() => onSelect(id)}
            onDragStop={(e, d) => {
              onUpdate(id, { x: d.x, y: d.y });
            }}
            onResizeStart={() => onSelect(id)}
            onResizeStop={(e, direction, ref, delta, position) => {
              onUpdate(id, {
                width: parseInt(ref.style.width, 10),
                height: parseInt(ref.style.height, 10),
                ...position,
              });
            }}
            className={`transition-all duration-200 ${isSelected ? 'ring-2 ring-cyan-400 z-50' : 'ring-0'}`}
            style={{ zIndex: item.zIndex }}
            lockAspectRatio
          >
            <div className="w-full h-full" style={{ transform: `rotate(${item.rotation}deg) scale(${item.scale})` }}>
              {isCharacter(item) && (
                <img src={poseToRender} alt={item.name} className="w-full h-full object-contain" style={{ transform: item.flipH ? 'scaleX(-1)' : 'none' }}/>
              )}
              {isPhoto(item) && (
                 <img src={item.url} alt={item.name} className="w-full h-full object-contain" />
              )}
              {isText(item) && (
                <div style={{ 
                  color: item.color, 
                  fontSize: `${item.fontSize}px`,
                  fontFamily: item.fontFamily,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {item.text}
                </div>
              )}
            </div>
          </Rnd>
        );
      })}
    </div>
  );
};

export default Canvas;
