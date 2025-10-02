import React, { useState, useRef } from 'react';
import { CHARACTERS, BACKGROUNDS } from '../constants';
import { Character, Background } from '../types';

interface LeftPanelProps {
  onCharacterSelect: (characterId: string) => void;
  onBackgroundSelect: (backgroundUrl: string) => void;
  uploadedPhotos: { id: string, name: string, url: string }[];
  onPhotoUpload: (file: File) => void;
  onPhotoSelect: (photoUrl: string) => void;
}

type ActiveTab = 'characters' | 'backgrounds' | 'photos';

const LeftPanel: React.FC<LeftPanelProps> = ({ 
    onCharacterSelect, 
    onBackgroundSelect,
    uploadedPhotos,
    onPhotoUpload,
    onPhotoSelect
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('characters');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCharacterDragStart = (e: React.DragEvent<HTMLDivElement>, characterId: string) => {
    e.dataTransfer.setData('characterId', characterId);
  };
  
  const handlePhotoDragStart = (e: React.DragEvent<HTMLDivElement>, photoUrl: string) => {
    e.dataTransfer.setData('photoUrl', photoUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(file) {
        onPhotoUpload(file);
    }
  };

  return (
    <aside className="w-64 bg-slate-800/60 flex flex-col border-r border-slate-700/80">
      <div className="flex border-b border-slate-700/80">
        <button
          onClick={() => setActiveTab('characters')}
          className={`flex-1 p-3 text-sm font-semibold transition-colors duration-200 relative ${
            activeTab === 'characters' ? 'text-cyan-400 bg-slate-900/30' : 'text-gray-400 hover:bg-slate-700/50'
          }`}
        >
          Characters
          {activeTab === 'characters' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400"></div>}
        </button>
        <button
          onClick={() => setActiveTab('backgrounds')}
          className={`flex-1 p-3 text-sm font-semibold transition-colors duration-200 relative ${
            activeTab === 'backgrounds' ? 'text-cyan-400 bg-slate-900/30' : 'text-gray-400 hover:bg-slate-700/50'
          }`}
        >
          Backgrounds
           {activeTab === 'backgrounds' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400"></div>}
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`flex-1 p-3 text-sm font-semibold transition-colors duration-200 relative ${
            activeTab === 'photos' ? 'text-cyan-400 bg-slate-900/30' : 'text-gray-400 hover:bg-slate-700/50'
          }`}
        >
          Photos
           {activeTab === 'photos' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400"></div>}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'characters' && (
          <div className="grid grid-cols-2 gap-3">
            {CHARACTERS.map((char: Character) => (
              <div
                key={char.id}
                draggable
                onDragStart={(e) => handleCharacterDragStart(e, char.id)}
                onClick={() => onCharacterSelect(char.id)}
                className="bg-slate-900/40 rounded-lg p-2 cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-105 hover:shadow-cyan-500/20 shadow-lg border border-slate-700/60"
              >
                {/* FIX: The `Character` type does not have an `image` property. Use the first pose as the preview. */}
                <img src={Object.values(char.poses)[0]} alt={char.name} className="w-full h-24 object-contain" />
                <p className="text-xs text-center mt-2 font-medium truncate">{char.name}</p>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'backgrounds' && (
          <div className="grid grid-cols-1 gap-3">
            {BACKGROUNDS.map((bg: Background) => (
              <div
                key={bg.id}
                onClick={() => onBackgroundSelect(bg.image)}
                className="cursor-pointer rounded-lg overflow-hidden transition-transform duration-200 hover:scale-105 hover:shadow-cyan-500/20 shadow-lg border border-slate-700/60"
              >
                <img src={bg.image} alt={bg.name} className="w-full h-20 object-cover" />
                <p className="text-xs text-center bg-slate-900/50 p-1 font-medium truncate">{bg.name}</p>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'photos' && (
            <div className="flex flex-col gap-3">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-2 bg-cyan-600 rounded-md text-sm font-semibold hover:bg-cyan-500 transition-colors shadow-md"
                >
                    Upload Photo
                </button>
                {uploadedPhotos.length === 0 && (
                    <div className="text-center text-xs text-slate-400 mt-4 p-4 bg-slate-900/40 rounded-lg">
                        Upload your own images to use in your animation.
                    </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                    {uploadedPhotos.map((photo) => (
                        <div
                            key={photo.id}
                            draggable
                            onDragStart={(e) => handlePhotoDragStart(e, photo.url)}
                            onClick={() => onPhotoSelect(photo.url)}
                            className="bg-slate-900/40 rounded-lg p-2 cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-105 hover:shadow-cyan-500/20 shadow-lg border border-slate-700/60"
                        >
                            <img src={photo.url} alt={photo.name} className="w-full h-24 object-contain" />
                            <p className="text-xs text-center mt-2 font-medium truncate">{photo.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </aside>
  );
};

export default LeftPanel;