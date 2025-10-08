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

  // Determine which kit preset to use based on kitCode.pegs (map your store selection)
  const presetKey = kitCode.pegs >= 384 ? 'pro' : kitCode.pegs >= 256 ? 'standard' : 'starter';
  const preset = kitMap[presetKey as keyof typeof kitMap];

  // -------------------------------------------------------
  // Worker code embedded as a string. The worker performs:
  // - createImageBitmap from the input bytes
  // - draw to OffscreenCanvas, grayscale, Sobel edge magnitude
  // - build importance map (edge + darkness)
  // - generate pins
  // - greedy + beam search (cached Bresenham indices)
  // - incremental updates to a "current" brightness buffer
  // - post progress and final result (grayscale buffer, size, lines, pins)
  // -------------------------------------------------------
  const workerSrc = `

  // Worker global scope
  self.onmessage = async (ev) => {
    try {
      const { cmd } = ev.data;
      if (cmd === 'generate') {
        const { imageBuffer, imageType, size, pins, upscale, beamWidth, lineWeight, maxLines, frameShape } = ev.data;
        // Recreate image
        const blob = new Blob([imageBuffer], { type: imageType });
        const imgBitmap = await createImageBitmap(blob);
        const targetSize = size;

        // OffscreenCanvas for preprocessing
        const off = new OffscreenCanvas(targetSize, targetSize);
        const ctx = off.getContext('2d');
        if (!ctx) throw new Error('OffscreenCanvas failed');

        // white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0,0,targetSize,targetSize);

        // optional circular clip
        if (frameShape === 'round') {
          ctx.save();
          ctx.beginPath();
          ctx.arc(targetSize/2, targetSize/2, targetSize/2 - 10, 0, Math.PI*2);
          ctx.clip();
        }

        // Draw image with cover scaling (center-crop)
        const scale = Math.max(targetSize / imgBitmap.width, targetSize / imgBitmap.height);
        const sw = imgBitmap.width * scale;
        const sh = imgBitmap.height * scale;
        const sx = (targetSize - sw) / 2;
        const sy = (targetSize - sh) / 2;
        ctx.drawImage(imgBitmap, sx, sy, sw, sh);

        if (frameShape === 'round') ctx.restore();

        // Get pixel data
        const imageData = ctx.getImageData(0,0,targetSize,targetSize);
        const pixels = imageData.data;
        const N = targetSize * targetSize;

        // Convert to grayscale float array (0..255)
        const gray = new Float32Array(N);
        for (let i=0, j=0; i<pixels.length; i+=4, j++) {
          const g = pixels[i]*0.2126 + pixels[i+1]*0.7152 + pixels[i+2]*0.0722;
          gray[j] = g;
        }

        // Simple S-curve contrast (emphasize midtones)
        for (let i=0;i<gray.length;i++){
          let v = gray[i]/255;
          v = v < 0.5 ? 2*v*v : 1 - 2*(1-v)*(1-v);
          gray[i] = Math.max(0, Math.min(255, v*255));
        }

        // Sobel gradient magnitude (3x3)
        const gmag = new Float32Array(N);
        let maxG = 1;
        for (let y=1; y<targetSize-1; y++){
          for (let x=1; x<targetSize-1; x++){
            const i = y*targetSize + x;
            const v00 = gray[(y-1)*targetSize + (x-1)];
            const v01 = gray[(y-1)*targetSize + (x)];
            const v02 = gray[(y-1)*targetSize + (x+1)];
            const v10 = gray[y*targetSize + (x-1)];
            const v12 = gray[y*targetSize + (x+1)];
            const v20 = gray[(y+1)*targetSize + (x-1)];
            const v21 = gray[(y+1)*targetSize + (x)];
            const v22 = gray[(y+1)*targetSize + (x+1)];
            const sx = (v02 + 2*v12 + v22) - (v00 + 2*v10 + v20);
            const sy = (v20 + 2*v21 + v22) - (v00 + 2*v01 + v02);
            const mag = Math.hypot(sx, sy);
            gmag[i] = mag;
            if (mag > maxG) maxG = mag;
          }
        }
        for (let i=0;i<gmag.length;i++) gmag[i] = gmag[i] / maxG;

        // Importance map: edges + dark regions
        const importance = new Float32Array(N);
        for (let i=0;i<N;i++){
          const dark = 1 - (gray[i] / 255);
          importance[i] = Math.min(1, 0.75 * gmag[i] + 0.5 * dark);
        }

        // Pins positions in a circle
        const pinsArr = new Float32Array(pins*2);
        const radius = targetSize/2;
        const center = radius;
        const inset = 10;
        for (let i=0;i<pins;i++){
          const a = (2*Math.PI*i)/pins;
          pinsArr[i*2] = center + (radius - inset) * Math.cos(a);
          pinsArr[i*2+1] = center + (radius - inset) * Math.sin(a);
        }

        // Bresenham helper (returns Int32Array of linear indices)
        const bresenhamIdxs = new Map();
        function getLineKey(a,b){ return a<b ? a+'-'+b : b+'-'+a; }
        function getLinePixels(a,b){
          const key = getLineKey(a,b);
          if (bresenhamIdxs.has(key)) return bresenhamIdxs.get(key);
          const x0 = Math.round(pinsArr[a*2]);
          const y0 = Math.round(pinsArr[a*2+1]);
          const x1 = Math.round(pinsArr[b*2]);
          const y1 = Math.round(pinsArr[b*2+1]);
          const coords = [];
          let dx = Math.abs(x1-x0);
          let dy = Math.abs(y1-y0);
          const sx = x0 < x1 ? 1 : -1;
          const sy = y0 < y1 ? 1 : -1;
          let err = dx - dy;
          let x = x0, y = y0;
          while (true){
            coords.push(x,y);
            if (x === x1 && y === y1) break;
            const e2 = 2*err;
            if (e2 > -dy){ err -= dy; x += sx; }
            if (e2 < dx){ err += dx; y += sy; }
          }
          const idxs = new Int32Array(coords.length/2);
          for (let i=0,j=0;i<coords.length;i+=2,j++){
            const xx = coords[i], yy = coords[i+1];
            idxs[j] = yy * targetSize + xx;
          }
          bresenhamIdxs.set(key, idxs);
          return idxs;
        }

        // Current brightness buffer: 255=white -> 0=black
        const current = new Float32Array(N);
        for (let i=0;i<N;i++) current[i] = 255;

        const targetDark = new Float32Array(N);
        for (let i=0;i<N;i++) targetDark[i] = 255 - gray[i];

        // Greedy + beam loop
        const generated = [];
        let currentPin = 0;
        const minLoop = Math.max(6, Math.floor(pins / 12));

        // provide progress
        postMessage({ type: 'progress', progress: 5, step: 'starting generation' });

        for (let s=0; s<maxLines; s++){
          const candidates = [];
          // sample every candidate pin (we could sample step if pins large)
          for (let testPin=0; testPin<pins; testPin++){
            if (testPin === currentPin) continue;
            const dist = Math.abs(testPin - currentPin);
            if (dist < minLoop && dist > 0 && (pins - dist) > minLoop) continue;
            const idxs = getLinePixels(currentPin, testPin);

            let score = 0;
            for (let i=0;i<idxs.length;i++){
              const pi = idxs[i];
              const currentDark = 255 - current[pi];
              const remaining = Math.max(0, targetDark[pi] - currentDark);
              if (remaining <= 0) continue;
              const w = importance[pi] + 0.12;
              score += remaining * w;
            }

            if (candidates.length < beamWidth){
              candidates.push({ pin: testPin, score });
              if (candidates.length === beamWidth) candidates.sort((a,b)=>a.score-b.score);
            } else if (score > candidates[0].score){
              candidates[0] = { pin: testPin, score };
              candidates.sort((a,b)=>a.score-b.score);
            }
          }

          if (candidates.length === 0) break;
          const best = candidates[candidates.length - 1];
          if (!best || best.score < 1e-6) break;
          const bestPin = best.pin;

          const idxsToDraw = getLinePixels(currentPin, bestPin);
          for (let i=0;i<idxsToDraw.length;i++){
            const pi = idxsToDraw[i];
            current[pi] = Math.max(0, current[pi] - lineWeight);
          }

          generated.push({ from: currentPin, to: bestPin });
          currentPin = bestPin;

          // periodic progress updates and yields
          if (s % 40 === 0 || s === maxLines - 1){
            const prog = 5 + Math.round((s / maxLines) * 90);
            postMessage({ type: 'progress', progress: prog, step: 'running', lines: generated.length });
            // allow event loop to process
            await new Promise(res => setTimeout(res, 0));
          }
        } // end loop

        // send final result: transfer current buffer (ArrayBuffer), size, lines array, and pins array
        postMessage({
          type: 'done',
          buffer: current.buffer,
          size: targetSize,
          lines: generated,
          pins: Array.from(pinsArr)
        }, [current.buffer]); // transfer ownership of buffer

      } // endif generate
    } catch (err) {
      postMessage({ type: 'error', message: (err && err.message) ? err.message : String(err) });
    }
  };
  `;

  // Create worker from the blob source (only once)
  const createWorker = useCallback(() => {
    if (workerRef.current) return workerRef.current;
    const blob = new Blob([workerSrc], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const w = new Worker(url, { type: 'module' });
    workerRef.current = w;
    return w;
  }, [workerSrc]);

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
        if (data.lines) setLines((prev) => prev.length < data.lines ? prev : prev);
      } else if (data.type === 'done') {
        // The worker transferred the ArrayBuffer as buffer; wrap as Uint8Array
        const buffer = data.buffer as ArrayBuffer;
        const size = data.size as number;
        const arr = new Uint8ClampedArray(buffer);
        // draw to canvas
        if (resultCanvasRef.current) {
          const ctx = resultCanvasRef.current.getContext('2d');
          if (ctx) {
            resultCanvasRef.current.width = size;
            resultCanvasRef.current.height = size;
            const imageData = ctx.createImageData(size, size);
            for (let i = 0; i < size * size; i++) {
              const v = arr[i]; // brightness 0..255
              imageData.data[i * 4] = v;
              imageData.data[i * 4 + 1] = v;
              imageData.data[i * 4 + 2] = v;
              imageData.data[i * 4 + 3] = 255;
            }
            ctx.putImageData(imageData, 0, 0);
            // draw lines overlay (threads)
            ctx.save();
            ctx.globalAlpha = 0.95;
            ctx.strokeStyle = 'black';
            ctx.lineCap = 'round';
            ctx.lineWidth = 0.6;
            const pinsFlat = data.pins as number[];
            const pinsPoints: Point[] = [];
            for (let i = 0; i < pinsFlat.length; i += 2) pinsPoints.push({ x: pinsFlat[i], y: pinsFlat[i + 1] });

            for (let L = 0; L < (data.lines as any[]).length; L++) {
              const ln = (data.lines as any[])[L];
              const x0 = pinsPoints[ln.from].x, y0 = pinsPoints[ln.from].y;
              const x1 = pinsPoints[ln.to].x, y1 = pinsPoints[ln.to].y;
              ctx.beginPath();
              ctx.moveTo(x0, y0);
              ctx.lineTo(x1, y1);
              ctx.stroke();
            }
            ctx.restore();
            // set result data URL
            const url = resultCanvasRef.current.toDataURL('image/png', 0.95);
            setResult(url);
            setProgress(100);
            setCurrentStep('Complete');
            setLines(data.lines as Line[]);
            const pinsPointArray = pinsPoints;
            setPins(pinsPointArray);
            setIsGenerating(false);
            // callback
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

  // generate: read image as ArrayBuffer and post to worker
  const generateStringArt = useCallback(async () => {
    if (!image) return;
    setIsGenerating(true);
    setProgress(1);
    setCurrentStep('Preparing image for worker...');
    setLines([]);
    setResult(null);

    try {
      const w = createWorker();

      // read file into ArrayBuffer
      const buf = await image.arrayBuffer();
      const sizeBase = 900; // base dimensional control
      // scale size by preset.upscale and by pin count factor
      const pinsFactor = Math.min(2, Math.max(1, Math.floor(preset.pins / 200)));
      const size = Math.max(sizeBase, Math.round(sizeBase * preset.upscale * pinsFactor));

      // post message to worker
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
      }, [buf]); // transfer buffer

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

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro tip:</strong> For portraits use <span className="font-semibold">{presetKey.toUpperCase()}</span>. White background, black thread output only.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5" /> Upload Image</CardTitle></CardHeader>
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
          <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5" /> Result</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-3 items-center">
              <label className="text-sm">Frame</label>
              <select value={frameShape} onChange={(e) => setFrameShape(e.target.value as any)} className="ml-2">
                <option value="round">Round</option>
                <option value="square">Square</option>
              </select>

              <div className="ml-auto">
                <span className="text-sm mr-2">Kit:</span>
                <span className="font-semibold">{presetKey.toUpperCase()} ({preset.pins} pins)</span>
              </div>
            </div>

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
                <p className="text-xs text-gray-500 mt-4">This runs in a worker — the UI will stay responsive.</p>
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
        <CardHeader><CardTitle><Settings className="w-5 h-5 inline mr-2" />Settings</CardTitle></CardHeader>
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
            <p className="text-xs text-gray-500 mt-1">Preset maps to kit purchased.</p>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Preview style</label>
            <div className="text-sm text-gray-700">White background, black thread</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
