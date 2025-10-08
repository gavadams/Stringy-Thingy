'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Download, Upload, X, Zap, Settings, Image as ImageIcon, Info } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [pins, setPins] = useState<Point[]>([]);
  const cancelRef = useRef(false);
  
  const [settings, setSettings] = useState({
    pins: kitCode.pegs,
    strings: kitCode.max_lines,
    minLoop: Math.max(20, Math.floor(kitCode.pegs / 10)),
    opacity: 25, // Line opacity (lower = darker lines)
    lineWeight: 15, // How much to reduce darkness per line
  });

  // Bresenham line algorithm - optimized version
  const bresenham = useCallback((x0: number, y0: number, x1: number, y1: number): Point[] => {
    const points: Point[] = [];
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let x = x0;
    let y = y0;

    while (true) {
      points.push({ x, y });
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

    return points;
  }, []);

  // Generate pins in a circle
  const generatePins = useCallback((numPins: number, size: number): Point[] => {
    const pins: Point[] = [];
    const center = size / 2;
    const radius = center - 20;
    
    for (let i = 0; i < numPins; i++) {
      const angle = (2 * Math.PI * i) / numPins;
      pins.push({
        x: Math.round(center + radius * Math.cos(angle)),
        y: Math.round(center + radius * Math.sin(angle))
      });
    }
    
    return pins;
  }, []);

  // Pre-calculate and cache all valid lines between pins
  const precalculateLineCache = useCallback((pins: Point[], minDistance: number): Map<string, Point[]> => {
    const cache = new Map<string, Point[]>();
    const numPins = pins.length;
    
    for (let i = 0; i < numPins; i++) {
      for (let j = i + minDistance; j < numPins; j++) {
        // Check both directions meet minimum distance
        if (j - i >= minDistance && numPins - j + i >= minDistance) {
          const pixels = bresenham(pins[i].x, pins[i].y, pins[j].x, pins[j].y);
          cache.set(`${i}-${j}`, pixels);
          cache.set(`${j}-${i}`, pixels); // Bidirectional
        }
      }
    }
    
    return cache;
  }, [bresenham]);

  // Calculate score for a line (sum of darkness along line)
  const scoreLine = useCallback((
    pixels: Point[],
    imageData: Uint8ClampedArray,
    width: number
  ): number => {
    let totalDarkness = 0;
    
    for (const p of pixels) {
      if (p.x >= 0 && p.x < width && p.y >= 0 && p.y < width) {
        const idx = (p.y * width + p.x) * 4;
        // Darkness = 255 - brightness (so dark pixels have high values)
        totalDarkness += (255 - imageData[idx]);
      }
    }
    
    // Return average darkness per pixel
    return totalDarkness / pixels.length;
  }, []);

  // Reduce darkness along a line path
  const reduceLine = useCallback((
    pixels: Point[],
    imageData: Uint8ClampedArray,
    width: number,
    amount: number
  ) => {
    for (const p of pixels) {
      if (p.x >= 0 && p.x < width && p.y >= 0 && p.y < width) {
        const idx = (p.y * width + p.x) * 4;
        // Lighten pixel (reduce darkness need)
        const newValue = Math.min(255, imageData[idx] + amount);
        imageData[idx] = newValue;
        imageData[idx + 1] = newValue;
        imageData[idx + 2] = newValue;
      }
    }
  }, []);

  // Main algorithm
  const generateStringArt = useCallback(async () => {
    console.log('generateStringArt called', { 
      image: !!image, 
      resultCanvasRef: !!resultCanvasRef.current, 
      sourceCanvasRef: !!sourceCanvasRef.current 
    });
    
    // Add a small delay to ensure canvas is rendered
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('After delay:', { 
      resultCanvasRef: !!resultCanvasRef.current, 
      sourceCanvasRef: !!sourceCanvasRef.current 
    });
    
    if (!image || !resultCanvasRef.current || !sourceCanvasRef.current) {
      console.log('Missing requirements:', { 
        image: !!image, 
        resultCanvasRef: !!resultCanvasRef.current, 
        sourceCanvasRef: !!sourceCanvasRef.current 
      });
      return;
    }
    
    console.log('Starting generation...');
    
    setIsGenerating(true);
    setProgress(0);
    setCurrentStep('Loading image...');
    setLines([]);
    cancelRef.current = false;
    
    try {
      const SIZE = 800; // High resolution for quality
      
      // Load image
      const img = new Image();
      img.src = URL.createObjectURL(image);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      setCurrentStep('Processing image...');
      setProgress(5);
      
      // Setup source canvas
      const sourceCanvas = sourceCanvasRef.current;
      sourceCanvas.width = SIZE;
      sourceCanvas.height = SIZE;
      const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
      if (!sourceCtx) throw new Error('Cannot get source context');
      
      // White background
      sourceCtx.fillStyle = '#FFFFFF';
      sourceCtx.fillRect(0, 0, SIZE, SIZE);
      
      // Draw image in circular mask
      sourceCtx.save();
      sourceCtx.beginPath();
      sourceCtx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 10, 0, Math.PI * 2);
      sourceCtx.clip();
      
      // Scale to fill circle
      const scale = Math.max(SIZE / img.width, SIZE / img.height);
      const scaledW = img.width * scale;
      const scaledH = img.height * scale;
      const x = (SIZE - scaledW) / 2;
      const y = (SIZE - scaledH) / 2;
      
      sourceCtx.drawImage(img, x, y, scaledW, scaledH);
      sourceCtx.restore();
      
      // Get image data
      const imgData = sourceCtx.getImageData(0, 0, SIZE, SIZE);
      const data = imgData.data;
      
      // Convert to grayscale
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }
      
      // Enhance contrast - critical for good results!
      const contrastFactor = 1.5;
      for (let i = 0; i < data.length; i += 4) {
        let gray = data[i];
        // Apply contrast
        gray = ((gray / 255 - 0.5) * contrastFactor + 0.5) * 255;
        // Clamp and apply slight gamma correction
        gray = Math.pow(Math.max(0, Math.min(255, gray)) / 255, 0.9) * 255;
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }
      
      setCurrentStep('Generating pins...');
      setProgress(10);
      
      // Generate pins
      const generatedPins = generatePins(settings.pins, SIZE);
      setPins(generatedPins);
      
      setCurrentStep('Pre-calculating line paths (this may take a minute)...');
      setProgress(15);
      
      // Pre-calculate all valid lines - THIS IS THE KEY OPTIMIZATION
      const lineCache = precalculateLineCache(generatedPins, settings.minLoop);
      
      console.log(`Generated ${lineCache.size} possible lines`);
      
      setCurrentStep('Drawing string art...');
      setProgress(20);
      
      // Setup result canvas
      const resultCanvas = resultCanvasRef.current;
      resultCanvas.width = SIZE;
      resultCanvas.height = SIZE;
      const ctx = resultCanvas.getContext('2d');
      if (!ctx) throw new Error('Cannot get result context');
      
      // White background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.globalAlpha = settings.opacity / 100;
      ctx.lineCap = 'round';
      
      // Generate lines using greedy algorithm
      const generatedLines: Line[] = [];
      let currentPin = 0;
      const maxStrings = Math.min(settings.strings, settings.pins * 25);
      
      for (let stringNum = 0; stringNum < maxStrings; stringNum++) {
        if (cancelRef.current) break;
        
        let bestScore = -1;
        let bestPin = -1;
        let bestPixels: Point[] | null = null;
        
        // Test all valid next pins
        for (let nextPin = 0; nextPin < settings.pins; nextPin++) {
          if (nextPin === currentPin) continue;
          
          // Get cached line pixels
          const cacheKey = `${currentPin}-${nextPin}`;
          const pixels = lineCache.get(cacheKey);
          if (!pixels) continue; // Skip if not in cache (too close)
          
          // Calculate score for this line
          const score = scoreLine(pixels, data, SIZE);
          
          if (score > bestScore) {
            bestScore = score;
            bestPin = nextPin;
            bestPixels = pixels;
          }
        }
        
        // Break if no good line found
        if (bestPin === -1 || bestScore < 10 || !bestPixels) break;
        
        // Draw the line on result canvas
        ctx.beginPath();
        ctx.moveTo(generatedPins[currentPin].x, generatedPins[currentPin].y);
        ctx.lineTo(generatedPins[bestPin].x, generatedPins[bestPin].y);
        ctx.stroke();
        
        // Reduce darkness in source data
        reduceLine(bestPixels, data, SIZE, settings.lineWeight);
        
        generatedLines.push({ from: currentPin, to: bestPin });
        currentPin = bestPin;
        
        // Update progress
        if (stringNum % 25 === 0) {
          const progressPercent = 20 + (stringNum / maxStrings) * 70;
          setProgress(progressPercent);
          setCurrentStep(`Drawing line ${stringNum + 1} of ${maxStrings}...`);
          setLines([...generatedLines]);
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      
      setCurrentStep('Finalizing...');
      setProgress(95);
      
      // Draw pins on top
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#1a1a1a';
      for (const pin of generatedPins) {
        ctx.beginPath();
        ctx.arc(pin.x, pin.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      setProgress(100);
      setCurrentStep('Complete!');
      setLines(generatedLines);
      
      const resultDataUrl = resultCanvas.toDataURL('image/png', 0.95);
      setResult(resultDataUrl);
      
      console.log(`Generated ${generatedLines.length} lines`);
      
      onComplete({
        pattern: resultDataUrl,
        settings: settings,
        lines: generatedLines
      });
      
    } catch (error) {
      console.error('Generation error:', error);
      alert('Error generating string art: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
      setCurrentStep('');
    }
  }, [
    image,
    settings,
    generatePins,
    precalculateLineCache,
    scoreLine,
    reduceLine,
    onComplete
  ]);

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
        lineWeight: settings.opacity / 100,
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
      {/* Tips Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Best results:</strong> Use high-contrast portraits with clear subjects. 
          Avoid busy backgrounds. The algorithm works best with faces and simple subjects.
        </AlertDescription>
      </Alert>

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
                <p className="text-sm text-gray-500">
                  JPG, PNG • Min 800x800px • High contrast works best
                </p>
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
                    disabled={isGenerating}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Change
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    onClick={() => { 
                      setImagePreview(null); 
                      onImageUpload(null);
                      setResult(null);
                      setLines([]);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    disabled={isGenerating}
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
            <div className="space-y-4">
              {result && (
                <canvas 
                  ref={resultCanvasRef} 
                  className="w-full rounded-xl border border-gray-200" 
                />
              )}
              
              {!result && !isGenerating && (
                <div className="border-2 border-gray-200 rounded-xl p-12 text-center bg-gray-50 min-h-[400px] flex flex-col items-center justify-center">
                  <Zap className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">Pattern will appear here</p>
                  {image && (
                    <Button 
                      onClick={() => {
                        console.log('Generate button clicked');
                        console.log('Button state:', { isGenerating, disabled });
                        generateStringArt();
                      }} 
                      disabled={disabled}
                      size="lg"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Generate String Art
                    </Button>
                  )}
                </div>
              )}
              
              {isGenerating && (
                <div className="border-2 border-gray-200 rounded-xl p-12 text-center bg-gray-50 min-h-[400px] flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-lg font-medium text-gray-700 mb-2">{currentStep}</p>
                  <div className="w-full max-w-md mt-4">
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-gray-500 mt-2">{Math.round(progress)}%</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    This may take 3-8 minutes depending on settings
                  </p>
                </div>
              )}
              
              {result && (
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
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Advanced Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">
              Pins (Locked)
            </label>
            <div className="text-3xl font-bold text-blue-600">{settings.pins}</div>
            <p className="text-xs text-gray-500 mt-1">Based on your kit</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">
              Max Lines (Locked)
            </label>
            <div className="text-3xl font-bold text-blue-600">{settings.strings}</div>
            <p className="text-xs text-gray-500 mt-1">Based on your kit</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">
              Line Darkness: {settings.opacity}%
            </label>
            <input
              type="range"
              min="15"
              max="40"
              value={settings.opacity}
              onChange={(e) => setSettings(prev => ({ ...prev, opacity: parseInt(e.target.value) }))}
              className="w-full"
              disabled={disabled || isGenerating}
            />
            <p className="text-xs text-gray-500 mt-1">Lower = darker lines</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">
              Line Weight: {settings.lineWeight}
            </label>
            <input
              type="range"
              min="10"
              max="25"
              value={settings.lineWeight}
              onChange={(e) => setSettings(prev => ({ ...prev, lineWeight: parseInt(e.target.value) }))}
              className="w-full"
              disabled={disabled || isGenerating}
            />
            <p className="text-xs text-gray-500 mt-1">How much each line covers</p>
          </div>
        </CardContent>
      </Card>

      {/* Kit Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Kit Code: <span className="font-mono font-semibold text-blue-600 text-base">{kitCode.code}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Type: <span className="font-semibold capitalize text-purple-600">{kitCode.kit_type}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Generations Left</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {kitCode.max_generations - kitCode.used_count}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden canvases */}
      <canvas ref={sourceCanvasRef} style={{ display: 'none' }} />
    </div>
  );
}