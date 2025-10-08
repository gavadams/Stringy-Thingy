'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Download, Upload, X, Zap, Settings, Image as ImageIcon } from 'lucide-react';
import { downloadInstructionsPDF } from '@/lib/generator/pdf';

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
  const processCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [pins, setPins] = useState<Point[]>([]);
  const cancelRef = useRef(false);
  
  const [settings, setSettings] = useState({
    pegs: kitCode.pegs,
    maxLines: kitCode.max_lines,
    lineOpacity: 30, // 0-100 scale
    minLoop: 30, // Minimum distance between pins
    shape: 'circle' as 'circle' | 'square'
  });

  // Generate pins around a circle
  const generatePins = useCallback((numPins: number, canvasSize: number): Point[] => {
    const pins: Point[] = [];
    const center = canvasSize / 2;
    const radius = (canvasSize / 2) - 20; // Leave margin
    
    for (let i = 0; i < numPins; i++) {
      const angle = (2 * Math.PI * i) / numPins - Math.PI / 2; // Start from top
      pins.push({
        x: Math.round(center + radius * Math.cos(angle)),
        y: Math.round(center + radius * Math.sin(angle))
      });
    }
    
    return pins;
  }, []);

  // Bresenham line algorithm to get all pixels in a line
  const getLinePixels = useCallback((x0: number, y0: number, x1: number, y1: number): Point[] => {
    const pixels: Point[] = [];
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    
    let x = x0;
    let y = y0;
    
    while (true) {
      pixels.push({ x, y });
      
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
    
    return pixels;
  }, []);

  // Calculate how much a line would reduce error (darkness) in the image
  const calculateLineScore = useCallback((
    pin1: Point,
    pin2: Point,
    imageData: Uint8ClampedArray,
    width: number
  ): number => {
    const pixels = getLinePixels(pin1.x, pin1.y, pin2.x, pin2.y);
    let score = 0;
    
    for (const pixel of pixels) {
      if (pixel.x >= 0 && pixel.x < width && pixel.y >= 0 && pixel.y < width) {
        const idx = (pixel.y * width + pixel.x) * 4;
        // Score is based on darkness (lower grayscale value = higher score)
        score += (255 - imageData[idx]);
      }
    }
    
    return score;
  }, [getLinePixels]);

  // Reduce darkness along a line (simulate drawing the line)
  const reduceDarkness = useCallback((
    pin1: Point,
    pin2: Point,
    imageData: Uint8ClampedArray,
    width: number,
    amount: number
  ) => {
    const pixels = getLinePixels(pin1.x, pin1.y, pin2.x, pin2.y);
    
    for (const pixel of pixels) {
      if (pixel.x >= 0 && pixel.x < width && pixel.y >= 0 && pixel.y < width) {
        const idx = (pixel.y * width + pixel.x) * 4;
        // Lighten the pixel (increase RGB values)
        imageData[idx] = Math.min(255, imageData[idx] + amount);
        imageData[idx + 1] = Math.min(255, imageData[idx + 1] + amount);
        imageData[idx + 2] = Math.min(255, imageData[idx + 2] + amount);
      }
    }
  }, [getLinePixels]);

  // Main generation algorithm
  const generateStringArt = useCallback(async () => {
    console.log('generateStringArt called', { 
      image: !!image, 
      resultCanvasRef: !!resultCanvasRef.current, 
      processCanvasRef: !!processCanvasRef.current 
    });
    
    if (!image || !resultCanvasRef.current || !processCanvasRef.current) {
      console.log('Missing requirements:', { 
        image: !!image, 
        resultCanvasRef: !!resultCanvasRef.current, 
        processCanvasRef: !!processCanvasRef.current 
      });
      return;
    }
    
    console.log('Starting generation...');
    setIsGenerating(true);
    setProgress(0);
    setLines([]);
    cancelRef.current = false;
    
    try {
      const canvasSize = 600; // Increased for better quality
      
      // Load and process image
      const img = new Image();
      img.src = URL.createObjectURL(image);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      // Setup processing canvas
      const processCanvas = processCanvasRef.current;
      processCanvas.width = canvasSize;
      processCanvas.height = canvasSize;
      const processCtx = processCanvas.getContext('2d', { willReadFrequently: true });
      if (!processCtx) throw new Error('Cannot get processing context');
      
      // Draw and convert to grayscale
      processCtx.fillStyle = '#ffffff';
      processCtx.fillRect(0, 0, canvasSize, canvasSize);
      
      // Draw image in center circle
      const imgSize = canvasSize - 40;
      processCtx.save();
      processCtx.beginPath();
      processCtx.arc(canvasSize / 2, canvasSize / 2, imgSize / 2, 0, Math.PI * 2);
      processCtx.clip();
      processCtx.drawImage(img, 20, 20, imgSize, imgSize);
      processCtx.restore();
      
      // Get and convert to grayscale
      const imgData = processCtx.getImageData(0, 0, canvasSize, canvasSize);
      const data = imgData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }
      
      // Generate pins
      const generatedPins = generatePins(settings.pegs, canvasSize);
      setPins(generatedPins);
      
      // Setup result canvas
      const resultCanvas = resultCanvasRef.current;
      resultCanvas.width = canvasSize;
      resultCanvas.height = canvasSize;
      const ctx = resultCanvas.getContext('2d');
      if (!ctx) throw new Error('Cannot get result context');
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasSize, canvasSize);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 0.8;
      ctx.globalAlpha = settings.lineOpacity / 100;
      ctx.lineCap = 'round';
      
      // Generate lines
      const generatedLines: Line[] = [];
      let currentPin = 0;
      const maxLines = Math.min(settings.maxLines, settings.pegs * 20);
      const minLoop = settings.minLoop;
      
      for (let lineNum = 0; lineNum < maxLines; lineNum++) {
        if (cancelRef.current) break;
        
        let bestScore = -1;
        let bestPin = -1;
        
        // Find best next pin
        for (let testPin = 0; testPin < settings.pegs; testPin++) {
          // Skip if too close
          const distance = Math.abs(testPin - currentPin);
          if (distance < minLoop && distance > 0 && (settings.pegs - distance) > minLoop) continue;
          
          // Calculate score
          const score = calculateLineScore(
            generatedPins[currentPin],
            generatedPins[testPin],
            data,
            canvasSize
          );
          
          if (score > bestScore) {
            bestScore = score;
            bestPin = testPin;
          }
        }
        
        if (bestPin === -1 || bestScore < 100) break; // No good line found
        
        // Draw the line
        ctx.beginPath();
        ctx.moveTo(generatedPins[currentPin].x, generatedPins[currentPin].y);
        ctx.lineTo(generatedPins[bestPin].x, generatedPins[bestPin].y);
        ctx.stroke();
        
        // Reduce darkness where line was drawn
        reduceDarkness(
          generatedPins[currentPin],
          generatedPins[bestPin],
          data,
          canvasSize,
          settings.lineOpacity / 2 // Proportional to opacity
        );
        
        generatedLines.push({ from: currentPin, to: bestPin });
        currentPin = bestPin;
        
        // Update progress periodically
        if (lineNum % 10 === 0) {
          setProgress((lineNum / maxLines) * 100);
          setLines([...generatedLines]);
          await new Promise(resolve => setTimeout(resolve, 0)); // Let UI update
        }
      }
      
      // Draw pins
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#333333';
      for (const pin of generatedPins) {
        ctx.beginPath();
        ctx.arc(pin.x, pin.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      setProgress(100);
      setLines(generatedLines);
      
      const resultDataUrl = resultCanvas.toDataURL('image/png');
      setResult(resultDataUrl);
      
      onComplete({
        pattern: resultDataUrl,
        settings: settings,
        lines: generatedLines
      });
      
    } catch (error) {
      console.error('Generation error:', error);
      alert('Error: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  }, [image, settings, generatePins, calculateLineScore, reduceDarkness, onComplete]);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const downloadInstructions = useCallback(() => {
    if (!result || !lines.length) return;
    downloadInstructionsPDF({
      lines,
      pegs: pins,
      settings: {
        pegs: settings.pegs,
        lines: settings.maxLines, // Map maxLines to lines
        lineWeight: settings.lineOpacity / 100, // Convert percentage to 0-1 range
        frameShape: settings.shape // Map shape to frameShape
      },
      imagePreview: result,
      kitType: kitCode.kit_type
    });
  }, [result, lines, settings, pins, kitCode.kit_type]);

  const downloadImage = useCallback(() => {
    if (!result) return;
    const link = document.createElement('a');
    link.download = 'string-art-pattern.png';
    link.href = result;
    link.click();
  }, [result]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload Section */}
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
                <p className="font-medium text-gray-700 mb-2">Click to upload image</p>
                <p className="text-sm text-gray-500">JPG, PNG (min 400x400px)</p>
              </div>
            ) : (
              <div className="space-y-4">
                <img 
                  src={imagePreview || ''} 
                  alt="Preview" 
                  className="w-full rounded-xl border border-gray-200" 
                />
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Change Image
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    onClick={() => { 
                      setImagePreview(null); 
                      onImageUpload(null);
                      setResult(null);
                      setLines([]);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="hidden" 
            />
          </CardContent>
        </Card>

        {/* Result */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              String Art Pattern
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <canvas 
                  ref={resultCanvasRef} 
                  className="w-full rounded-xl border border-gray-200" 
                />
                <div className="flex gap-2">
                  <Button onClick={downloadInstructions} className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Instructions (PDF)
                  </Button>
                  <Button onClick={downloadImage} variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Pattern (PNG)
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-gray-200 rounded-xl p-12 text-center bg-gray-50 min-h-[400px] flex flex-col items-center justify-center">
                <Zap className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">Pattern will appear here</p>
                {image && (
                  <Button 
                    onClick={() => {
                      console.log('Generate button clicked');
                      generateStringArt();
                    }} 
                    disabled={isGenerating || disabled}
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <span className="animate-spin mr-2">⚙️</span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Generate String Art
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
            {isGenerating && (
              <div className="mt-4 space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-center text-gray-600">
                  {Math.round(progress)}% - Drawing {lines.length} lines...
                </p>
                <p className="text-xs text-center text-gray-500">
                  This may take 2-5 minutes. Please don&apos;t close this tab.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">
              Pegs (Locked)
            </label>
            <div className="text-3xl font-bold text-blue-600">{settings.pegs}</div>
            <p className="text-xs text-gray-500 mt-1">From your kit</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">
              Max Lines (Locked)
            </label>
            <div className="text-3xl font-bold text-blue-600">{settings.maxLines}</div>
            <p className="text-xs text-gray-500 mt-1">From your kit</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">
              Line Opacity: {settings.lineOpacity}%
            </label>
            <input
              type="range"
              min="10"
              max="50"
              value={settings.lineOpacity}
              onChange={(e) => setSettings(prev => ({ ...prev, lineOpacity: parseInt(e.target.value) }))}
              className="w-full"
              disabled={disabled || isGenerating}
            />
            <p className="text-xs text-gray-500 mt-1">Adjust darkness</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">
              Min Distance: {settings.minLoop}
            </label>
            <input
              type="range"
              min="20"
              max="50"
              value={settings.minLoop}
              onChange={(e) => setSettings(prev => ({ ...prev, minLoop: parseInt(e.target.value) }))}
              className="w-full"
              disabled={disabled || isGenerating}
            />
            <p className="text-xs text-gray-500 mt-1">Pin spacing</p>
          </div>
        </CardContent>
      </Card>

      {/* Kit Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Using kit code: <span className="font-mono font-semibold text-blue-600">{kitCode.code}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Kit type: <span className="font-semibold capitalize">{kitCode.kit_type}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Remaining generations:
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {kitCode.max_generations - kitCode.used_count}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden processing canvas */}
      <canvas ref={processCanvasRef} style={{ display: 'none' }} />
    </div>
  );
}