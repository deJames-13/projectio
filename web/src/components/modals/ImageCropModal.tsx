"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RotateCcw, 
  Check, 
  Loader2, 
  AlertCircle,
  Crop as CropIcon
} from "lucide-react";

export interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  fileName?: string;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => Promise<void> | void;
}

const VIEWPORT_SIZE = 280; // Size in px of the crop box
const OUTPUT_SIZE = 512;   // 512x512 retina square output

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  fileName = "avatar.jpg",
  onClose,
  onCropComplete,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Reset state whenever a new image opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setErrorMsg(null);
      setIsProcessing(false);
      setImageLoaded(false);
    }
  }, [isOpen, imageSrc]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || isProcessing) return;
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      setIsDragging(true);
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    if (touch) {
      setPan({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Rotate clockwise 90 degrees
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Reset framing
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  // Generate 512x512 cropped canvas and export
  const handleApplyCrop = async () => {
    if (!imageRef.current || !imageSrc) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const img = imageRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not initialize 2D canvas context.");
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Fill canvas background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

      // Translate context to center of output canvas
      ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2);

      // Apply rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Apply scale (zoom factor relative to output/viewport ratio)
      const scaleMultiplier = (OUTPUT_SIZE / VIEWPORT_SIZE) * zoom;
      ctx.scale(scaleMultiplier, scaleMultiplier);

      // Apply pan offset (converted to viewport scale)
      ctx.translate(pan.x, pan.y);

      // Calculate base image dimensions to fit within viewport
      const naturalWidth = img.naturalWidth || 500;
      const naturalHeight = img.naturalHeight || 500;
      const aspect = naturalWidth / naturalHeight;

      let drawW: number;
      let drawH: number;

      if (aspect >= 1) {
        // Landscape or square: fit height
        drawH = VIEWPORT_SIZE;
        drawW = VIEWPORT_SIZE * aspect;
      } else {
        // Portrait: fit width
        drawW = VIEWPORT_SIZE;
        drawH = VIEWPORT_SIZE / aspect;
      }

      // Draw image centered at (0, 0) in transformed context
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

      // Export as optimized JPEG Blob (< 300KB)
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92);
      });

      if (!blob) {
        throw new Error("Failed to export cropped image data.");
      }

      // Create a clean File instance
      const cleanFileName = fileName.replace(/\.[^/.]+$/, "") + "-cropped.jpg";
      const croppedFile = new File([blob], cleanFileName, { type: "image/jpeg" });

      await onCropComplete(croppedFile);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error processing image crop.";
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-modal-title"
    >
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/80 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <CropIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 id="crop-modal-title" className="text-sm font-bold text-slate-900 dark:text-white">
                Crop Profile Picture
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Position &amp; scale your photo to a 1:1 circular avatar
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Close crop dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col items-center space-y-4">
          {errorMsg && (
            <div 
              role="alert"
              className="w-full p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-rose-800 dark:text-rose-300 text-xs font-medium animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span className="flex-1">{errorMsg}</span>
            </div>
          )}

          {/* Interactive Crop Viewport */}
          <div
            ref={containerRef}
            style={{ width: VIEWPORT_SIZE, height: VIEWPORT_SIZE }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`relative rounded-xl overflow-hidden bg-slate-950 border border-slate-300 dark:border-slate-700 shadow-inner select-none ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            {/* Transformed Image Layer */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
              }}
            >
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Source preview for cropping"
                crossOrigin="anonymous"
                onLoad={() => setImageLoaded(true)}
                onError={() => setErrorMsg("Failed to load source image. Please choose another file.")}
                className={`max-w-none max-h-none select-none transition-opacity duration-200 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  width: "auto",
                  height: "auto",
                  maxWidth: "100%",
                  maxHeight: "100%",
                }}
                draggable={false}
              />
            </div>

            {/* Circular Avatar Guide Mask Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(circle at center, transparent 48%, rgba(15, 23, 42, 0.75) 50%)",
              }}
            >
              {/* Circular guide border */}
              <div 
                className="absolute inset-2 rounded-full border-2 border-dashed border-white/70 shadow-xs"
              />
            </div>

            {/* Loading placeholder before image loads */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                <span className="text-xs">Loading image...</span>
              </div>
            )}
          </div>

          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Drag photo to reposition inside the circular avatar frame
          </span>

          {/* Controls Bar */}
          <div className="w-full bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.max(1, Number((prev - 0.2).toFixed(1))))}
                disabled={zoom <= 1 || isProcessing}
                aria-label="Zoom out"
                className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                disabled={isProcessing}
                aria-label="Zoom level"
                className="flex-1 accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
              />

              <button
                type="button"
                onClick={() => setZoom((prev) => Math.min(3, Number((prev + 0.2).toFixed(1))))}
                disabled={zoom >= 3 || isProcessing}
                aria-label="Zoom in"
                className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 w-10 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Auxiliary Tools: Rotate & Reset */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
              <button
                type="button"
                onClick={handleRotate}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate 90°</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={isProcessing || (zoom === 1 && rotation === 0 && pan.x === 0 && pan.y === 0)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Framing</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApplyCrop}
            disabled={isProcessing || !imageLoaded}
            className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving 1:1 Avatar...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Apply &amp; Upload</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
