import React, { useRef } from 'react';
import 'cropperjs';

interface ImageCropperProps {
  image: string;
  aspectRatio?: number;
  cropperStyles?: React.CSSProperties;
  buttonContainerClassName?: string;
  buttonClassName?: string;
  onCrop: (cropped: string) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  image,
  aspectRatio = 55 / 71,
  cropperStyles = { width: '600px', height: '600px', maxWidth: '90vw', maxHeight: '70vh' },
  buttonContainerClassName,
  buttonClassName,
  onCrop,
  onCancel,
}) => {
  const selectionRef = useRef<any>(null);

  const handleCrop = async () => {
    if (selectionRef.current) {
      const canvas = await selectionRef.current.$toCanvas();
      if (canvas) {
        const cropped = canvas.toDataURL('image/jpeg', 0.95);
        onCrop(cropped);
      }
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      padding: '20px',
      gap: '20px'
    }}>
      <cropper-canvas background style={cropperStyles}>
        <cropper-image
          src={image}
          alt="To crop"
          rotatable
          scalable
          skewable
          translatable
        />
        <cropper-shade hidden />
        <cropper-handle action="select" plain />
        <cropper-selection
          ref={selectionRef}
          initial-coverage="0.5"
          movable
          resizable
          aspect-ratio={aspectRatio}
        >
          <cropper-grid role="grid" covered />
          <cropper-crosshair centered />
          <cropper-handle action="move" theme-color="rgba(255, 255, 255, 0.35)" />
          <cropper-handle action="n-resize" />
          <cropper-handle action="e-resize" />
          <cropper-handle action="s-resize" />
          <cropper-handle action="w-resize" />
          <cropper-handle action="ne-resize" />
          <cropper-handle action="nw-resize" />
          <cropper-handle action="se-resize" />
          <cropper-handle action="sw-resize" />
        </cropper-selection>
      </cropper-canvas>
      <div 
        className={buttonContainerClassName} 
        style={{ 
          display: 'flex', 
          gap: '12px',
          justifyContent: 'center'
        }}
      >
        <button 
          type="button" 
          onClick={handleCrop} 
          className={buttonClassName}
          style={{
            padding: '10px 24px',
            fontSize: '16px',
            fontWeight: '500',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#0066ff',
            color: 'white',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            ...(!buttonClassName && {}),
          }}
          onMouseEnter={(e) => {
            if (!buttonClassName) e.currentTarget.style.backgroundColor = '#0052cc';
          }}
          onMouseLeave={(e) => {
            if (!buttonClassName) e.currentTarget.style.backgroundColor = '#0066ff';
          }}
        >
          Crop
        </button>
        <button 
          type="button" 
          onClick={onCancel} 
          className={buttonClassName}
          style={{
            padding: '10px 24px',
            fontSize: '16px',
            fontWeight: '500',
            borderRadius: '6px',
            border: '1px solid #d0d0d0',
            backgroundColor: 'white',
            color: '#333',
            cursor: 'pointer',
            transition: 'all 0.2s',
            ...(!buttonClassName && {}),
          }}
          onMouseEnter={(e) => {
            if (!buttonClassName) {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
              e.currentTarget.style.borderColor = '#b0b0b0';
            }
          }}
          onMouseLeave={(e) => {
            if (!buttonClassName) {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#d0d0d0';
            }
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ImageCropper;
