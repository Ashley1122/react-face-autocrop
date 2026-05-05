export interface ImageOutputOptions {
  targetWidth?: number;
  targetHeight?: number;
  mimeType?: 'image/jpeg' | 'image/png' | 'image/webp';
  maxSizeBytes?: number;
  initialQuality?: number;
  minQuality?: number;
  qualityStep?: number;
}

export interface ResolvedImageOutputOptions {
  targetWidth: number;
  targetHeight: number;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  maxSizeBytes: number;
  initialQuality: number;
  minQuality: number;
  qualityStep: number;
}

export interface NormalizedImageOutput {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  size: number;
  quality: number;
  mimeType: string;
}

export const DEFAULT_IMAGE_OUTPUT_OPTIONS: ResolvedImageOutputOptions = {
  targetWidth: 700,
  targetHeight: 900,
  mimeType: 'image/jpeg',
  maxSizeBytes: 300 * 1024,
  initialQuality: 0.95,
  minQuality: 0.1,
  qualityStep: 0.05,
};

export function resolveImageOutputOptions(options: ImageOutputOptions = {}): ResolvedImageOutputOptions {
  return {
    ...DEFAULT_IMAGE_OUTPUT_OPTIONS,
    ...options,
  };
}

export function fileToDataUrl(fileOrBlob: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to read image file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(fileOrBlob);
  });
}

export function loadImage(imageSource: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load image'));
    image.src = imageSource;
  });
}

export async function canvasToCompressedImage(
  canvas: HTMLCanvasElement,
  options: ImageOutputOptions = {}
): Promise<NormalizedImageOutput> {
  const resolved = resolveImageOutputOptions(options);
  let quality = resolved.initialQuality;
  let outputBlob: Blob | null = null;

  do {
    outputBlob = await canvasToBlob(canvas, resolved.mimeType, quality);
    if (outputBlob.size <= resolved.maxSizeBytes || quality <= resolved.minQuality) {
      break;
    }
    quality = Math.max(resolved.minQuality, quality - resolved.qualityStep);
  } while (outputBlob.size > resolved.maxSizeBytes);

  if (!outputBlob) {
    throw new Error('Failed to encode image');
  }

  return {
    dataUrl: await fileToDataUrl(outputBlob),
    blob: outputBlob,
    width: canvas.width,
    height: canvas.height,
    size: outputBlob.size,
    quality,
    mimeType: resolved.mimeType,
  };
}

export async function normalizeImageToJpeg(
  fileOrDataUrl: File | Blob | string,
  options: ImageOutputOptions = {}
): Promise<NormalizedImageOutput> {
  const resolved = resolveImageOutputOptions(options);
  const imageSource = typeof fileOrDataUrl === 'string' ? fileOrDataUrl : await fileToDataUrl(fileOrDataUrl);
  const image = await loadImage(imageSource);
  const canvas = document.createElement('canvas');
  const ctx = getCanvasContext(canvas);
  const targetRatio = resolved.targetWidth / resolved.targetHeight;
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;
  const imageRatio = imageWidth / imageHeight;

  canvas.width = resolved.targetWidth;
  canvas.height = resolved.targetHeight;

  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = imageWidth;
  let sourceHeight = imageHeight;

  if (imageRatio > targetRatio) {
    sourceWidth = imageHeight * targetRatio;
    sourceX = (imageWidth - sourceWidth) / 2;
  } else {
    sourceHeight = imageWidth / targetRatio;
    sourceY = (imageHeight - sourceHeight) / 2;
  }

  drawImage(ctx, image, sourceX, sourceY, sourceWidth, sourceHeight, resolved.targetWidth, resolved.targetHeight);
  return canvasToCompressedImage(canvas, resolved);
}

export async function cropImageToOutput(
  image: HTMLImageElement,
  sourceX: number,
  sourceY: number,
  sourceWidth: number,
  sourceHeight: number,
  options: ImageOutputOptions = {}
): Promise<NormalizedImageOutput> {
  const resolved = resolveImageOutputOptions(options);
  const canvas = document.createElement('canvas');
  const ctx = getCanvasContext(canvas);

  canvas.width = resolved.targetWidth;
  canvas.height = resolved.targetHeight;

  drawImage(
    ctx,
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    resolved.targetWidth,
    resolved.targetHeight
  );

  return canvasToCompressedImage(canvas, resolved);
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to encode image'));
      }
    }, mimeType, quality);
  });
}

function getCanvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas is not supported in this browser');
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  return ctx;
}

function drawImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  sourceX: number,
  sourceY: number,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number
) {
  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    targetWidth,
    targetHeight
  );
}
