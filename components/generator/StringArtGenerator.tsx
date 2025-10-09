// components/generator/StringArtGenerator.tsx

'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Download, Upload, X, Zap, Settings, Image as ImageIcon, Info } from 'lucide-react';
import { downloadInstructionsPDF } from '@/lib/generator/pdf';
import { Alert, AlertDescription } from '@/components/ui/alert';

type KitCode = {
  id: string;
  code: string;
  kit_type: string;
  pegs: number;
  max_lines: number;
  used_count: number;
  max_generations: number;
};

type StringArtGeneratorProps = {
  kitCode: KitCode;
  onComplete: (generation: {
    pattern: string;
    settings: Record<string, unknown>;
    lines: { from: number; to: number }[];
  }) => void;
  onImageUpload: (file: File | null) => void;
  image: File | null;
  disabled: boolean;
};

type Point = { x: number; y: number };
type Line = { from: number; to: number };

export default function StringArtGenerator({
  kitCode,
  onComplete,
  onImageUpload,
  image,
  disabled
}: StringArtGeneratorProps) {
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [pins, setPins] = useState<Point[]>([]);
  const [frameShape, setFrameShape] = useState<'round' | 'square'>('round');

  // Kit presets
  const kitMap = {
    starter: { pins: 150, upscale: 1, beamWidth: 2, lineWeight: 14, maxLines: 3000 },
    standard: { pins: 256, upscale: 2, beamWidth: 4, lineWeight: 10, maxLines: 6000 },
    pro: { pins: 384, upscale: 3, beamWidth: 6, lineWeight: 8, maxLines: 10000 }
  };

  const presetKey = kitCode.pegs >= 384 ? 'pro' : kitCode.pegs >= 256 ? 'standard' : 'starter';
  const preset = kitMap[presetKey as keyof typeof kitMap];

  // --------------------------------------------------------------------
  // Worker loader (uses external file)
  // --------------------------------------------------------------------
  const createWorker = useCallback(() => {
    if (workerRef.current) return workerRef.current;

    // ✅ Adjust path depending on where you store worker.js
    // Option 1: If placed in /public
    const workerUrl = '/worker.js';

    // Option 2: If placed under /src/workers/
    // const workerUrl = new URL('../../workers/worker.js', import.meta.url);

    const w = new Worker(workerUrl, { type: 'module' });
    workerRef.current = w;
    return w;
  }, []);

  // --------------------------------------------------------------------
  // Cleanup
  // --------------------------------------------------------------------
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  // --------------------------------------------------------------------
  // Handle worker messages
  // --------------------------------------------------------------------
  useEffect(() => {
    const w = workerRef.current;
    if (!w) return;

    const handler = (ev: MessageEvent) => {
      const data = ev.data;

      if (data.type === 'progress') {
        setProgress(data.progress ?? 0);
        setCurrentStep(data.step ?? '');
        if (data.lines) setLines((prev) => prev.length < data.lines ? prev : prev);
      } else if (data.type === 'done') {
        const buffer = data.buffer as ArrayBuffer;
        const size = data.size as number;
        const arr = new Uint8ClampedArray(buffer);

        if (resultCanvasRef.current) {
          const ctx = resultCanvasRef.current.getContext('2d');
          if (ctx) {
            resultCanvasRef.current.width = size;
            resultCanvasRef.current.height = size;

            const imageData = ctx.createImageData(size, size);
            for (let i = 0; i < size * size; i++) {
              const v = arr[i];
              imageData.data[i * 4] = v;
              imageData.data[i * 4 + 1] = v;
              imageData.data[i * 4 + 2] = v;
              imageData.data[i * 4 + 3] = 255;
            }
            ctx.putImageData(imageData, 0, 0);

            // Draw threads overlay
            ctx.save();
            ctx.globalAlpha = 0.95;
            ctx.strokeStyle = 'black';
            ctx.lineCap = 'round';
            ctx.lineWidth = 0.6;

            const pinsFlat = data.pins as number[];
            const pinsPoints: Point[] = [];
            for (let i = 0; i < pinsFlat.length; i += 2)
              pinsPoints.push({ x: pinsFlat[i], y: pinsFlat[i + 1] });

            for (let L = 0; L < data.lines.length; L++) {
              const ln = data.lines[L];
              const x0 = pinsPoints[ln.from].x,
                y0 = pinsPoints[ln.from].y;
              const x1 = pinsPoints[ln.to].x,
                y1 = pinsPoints[ln.to].y;
              ctx.beginPath();
              ctx.moveTo(x0, y0);
              ctx.lineTo(x1, y1);
              ctx.stroke();
            }
            ctx.restore();

            const url = resultCanvasRef.current.toDataURL('image/png', 0.95);
            setResult(url);
            setProgress(100);
            setCurrentStep('Complete');
            setLines(data.lines as Line[]);
            setPins(pinsPoints);
            setIsGenerating(false);

            onComplete({ pattern: url, settings: { presetKey }, lines: data.lines as Line[] });
          }
        }
      } else if (data.type === 'error') {
        setIsGenerating(false);
        setCurrentStep('');
        alert('Worker error: ' + data.message);
      }
    };

    w.addEventListener('message', handler);
    return () => w.removeEventListener('message', handler);
  }, [onComplete, presetKey]);

  // --------------------------------------------------------------------
  // Generate button logic
  // --------------------------------------------------------------------
  const generateStringArt = useCallback(async () => {
    if (!image) return;
    setIsGenerating(true);
    setProgress(1);
    setCurrentStep('Preparing image for worker...');
    setLines([]);
    setResult(null);

    try {
      const w = createWorker();
      const buf = await image.arrayBuffer();

      const sizeBase = 900;
      const pinsFactor = Math.min(2, Math.max(1, Math.floor(preset.pins / 200)));
      const size = Math.max(sizeBase, Math.round(sizeBase * preset.upscale * pinsFactor));

      w.postMessage({
        cmd: 'generate',
        imageBuffer: buf,
        imageType: image.type || 'image/png',
        size,
        pins: preset.pins,
        upscale: preset.upscale,
        beamWidth: preset.beamWidth,
        lineWeight: preset.lineWeight,
        maxLines: preset.maxLines,
        frameShape
      }, [buf]);

      setCurrentStep('Worker started');
    } catch (err) {
      setIsGenerating(false);
      setCurrentStep('');
      alert('Generation start failed: ' + ((err as Error)?.message || String(err)));
    }
  }, [image, createWorker, preset, frameShape]);

  // --------------------------------------------------------------------
  // UI
  // --------------------------------------------------------------------
  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      if (file) {
        onImageUpload(file);
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target?.result as string);
        reader.readAsDataURL(file);
        setResult(null);
        setLines([]);
      } else {
        onImageUpload(null);
        setImagePreview(null);
        setResult(null);
        setLines([]);
      }
    },
    [onImageUpload]
  );

  const downloadImage = useCallback(() => {
    if (!result) return;
    const link = document.createElement('a');
    link.download = `string-art-${kitCode.code}.png`;
    link.href = result;
    link.click();
  }, [result, kitCode.code]);

  const downloadInstructions = useCallback(() => {
    if (!result || !lines.length || !pins.length) return;
    downloadInstructionsPDF({
      lines,
      pegs: pins,
      settings: {
        pegs: preset.pins,
        lines: preset.maxLines,
        lineWeight: preset.lineWeight,
        frameShape
      },
      imagePreview: result,
      kitType: kitCode.kit_type
    });
  }, [result, lines, pins, preset, kitCode.kit_type, frameShape]);

  // --------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------
  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro tip:</strong> For portraits use{' '}
          <span className="font-semibold">{presetKey.toUpperCase()}</span>. White background, black
          thread output only.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" /> Upload Image
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
                <p className="text-sm text-gray-500">
                  Best: centered portrait, high-contrast, 1000×1000+
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <img src={imagePreview || ''} alt="Preview" className="w-full rounded-xl border" />
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" /> Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-3 items-center">
              <label className="text-sm">Frame</label>
              <select
                value={frameShape}
                onChange={(e) => setFrameShape(e.target.value as 'round' | 'square')}
                className="ml-2"
              >
                <option value="round">Round</option>
                <option value="square">Square</option>
              </select>

              <div className="ml-auto">
                <span className="text-sm mr-2">Kit:</span>
                <span className="font-semibold">
                  {presetKey.toUpperCase()} ({preset.pins} pins)
                </span>
              </div>
            </div>

            <canvas
              ref={resultCanvasRef}
              className="w-full rounded-xl border"
              style={{ display: result || isGenerating ? 'block' : 'none' }}
            />

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
                <p className="text-xs text-gray-500 mt-4">
                  This runs in a worker — the UI will stay responsive.
                </p>
              </div>
            )}

            {result && (
              <div className="flex gap-2 mt-4">
                <Button onClick={downloadInstructions} className="flex-1">
                  <Download className="w-4 h-4 mr-2" /> PDF Instructions
                </Button>
                <Button onClick={downloadImage} variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" /> PNG Pattern
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Settings className="w-5 h-5 inline mr-2" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium block mb-2">Pins</label>
            <div className="text-3xl font-bold text-blue-600">{preset.pins}</div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Max lines</label>
            <div className="text-3xl font-bold text-blue-600">{preset.maxLines}</div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Quality</label>
            <div className="text-sm text-gray-700">Preset: {presetKey.toUpperCase()}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
              }
