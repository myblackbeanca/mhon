import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { applyColorFilter } from '../utils/colorFilters';
import type { FilterType } from './ColorFilters';

interface Props {
  videoUrl: string;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  colorFilter: FilterType;
}

export const HexagonalBarcodeGenerator: React.FC<Props> = ({ videoUrl, canvasRef, colorFilter }) => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    if (!videoUrl || !canvasRef.current) return;

    const video = document.createElement('video');
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setError('Canvas context not supported');
      return;
    }

    let cancelled = false;

    const drawHexagon = (x: number, y: number, size: number, frameData: ImageData | string, index: number) => {
      const numberOfSides = 6;
      const step = 2 * Math.PI / numberOfSides;
      const shift = (Math.PI / 180.0) * 30;

      ctx.save();
      ctx.beginPath();
      
      // Create hexagon path
      for (let i = 0; i <= numberOfSides; i++) {
        const curStep = i * step + shift;
        const curX = x + size * Math.cos(curStep);
        const curY = y + size * Math.sin(curStep);
        if (i === 0) {
          ctx.moveTo(curX, curY);
        } else {
          ctx.lineTo(curX, curY);
        }
      }
      
      ctx.closePath();
      ctx.clip(); // Clip to hexagon shape

      if (colorFilter === 'frame-based' && frameData instanceof ImageData) {
        // Draw the actual frame inside the hexagon
        const frameCanvas = document.createElement('canvas');
        frameCanvas.width = frameData.width;
        frameCanvas.height = frameData.height;
        const frameCtx = frameCanvas.getContext('2d');
        if (frameCtx) {
          frameCtx.putImageData(frameData, 0, 0);
          // Draw the frame scaled to fit the hexagon
          ctx.drawImage(
            frameCanvas,
            x - size,
            y - size,
            size * 2,
            size * 2
          );
        }
      } else {
        // Use color with filter
        const color = typeof frameData === 'string' ? frameData : getBrightestColor(frameData);
        const filteredColor = applyColorFilter(
          color,
          colorFilter,
          index > 0 ? colors[index - 1] : undefined
        );
        ctx.fillStyle = filteredColor;
        ctx.fill();
      }
      
      // Add hexagon border
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.restore();
    };

    const generatePattern = async () => {
      try {
        setProgress(0);
        setError('');
        setColors([]);

        video.src = videoUrl;
        await new Promise((resolve, reject) => {
          video.onloadedmetadata = resolve;
          video.onerror = reject;
        });

        const width = 1000;
        const height = 600;
        canvas.width = width;
        canvas.height = height;

        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);

        const hexRadius = 40;
        const hexHeight = hexRadius * Math.sqrt(3);
        const columns = Math.floor(width / (hexRadius * 1.5));
        const rows = Math.floor(height / hexHeight);
        const totalHexagons = rows * columns;

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // Higher resolution for frame-based filter
        tempCanvas.width = colorFilter === 'frame-based' ? 128 : 32;
        tempCanvas.height = colorFilter === 'frame-based' ? 128 : 32;

        if (!tempCtx) throw new Error('Temp canvas context not available');

        const newColors: string[] = [];
        let hexIndex = 0;

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < columns; col++) {
            if (cancelled) return;

            const x = col * hexRadius * 1.5 + hexRadius;
            const y = row * hexHeight + (col % 2) * hexHeight / 2 + hexRadius;

            // Set video time and wait for frame
            video.currentTime = (hexIndex / totalHexagons) * video.duration;
            await new Promise(resolve => { video.onseeked = resolve; });

            // Capture and process frame
            tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
            const frameData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            
            if (colorFilter === 'frame-based') {
              drawHexagon(x, y, hexRadius, frameData, hexIndex);
            } else {
              const color = getBrightestColor(frameData);
              newColors.push(color);
              drawHexagon(x, y, hexRadius, color, hexIndex);
            }

            hexIndex++;
            setProgress((hexIndex / totalHexagons) * 100);
          }
        }

        if (colorFilter !== 'frame-based') {
          setColors(newColors);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error processing video');
      }
    };

    generatePattern();

    return () => {
      cancelled = true;
      video.src = '';
      setColors([]);
    };
  }, [videoUrl, colorFilter]);

  if (error) {
    return (
      <div className="aspect-video w-full bg-gray-700/30 rounded-xl overflow-hidden flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-red-400 mb-2">⚠️ {error}</p>
          <p className="text-sm text-gray-400">Try uploading a different video file</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full aspect-video rounded-xl"
      />
      {progress < 100 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 rounded-xl">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p className="text-lg font-semibold">
            Generating pattern... {Math.round(progress)}%
          </p>
        </div>
      )}
    </div>
  );
};

function getBrightestColor(imageData: ImageData): string {
  const data = imageData.data;
  let maxBrightness = 0;
  let brightestR = 0, brightestG = 0, brightestB = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
    
    if (brightness > maxBrightness) {
      maxBrightness = brightness;
      brightestR = r;
      brightestG = g;
      brightestB = b;
    }
  }

  // Enhance color saturation for brighter colors
  const maxChannel = Math.max(brightestR, brightestG, brightestB);
  if (maxChannel > 0) {
    const saturationBoost = 1.2;
    brightestR = Math.min(255, brightestR * saturationBoost);
    brightestG = Math.min(255, brightestG * saturationBoost);
    brightestB = Math.min(255, brightestB * saturationBoost);
  }

  return `rgb(${Math.round(brightestR)}, ${Math.round(brightestG)}, ${Math.round(brightestB)})`;
}