'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Download, Upload, X, Zap, Settings as SettingsIcon, Image as ImageIcon, Info } from 'lucide-react';
import { downloadInstructionsPDF } from '@/lib/generator/pdf';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface KitCode {
  id: string;
  code: string;
  kit_type: string;
  pegs: number;
  max_lines: number;
  used_count: number;
  max_generations: number;
}

interface StringArtGeneratorProps {
  kitCode: KitCode;
  onComplete: (generation: {
    pattern: string;
    settings: Record<string, unknown>;
    lines: { from: number; to: number }[];
  }) => void;
  onImageUpload: (file: File | null) => void;
  image: File | null;
  disabled: boolean;
}

interface Point {
  x: number;
  y: number;
}

interface Line {
  from: number;
  to: number;
}

interface Settings {
  pins: number;
  maxStrings: number;
  minDistance: number;
  lineAlpha: number;
  lineRemoval: number;
}

export default function StringArtGenerator({
  kitCode,
  onComplete,
  onImageUpload,
  image,
  disabled
}: StringArtGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLines, setGeneratedLines] = useState<Line[]>([]);
  const [pins, setPins] = useState<Point[]>([]);
  
  const [settings, setSettings] = useState<Settings>({
    pins: kitCode.pegs,
    maxStrings: kitCode.max_lines,
    minDistance: Math.max(25, Math.floor(kitCode.pegs / 8)),
    lineAlpha: 25,
    lineRemoval: 22,
  });

  const generateCircularPins = useCallback((count: number, size: number): Point[] => {
    const pins: Point[] = [];
    const center = size / 2;
    const radius = center - 15;
    
    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count;
      pins.push({
        x: Math.round(center + radius * Math.cos(angle)),
        y: Math.round(center + radius * Math.sin(angle))
      });
    }
    
    return pins;
  }, []);

  const getLineCoords = useCallback((x0: number, y0: number, x1: number, y1: number): number[] => {
    const coords: number[] = [];
    let x = Math.floor(x0);
    let y = Math.floor(y0);
    const x2 = Math.floor(x1);
    const y2 = Math.floor(y1);
    
    const dx = Math.abs(x2 - x);
    const dy = Math.abs(y2 - y);
    const sx = x < x2 ? 1 : -1;
    const sy = y < y2 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      coords.push(x, y);
      if (x === x2 && y === y2) break;
      
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
    
    return coords;
  }, []);

  const scoreLine = useCallback((
    coords: number[],
    pixels: Uint8ClampedArray,
    width: number
  ): number => {
    let score = 0;
    
    for (let i = 0; i < coords.length; i += 2) {
      const x = coords[i];
      const y = coords[i + 1];
      
      if (x >= 0 && x < width && y >= 0 && y < width) {
        const idx = (y * width + x) * 4;
        score += (255 - pixels[idx]);
      }
    }
    
    return score / (coords.length / 2);
  }, []);

  const removeDarkness = useCallback((
    coords: number[],
    pixels: Uint8ClampedArray,
    width: number,
    amount: number
  ) => {
    for (let i = 0; i < coords.length; i += 2) {
      const x = coords[i];
      const y = coords[i + 1];
      
      if (x >= 0 && x < width && y >= 0 && y < width) {
        const idx = (y * width + x) * 4;
        const newValue = Math.min(255, pixels[idx] + amount);
        pixels[idx] = newValue;
        pixels[idx + 1] = newValue;
        pixels[idx + 2] = newValue;
      }
    }
  }, []);

  const generateStringArt = useCallback(async () => {
    if (!image) return;
    
    setIsGenerating(true);
    setProgress(0);
    setStatus('Loading image...');
    setGeneratedLines([]);
    
    try {
      const SIZE = 1000;
      
      const img = new Image();
      img.src = URL.createObjectURL(image);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      setStatus('Processing image...');
      setProgress(10);
      
      const processCanvas = document.createElement('canvas');
      processCanvas.width = SIZE;
      processCanvas.height = SIZE;
      const processCtx = processCanvas.getContext('2d', { willReadFrequently: true });
      if (!processCtx) throw new Error('Cannot get context');
      
      processCtx.fillStyle = '#FFFFFF';
      processCtx.fillRect(0, 0, SIZE, SIZE);
      
      processCtx.save();
      processCtx.beginPath();
      processCtx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 10, 0, Math.PI * 2);
      processCtx.clip();
      
      const scale = Math.max(SIZE / img.width, SIZE / img.height);
      const sw = img.width * scale;
      const sh = img.height * scale;
      const sx = (SIZE - sw) / 2;
      const sy = (SIZE - sh) / 2;
      
      processCtx.drawImage(img, sx, sy, sw, sh);
      processCtx.restore();
      
      const imageData = processCtx.getImageData(0, 0, SIZE, SIZE);
      const pixels = imageData.data;
      
      for (let i = 0; i < pixels.length; i += 4) {
        const gray = pixels[i] * 0.2126 + pixels[i + 1] * 0.7152 + pixels[i + 2] * 0.0722;
        pixels[i] = gray;
        pixels[i + 1] = gray;
        pixels[i + 2] = gray;
      }
      
      setStatus('Enhancing contrast...');
      setProgress(20);
      
      for (let i = 0; i < pixels.length; i += 4) {
        let gray = pixels[i] / 255;
        gray = gray < 0.5 ? 2 * gray * gray : 1 - 2 * (1 - gray) * (1 - gray);
        gray = gray * 255;
        
        if (gray < 128) {
          gray = Math.max(0, gray - 15);
        } else {
          gray = Math.min(255, gray + 15);
        }
        
        pixels[i] = gray;
        pixels[i + 1] = gray;
        pixels[i + 2] = gray;
      }
      
      setStatus('Generating pins...');
      setProgress(25);
      
      const pinsArray = generateCircularPins(settings.pins, SIZE);
      setPins(pinsArray);
      
      setStatus('Creating string art...');
      setProgress(30);
      
      const resultCanvas = canvasRef.current || document.createElement('canvas');
      resultCanvas.width = SIZE;
      resultCanvas.height = SIZE;
      const ctx = resultCanvas.getContext('2d');
      if (!ctx) throw new Error('Cannot get result context');
      
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 0.8;
      ctx.globalAlpha = settings.lineAlpha / 100;
      ctx.lineCap = 'round';
      
      const lines: Line[] = [];
      let currentPin = 0;
      const maxStrings = settings.maxStrings;
      const minDist = settings.minDistance;
      
      for (let s = 0; s < maxStrings; s++) {
        let bestScore = -1;
        let bestPin = -1;
        let bestCoords: number[] = [];
        
        for (let testPin = 0; testPin < settings.pins; testPin++) {
          if (testPin === currentPin) continue;
          
          const dist = Math.abs(testPin - currentPin);
          if (dist < minDist && dist > 0 && (settings.pins - dist) > minDist) {
            continue;
          }
          
          const coords = getLineCoords(
            pinsArray[currentPin].x,
            pinsArray[currentPin].y,
            pinsArray[testPin].x,
            pinsArray[testPin].y
          );
          
          const score = scoreLine(coords, pixels, SIZE);
          
          if (score > bestScore) {
            bestScore = score;
            bestPin = testPin;
            bestCoords = coords;
          }
        }
        
        if (bestPin === -1 || bestScore < 5) break;
        
        ctx.beginPath();
        ctx.moveTo(pinsArray[currentPin].x, pinsArray[currentPin].y);
        ctx.lineTo(pinsArray[bestPin].x, pinsArray[bestPin].y);
        ctx.stroke();
        
        removeDarkness(bestCoords, pixels, SIZE, settings.lineRemoval);
        
        lines.push({ from: currentPin, to: bestPin });
        currentPin = bestPin;
        
        if (s % 50 === 0) {
          const prog = 30 + (s / maxStrings) * 65;
          setProgress(prog);
          setStatus(`Drawing string ${s + 1} of ${maxStrings}...`);
          setGeneratedLines([...lines]);
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      
      setStatus('Finalizing...');
      setProgress(98);
      
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#000000';
      for (const pin of pinsArray) {
        ctx.beginPath();
        ctx.arc(pin.x, pin.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      setGeneratedLines(lines);
      const dataUrl = resultCanvas.toDataURL('image/png', 0.95);
      setResult(dataUrl);
      
      setProgress(100);
      setStatus('Complete!');
      
      console.log(`Generated ${lines.length} lines`);
      
      onComplete({
        pattern: dataUrl,
        settings: settings,
        lines: lines
      });
      
    } catch (error) {
      console.error('Error:', error);
      setStatus('');
      alert('Error: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  }, [image, settings, generateCircularPins, getLineCoords, scoreLine, removeDarkness, onComplete]);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
      setResult(null);
      setGeneratedLines([]);
    }
  }, [onImageUpload]);

  const downloadInstructions = useCallback(() => {
    if (!result || !generatedLines.length) return;
    downloadInstructionsPDF({
      lines: generatedLines,
      pegs: pins,
      settings: {
        pegs: settings.pins,
        lines: settings.maxStrings,
        lineWeight: settings.lineAlpha / 100,
        frameShape: 'circle'
      },
      imagePreview: result,
      kitType: kitCode.kit_type
    });
  }, [result, generatedLines, settings, pins, kitCode.kit_type]);

  const downloadImage = useCallback(() => {
    if (!result) return;
    const link = document.createElement('a');
    link.download = `string-art-${kitCode.code}.png`;
    link.href = result;
    link.click();
  }, [result, kitCode.code]);

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Best results:</strong> Use high-contrast images with clear subjects. Faces and simple objects work best.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!image ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="font-medium text-gray-700 mb-2">Click to upload</p>
                <p className="text-sm text-gray-500">JPG, PNG • High resolution recommended</p>
              </div>
            ) : (
              <div className="space-y-4">
                <img src={imagePreview || ''} alt="Preview" className="w-full rounded-xl border" />
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => fileInputRef.current?.click()} disabled={isGenerating}>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Change
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => { 
                    setImagePreview(null); 
                    onImageUpload(null);
                    setResult(null);
                    setGeneratedLines([]);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }} disabled={isGenerating}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result && <canvas ref={canvasRef} className="w-full rounded-xl border" />}
            
            {!result && !isGenerating && (
              <div className="border-2 border-gray-200 rounded-xl p-12 text-center bg-gray-50 min-h-[400px] flex flex-col items-center justify-center">
                <Zap className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">Pattern will appear here</p>
                {image && (
                  <Button onClick={generateStringArt} disabled={disabled} size="lg">
                    <Zap className="w-4 h-4 mr-2" />
                    Generate String Art
                  </Button>
                )}
              </div>
            )}
            
            {isGenerating && (
              <div className="border-2 rounded-xl p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-lg font-medium mb-2">{status}</p>
                <div className="w-full max-w-md mt-4">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-gray-500 mt-2">{Math.round(progress)}%</p>
                </div>
                <p className="text-xs text-gray-500 mt-4">This takes 4-8 minutes</p>
              </div>
            )}
            
            {result && (
              <div className="flex gap-2 mt-4">
                <Button onClick={downloadInstructions} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Instructions
                </Button>
                <Button onClick={downloadImage} variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Pattern
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle><SettingsIcon className="w-5 h-5 inline mr-2" />Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium block mb-2">Pins (Locked)</label>
            <div className="text-3xl font-bold text-blue-600">{settings.pins}</div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Lines (Locked)</label>
            <div className="text-3xl font-bold text-blue-600">{settings.maxStrings}</div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Opacity: {settings.lineAlpha}%</label>
            <input 
              type="range" 
              min="15" 
              max="40" 
              value={settings.lineAlpha} 
              onChange={(e) => setSettings(p => ({ ...p, lineAlpha: parseInt(e.target.value) }))} 
              className="w-full" 
              disabled={disabled || isGenerating} 
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Weight: {settings.lineRemoval}</label>
            <input 
              type="range" 
              min="15" 
              max="30" 
              value={settings.lineRemoval} 
              onChange={(e) => setSettings(p => ({ ...p, lineRemoval: parseInt(e.target.value) }))} 
              className="w-full" 
              disabled={disabled || isGenerating} 
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Code: <span className="font-mono font-semibold text-blue-600">{kitCode.code}</span></p>
              <p className="text-sm">Type: <span className="font-semibold capitalize">{kitCode.kit_type}</span></p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Remaining</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {kitCode.max_generations - kitCode.used_count}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}