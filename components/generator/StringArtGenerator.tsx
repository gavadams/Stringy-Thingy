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
  onComplete: (generation: { pattern: string; settings: Record<string, unknown>; lines: { from: number; to: number }[]; }) => void;
  onImageUpload: (file: File | null) => void;
  image: File | null;
  disabled: boolean;
};

type Point = { x: number; y: number; };
type Line = { from: number; to: number; };

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

  // Kit presets (Starter/Standard/Pro)
  const kitMap = {
    starter: { pins: 150, upscale: 1, beamWidth: 2, lineWeight: 14, maxLines: 3000 },
    standard: { pins: 256, upscale: 2, beamWidth: 4, lineWeight: 10, maxLines: 6000 },
    pro: { pins: 384, upscale: 3, beamWidth: 6, lineWeight: 8, maxLines: 10000 }
  };

  const presetKey = kitCode.pegs >= 384 ? 'pro' : kitCode.pegs >= 256 ? 'standard' : 'starter';
  const preset = kitMap[presetKey as keyof typeof kitMap];

  // ---------------------------
  // Use external worker.js
  // ---------------------------
  const createWorker = useCallback(() => {
    if (workerRef.current) return workerRef.current;
    const w = new Worker('/worker.js'); // <-- your external worker file in /public
    workerRef.current = w;
    return w;
  }, []);

  // cleanup worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  // handle worker messages
  useEffect(() => {
    const w = workerRef.current;
    if (!w) return;
    const handler = (ev: MessageEvent) => {
      const data = ev.data;
      if (data.type === 'progress') {
        setProgress(data.progress ?? 0);
        setCurrentStep(data.step ?? '');
        if (data.lines) setLines(data.lines as Line[]);
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

            // draw lines overlay
            ctx.save();
            ctx.globalAlpha = 0.95;
            ctx.strokeStyle = 'black';
            ctx.lineCap = 'round';
            ctx.lineWidth = 0.6;
            const pinsFlat = data.pins as number[];
            const pinsPoints: Point[] = [];
            for (let i = 0; i < pinsFlat.length; i += 2) pinsPoints.push({ x: pinsFlat[i], y: pinsFlat[i + 1] });

            for (let L = 0; L < (data.lines as { from: number; to: number }[]).length; L++) {
              const ln = (data.lines as { from: number; to: number }[])[L];
              const x0 = pinsPoints[ln.from].x, y0 = pinsPoints[ln.from].y;
              const x1 = pinsPoints[ln.to].x, y1 = pinsPoints[ln.to].y;
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

  // generate: read image and post to worker
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
      alert('Generation start failed: ' + ((err && (err as Error).message) ? (err as Error).message : String(err)));
    }
  }, [image, createWorker, preset, frameShape]);

  // UI handlers
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [onImageUpload]);

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

  // ... UI code remains unchanged
  return (
    <div className="space-y-6">
      {/* UI omitted for brevity; same as your original */}
    </div>
  );
}
