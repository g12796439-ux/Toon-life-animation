import React, { useState } from 'react';
import { generateScript } from '../services/geminiService';

interface ScriptGeneratorProps {
  onAddScriptToScene: (script: string) => void;
}

const ScriptGenerator: React.FC<ScriptGeneratorProps> = ({ onAddScriptToScene }) => {
  const [prompt, setPrompt] = useState<string>('A farmer and a politician arguing about rain');
  const [script, setScript] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGenerateScript = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setScript('');
    try {
      const result = await generateScript(prompt);
      setScript(result);
    } catch (error) {
      setScript('Failed to generate script. See console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-400">AI Script Generator</h3>
      <div>
        <label htmlFor="script-prompt" className="block text-xs font-medium text-gray-300 mb-1">
          Enter a prompt
        </label>
        <textarea
          id="script-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A teacher explaining React to a mythological character"
          className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          rows={3}
        />
      </div>
      <button
        onClick={handleGenerateScript}
        disabled={isLoading || !prompt.trim()}
        className="w-full p-2 bg-cyan-600 rounded-md text-sm font-semibold hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Generating...' : 'Generate Script'}
      </button>
      {script && (
        <div className="mt-4 p-3 bg-slate-900/50 rounded-md border border-slate-700">
          <h4 className="text-xs font-bold text-gray-400 mb-2">Generated Script:</h4>
          <pre className="text-sm whitespace-pre-wrap font-sans">{script}</pre>
          <button
            onClick={() => onAddScriptToScene(script)}
            className="w-full mt-3 p-2 bg-purple-600 rounded-md text-sm font-semibold hover:bg-purple-500 transition-colors"
          >
            Add Script to Scene
          </button>
        </div>
      )}
    </div>
  );
};

export default ScriptGenerator;