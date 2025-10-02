import React from 'react';
import { Character, Background, SoundEffect } from './types';

// Icons
export const UndoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l4-4m-4 4l4 4" /></svg>;
export const RedoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-4-4m4 4l-4 4" /></svg>;
export const FlipIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 20.5V3.5m0 17L8.5 17m3.5 3.5L15.5 17"/><path d="M12 3.5L8.5 7M12 3.5L15.5 7"/></svg>;
export const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
export const BringForwardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" /></svg>;
export const SendBackwardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010-18z" /></svg>;
export const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
export const PauseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
export const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
export const MicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
export const StopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" /></svg>;


// Mock data
export const CHARACTERS: Character[] = [
  {
    id: 'char1',
    name: 'Captain Astro',
    poses: {
      idle: '/assets/characters/astro-idle.png',
      walking: '/assets/characters/astro-walking.png',
      talking: '/assets/characters/astro-talking.png',
    },
    animations: [],
  },
  {
    id: 'char2',
    name: 'Luna the Robot',
    poses: {
      idle: '/assets/characters/luna-idle.png',
      happy: '/assets/characters/luna-happy.png',
      sad: '/assets/characters/luna-sad.png',
    },
    animations: [],
  },
  {
    id: 'rajasthani-man',
    name: 'Rajasthani Man',
    poses: {
      idle: '/assets/characters/rajasthani-man-idle.png',
      happy: '/assets/characters/rajasthani-man-happy.png',
      sad: '/assets/characters/rajasthani-man-sad.png',
    },
    animations: [],
  },
  {
    id: 'rajasthani-woman',
    name: 'Rajasthani Woman',
    poses: {
      idle: '/assets/characters/rajasthani-woman-idle.png',
      happy: '/assets/characters/rajasthani-woman-happy.png',
      romantic: '/assets/characters/rajasthani-woman-romantic.png',
    },
    animations: [],
  }
];

export const BACKGROUNDS: Background[] = [
    { id: 'bg1', name: 'Space Station', image: '/assets/backgrounds/space-station.jpg' },
    { id: 'bg2', name: 'Alien Planet', image: '/assets/backgrounds/alien-planet.jpg' },
    { id: 'bg3', name: 'Cyber City', image: '/assets/backgrounds/cyber-city.jpg' },
    { id: 'bg-rajasthani-village', name: 'Rajasthani Village', image: '/assets/backgrounds/rajasthani-village.jpg' },
];

export const SOUND_EFFECTS: SoundEffect[] = [
    { name: 'Laser Blast', url: '/assets/sfx/laser.mp3'},
    { name: 'Whoosh', url: '/assets/sfx/whoosh.mp3'},
    { name: 'Beep', url: '/assets/sfx/beep.mp3'},
];