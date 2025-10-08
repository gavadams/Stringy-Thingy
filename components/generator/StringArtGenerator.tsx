'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Download, Upload, X, Zap, Settings, Image as ImageIcon, Info, AlertCircle } from 'lucide-react';
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

export default function StringArtGenerator({
  kitCode,
  onComplete,
  onImageUpload,
  image,
  disabled
}: StringArtGeneratorProps) {
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [pins, setPins] = useState<Point[]>([]);
  
  const [settings, setSettings] = useState({
    pins: kitCode.pegs,
    strings: kitCode.max_lines,
    minLoop: Math.max(30, Math.floor(kitCode.pegs / 8)),
    fade: 20, // Line opacity (0-255, lower = more transparent)
    lineWeight: 20, // How much darkness to remove per line
  });

  // Bresenham's line algorithm - returns all pixels in a line
  const bresenham = useCallback((x0: number, y0: number, x1: number, y1: number): number[] => {
    const coords: number[] = [];
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let x = x0;
    let y = y0;

    while (true) {
      coords.push(x, y);
      if (x === x1 && y === y1) break;

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

  // Generate pins around circle
  const generatePins = useCallback((numPins: number, diameter: number): Float32Array => {
    const pins = new Float32Array(numPins * 2);
    const radius = diameter / 2;
    const center = radius;
    
    for (let i = 0; i < numPins; i++) {
      const angle = (2 * Math.PI * i) / numPins;
      pins[i * 2] = center + (radius - 10) * Math.cos(angle);
      pins[i * 2 + 1] = center + (radius - 10) * Math.sin(angle);
    }
    
    return pins;
  }, []);

  // Calculate line score based on darkness
  const lineScore = useCallback((
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    pixels: Uint8ClampedArray,
    width: number
  ): number => {
    const coords = bresenham(
      Math.round(x0),
      Math.round(y0),
      Math.round(x1),
      Math.round(y1)
    );
    
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
  }, [bresenham]);

  // Draw line and reduce darkness
  const drawLine = useCallback((
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    pixels: Uint8ClampedArray,
    width: number,
    weight: number
  ) => {
    const coords = bresenham(
      Math.round(x0),
      Math.round(y0),
      Math.round(x1),
      Math.round(y1)
    );
    
    for (let i = 0; i < coords.length; i += 2) {
      const x = coords[i];
      const y = coords[i + 1];
      if (x >= 0 && x < width && y >= 0 && y < width) {
        const idx = (y * width + x) * 4;
        const newVal = Math.min(255, pixels[idx] + weight);
        pixels[idx] = newVal;
        pixels[idx + 1] = newVal;
        pixels[idx + 2] = newVal;
      }
    }
  }, [bresenham]);

  const generateStringArt = useCallback(async () => {
    if (!image) return;
    
    setIsGenerating(true);
    setProgress(0);
    setCurrentStep('Initializing...');
    setLines([]);
    
    try {
      const SIZE = 1000; // Higher resolution
      
      setCurrentStep('Loading image...');
      setProgress(5);
      
      const img = new Image();
      const imageUrl = URL.createObjectURL(image);
      img.src = imageUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image'));
      });
      
      setCurrentStep('Processing image...');
      setProgress(10);
      
      // Process image on source canvas
      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = SIZE;
      sourceCanvas.height = SIZE;
      const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
      if (!sourceCtx) throw new Error('Failed to get source context');
      
      // White background
      sourceCtx.fillStyle = '#FFFFFF';
      sourceCtx.fillRect(0, 0, SIZE, SIZE);
      
      // Draw in circle
      sourceCtx.save();
      sourceCtx.beginPath();
      sourceCtx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 10, 0, Math.PI * 2);
      sourceCtx.clip();
      
      const scale = Math.max(SIZE / img.width, SIZE / img.height);
      const sw = img.width * scale;
      const sh = img.height * scale;
      const sx = (SIZE - sw) / 2;
      const sy = (SIZE - sh) / 2;
      
      sourceCtx.drawImage(img, sx, sy, sw, sh);
      sourceCtx.restore();
      
      URL.revokeObjectURL(imageUrl);
      
      // Get and process pixels
      const imageData = sourceCtx.getImageData(0, 0, SIZE, SIZE);
      const pixels = imageData.data;
      
      // Convert to grayscale
      for (let i = 0; i < pixels.length; i += 4) {
        const gray = pixels[i] * 0.2126 + pixels[i + 1] * 0.7152 + pixels[i + 2] * 0.0722;
        pixels[i] = gray;
        pixels[i + 1] = gray;
        pixels[i + 2] = gray;
      }
      
      // Apply strong contrast and edge enhancement
      setCurrentStep('Enhancing contrast...');
      setProgress(15);
      
      // First pass: increase contrast
      for (let i = 0; i < pixels.length; i += 4) {
        let gray = pixels[i];
        // Strong S-curve contrast
        gray = gray / 255;
        gray = gray < 0.5 
          ? 2 * gray * gray 
          : 1 - 2 * (1 - gray) * (1 - gray);
        gray = gray * 255;
        
        // Apply threshold to enhance edges
        if (gray < 128) {
          gray = Math.max(0, gray - 20);
        } else {
          gray = Math.min(255, gray + 20);
        }
        
        pixels[i] = gray;
        pixels[i + 1] = gray;
        pixels[i + 2] = gray;
      }
      
      setCurrentStep('Generating pins...');
      setProgress(20);
      
      const pinsArray = generatePins(settings.pins, SIZE);
      const pinsPoints: Point[] = [];
      for (let i = 0; i < pinsArray.length; i += 2) {
        pinsPoints.push({ x: pinsArray[i], y: pinsArray[i + 1] });
      }
      setPins(pinsPoints);
      
      setCurrentStep('Creating string art...');
      setProgress(25);
      
      // Create result canvas
      const resultCanvas = document.createElement('canvas');
      resultCanvas.width = SIZE;
      resultCanvas.height = SIZE;
      const ctx = resultCanvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get result context');
      
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 0.7;
      ctx.globalAlpha = settings.fade / 255;
      ctx.lineCap = 'round';
      
      // String art algorithm
      const generatedLines: Line[] = [];
      let currentPin = 0;
      const maxStrings = settings.strings;
      const minLoop = settings.minLoop;
      
      for (let s = 0; s < maxStrings; s++) {
        let bestScore = -1;
        let bestPin = -1;
        
        // Find best next pin
        for (let testPin = 0; testPin < settings.pins; testPin++) {
          if (testPin === currentPin) continue;
          
          // Check minimum distance
          const dist = Math.abs(testPin - currentPin);
          if (dist < minLoop && dist > 0 && (settings.pins - dist) > minLoop) {
            continue;
          }
          
          const x0 = pinsArray[currentPin * 2];
          const y0 = pinsArray[currentPin * 2 + 1];
          const x1 = pinsArray[testPin * 2];
          const y1 = pinsArray[testPin * 2 + 1];
          
          const score = lineScore(x0, y0, x1, y1, pixels, SIZE);
          
          if (score > bestScore) {
            bestScore = score;
            bestPin = testPin;
          }
        }
        
        if (bestPin === -1 || bestScore < 5) break;
        
        const x0 = pinsArray[currentPin * 2];
        const y0 = pinsArray[currentPin * 2 + 1];
        const x1 = pinsArray[bestPin * 2];
        const y1 = pinsArray[bestPin * 2 + 1];
        
        // Draw line
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        
        // Update pixel data
        drawLine(x0, y0, x1, y1, pixels, SIZE, settings.lineWeight);
        
        generatedLines.push({ from: currentPin, to: bestPin });
        currentPin = bestPin;
        
        // Update progress
        if (s % 50 === 0) {
          const prog = 25 + (s / maxStrings) * 70;
          setProgress(prog);
          setCurrentStep(`Drawing string ${s + 1} of ${maxStrings}...`);
          setLines([...generatedLines]);
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      
      setCurrentStep('Finalizing...');
      setProgress(95);
      
      // Draw pins
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#000000';
      for (let i = 0; i < pinsArray.length; i += 2) {
        ctx.beginPath();
        ctx.arc(pinsArray[i], pinsArray[i + 1], 2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      setLines(generatedLines);
      
      const dataUrl = resultCanvas.toDataURL('image/png', 0.95);
      setResult(dataUrl);
      
      // Update the actual canvas ref if it exists
      if (resultCanvasRef.current) {
        const displayCtx = resultCanvasRef.current.getContext('2d');
        if (displayCtx) {
          resultCanvasRef.current.width = SIZE;
          resultCanvasRef.current.height = SIZE;
          displayCtx.drawImage(resultCanvas, 0, 0);
        }
      }
      
      setProgress(100);
      setCurrentStep('Complete!');
      
      console.log(`Generated ${generatedLines.length} lines`);
      
      onComplete({
        pattern: dataUrl,
        settings: settings,
        lines: generatedLines
      });
      
    } catch (error) {
      console.error('Generation error:', error);
      setCurrentStep('');
      alert('Error: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  }, [image, settings, generatePins, lineScore, drawLine, onComplete]);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
      setResult(null);
      setLines([]);
    }
  }, [onImageUpload]);

  const downloadInstructions = useCallback(() => {
    if (!result || !lines.length) return;
    downloadInstructionsPDF({
      lines,
      pegs: pins,
      settings: {
        pegs: settings.pins,
        lines: settings.strings,
        lineWeight: settings.fade / 255,
        frameShape: 'circle'
      },
      imagePreview: result,
      kitType: kitCode.kit_type
    });
  }, [result, lines, settings, pins, kitCode.kit_type]);

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
          <strong>Pro tip:</strong> Best results with high-contrast images. Try increasing contrast in your photo editor before uploading.
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
                <p className="text-sm text-gray-500">JPG, PNG • 1000x1000px+ recommended</p>
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
                    setLines([]);
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
            {result && <canvas ref={resultCanvasRef} className="w-full rounded-xl border" />}
            
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
                <p className="text-lg font-medium mb-2">{currentStep}</p>
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
                  PDF Instructions
                </Button>
                <Button onClick={downloadImage} variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  PNG Pattern
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle><Settings className="w-5 h-5 inline mr-2" />Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium block mb-2">Pins (Locked)</label>
            <div className="text-3xl font-bold text-blue-600">{settings.pins}</div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Lines (Locked)</label>
            <div className="text-3xl font-bold text-blue-600">{settings.strings}</div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Darkness: {settings.fade}</label>
            <input type="range" min="10" max="35" value={settings.fade} onChange={(e) => setSettings(p => ({ ...p, fade: parseInt(e.target.value) }))} className="w-full" disabled={disabled || isGenerating} />
            <p className="text-xs text-gray-500 mt-1">Lower = darker</p>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Weight: {settings.lineWeight}</label>
            <input type="range" min="15" max="30" value={settings.lineWeight} onChange={(e) => setSettings(p => ({ ...p, lineWeight: parseInt(e.target.value) }))} className="w-full" disabled={disabled || isGenerating} />
            <p className="text-xs text-gray-500 mt-1">Coverage amount</p>
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

      <canvas ref={sourceCanvasRef} style={{ display: 'none' }} />
      <canvas ref={previewCanvasRef} style={{ display: 'none' }} />
    </div>
  );
}