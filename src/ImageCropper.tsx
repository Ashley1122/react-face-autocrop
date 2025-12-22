import React, { useRef, useEffect } from 'react';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';

interface ImageCropperProps {
  image: string;
  onCrop: (cropped: string) => void;
  onCancel: () => void;
  aspectRatio?: number;
  cropperStyles?: React.CSSProperties;
  buttonContainerClassName?: string;
  buttonClassName?: string;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  image,
  onCrop,
  onCancel,
  aspectRatio = 55 / 71,
  cropperStyles = { maxWidth: 300, maxHeight: 300 },
  buttonContainerClassName,
  buttonClassName,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<Cropper | null>(null);

  useEffect(() => {
    if (imgRef.current) {
      cropperRef.current = new Cropper(imgRef.current, {
        aspectRatio: aspectRatio,
        viewMode: 2,
        zoomOnTouch: false,
        movable: true,
        zoomOnWheel: true,
        zoomable: true,
        responsive: true,
      } as any);
    }
    return () => {
      (cropperRef.current as any)?.destroy();
      cropperRef.current = null;
    };
  }, [image, aspectRatio]);

  const handleCrop = () => {
    if (cropperRef.current) {
      const canvas = cropperRef.current.getCroppedCanvas({
        maxWidth: 800,
        maxHeight: 1024,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });
      const cropped = canvas.toDataURL('image/jpeg', 0.95);
      onCrop(cropped);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <img ref={imgRef} src={image} alt="To crop" style={cropperStyles} />
      <div className={buttonContainerClassName} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button type="button" onClick={handleCrop} className={buttonClassName}>
          Crop
        </button>
        <button type="button" onClick={onCancel} className={buttonClassName}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ImageCropper;
