"use client";

import React, { useState, useRef } from 'react';
import { Upload, Download, Settings, ImagePlus, Zap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { downloadInstructionsPDF, downloadTextInstructions } from '@/lib/generator/pdf';

interface StringArtConverterProps {
  onGenerate?: (result: { lines: unknown[]; pegs: unknown[]; settings: unknown }) => void;
  onImageUpload?: (file: File) => void;
  kitCode?: string;
  remainingGenerations?: number;
  isProcessing?: boolean;
  disabled?: boolean;
}

const StringArtConverter: React.FC<StringArtConverterProps> = ({
  onGenerate,
  onImageUpload,
  kitCode,
  remainingGenerations,
  isProcessing = false,
  disabled = false
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [result, setResult] = useState<{ lines: unknown[]; pegs: unknown[]; settings: unknown } | null>(null);
  const [params, setParams] = useState({
    pegs: 200,
    lines: 3000,
    lineWeight: 0.2,
    frameShape: 'circle' as 'circle' | 'square'
  });
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setError(null);
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          setResult(null); // Clear previous result
          setTimeout(() => drawOriginalImage(img), 0);
          onImageUpload?.(file);
        };
        img.onerror = () => {
          setError('Failed to load image. Please try another file.');
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = () => {
        setError('Failed to read file. Please try again.');
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please upload a valid image file (PNG, JPG, etc.)');
    }
  };

  const drawOriginalImage = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const size = 500;
    canvas.width = size;
    canvas.height = size;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    const scale = Math.min(size / img.width, size / img.height);
    const x = (size - img.width * scale) / 2;
    const y = (size - img.height * scale) / 2;
    
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
  };

  const convertToGrayscale = (imageData: ImageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg;
    }
    return imageData;
  };

  const generatePegs = (numPegs: number, size: number, shape: string) => {
    const pegs: { x: number; y: number }[] = [];
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 20;
    
    if (shape === 'circle') {
      for (let i = 0; i < numPegs; i++) {
        const angle = (i / numPegs) * Math.PI * 2;
        pegs.push({
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        });
      }
    } else {
      const perSide = Math.floor(numPegs / 4);
      for (let i = 0; i < perSide; i++) {
        pegs.push({ x: 20 + (size - 40) * (i / perSide), y: 20 });
      }
      for (let i = 0; i < perSide; i++) {
        pegs.push({ x: size - 20, y: 20 + (size - 40) * (i / perSide) });
      }
      for (let i = 0; i < perSide; i++) {
        pegs.push({ x: size - 20 - (size - 40) * (i / perSide), y: size - 20 });
      }
      for (let i = 0; i < perSide; i++) {
        pegs.push({ x: 20, y: size - 20 - (size - 40) * (i / perSide) });
      }
    }
    
    return pegs;
  };

  const getLinePixels = (x0: number, y0: number, x1: number, y1: number) => {
    const pixels: { x: number; y: number }[] = [];
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let x = Math.round(x0);
    let y = Math.round(y0);

    while (true) {
      pixels.push({ x, y });
      
      if (x === Math.round(x1) && y === Math.round(y1)) break;
      
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
  };

  const calculateLineScore = (pegs: { x: number; y: number }[], pegA: number, pegB: number, imageData: ImageData, size: number) => {
    const pixels = getLinePixels(pegs[pegA].x, pegs[pegA].y, pegs[pegB].x, pegs[pegB].y);
    let score = 0;
    
    for (const pixel of pixels) {
      const x = Math.round(pixel.x);
      const y = Math.round(pixel.y);
      
      if (x >= 0 && x < size && y >= 0 && y < size) {
        const idx = (y * size + x) * 4;
        const darkness = 255 - imageData.data[idx];
        score += darkness;
      }
    }
    
    return score / pixels.length;
  };

  const processImage = async () => {
    if (!image) return;
    
    setError(null);
    
    try {
      const size = 500;
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = size;
      tempCanvas.height = size;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx) throw new Error('Failed to get canvas context');
      
      tempCtx.fillStyle = '#ffffff';
      tempCtx.fillRect(0, 0, size, size);
      
      const scale = Math.min(size / image.width, size / image.height);
      const x = (size - image.width * scale) / 2;
      const y = (size - image.height * scale) / 2;
      
      tempCtx.drawImage(image, x, y, image.width * scale, image.height * scale);
      
      let imageData = tempCtx.getImageData(0, 0, size, size);
      imageData = convertToGrayscale(imageData);
      
      const pegs = generatePegs(params.pegs, size, params.frameShape);
      const lines: { from: number; to: number }[] = [];
      let currentPeg = 0;
      
      const resultCanvas = resultCanvasRef.current;
      if (!resultCanvas) throw new Error('Result canvas not found');
      
      resultCanvas.width = size;
      resultCanvas.height = size;
      const ctx = resultCanvas.getContext('2d');
      
      if (!ctx) throw new Error('Failed to get result canvas context');
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = `rgba(0, 0, 0, ${params.lineWeight})`;
      ctx.lineWidth = 0.5;
      
      for (let line = 0; line < params.lines; line++) {
        let bestScore = -1;
        let bestPeg = -1;
        
        for (let nextPeg = 0; nextPeg < pegs.length; nextPeg++) {
          if (nextPeg === currentPeg) continue;
          if (lines.length > 0 && nextPeg === lines[lines.length - 1].to) continue;
          
          const score = calculateLineScore(pegs, currentPeg, nextPeg, imageData, size);
          
          if (score > bestScore) {
            bestScore = score;
            bestPeg = nextPeg;
          }
        }
        
        if (bestPeg === -1) break;
        
        lines.push({ from: currentPeg, to: bestPeg });
        
        ctx.beginPath();
        ctx.moveTo(pegs[currentPeg].x, pegs[currentPeg].y);
        ctx.lineTo(pegs[bestPeg].x, pegs[bestPeg].y);
        ctx.stroke();
        
        const linePixels = getLinePixels(
          pegs[currentPeg].x, 
          pegs[currentPeg].y, 
          pegs[bestPeg].x, 
          pegs[bestPeg].y
        );
        
        for (const pixel of linePixels) {
          const px = Math.round(pixel.x);
          const py = Math.round(pixel.y);
          
          if (px >= 0 && px < size && py >= 0 && py < size) {
            const idx = (py * size + px) * 4;
            imageData.data[idx] = Math.min(255, imageData.data[idx] + 20);
            imageData.data[idx + 1] = Math.min(255, imageData.data[idx + 1] + 20);
            imageData.data[idx + 2] = Math.min(255, imageData.data[idx + 2] + 20);
          }
        }
        
        currentPeg = bestPeg;
      }
      
      ctx.fillStyle = '#000';
      for (const peg of pegs) {
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      const resultData = { lines, pegs, settings: params };
      setResult(resultData);
      onGenerate?.(resultData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during processing');
    }
  };

  const downloadInstructions = async () => {
    if (!result) return;
    
    try {
      await downloadInstructionsPDF({
        lines: result.lines as { from: number; to: number }[],
        pegs: result.pegs as { x: number; y: number }[],
        settings: params,
        kitType: 'standard'
      });
    } catch (error) {
      console.error('PDF generation failed:', error);
      // Fallback to text instructions
      downloadTextInstructions({
        lines: result.lines as { from: number; to: number }[],
        pegs: result.pegs as { x: number; y: number }[],
        settings: params,
        kitType: 'standard'
      });
    }
  };

  const downloadImage = () => {
    if (!resultCanvasRef.current) return;
    
    const url = resultCanvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'string-art-pattern.png';
    a.click();
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Original Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!image ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-gray-400 transition-colors bg-gray-50"
              >
                <ImagePlus className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-700 text-lg mb-2">Click to upload image</p>
                <p className="text-gray-500 text-sm">PNG, JPG up to 10MB</p>
              </div>
            ) : (
              <div className="space-y-4">
                <canvas
                  ref={canvasRef}
                  className="w-full rounded-xl border border-gray-200"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                >
                  Change Image
                </Button>
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

        {/* Result Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              String Art Pattern
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="border-2 border-gray-200 rounded-xl p-12 text-center bg-gray-50 h-[400px] flex items-center justify-center">
                <div>
                  <p className="text-gray-500 text-lg">Your string art will appear here</p>
                  {image && (
                    <Button
                      onClick={processImage}
                      disabled={isProcessing || disabled}
                      className="mt-6"
                    >
                      {isProcessing ? 'Processing...' : 'Generate String Art'}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <canvas
                  ref={resultCanvasRef}
                  className="w-full rounded-xl border border-gray-200"
                />
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Settings Panel */}
      <Card>
        <CardHeader>
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="ghost"
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Advanced Settings
            </span>
            <span className="text-xl">{showSettings ? '−' : '+'}</span>
          </Button>
        </CardHeader>
        
        {showSettings && (
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Number of Pegs: {params.pegs}</label>
                <input
                  type="range"
                  min="50"
                  max="300"
                  value={params.pegs}
                  onChange={(e) => setParams({...params, pegs: parseInt(e.target.value)})}
                  className="w-full"
                  disabled={disabled}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Number of Lines: {params.lines}</label>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="100"
                  value={params.lines}
                  onChange={(e) => setParams({...params, lines: parseInt(e.target.value)})}
                  className="w-full"
                  disabled={disabled}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Line Darkness: {params.lineWeight.toFixed(2)}</label>
                <input
                  type="range"
                  min="0.05"
                  max="0.5"
                  step="0.05"
                  value={params.lineWeight}
                  onChange={(e) => setParams({...params, lineWeight: parseFloat(e.target.value)})}
                  className="w-full"
                  disabled={disabled}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Frame Shape</label>
                <select
                  value={params.frameShape}
                  onChange={(e) => setParams({...params, frameShape: e.target.value as 'circle' | 'square'})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300"
                  disabled={disabled}
                >
                  <option value="circle">Circle</option>
                  <option value="square">Square</option>
                </select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Kit Code Info */}
      {kitCode && remainingGenerations !== undefined && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Using kit code: <span className="font-mono font-semibold">{kitCode}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {remainingGenerations} generation{remainingGenerations !== 1 ? 's' : ''} remaining
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StringArtConverter;
