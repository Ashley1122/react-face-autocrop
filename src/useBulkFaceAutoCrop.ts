import { useState } from 'react';
import { autoCropImageToOutput, type FaceAutoCropOptions } from './useFaceAutoCrop';
import { fileToDataUrl, type ImageOutputOptions } from './imageOutput';

export type BulkCropStatus = 'processing' | 'ready' | 'needs-manual-crop' | 'error';

export interface BulkFaceAutoCropOptions extends FaceAutoCropOptions {
  outputOptions?: ImageOutputOptions;
}

export interface BulkCropItem {
  id: string;
  file: File;
  fileName: string;
  originalDataUrl: string;
  status: BulkCropStatus;
  croppedDataUrl?: string;
  croppedBlob?: Blob;
  error?: string;
  width?: number;
  height?: number;
  size?: number;
  quality?: number;
}

export interface BulkCropResult {
  total: number;
  successCount: number;
  failedCount: number;
  items: BulkCropItem[];
}

export function useBulkFaceAutoCrop(options: BulkFaceAutoCropOptions = {}) {
  const [items, setItems] = useState<BulkCropItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cropFiles = async (files: File[] | FileList): Promise<BulkCropResult> => {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    const initialItems = imageFiles.map((file, index) => ({
      id: createItemId(file, index),
      file,
      fileName: file.name,
      originalDataUrl: '',
      status: 'processing' as BulkCropStatus,
    }));

    setItems(initialItems);
    setProcessing(true);
    setError(null);

    const completedItems: BulkCropItem[] = [];
    let successCount = 0;
    let failedCount = 0;

    try {
      for (const item of initialItems) {
        const nextItem = await cropFile(item, options);

        if (nextItem.status === 'ready') {
          successCount += 1;
        } else {
          failedCount += 1;
        }

        completedItems.push(nextItem);
        setItems(currentItems =>
          currentItems.map(currentItem => currentItem.id === nextItem.id ? nextItem : currentItem)
        );
      }
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : 'Bulk auto-crop failed';
      setError(message);
    } finally {
      setProcessing(false);
    }

    return {
      total: imageFiles.length,
      successCount,
      failedCount,
      items: completedItems,
    };
  };

  const reset = () => {
    setItems([]);
    setError(null);
    setProcessing(false);
  };

  return {
    items,
    cropFiles,
    reset,
    processing,
    loading: processing,
    error,
  };
}

async function cropFile(
  item: BulkCropItem,
  options: BulkFaceAutoCropOptions
): Promise<BulkCropItem> {
  let originalDataUrl = item.originalDataUrl;

  try {
    originalDataUrl = await fileToDataUrl(item.file);
    const output = await autoCropImageToOutput(originalDataUrl, options);

    if (!output) {
      return {
        ...item,
        originalDataUrl,
        status: 'needs-manual-crop',
        error: 'No faces detected. Try manual crop.',
      };
    }

    return {
      ...item,
      originalDataUrl,
      status: 'ready',
      croppedDataUrl: output.dataUrl,
      croppedBlob: output.blob,
      width: output.width,
      height: output.height,
      size: output.size,
      quality: output.quality,
    };
  } catch (unknownError) {
    const message = unknownError instanceof Error ? unknownError.message : 'Failed to process image';
    return {
      ...item,
      originalDataUrl,
      status: 'error',
      error: message,
    };
  }
}

function createItemId(file: File, index: number): string {
  return `${Date.now()}-${index}-${file.name}-${file.size}`;
}
