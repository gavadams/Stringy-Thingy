// components/generator/StringArtGenerator.tsx
'use client';

import React, { useRef, useState, useCallback, useMemo } from 'react';
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

interface Point { x: number; y: number; }
interface Line { from: number; to: number; }

export default function StringArtGenerator({
  kitCode,
  onComplete,
  onImageUpload,
  image,
  disabled
}: StringArtGeneratorProps) {
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [pins, setPins] = useState<Point[]>([]);

  // Default settings derived from kit
  const defaultQuality = kitCode.pegs >= 300 ? 'high' : kitCode.pegs >= 200 ? 'balanced' : 'fast';
  const [qualityPreset, setQualityPreset] = useState<'fast'|'balanced'|'high'>(defaultQuality);

  const presets = useMemo(() => ({
    fast: { upscale: 1, beamWidth: 1, sampleStep: 1, lineWeight: 18 },
    balanced: { upscale: 2, beamWidth: 2, sampleStep: 1, lineWeight: 14 },
    high: { upscale: 3, beamWidth: 3, sampleStep: 1, lineWeight: 12 }
  }), []);

  const dynamicSettings = useMemo(() => ({
    pins: kitCode.pegs,
    strings: kitCode.max_lines,
    minLoop: Math.max(10, Math.floor(kitCode.pegs / 12)),
    fade: 22
  }), [kitCode.pegs, kitCode.max_lines]);

  // ---------- Bresenham: returns [x,y,x,y,...] ----------
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

  // ---------- Line pixel cache (maps a-b key to Int32Array of linear indices) ----------
  const lineCache = useRef<Map<string, Int32Array>>(new Map());
  const getLineKey = (a: number, b: number) => a < b ? `${a}-${b}` : `${b}-${a}`;

  const getLinePixels = useCallback((a: number, b: number, pinsArr: Float32Array, size: number) => {
    const key = getLineKey(a, b);
    const cache = lineCache.current;
    if (cache.has(key)) return cache.get(key)!;
    const x0 = Math.round(pinsArr[a * 2]);
    const y0 = Math.round(pinsArr[a * 2 + 1]);
    const x1 = Math.round(pinsArr[b * 2]);
    const y1 = Math.round(pinsArr[b * 2 + 1]);
    const coords = bresenham(x0, y0, x1, y1);
    const idxs = new Int32Array(coords.length / 2);
    for (let i = 0, j = 0; i < coords.length; i += 2, j++) {
      const x = coords[i];
      const y = coords[i + 1];
      idxs[j] = y * size + x;
    }
    cache.set(key, idxs);
    return idxs;
  }, [bresenham]);

  // ---------- Preprocess image -> grayscale + importance map ----------
  const preprocess = useCallback(async (file: File, targetSize: number) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error('Failed loading image'));
    });

    const canvas = document.createElement('canvas');
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Failed to create canvas context');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetSize, targetSize);

    ctx.save();
    ctx.beginPath();
    ctx.arc(targetSize / 2, targetSize / 2, targetSize / 2 - 10, 0, Math.PI * 2);
    ctx.clip();

    const scale = Math.max(targetSize / img.width, targetSize / img.height);
    const sw = img.width * scale;
    const sh = img.height * scale;
    const sx = (targetSize - sw) / 2;
    const sy = (targetSize - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh);
    ctx.restore();

    const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
    const pixels = imageData.data;
    const gray = new Float32Array(targetSize * targetSize);
    for (let i = 0, j = 0; i < pixels.length; i += 4, j++) {
      const g = pixels[i] * 0.2126 + pixels[i + 1] * 0.7152 + pixels[i + 2] * 0.0722;
      gray[j] = g;
    }

    // Small S-curve contrast to help midtones (good for faces)
    for (let i = 0; i < gray.length; i++) {
      let v = gray[i] / 255;
      v = v < 0.5 ? 2 * v * v : 1 - 2 * (1 - v) * (1 - v);
      gray[i] = Math.max(0, Math.min(255, v * 255));
    }

    // Sobel gradient magnitude
    const gmag = new Float32Array(targetSize * targetSize);
    let maxG = 1;
    for (let y = 1; y < targetSize - 1; y++) {
      for (let x = 1; x < targetSize - 1; x++) {
        const i = y * targetSize + x;
        const v00 = gray[(y - 1) * targetSize + (x - 1)];
        const v01 = gray[(y - 1) * targetSize + x];
        const v02 = gray[(y - 1) * targetSize + (x + 1)];
        const v10 = gray[y * targetSize + (x - 1)];
        const v12 = gray[y * targetSize + (x + 1)];
        const v20 = gray[(y + 1) * targetSize + (x - 1)];
        const v21 = gray[(y + 1) * targetSize + x];
        const v22 = gray[(y + 1) * targetSize + (x + 1)];
        const sx = (v02 + 2 * v12 + v22) - (v00 + 2 * v10 + v20);
        const sy = (v20 + 2 * v21 + v22) - (v00 + 2 * v01 + v02);
        const mag = Math.hypot(sx, sy);
        gmag[i] = mag;
        if (mag > maxG) maxG = mag;
      }
    }
    for (let i = 0; i < gmag.length; i++) gmag[i] = gmag[i] / maxG;

    // Importance map: combine edge strength + darkness
    const importance = new Float32Array(targetSize * targetSize);
    for (let i = 0; i < gray.length; i++) {
      const dark = 1 - (gray[i] / 255);
      importance[i] = Math.min(1, 0.75 * gmag[i] + 0.5 * dark);
    }

    URL.revokeObjectURL(img.src);
    return { canvas, ctx, gray, importance };
  }, []);

  // ---------- Main generator (client-side) ----------
  const generateStringArt = useCallback(async () => {
    if (!image) return;
    setIsGenerating(true);
    setProgress(0);
    setCurrentStep('Initializing...');
    setLines([]);
    lineCache.current.clear();

    try {
      const preset = presets[qualityPreset];
      // base internal size scales with preset and pin count for detail
      const base = 900;
      const pinsFactor = Math.min(2, Math.max(1, Math.floor(dynamicSettings.pins / 200)));
      const SIZE = Math.max(base, Math.round(base * preset.upscale * pinsFactor));
      setCurrentStep('Preprocessing image...');
      setProgress(8);

      const pre = await preprocess(image, SIZE);
      const targetGray = pre.gray; // 0..255 where 0 = black
      const importance = pre.importance;

      setCurrentStep('Placing pins...');
      setProgress(15);

      const numPins = dynamicSettings.pins;
      const pinsArr = new Float32Array(numPins * 2);
      const radius = SIZE / 2;
      const center = radius;
      const inset = 10;
      for (let i = 0; i < numPins; i++) {
        const angle = (2 * Math.PI * i) / numPins;
        pinsArr[i * 2] = center + (radius - inset) * Math.cos(angle);
        pinsArr[i * 2 + 1] = center + (radius - inset) * Math.sin(angle);
      }
      const pinPoints: Point[] = [];
      for (let i = 0; i < numPins; i++) pinPoints.push({ x: pinsArr[i * 2], y: pinsArr[i * 2 + 1] });
      setPins(pinPoints);

      setCurrentStep('Preparing buffers...');
      setProgress(20);

      const current = new Float32Array(SIZE * SIZE);
      for (let i = 0; i < current.length; i++) current[i] = 255;

      const targetDark = new Float32Array(SIZE * SIZE);
      for (let i = 0; i < targetGray.length; i++) targetDark[i] = 255 - targetGray[i];

      const lineWeight = preset.lineWeight;
      const minLoop = dynamicSettings.minLoop;
      const beamWidth = preset.beamWidth;
      const sampleStep = preset.sampleStep;
      const maxStrings = dynamicSettings.strings;

      setCurrentStep('Generating strings...');
      setProgress(24);

      const generated: Line[] = [];
      let currentPin = 0;

      for (let s = 0; s < maxStrings; s++) {
        const candidates: { pin: number; score: number }[] = [];

        for (let testPin = 0; testPin < numPins; testPin += sampleStep) {
          if (testPin === currentPin) continue;
          const dist = Math.abs(testPin - currentPin);
          if (dist < minLoop && dist > 0 && (numPins - dist) > minLoop) continue;

          const idxs = getLinePixels(currentPin, testPin, pinsArr, SIZE);

          let score = 0;
          for (let i = 0; i < idxs.length; i++) {
            const pi = idxs[i];
            const currentDark = 255 - current[pi];
            const remaining = Math.max(0, targetDark[pi] - currentDark);
            if (remaining <= 0) continue;
            const w = importance[pi] + 0.12;
            score += remaining * w;
          }

          if (candidates.length < beamWidth) {
            candidates.push({ pin: testPin, score });
            if (candidates.length === beamWidth) candidates.sort((a, b) => a.score - b.score);
          } else if (score > candidates[0].score) {
            candidates[0] = { pin: testPin, score };
            candidates.sort((a, b) => a.score - b.score);
          }
        }

        if (candidates.length === 0) break;
        const best = candidates[candidates.length - 1];
        if (!best || best.score < 1e-6) break;
        const bestPin = best.pin;

        const idxsToDraw = getLinePixels(currentPin, bestPin, pinsArr, SIZE);
        for (let i = 0; i < idxsToDraw.length; i++) {
          const pi = idxsToDraw[i];
          current[pi] = Math.max(0, current[pi] - lineWeight);
        }

        generated.push({ from: currentPin, to: bestPin });
        currentPin = bestPin;

        if (s % 40 === 0 || s === maxStrings - 1) {
          setLines([...generated]);
          const prog = 24 + Math.round((s / maxStrings) * 72);
          setProgress(prog);
          setCurrentStep(`Drawing string ${s + 1} of ${maxStrings}...`);

          if (resultCanvasRef.current) {
            const dctx = resultCanvasRef.current.getContext('2d');
            if (dctx) {
              resultCanvasRef.current.width = SIZE;
              resultCanvasRef.current.height = SIZE;
              const out = dctx.createImageData(SIZE, SIZE);
              for (let i = 0; i < current.length; i++) {
                const b = Math.round(current[i]);
                out.data[i * 4] = b;
                out.data[i * 4 + 1] = b;
                out.data[i * 4 + 2] = b;
                out.data[i * 4 + 3] = 255;
              }
              dctx.putImageData(out, 0, 0);

              dctx.save();
              dctx.globalAlpha = Math.min(1, dynamicSettings.fade / 30);
              dctx.lineWidth = Math.max(0.6, preset.lineWeight / 8);
              dctx.strokeStyle = 'black';
              dctx.beginPath();
              for (let L = 0; L < generated.length; L++) {
                const ln = generated[L];
                const x0 = pinsArr[ln.from * 2], y0 = pinsArr[ln.from * 2 + 1];
                const x1 = pinsArr[ln.to * 2], y1 = pinsArr[ln.to * 2 + 1];
                dctx.moveTo(x0, y0);
                dctx.lineTo(x1, y1);
              }
              dctx.stroke();
              dctx.restore();

              dctx.fillStyle = '#000';
              for (let i = 0; i < pinsArr.length; i += 2) {
                dctx.beginPath();
                dctx.arc(pinsArr[i], pinsArr[i + 1], 2, 0, Math.PI * 2);
                dctx.fill();
              }
            }
          }

          await new Promise((res) => setTimeout(res, 0));
        }
      }

      setCurrentStep('Finalizing...');
      setProgress(96);

      if (resultCanvasRef.current) {
        const dctx = resultCanvasRef.current.getContext('2d')!;
        resultCanvasRef.current.width = SIZE;
        resultCanvasRef.current.height = SIZE;
        const out = dctx.createImageData(SIZE, SIZE);
        for (let i = 0; i < current.length; i++) {
          const b = Math.round(current[i]);
          out.data[i * 4] = b;
          out.data[i * 4 + 1] = b;
          out.data[i * 4 + 2] = b;
          out.data[i * 4 + 3] = 255;
        }
        dctx.putImageData(out, 0, 0);

        dctx.save();
        dctx.globalAlpha = Math.min(1, dynamicSettings.fade / 32);
        dctx.lineWidth = Math.max(0.6, preset.lineWeight / 8);
        dctx.lineCap = 'round';
        dctx.strokeStyle = 'black';
        dctx.beginPath();
        for (let L = 0; L < generated.length; L++) {
          const ln = generated[L];
          const x0 = pinsArr[ln.from * 2], y0 = pinsArr[ln.from * 2 + 1];
          const x1 = pinsArr[ln.to * 2], y1 = pinsArr[ln.to * 2 + 1];
          dctx.moveTo(x0, y0);
          dctx.lineTo(x1, y1);
        }
        dctx.stroke();
        dctx.restore();

        dctx.fillStyle = '#000';
        for (let i = 0; i < pinsArr.length; i += 2) {
          dctx.beginPath();
          dctx.arc(pinsArr[i], pinsArr[i + 1], 2, 0, Math.PI * 2);
          dctx.fill();
        }

        const dataUrl = resultCanvasRef.current.toDataURL('image/png', 0.95);
        setResult(dataUrl);
        onComplete({
          pattern: dataUrl,
          settings: { ...dynamicSettings, preset: qualityPreset },
          lines: generated
        });
      }

      setLines(generated);
      setProgress(100);
      setCurrentStep('Complete');
      setIsGenerating(false);
    } catch (err) {
      setIsGenerating(false);
      setCurrentStep('');
      console.error('Generation error', err);
      alert('Error: ' + (err instanceof Error ? err.message : String(err)));
    }
  }, [image, qualityPreset, preprocess, getLinePixels, dynamicSettings, presets, onComplete]);

  // ---------- UI handlers ----------
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
    if (!result || !lines.length) return;
    downloadInstructionsPDF({
      lines,
      pegs: pins,
      settings: {
        pegs: dynamicSettings.pins,
        lines: dynamicSettings.strings,
        lineWeight: presets[qualityPreset].lineWeight,
        frameShape: 'circle'
      },
      imagePreview: result,
      kitType: kitCode.kit_type
    });
  }, [result, lines, pins, dynamicSettings, presets, qualityPreset, kitCode.kit_type]);

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro tip:</strong> For portraits use the <span className="font-semibold">{qualityPreset.toUpperCase()}</span> preset. High detail requires more time but preserves facial features.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5" /> Upload Image</CardTitle>
          </CardHeader>
          <CardContent>
            {!image ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="font-medium text-gray-700 mb-2">Click to upload</p>
                <p className="text-sm text-gray-500">Best: centered portrait, high-contrast, 1000×1000+</p>
              </div>
            ) : (
              <div className="space-y-4">
                <img src={imagePreview || ''} alt="Preview" className="w-full rounded-xl border" />
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => fileInputRef.current?.click()} disabled={isGenerating}><ImageIcon className="w-4 h-4 mr-2" />Change</Button>
                  <Button variant="destructive" size="icon" onClick={() => { setImagePreview(null); onImageUpload(null); setResult(null); setLines([]); if (fileInputRef.current) fileInputRef.current.value = ''; }} disabled={isGenerating}><X className="w-4 h-4" /></Button>
                </div>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5" /> Result</CardTitle>
          </CardHeader>
          <CardContent>
            <canvas ref={resultCanvasRef} className="w-full rounded-xl border" style={{ display: result || isGenerating ? 'block' : 'none' }} />
            {!result && !isGenerating && (
              <div className="border-2 border-gray-200 rounded-xl p-12 text-center bg-gray-50 min-h-[400px] flex flex-col items-center justify-center">
                <Zap className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">Pattern will appear here</p>
                {image && <Button onClick={generateStringArt} disabled={disabled} size="lg"><Zap className="w-4 h-4 mr-2" />Generate String Art</Button>}
              </div>
            )}

            {isGenerating && (
              <div className="border-2 rounded-xl p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-lg font-medium mb-2">{currentStep}</p>
                <div className="w-full max-w-md mt-4"><Progress value={progress} className="h-2" /><p className="text-sm text-gray-500 mt-2">{Math.round(progress)}%</p></div>
                <p className="text-xs text-gray-500 mt-4">Preview is generated client-side. High-detail can take longer depending on browser/device.</p>
              </div>
            )}

            {result && (
              <div className="flex gap-2 mt-4">
                <Button onClick={downloadInstructions} className="flex-1"><Download className="w-4 h-4 mr-2" />PDF Instructions</Button>
                <Button onClick={downloadImage} variant="outline" className="flex-1"><Download className="w-4 h-4 mr-2" />PNG Pattern</Button>
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
            <label className="text-sm font-medium block mb-2">Pins</label>
            <div className="text-3xl font-bold text-blue-600">{dynamicSettings.pins}</div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Lines</label>
            <div className="text-3xl font-bold text-blue-600">{dynamicSettings.strings}</div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Quality</label>
            <select value={qualityPreset} onChange={(e) => setQualityPreset(e.target.value as 'fast'|'balanced'|'high')} disabled={disabled || isGenerating} className="w-full">
              <option value="fast">Fast (preview)</option>
              <option value="balanced">Balanced</option>
              <option value="high">High detail</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Higher quality increases processing time but preserves facial detail.</p>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Line darkness</label>
            <div className="text-sm text-gray-700">{presets[qualityPreset].lineWeight}</div>
            <p className="text-xs text-gray-500 mt-1">Preset-driven; adjust via kit selection.</p>
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
