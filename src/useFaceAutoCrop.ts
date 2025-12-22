import { useState } from 'react';
import * as faceapi from 'face-api.js';

export interface FaceAutoCropOptions {
  modelUrl?: string;
  zoomOutFactor?: number;
  passportAspectRatio?: number;
}

// Internal: tracks model loading state
let modelsLoaded = false;
let modelsLoadPromise: Promise<void> | null = null;

// Loads face-api.js models from the given URL. Call once at startup for best performance.
export async function loadFaceApiModels(modelUrl: string): Promise<void> {
  if (modelsLoaded) return;
  if (modelsLoadPromise) return modelsLoadPromise;
  modelsLoadPromise = Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(modelUrl),
    faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl),
    faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl)
  ]).then(() => {
    modelsLoaded = true;
    modelsLoadPromise = null;
  });
  return modelsLoadPromise;
}

export function useFaceAutoCrop(options: FaceAutoCropOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    modelUrl = '/models',
    zoomOutFactor = 2.3,
    passportAspectRatio = 36 / 45,
  } = options;

  // Crops the face from an image (File or base64 string). Returns a base64 JPEG string.
  const autoCrop = async (fileOrDataUrl: File | string): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      let imageDataUrl: string;
      if (typeof fileOrDataUrl === 'string') {
        imageDataUrl = fileOrDataUrl;
      } else {
        imageDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(fileOrDataUrl);
        });
      }
      if (!modelsLoaded) {
        await loadFaceApiModels(modelUrl);
      }
      const image = await faceapi.fetchImage(imageDataUrl);
      const detections = await faceapi
        .detectAllFaces(image)
        .withFaceLandmarks()
        .withFaceDescriptors();
      if (detections.length > 0) {
        const firstFace = detections[0];
        const faceRect = firstFace.detection.box;
        const centerX = faceRect.x + faceRect.width / 2;
        const centerY = faceRect.y + faceRect.height / 1.5;
        let croppedWidth, croppedHeight;
        if (faceRect.width / faceRect.height > passportAspectRatio) {
          croppedHeight = faceRect.height * zoomOutFactor;
          croppedWidth = croppedHeight * passportAspectRatio;
        } else {
          croppedWidth = faceRect.width * zoomOutFactor;
          croppedHeight = croppedWidth / passportAspectRatio;
        }
        const topLeftX = centerX - croppedWidth / 2;
        const topLeftY = centerY - croppedHeight / 2;
        const clampedX = Math.max(0, Math.min(topLeftX, image.width - croppedWidth));
        const clampedY = Math.max(0, Math.min(topLeftY, image.height - croppedHeight));
        const cropped = createCroppedImage(
          image,
          clampedX,
          clampedY,
          croppedWidth,
          croppedHeight
        );
        setLoading(false);
        return cropped;
      } else {
        setError('No faces detected. Please upload a clear passport-style photo.');
        setLoading(false);
        return null;
      }
    } catch (err: any) {
      setError(err?.message || 'Face detection failed');
      setLoading(false);
      return null;
    }
  };

  return { autoCrop, loading, error };
}

function createCroppedImage(image: HTMLImageElement, x: number, y: number, width: number, height: number): string {
  const canvas = document.createElement('canvas');
  const targetAspectRatio = width / height;
  const targetHeight = 800;
  const targetWidth = targetHeight * targetAspectRatio;
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, x, y, width, height, 0, 0, targetWidth, targetHeight);
  return canvas.toDataURL('image/jpeg', 0.95);
}
