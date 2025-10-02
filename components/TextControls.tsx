import React, { useState, useEffect } from 'react';
import { TextItem } from '../types';

interface TextControlsProps {
    selectedText?: TextItem;
    onTextAdd?: (text: string) => void;
    onTextUpdate?: (id: string, updates: Partial<TextItem>) => void;
}

const FONT_FAMILIES = ['Arial', 'Georgia', 'Verdana', 'Times New Roman', 'Courier New', 'Impact'];

const TextControls: React.FC<TextControlsProps> = ({ selectedText, onTextAdd, onTextUpdate }) => {
    const [text, setText] = useState('');
    const [fontSize, setFontSize] = useState(48);
    const [color, setColor] = useState('#FFFFFF');
    const [fontFamily, setFontFamily] = useState('Arial');

    useEffect(() => {
        if (selectedText) {
            setText(selectedText.text);
            setFontSize(selectedText.fontSize);
            setColor(selectedText.color);
            setFontFamily(selectedText.fontFamily || 'Arial');
        } else {
            setText('');
            setFontSize(48);
            setColor('#FFFFFF');
            setFontFamily('Arial');
        }
    }, [selectedText]);

    const handleTextUpdate = (updates: Partial<TextItem>) => {
        if (selectedText && onTextUpdate) {
            onTextUpdate(selectedText.id, updates);
        }
    };

    const handleAdd = () => {
        if (text.trim() && onTextAdd) {
            onTextAdd(text);
            setText('');
        }
    };
    
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400">{selectedText ? 'Edit Text' : 'Add Text'}</h3>
            <div>
                <textarea
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        if (selectedText) handleTextUpdate({ text: e.target.value });
                    }}
                    placeholder="Enter text here..."
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    rows={3}
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Font</label>
                <select
                    value={fontFamily}
                    onChange={(e) => {
                        setFontFamily(e.target.value);
                        if (selectedText) handleTextUpdate({ fontFamily: e.target.value });
                    }}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-sm"
                >
                    {FONT_FAMILIES.map(font => (
                        <option key={font} value={font}>{font}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                     <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-medium text-gray-300">Font Size</label>
                        <span className="text-xs text-gray-400">{fontSize}px</span>
                    </div>
                    <input
                        type="range"
                        min="8"
                        max="128"
                        step="1"
                        value={fontSize}
                        onChange={(e) => {
                            const newSize = parseInt(e.target.value, 10);
                            setFontSize(newSize);
                            if (selectedText) handleTextUpdate({ fontSize: newSize });
                        }}
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Color</label>
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => {
                            setColor(e.target.value);
                            if (selectedText) handleTextUpdate({ color: e.target.value });
                        }}
                        className="w-full p-1 h-10 bg-slate-700 border border-slate-600 rounded-md"
                    />
                </div>
            </div>
            
            {!selectedText && onTextAdd && (
                <button
                    onClick={handleAdd}
                    disabled={!text.trim()}
                    className="w-full p-2 bg-cyan-600 rounded-md text-sm font-semibold hover:bg-cyan-500 disabled:bg-slate-600 transition-colors"
                >
                    Add Text to Scene
                </button>
            )}
        </div>
    );
};

export default TextControls;
