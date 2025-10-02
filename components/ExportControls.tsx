import React, { useState } from 'react';
import { Scene, Keyframe, SceneItem, SceneCharacter, ScenePhoto, TextItem, AudioClip } from '../types';

interface ExportControlsProps {
  scene: Scene;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const ExportControls: React.FC<ExportControlsProps> = ({ scene }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = async (format: 'MP4') => {
    setIsExporting(true);
    setProgress(0);

    const canvas = document.createElement('canvas');
    // For performance, let's cap export resolution
    const exportWidth = 1280;
    const exportHeight = 720;
    canvas.width = exportWidth;
    canvas.height = exportHeight;
    const ctx = canvas.getContext('2d')!;

    // 1. Preload all images
    const imageUrls = new Set<string>();
    imageUrls.add(scene.background);
    scene.keyframes.forEach(kf => {
        // FIX: Explicitly type `p` as string. In some TypeScript environments, `Object.values` may return `unknown[]`, causing a type error.
        kf.characters.forEach(c => Object.values(c.poses).forEach((p: string) => imageUrls.add(p)));
        kf.photos.forEach(p => imageUrls.add(p.url));
    });

    const loadedImages = new Map<string, HTMLImageElement>();
    const imagePromises = Array.from(imageUrls).map(url => new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            loadedImages.set(url, img);
            resolve();
        };
        img.onerror = reject;
        img.src = url;
    }));
    await Promise.all(imagePromises);
    setProgress(10);

    // 2. Mix audio
    const audioContext = new (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext)(2, 44100 * scene.duration, 44100);
    const audioPromises = scene.audioClips.map(clip => fetch(clip.url).then(res => res.arrayBuffer()).then(buffer => audioContext.decodeAudioData(buffer)));
    const audioBuffers = await Promise.all(audioPromises);
    
    audioBuffers.forEach((buffer, index) => {
        const clip = scene.audioClips[index];
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        if (clip.pitch) {
            source.playbackRate.value = Math.pow(2, clip.pitch / 12);
        }
        source.connect(audioContext.destination);
        source.start(clip.start, clip.offset, clip.duration);
    });
    
    const mixedAudioBuffer = await audioContext.startRendering();
    setProgress(30);

    // 3. Setup MediaStream and Recorder
    const videoStream = canvas.captureStream(30);
    const audioDestination = new MediaStreamAudioDestinationNode(new AudioContext());
    const audioSource = new AudioBufferSourceNode(new AudioContext(), { buffer: mixedAudioBuffer });
    audioSource.connect(audioDestination);
    audioSource.start();

    const combinedStream = new MediaStream([
        videoStream.getVideoTracks()[0],
        audioDestination.stream.getAudioTracks()[0]
    ]);
    
    const recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });
    const chunks: Blob[] = [];
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `toon-life-animation.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
    };

    recorder.start();

    // 4. Render frames
    let startTime = performance.now();
    const renderFrame = (now: number) => {
        const currentTime = (now - startTime) / 1000;
        
        if (currentTime > scene.duration) {
            recorder.stop();
            return;
        }

        setProgress(30 + (currentTime / scene.duration) * 70);

        // Find keyframes and interpolation factor
        let fromKfIndex = scene.keyframes.length - 1;
        while(fromKfIndex > 0 && (fromKfIndex / (scene.keyframes.length - 1)) * scene.duration > currentTime) {
            fromKfIndex--;
        }
        const toKfIndex = Math.min(fromKfIndex + 1, scene.keyframes.length - 1);
        const fromKfTime = (fromKfIndex / (scene.keyframes.length - 1)) * scene.duration;
        const toKfTime = (toKfIndex / (scene.keyframes.length - 1)) * scene.duration;

        let t = 0;
        if(toKfTime > fromKfTime) {
            t = (currentTime - fromKfTime) / (toKfTime - fromKfTime);
        }
        
        const fromKf = scene.keyframes[fromKfIndex];
        const toKf = scene.keyframes[toKfIndex];

        // Draw background
        const bgImg = loadedImages.get(scene.background);
        if(bgImg) ctx.drawImage(bgImg, 0, 0, exportWidth, exportHeight);

        // Interpolate and draw items
        const allItemsFrom = [...fromKf.characters, ...fromKf.photos, ...fromKf.textItems];
        
        allItemsFrom.sort((a,b) => a.zIndex - b.zIndex).forEach(fromItem => {
            const id = 'instanceId' in fromItem ? fromItem.instanceId : fromItem.id;
            const toItem = [...toKf.characters, ...toKf.photos, ...toKf.textItems].find(item => ('instanceId' in item ? item.instanceId : item.id) === id);

            if(!toItem) return;

            const x = lerp(fromItem.x, toItem.x, t);
            const y = lerp(fromItem.y, toItem.y, t);
            const w = lerp(fromItem.width, toItem.width, t);
            const h = lerp(fromItem.height, toItem.height, t);
            const rot = lerp(fromItem.rotation, toItem.rotation, t);
            const scale = lerp(fromItem.scale, toItem.scale, t);
            
            ctx.save();
            ctx.translate(x + w / 2, y + h / 2);
            ctx.rotate(rot * Math.PI / 180);
            ctx.scale(scale, scale);
            ctx.translate(-(x + w / 2), -(y + h / 2));

            if('poses' in fromItem) { // Character
                const img = loadedImages.get(fromItem.pose);
                if(img) {
                    if (fromItem.flipH) {
                        ctx.scale(-1, 1);
                        ctx.drawImage(img, -(x + w), y, w, h);
                    } else {
                        ctx.drawImage(img, x, y, w, h);
                    }
                }
            } else if ('url' in fromItem) { // Photo
                const img = loadedImages.get(fromItem.url);
                if (img) ctx.drawImage(img, x, y, w, h);
            } else { // Text
                const fromColor = fromItem.color;
                const toColor = (toItem as TextItem).color;
                // color lerp logic here if needed, for now just use from color
                ctx.font = `${lerp(fromItem.fontSize, (toItem as TextItem).fontSize, t)}px ${fromItem.fontFamily}`;
                ctx.fillStyle = fromColor;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(fromItem.text, x + w / 2, y + h / 2);
            }
            ctx.restore();
        });

        requestAnimationFrame(renderFrame);
    };

    requestAnimationFrame(renderFrame);
  };

  if (isExporting) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-32 h-10 bg-slate-700 rounded-md flex items-center justify-center">
            <div className="w-full bg-slate-800 rounded-full h-2.5 mx-2">
                <div className="bg-cyan-500 h-2.5 rounded-full" style={{width: `${progress}%`}}></div>
            </div>
        </div>
        <button className="px-4 py-2 text-sm font-semibold bg-purple-600 rounded-md" disabled>
            Exporting...
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleExport('MP4')}
        className="px-4 py-2 text-sm font-semibold bg-purple-600 rounded-md hover:bg-purple-500 transition-colors shadow-md"
      >
        Export Video
      </button>
    </div>
  );
};

export default ExportControls;