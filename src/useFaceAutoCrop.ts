import { useState } from 'react';
import * as faceapi from 'face-api.js';
import {
  cropImageToOutput,
  fileToDataUrl,
  resolveImageOutputOptions,
  type ImageOutputOptions,
  type NormalizedImageOutput,
} from './imageOutput';

export interface FaceAutoCropOptions {
  modelUrl?: string;
  zoomOutFactor?: number;
  passportAspectRatio?: number;
  zoomFactor?: number;
  aspectRatio?: number;
  outputOptions?: ImageOutputOptions;
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

export async function autoCropImageToOutput(
  fileOrDataUrl: File | string,
  options: FaceAutoCropOptions = {}
): Promise<NormalizedImageOutput | null> {
  const {
    modelUrl = '/models',
    outputOptions,
  } = options;
  const resolvedOutputOptions = resolveImageOutputOptions(outputOptions);
  const zoomOutFactor = options.zoomOutFactor ?? options.zoomFactor ?? 2.3;
  const passportAspectRatio = options.passportAspectRatio
    ?? options.aspectRatio
    ?? resolvedOutputOptions.targetWidth / resolvedOutputOptions.targetHeight;

  const imageDataUrl = typeof fileOrDataUrl === 'string' ? fileOrDataUrl : await fileToDataUrl(fileOrDataUrl);

  if (!modelsLoaded) {
    await loadFaceApiModels(modelUrl);
  }

  const image = await faceapi.fetchImage(imageDataUrl);
  const detections = await faceapi
    .detectAllFaces(image)
    .withFaceLandmarks()
    .withFaceDescriptors();

  if (detections.length === 0) {
    return null;
  }

  const faceRect = detections[0].detection.box;
  const cropRect = calculateCropRect(
    image,
    faceRect.x,
    faceRect.y,
    faceRect.width,
    faceRect.height,
    passportAspectRatio,
    zoomOutFactor
  );

  return cropImageToOutput(
    image,
    cropRect.x,
    cropRect.y,
    cropRect.width,
    cropRect.height,
    resolvedOutputOptions
  );
}

export function useFaceAutoCrop(options: FaceAutoCropOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { modelUrl = '/models' } = options;
  const zoomOutFactor = options.zoomOutFactor ?? options.zoomFactor ?? 2.3;
  const passportAspectRatio = options.passportAspectRatio ?? options.aspectRatio ?? 7 / 9;

  // Crops the face from an image (File or base64 string). Returns a base64 JPEG string.
  const autoCrop = async (fileOrDataUrl: File | string): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      let imageDataUrl: string;
      if (typeof fileOrDataUrl === 'string') {
        imageDataUrl = fileOrDataUrl;
      } else {
        imageDataUrl = await fileToDataUrl(fileOrDataUrl);
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
        const fittedCrop = fitCropToImage(croppedWidth, croppedHeight, image.width, image.height, passportAspectRatio);
        const topLeftX = centerX - fittedCrop.width / 2;
        const topLeftY = centerY - fittedCrop.height / 2;
        const clampedX = Math.max(0, Math.min(topLeftX, image.width - fittedCrop.width));
        const clampedY = Math.max(0, Math.min(topLeftY, image.height - fittedCrop.height));
        const cropped = createCroppedImage(
          image,
          clampedX,
          clampedY,
          fittedCrop.width,
          fittedCrop.height
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

function calculateCropRect(
  image: HTMLImageElement,
  faceX: number,
  faceY: number,
  faceWidth: number,
  faceHeight: number,
  aspectRatio: number,
  zoomOutFactor: number
) {
  const imageWidth = image.width;
  const imageHeight = image.height;
  const centerX = faceX + faceWidth / 2;
  const centerY = faceY + faceHeight / 1.5;
  let croppedWidth: number;
  let croppedHeight: number;

  if (faceWidth / faceHeight > aspectRatio) {
    croppedHeight = faceHeight * zoomOutFactor;
    croppedWidth = croppedHeight * aspectRatio;
  } else {
    croppedWidth = faceWidth * zoomOutFactor;
    croppedHeight = croppedWidth / aspectRatio;
  }

  const fittedCrop = fitCropToImage(croppedWidth, croppedHeight, imageWidth, imageHeight, aspectRatio);
  const topLeftX = centerX - fittedCrop.width / 2;
  const topLeftY = centerY - fittedCrop.height / 2;

  return {
    x: Math.max(0, Math.min(topLeftX, imageWidth - fittedCrop.width)),
    y: Math.max(0, Math.min(topLeftY, imageHeight - fittedCrop.height)),
    width: fittedCrop.width,
    height: fittedCrop.height,
  };
}

function fitCropToImage(
  width: number,
  height: number,
  imageWidth: number,
  imageHeight: number,
  aspectRatio: number
) {
  let fittedWidth = width;
  let fittedHeight = height;

  if (fittedWidth > imageWidth) {
    fittedWidth = imageWidth;
    fittedHeight = fittedWidth / aspectRatio;
  }

  if (fittedHeight > imageHeight) {
    fittedHeight = imageHeight;
    fittedWidth = fittedHeight * aspectRatio;
  }

  return { width: fittedWidth, height: fittedHeight };
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
