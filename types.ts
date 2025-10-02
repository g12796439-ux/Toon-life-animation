// FIX: Add global declaration for Google Identity Services to resolve TypeScript errors.
declare global {
  interface Window {
    google: any;
    handleGoogleLogin: (response: any) => void;
  }
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export interface Scene {
  id: string;
  background: string;
  keyframes: Keyframe[];
  audioClips: AudioClip[];
  duration: number; // in seconds
}

export interface Keyframe {
  id: string;
  characters: SceneCharacter[];
  textItems: TextItem[];
  photos: ScenePhoto[];
}

// Base type for any item on the canvas
export interface SceneItem {
  id: string; // The ID of the original asset (e.g., Character ID)
  instanceId: string; // A unique ID for this specific instance on the canvas
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
  zIndex: number;
  flipH: boolean;
}

export interface SceneCharacter extends SceneItem {
  name: string;
  poses: Record<string, string>; // poseName: imageUrl
  pose: string; // current pose imageUrl
  animations: AnimationPreset[];
}

export interface TextItem extends SceneItem {
  text: string;
  color: string;
  fontSize: number;
  fontFamily: string;
}

export interface ScenePhoto extends SceneItem {
    name: string;
    url: string;
}

export interface AudioClip {
  id: string;
  name: string;
  url: string;
  trackId: 'voiceover' | 'music' | 'sfx';
  start: number; // start time in seconds
  duration: number; // duration in seconds
  sourceDuration: number; // original duration of the audio file
  offset: number; // offset within the audio file to start playing from
  pitch?: number; // pitch shift in semitones
  characterInstanceId?: string; // ID of the character this voiceover is for
}

export interface AnimationPreset {
  name: string;
  keyframes: {
    [key: string]: { // property name like 'x', 'y', 'scale'
      from: number;
      to: number;
    }
  };
  duration: number; // duration of the animation preset
}

// For the left panel asset lists
export interface Character {
  id: string;
  name: string;
  poses: Record<string, string>;
  animations: AnimationPreset[];
}

export interface Background {
  id: string;
  name:string;
  image: string;
}

export interface SoundEffect {
    name: string;
    url: string;
}