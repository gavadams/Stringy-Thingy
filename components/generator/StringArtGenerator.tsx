'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Download, Upload, X, Zap, Settings as SettingsIcon, Image as ImageIcon, Info } from 'lucide-react';
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

// Settings interface
interface Settings {
  pins: number;
  maxStrings: number;
  minDistance: number;
  lineAlpha: number;
  lineRemoval: number;
}

export default function StringArtGenerator({
  kitCode,
  onComplete,
  onImageUpload,
  image,
  disabled
}: StringArtGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLines, setGeneratedLines] = useState<Line[]>([]);
  const [pins, setPins] = useState<Point[]>([]);
  
  const [settings, setSettings] = useState<Settings>({
    pins: kitCode.pegs,
    maxStrings: kitCode.max_lines,
    minDistance: Math.max(25, Math.floor(kitCode.pegs / 8)),
    lineAlpha: 25, // 0-100 (transparency)
    lineRemoval: 22, // 0-50 (how much darkness to remove per line)
  });

  // Initialize offscreen canvas
  if (!offscreenRef.current && typeof document !== 'undefined') {
    offscreenRef.current = document.createElement('canvas');
  }

  // Generate circular pin positions
  const generateCircularPins = useCallback((count: number, size: number): Point[] => {
    const pins: Point[] = [];
    const center = size / 2;
    const radius = center - 15;
    
    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count;
      pins.push({
        x: Math.round(center + radius * Math.cos(angle)),
        y: Math.round(center + radius * Math.sin(angle))
      });
    }
    
    return pins;
  }, []);

  // Bresenham line algorithm - returns pixel coordinates
  const getLineCoords = useCallback((x0: number, y0: number, x1: number, y1: number): number[] => {
    const coords: number[] = [];
    let x = Math.floor(x0);
    let y = Math.floor(y0);
    const x2 = Math.floor(x1);
    const y2 = Math.floor(y1);
    
    const dx = Math.abs(x2 - x);
    const dy = Math.abs(y2 - y);
    const sx = x < x2 ? 1 : -1;
    const sy = y < y2 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      coords.push(x, y);
      
      if (x === x2 && y === y2) break;
      
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

  // Calculate score for a potential line (sum of pixel darkness)
  const scoreLine = useCallback((
    coords: number[],
    pixels: Uint8ClampedArray,
    width: number
  ): number => {
    let score = 0;
    
    for (let i = 0; i < coords.length; i += 2) {
      const x = coords[i];
      const y = coords[i + 1];
      
      if (x >= 0 && x < width && y >= 0 && y < width) {
        const idx = (y * width + x) * 4;
        // Higher score for darker pixels
        score += (255 - pixels[idx]);
      }
    }
    
    return score / (coords.length / 2); // Return average darkness
  }, []);

  // Remove darkness along a line (simulate drawing the string)
  const removeDarkness = useCallback((
    coords: number[],
    pixels: Uint8ClampedArray,
    width: number,
    amount: number
  ) => {
    for (let i = 0; i < coords.length; i += 2) {
      const x = coords[i];
      const y = coords[i + 1];
      
      if (x >= 0 && x < width && y >= 0 && y < width) {
        const idx = (y * width + x) * 4;
        // Lighten the pixel
        const newValue = Math.min(255, pixels[idx] + amount);
        pixels[idx] = newValue;
        pixels[idx + 1] = newValue;
        pixels[idx + 2] = newValue;
      }
    }
  }, [