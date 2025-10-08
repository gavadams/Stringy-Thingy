// string-art-improved.tsx
'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Download, Upload, X, Zap, Settings, Image as ImageIcon, Info } from 'lucide-react';
import { downloadInstructionsPDF } from '@/lib/generator/pdf';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface KitCode { id: string; code: string; kit_type: string; pegs: number; max_lines: number; used_count: number; max_generations: number; }
interface StringArtGeneratorProps { kitCode: KitCode; onComplete: (generation: { pattern: string; settings: Record<string, unknown>; lines: { from: number; to: number }[]; }) => void; onImageUpload: (file: File | null) => void; image: File | null; disabled: boolean; }
interface Point { x: number; y: number; }
interface Line { from: number; to: number; }

export default function StringArtGenerator({
  kitCode, onComplete, onImageUpload, image, disabled
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

  // Tunable settings for portrait kits (can be exposed in UI)
  const [settings, setSettings] = useState({
    pins: kitCode.pegs,
    strings: kitCode.max_lines,
    minLoop: Math.max(12, Math.floor(kitCode.pegs / 12)), // relax to allow detail
    fade: 24, // alpha for stroke drawing preview
    lineWeight: 14, // how much brightness each thread reduces (0-255)
    upscale: 2, // super-resolution factor
    beamWidth: 3, // keep top-K candidates
    sampleLimit: 1  // candidate sampling step (1 = evaluate all)
  });

  // --------------------
  // Utility: Bresenham (returns [x,y,x,y,...])
  // --------------------
  const bresenham = useCallback((x0:number,y0:number,x1:number,y1:number): number[] => {
    const coords:number[] = [];
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = x0 < x1 ? 1 : -1;
    let sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    let x = x0, y = y0;
    while (true) {
      coords.push(x, y);
      if (x === x1 && y === y1) break;
      let e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x += sx; }
      if (e2 < dx) { err += dx; y += sy; }
    }
    return coords;
  }, []);

  // --------------------
  // On-demand cache for line pixel indices to avoid recomputing
  // --------------------
  const lineCache = useRef<Map<string, Int32Array>>(new Map());
  const getLineKey = (a:number,b:number) => a < b ? `${a}-${b}` : `${b}-${a}`;
  const getLinePixels = useCallback((a:number,b:number,pinsArr: Float32Array, size:number) => {
    const key = getLineKey(a,b);
    const cache = lineCache.current;
    if (cache.has(key)) return cache.get(key)!;
    const x0 = Math.round(pinsArr[a*2]);
    const y0 = Math.round(pinsArr[a*2+1]);
    const x1 = Math.round(pinsArr[b*2]);
    const y1 = Math.round(pinsArr[b*2+1]);
    const coords = bresenham(x0, y0, x1, y1);
    // Convert to linear indices for quick scoring: idx = y*size + x
    const idxs = new Int32Array(coords.length/2);
    for (let i=0, j=0; i<coords.length; i+=2, j++) {
      const x = coords[i], y = coords[i+1];
      idxs[j] = y * size + x;
    }
    cache.set(key, idxs);
    return idxs;
  }, [bresenham]);

  // --------------------
  // Image preprocessing: draw image into a square canvas at internal SIZE,
  // grayscale, normalize, create importance map (Sobel gradient + dark emphasis)
  // --------------------
  async function preprocess(file: File, targetSize:number) {
    // load image
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error('load image failed')); });

    // draw onto canvas (letterbox, fill white background then clip circle)
    const canvas = document.createElement('canvas');
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0,0,targetSize,targetSize);

    // clip to circle (preserve circular frame like your product)
    ctx.save();
    ctx.beginPath();
    ctx.arc(targetSize/2, targetSize/2, targetSize/2 - 10, 0, Math.PI*2);
    ctx.clip();

    // scale preserving aspect
    const scale = Math.max(targetSize / img.width, targetSize / img.height);
    const sw = img.width * scale;
    const sh = img.height * scale;
    const sx = (targetSize - sw) / 2;
    const sy = (targetSize - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh);
    ctx.restore();

    // read image pixels
    const imageData = ctx.getImageData(0,0,targetSize,targetSize);
    const pixels = imageData.data;
    // convert to grayscale (luminosity) and build base arrays
    const gray = new Float32Array(targetSize * targetSize);
    for (let i=0, j=0; i<pixels.length; i+=4, j++) {
      const g = pixels[i]*0.2126 + pixels[i+1]*0.7152 + pixels[i+2]*0.0722;
      gray[j] = g; // 0..255 (0 dark)
    }

    // apply contrast/gamma/histogram equalization-ish (small gamma tweak helps portraits)
    // quick approximate gamma correction centered around midtones
    for (let i=0; i<gray.length; i++) {
      let v = gray[i] / 255;
      // small S-curve (emphasize midtones)
      v = v < 0.5 ? 2 * v * v : 1 - 2 * (1 - v) * (1 - v);
      gray[i] = Math.max(0, Math.min(255, v * 255));
    }

    // compute Sobel gradients (simple 3x3) to get edge strength
    const gx = new Float32Array(targetSize * targetSize);
    const gy = new Float32Array(targetSize * targetSize);
    const gmag = new Float32Array(targetSize * targetSize);
    for (let y=1; y<targetSize-1; y++) {
      for (let x=1; x<targetSize-1; x++) {
        const i = y * targetSize + x;
        // Sobel X
        const v00 = gray[(y-1)*targetSize + (x-1)];
        const v01 = gray[(y-1)*targetSize + (x)];
        const v02 = gray[(y-1)*targetSize + (x+1)];
        const v10 = gray[(y)*targetSize + (x-1)];
        const v12 = gray[(y)*targetSize + (x+1)];
        const v20 = gray[(y+1)*targetSize + (x-1)];
        const v21 = gray[(y+1)*targetSize + (x)];
        const v22 = gray[(y+1)*targetSize + (x+1)];
        const sx = (v02 + 2*v12 + v22) - (v00 + 2*v10 + v20);
        const sy = (v20 + 2*v21 + v22) - (v00 + 2*v01 + v02);
        gx[i] = sx;
        gy[i] = sy;
        gmag[i] = Math.hypot(sx, sy);
      }
    }
    // normalize gradient magnitude to 0..1
    let maxG = 1;
    for (let i=0;i<gmag.length;i++) if (gmag[i] > maxG) maxG = gmag[i];
    for (let i=0;i<gmag.length;i++) gmag[i] = gmag[i] / maxG;

    // Importance map combines edge strength and darkness (portrait features often dark)
    // importance = edgeWeight * edge + darkWeight * (1 - gray_norm)
    const importance = new Float32Array(targetSize * targetSize);
    for (let i=0;i<gray.length;i++) {
      const dark = 1 - (gray[i] / 255); // 0..1 darker -> higher
      importance[i] = Math.min(1, 0.75 * gmag[i] + 0.5 * dark); // give edges more weight
    }

    URL.revokeObjectURL(img.src);
    return { canvas, ctx, gray, importance };
  }

  // --------------------
  // Main improved algorithm: greedy + beam, with cached lines and incremental updates
  // --------------------
  const generateStringArt = useCallback(async () => {
    if (!image) return;
    setIsGenerating(true);
    setProgress(0);
    setCurrentStep('Initializing...');
    setLines([]);
    lineCache.current.clear();

    try {
      // Determine internal size using upscale setting and kit peg count
      const base = 900; // base internal dimension for good detail on portraits
      const SIZE = Math.max(900, base * settings.upscale); // adaptable
      setCurrentStep('Loading and preprocessing...');
      setProgress(7);

      // Preprocess (grayscale + importance)
      const pre = await preprocess(image, SIZE);
      const targetSize = SIZE;
      const targetGray = pre.gray; // 0..255 target brightness (0 dark)
      const importance = pre.importance; // 0..1 importance weights

      setCurrentStep('Generating pins...');
      setProgress(12);

      // Generate pins (circle)
      const numPins = settings.pins;
      const pinsArr = new Float32Array(numPins * 2);
      const radius = targetSize / 2;
      const center = radius;
      const inset = 10;
      for (let i = 0; i < numPins; i++) {
        const a = (2 * Math.PI * i) / numPins;
        pinsArr[i*2] = center + (radius - inset) * Math.cos(a);
        pinsArr[i*2+1] = center + (radius - inset) * Math.sin(a);
      }
      const pinsPoints: Point[] = [];
      for (let i = 0; i < numPins; i++) pinsPoints.push({ x: pinsArr[i*2], y: pinsArr[i*2+1] });
      setPins(pinsPoints);

      setCurrentStep('Preparing buffers...');
      setProgress(18);

      // Current canvas "brightness" buffer (255 = white background, 0 = black)
      const current = new Float32Array(targetSize * targetSize);
      for (let i = 0; i < current.length; i++) current[i] = 255; // start white

      // Precompute pixel-wise desired darkness = targetDark = 255 - targetGray (so higher => more thread)
      const targetDark = new Float32Array(targetSize * targetSize);
      for (let i=0;i<targetGray.length;i++) targetDark[i] = 255 - targetGray[i];

      // Score function: approximate improvement from drawing line = sum( (current - Math.max(targetBrightness, current - lineWeight)) )
      const lineWeight = settings.lineWeight; // brightness units removed per thread
      const minLoop = settings.minLoop;
      const beamWidth = Math.max(1, settings.beamWidth);
      const maxStrings = settings.strings;

      setCurrentStep('Generating string order...');
      setProgress(22);

      const generatedLines: Line[] = [];
      let currentPin = 0;

      // Candidate sampling heuristic when many pins: evaluate every 'step' pin instead of all
      const sampleStep = settings.sampleLimit > 1 ? settings.sampleLimit : (numPins > 320 ? Math.floor(numPins / 320) : 1);

      for (let s = 0; s < maxStrings; s++) {
        // find top candidates (beam)
        let bests: { pin:number; score:number }[] = [];

        // iterate test pins (we sample to save time on high pin counts)
        for (let testPin = 0; testPin < numPins; testPin += sampleStep) {
          if (testPin === currentPin) continue;
          // enforce min loop (skip very close pins)
          const dist = Math.abs(testPin - currentPin);
          if (dist < minLoop && dist > 0 && (numPins - dist) > minLoop) continue;

          // get pixel indices for line (cached)
          const idxs = getLinePixels(currentPin, testPin, pinsArr, targetSize);

          // quick approximate score: sum of (currentDark - min(currentDark, targetDark + 0)) i.e.
          // how much darkness remains to be filled along that line (higher = more useful)
          // compute weighted by importance to favor edges/features
          let score = 0;
          for (let i = 0; i < idxs.length; i++) {
            const pi = idxs[i];
            // current brightness -> currentDark = 255 - current[pi]; targetDark[pi] from above
            const currentDark = 255 - current[pi];
            const remaining = Math.max(0, targetDark[pi] - currentDark); // how much dark still needed
            if (remaining <= 0) continue;
            // weight by importance (edges/facial features get more)
            const w = importance[pi] + 0.1;
            score += remaining * w;
          }

          // keep top beamWidth candidates (min-heap style)
          if (bests.length < beamWidth) {
            bests.push({ pin: testPin, score });
            if (bests.length === beamWidth) bests.sort((a,b)=>a.score-b.score);
          } else if (score > bests[0].score) {
            bests[0] = { pin: testPin, score };
            bests.sort((a,b)=>a.score-b.score);
          }
        }

        // pick the best among beam winners but we can also pick the one with the highest score
        if (bests.length === 0) break;
        // pick the maximum
        let candidate = bests[bests.length-1];
        if (!candidate || candidate.score < 1e-6) break; // no meaningful improvement left

        const bestPin = candidate.pin;

        // apply line: reduce brightness along pixels by lineWeight (simulate putting dark thread)
        const idxsToDraw = getLinePixels(currentPin, bestPin, pinsArr, targetSize);
        for (let i = 0; i < idxsToDraw.length; i++) {
          const pi = idxsToDraw[i];
          // reduce brightness (down toward 0), but not below 0
          current[pi] = Math.max(0, current[pi] - lineWeight);
        }

        generatedLines.push({ from: currentPin, to: bestPin });
        currentPin = bestPin;

        // streaming progress & preview update occasionally
        if (s % 30 === 0 || s === maxStrings - 1) {
          setLines([...generatedLines]);
          const prog = 22 + Math.round((s / maxStrings) * 70);
          setProgress(prog);
          setCurrentStep(`Drawing string ${s+1} / ${maxStrings}`);
          // draw preview to result canvas (fast draw uses imageData)
          if (resultCanvasRef.current) {
            const dctx = resultCanvasRef.current.getContext('2d');
            if (dctx) {
              resultCanvasRef.current.width = targetSize;
              resultCanvasRef.current.height = targetSize;
              const outImg = dctx.createImageData(targetSize, targetSize);
              // convert current brightness to RGBA (grayscale)
              for (let i=0;i<current.length;i++) {
                const b = Math.round(current[i]);
                outImg.data[i*4] = b;
                outImg.data[i*4+1] = b;
                outImg.data[i*4+2] = b;
                outImg.data[i*4+3] = 255;
              }
              dctx.putImageData(outImg, 0, 0);

              // draw pins and current drawn threads overlay for visual polish
              dctx.save();
              dctx.lineWidth = Math.max(0.6, settings.fade / 18);
              dctx.strokeStyle = 'rgba(0,0,0,0.85)';
              dctx.beginPath();
              for (let L=0; L<generatedLines.length; L++) {
                const ln = generatedLines[L];
                const x0 = pinsArr[ln.from*2], y0 = pinsArr[ln.from*2+1];
                const x1 = pinsArr[ln.to*2], y1 = pinsArr[ln.to*2+1];
                dctx.moveTo(x0,y0);
                dctx.lineTo(x1,y1);
              }
              dctx.stroke();
              // pins
              dctx.fillStyle = '#000';
              for (let i=0;i<pinsArr.length;i+=2) {
                dctx.beginPath();
                dctx.arc(pinsArr[i], pinsArr[i+1], 2, 0, Math.PI*2);
                dctx.fill();
              }
              dctx.restore();
            }
          }
          // yield so UI remains responsive
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      } // end for strings

      setCurrentStep('Finalizing image...');
      setProgress(95);

      // produce final PNG preview from result canvas (ensure final draw)
      if (resultCanvasRef.current) {
        // ensure the final current buffer is painted with strokes (we already drew periodically; draw final explicitly)
        const dctx = resultCanvasRef.current.getContext('2d')!;
        resultCanvasRef.current.width = targetSize;
        resultCanvasRef.current.height = targetSize;
        const outImg = dctx.createImageData(targetSize, targetSize);
        for (let i=0;i<current.length;i++) {
          const b = Math.round(current[i]);
          outImg.data[i*4] = b;
          outImg.data[i*4+1] = b;
          outImg.data[i*4+2] = b;
          outImg.data[i*4+3] = 255;
        }
        dctx.putImageData(outImg, 0, 0);

        // redraw lines on top with slightly translucent black to emulate thread
        dctx.save();
        dctx.globalAlpha = Math.min(1, settings.fade / 32);
        dctx.lineWidth = Math.max(0.6, settings.lineWeight / 8);
        dctx.lineCap = 'round';
        dctx.strokeStyle = 'black';
        dctx.beginPath();
        for (let L=0; L<generatedLines.length; L++) {
          const ln = generatedLines[L];
          const x0 = pinsArr[ln.from*2], y0 = pinsArr[ln.from*2+1];
          const x1 = pinsArr[ln.to*2], y1 = pinsArr[ln.to*2+1];
          dctx.moveTo(x0,y0);
          dctx.lineTo(x1,y1);
        }
        dctx.stroke();
        dctx.restore();

        // draw pins
        dctx.fillStyle = '#000';
        for (let i=0;i<pinsArr.length;i+=2) {
          dctx.beginPath();
          dctx.arc(pinsArr[i], pinsArr[i+1], 2, 0, Math.PI*2);
          dctx.fill();
        }

        const dataUrl = resultCanvasRef.current.toDataURL('image/png', 0.95);
        setResult(dataUrl);
        onComplete({
          pattern: dataUrl,
          settings,
          lines: generatedLines
        });
      }

      setLines(generatedLines);
      setProgress(100);
      setCurrentStep('Complete!');
      console.log('Generated', generatedLines.length, 'lines');

    } catch (err) {
      console.error('Generation error', err);
      alert('Error: ' + (err as Error).message);
      setCurrentStep('');
    } finally {
      setIsGenerating(false);
    }

  }, [image, settings, onComplete, getLinePixels]);

  // --------------------
  // UI handlers
  // --------------------
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
      settings: { pegs: settings.pins, lines: settings.strings, lineWeight: settings.lineWeight, frameShape: 'circle' },
      imagePreview: result,
      kitType: kitCode.kit_type
    });
  }, [result, lines, pins, settings, kitCode.kit_type]);

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro tip:</strong> Best results from clear, centered portraits. Use the “High Detail” preset for faces and pets.
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
                <p className="text-sm text-gray-500">Best: frontal portrait, high contrast (1000×1000+)</p>
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
                <p className="text-xs text-gray-500 mt-4">This may take up to a minute depending on quality settings</p>
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
          <div><label className="text-sm font-medium block mb-2">Pins</label><div className="text-3xl font-bold text-blue-600">{settings.pins}</div></div>
          <div><label className="text-sm font-medium block mb-2">Lines</label><div className="text-3xl font-bold text-blue-600">{settings.strings}</div></div>
          <div><label className="text-sm font-medium block mb-2">Detail preset</label>
            <select disabled={disabled || isGenerating} value={settings.upscale} onChange={(e)=>setSettings(s=>({...s, upscale: parseInt(e.target.value)}))} className="w-full">
              <option value={1}>Fast (lower detail)</option>
              <option value={2}>Balanced</option>
              <option value={3}>High Detail</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Upscaling improves details; higher = slower</p>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Line darkness</label>
            <input type="range" min="6" max="28" value={settings.lineWeight} onChange={(e)=>setSettings(s=>({...s, lineWeight: parseInt(e.target.value)}))} className="w-full" disabled={disabled || isGenerating}/>
            <p className="text-xs text-gray-500 mt-1">Higher = faster fill, lower = more delicate lines</p>
          </div>
        </CardContent>
      </Card>

      <canvas style={{ display: 'none' }} />
    </div>
  );
}
