# react-face-autocrop

React hook and component for automatic and manual face cropping in React apps.

**You must set the modelUrl to a public CDN.**

**Recommended CDN:**
```
https://ashley1122.github.io/face-api-models/models/
```

## Install

```
npm install react-face-autocrop
```

## Usage



```tsx
import {
  useFaceAutoCrop,
  useBulkFaceAutoCrop,
  loadFaceApiModels,
  normalizeImageToJpeg,
  ImageCropper,
} from 'react-face-autocrop';

// Preload models (recommended)
await loadFaceApiModels('https://ashley1122.github.io/face-api-models/models/');

// Use the hook (auto crop)
const { autoCrop, loading, error } = useFaceAutoCrop({
  modelUrl: 'https://ashley1122.github.io/face-api-models/models/',
  aspectRatio: 1, // Optional: e.g. 1 for square, 16/9, 4/3, etc.
  zoomFactor: 1.2, // Optional: how much to zoom in on the face (default 1)
});

// Bulk auto-crop multiple local files. Results are returned in memory.
const { cropFiles, processing, items } = useBulkFaceAutoCrop({
  modelUrl: 'https://ashley1122.github.io/face-api-models/models/',
  aspectRatio: 7 / 9,
  zoomFactor: 2.3,
  outputOptions: {
    targetWidth: 700,
    targetHeight: 900,
    maxSizeBytes: 300 * 1024,
  },
});

const result = await cropFiles(fileInput.files);

// Manual cropping (with custom size)
<ImageCropper
  image={...}
  onCrop={...}
  onCancel={...}
  aspectRatio={1} // Optional: same as above
  cropperStyles={{ width: '1000px', height: '700px' }} // Optional: set cropper window size
/>

// Normalize manual crop output to the same JPG constraints as bulk auto-crop.
const normalized = await normalizeImageToJpeg(croppedDataUrl, {
  targetWidth: 700,
  targetHeight: 900,
  maxSizeBytes: 300 * 1024,
});
```


**Options:**
- `aspectRatio`: Set the crop aspect ratio (e.g. 1 for square, 16/9, 4/3, etc.).
- `cropperStyles`: Set the width, height, or any CSS for the cropper window (e.g. `{ width: '1000px', height: '700px' }`).
- `zoomFactor`: Zoom in/out on the face (auto) or set initial zoom (manual). Default is 1.
- `outputOptions`: For bulk and normalization helpers, set target dimensions, MIME type, quality, and max byte size.
- Default passport output uses the Indian standard 35mm x 45mm ratio, i.e. 7:9.

**The single-image cropper returns a base64 string. Bulk and normalization helpers return both a base64 string and a Blob.**

---

MIT License
