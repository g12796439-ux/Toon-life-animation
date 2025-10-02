import React, { useEffect } from 'react';
import { UserProfile, Scene } from './types';
import ExportControls from './components/ExportControls';
import { UndoIcon, RedoIcon } from './constants';

interface HeaderProps {
  user: UserProfile | null;
  onLogout: () => void;
  scene: Scene;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'; // IMPORTANT: Replace with your actual Google Client ID

const Header: React.FC<HeaderProps> = ({ user, onLogout, scene, onUndo, onRedo, canUndo, canRedo }) => {

  const isGoogleAuthReady = GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.startsWith('YOUR_');

  useEffect(() => {
    if (!user && isGoogleAuthReady && window.google) {
      const signInDiv = document.getElementById('signInDiv');
      
      const handleCredentialResponse = (response: any) => {
        // The actual login logic is handled in App.tsx. This function acts
        // as a bridge, calling the handler exposed on the window object.
        if ((window as any).handleGoogleLogin) {
          (window as any).handleGoogleLogin(response);
        }
      };

      if (signInDiv) {
        signInDiv.innerHTML = ''; // Clear previous button
        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            use_fedcm_for_prompt: false, // Fix for FedCM NotAllowedError
        });
        window.google.accounts.id.renderButton(
          signInDiv,
          { theme: "outline", size: "large", type: 'standard', text: 'signin_with' }
        );
      }
    }
  }, [user, isGoogleAuthReady]);

  return (
    <header className="bg-slate-900/80 text-white p-3 flex justify-between items-center border-b border-slate-700/80 shadow-md backdrop-blur-sm z-50">
      <h1 className="text-xl font-bold text-cyan-400 tracking-wider">Toon Life</h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
            <button onClick={onUndo} disabled={!canUndo} className="p-2 bg-slate-700 rounded-md hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"><UndoIcon/></button>
            <button onClick={onRedo} disabled={!canRedo} className="p-2 bg-slate-700 rounded-md hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"><RedoIcon/></button>
        </div>
        <div className="w-px h-6 bg-slate-700"></div>
        <ExportControls scene={scene} />
        {user ? (
          <div className="flex items-center gap-3">
            <img src={user.picture} alt={user.name} className="w-9 h-9 rounded-full" />
            <div className="text-sm font-medium leading-tight">
                <div>{user.name}</div>
                <button onClick={onLogout} className="text-xs text-cyan-400 hover:underline">Sign Out</button>
            </div>
          </div>
        ) : (
           <div id="signInDiv" style={{ display: isGoogleAuthReady ? 'block' : 'none' }}></div>
        )}
      </div>
    </header>
  );
};

export default Header;
