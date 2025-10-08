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
  isProcessing: boolean;
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
  isProcessing,
  disabled
}: StringArtGeneratorProps) {
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);
  const [totalLines, setTotalLines] = useState(0);
  const [lines, setLines] = useState<Line[]>([]);
  const [pins, setPins] = useState<Point[]>([]);
  const [settings, setSettings] = useState({
    pegs: kitCode.pegs,
    maxLines: kitCode.max_lines,
    lineOpacity: 0.3,
    lineWidth: 1,
    shape: 'circle' as 'circle' | 'square',
    minLoop: 20
  });


  // Optimized line scoring using Uint8ClampedArray
  const scoreLine = useCallback((x0: number, y0: number, x1: number, y1: number, imageData: Uint8ClampedArray, width: number): number => {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    
    let x = x0;
    let y = y0;
    let score = 0;
    let pixelCount = 0;
    
    while (true) {
      if (x >= 0 && x < width && y >= 0 && y < width) {
        const idx = (y * width + x) * 4;
        const gray = imageData[idx]; // R channel (grayscale)
        score += gray;
        pixelCount++;
      }
      
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
    
    return pixelCount > 0 ? score / pixelCount : 0;
  }, []);

  // Generate pins in a circle or square pattern
  const generatePins = useCallback((numPins: number, shape: 'circle' | 'square'): Point[] => {
    const pins: Point[] = [];
    const centerX = 200;
    const centerY = 200;
    const radius = 180;
    
    for (let i = 0; i < numPins; i++) {
      const angle = (2 * Math.PI * i) / numPins;
      let x: number, y: number;
      
      if (shape === 'circle') {
        x = centerX + radius * Math.cos(angle);
        y = centerY + radius * Math.sin(angle);
      } else {
        // Square pattern
        const side = Math.floor(numPins / 4);
        const sideIndex = i % side;
        const sideNum = Math.floor(i / side);
        
        switch (sideNum) {
          case 0: // Top
            x = 20 + (sideIndex * (360 / side));
            y = 20;
            break;
          case 1: // Right
            x = 380;
            y = 20 + (sideIndex * (360 / side));
            break;
          case 2: // Bottom
            x = 380 - (sideIndex * (360 / side));
            y = 380;
            break;
          default: // Left
            x = 20;
            y = 380 - (sideIndex * (360 / side));
            break;
        }
      }
      
      pins.push({ x: Math.round(x), y: Math.round(y) });
    }
    
    return pins;
  }, []);

  // Convert image to grayscale and get image data
  const processImageData = useCallback((image: HTMLImageElement): Uint8ClampedArray => {
    const canvas = offscreenCanvasRef.current;
    if (!canvas) throw new Error('Offscreen canvas not found');
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not found');
    
    canvas.width = 400;
    canvas.height = 400;
    
    // Draw and scale image
    ctx.drawImage(image, 0, 0, 400, 400);
    
    // Convert to grayscale
    const imageData = ctx.getImageData(0, 0, 400, 400);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      data[i] = gray;     // R
      data[i + 1] = gray; // G
      data[i + 2] = gray; // B
      // Alpha stays the same
    }
    
    ctx.putImageData(imageData, 0, 0);
    return data;
  }, []);

  // Main generation algorithm with progressive rendering
  const generateStringArt = useCallback(async () => {
    if (!image || !resultCanvasRef.current) return;
    
    setIsGenerating(true);
    setProgress(0);
    setCurrentLine(0);
    setLines([]);
    
    try {
      // Create image element
      const img = new Image();
      img.src = URL.createObjectURL(image);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      // Process image data
      const imageData = processImageData(img);
      const generatedPins = generatePins(settings.pegs, settings.shape);
      setPins(generatedPins);
      
      // Initialize result canvas
      const resultCanvas = resultCanvasRef.current;
      resultCanvas.width = 400;
      resultCanvas.height = 400;
      const ctx = resultCanvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not found');
      
      // Clear canvas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 400, 400);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = settings.lineWidth;
      
      const generatedLines: Line[] = [];
      let currentPin = 0;
      const maxLines = Math.min(settings.maxLines, settings.pegs * 10);
      setTotalLines(maxLines);
      
      // Progressive generation with batching
      const batchSize = 10;
      let lineCount = 0;
      
      for (let i = 0; i < maxLines; i++) {
        let bestScore = -1;
        let bestPin = 0;
        
        // Find best next pin
        for (let j = 0; j < settings.pegs; j++) {
          if (j === currentPin) continue;
          
          const score = scoreLine(
            generatedPins[currentPin].x,
            generatedPins[currentPin].y,
            generatedPins[j].x,
            generatedPins[j].y,
            imageData,
            400
          );
          
          if (score > bestScore) {
            bestScore = score;
            bestPin = j;
          }
        }
        
        // Draw line
        ctx.beginPath();
        ctx.moveTo(generatedPins[currentPin].x, generatedPins[currentPin].y);
        ctx.lineTo(generatedPins[bestPin].x, generatedPins[bestPin].y);
        ctx.stroke();
        
        generatedLines.push({ from: currentPin, to: bestPin });
        currentPin = bestPin;
        lineCount++;
        
        // Update progress every batch
        if (lineCount % batchSize === 0) {
          setProgress((lineCount / maxLines) * 100);
          setCurrentLine(lineCount);
          setLines([...generatedLines]);
          
          // Allow UI to update
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      
      // Final update
      setProgress(100);
      setCurrentLine(maxLines);
      setLines(generatedLines);
      
      // Convert to data URL
      const resultDataUrl = resultCanvas.toDataURL('image/png');
      setResult(resultDataUrl);
      
      // Call completion callback
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
    }
  }, [image, settings, processImageData, generatePins, scoreLine, onComplete]);


  // Download functions
  const downloadInstructions = useCallback(() => {
    if (!result || !lines.length) return;
    
    downloadInstructionsPDF({
      lines: lines,
      pegs: pins,
      settings: {
        pegs: settings.pegs,
        lines: settings.maxLines,
        lineWeight: settings.lineWidth,
        frameShape: settings.shape
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

  // Handle image upload
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Settings Panel */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Pegs (Locked)</label>
              <div className="text-2xl font-bold text-blue-600">{settings.pegs}</div>
              <p className="text-xs text-gray-500">Based on your kit type</p>
            </div>
            
            <div>
              <label className="text-sm font-medium">Max Lines (Locked)</label>
              <div className="text-2xl font-bold text-blue-600">{settings.maxLines}</div>
              <p className="text-xs text-gray-500">Based on your kit type</p>
            </div>
            
            <div>
              <label className="text-sm font-medium">Line Opacity</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={settings.lineOpacity}
                onChange={(e) => setSettings(prev => ({ ...prev, lineOpacity: parseFloat(e.target.value) }))}
                className="w-full"
                disabled={disabled}
              />
              <div className="text-sm text-gray-600">{settings.lineOpacity}</div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Line Width</label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.5"
                value={settings.lineWidth}
                onChange={(e) => setSettings(prev => ({ ...prev, lineWidth: parseFloat(e.target.value) }))}
                className="w-full"
                disabled={disabled}
              />
              <div className="text-sm text-gray-600">{settings.lineWidth}</div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Frame Shape</label>
              <select
                value={settings.shape}
                onChange={(e) => setSettings(prev => ({ ...prev, shape: e.target.value as 'circle' | 'square' }))}
                className="w-full p-2 border rounded"
                disabled={disabled}
              >
                <option value="circle">Circle</option>
                <option value="square">Square</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Image Upload */}
      <div className="lg:col-span-2">
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
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-600 mb-2">
                  Drop your image here or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports JPG, PNG, WebP (max 10MB, min 400x400px)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={imagePreview || ''}
                    alt="Upload preview"
                    className="w-full h-64 object-cover rounded-xl border border-gray-200"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImagePreview(null);
                      onImageUpload(null);
                      // Reset the file input
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="flex-1"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Change Image
                  </Button>
                  <Button
                    onClick={generateStringArt}
                    disabled={isProcessing || disabled || isGenerating}
                    className="flex-1"
                  >
                    {isGenerating ? 'Generating...' : 'Generate String Art'}
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Canvas Preview */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              String Art Pattern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <canvas
                ref={resultCanvasRef}
                className="w-full rounded-xl border border-gray-200"
                style={{ display: result ? 'block' : 'none' }}
              />
              {!result && (
                <div className="border-2 border-gray-200 rounded-xl p-12 text-center bg-gray-50 h-[400px] flex items-center justify-center">
                  <div>
                    <p className="text-gray-500 text-lg">Your string art will appear here</p>
                    {image && (
                      <Button
                        onClick={generateStringArt}
                        disabled={isProcessing || disabled || isGenerating}
                        className="mt-6"
                      >
                        {isGenerating ? 'Generating...' : 'Generate String Art'}
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Progress Bar */}
              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Generating...</span>
                    <span>{currentLine} / {totalLines} lines</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
              
              {result && (
                <div className="flex gap-3">
                  <Button
                    onClick={downloadInstructions}
                    className="flex-1"
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Instructions (PDF)
                  </Button>
                  <Button
                    onClick={downloadImage}
                    className="flex-1"
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Pattern
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hidden offscreen canvas for processing */}
      <canvas
        ref={offscreenCanvasRef}
        style={{ display: 'none' }}
        width={400}
        height={400}
      />
    </div>
  );
}
