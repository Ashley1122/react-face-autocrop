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
import { useFaceAutoCrop, loadFaceApiModels, ImageCropper } from 'react-face-autocrop';

// Preload models (recommended)
await loadFaceApiModels('https://ashley1122.github.io/face-api-models/models/');

// Use the hook (auto crop)
const { autoCrop, loading, error } = useFaceAutoCrop({
  modelUrl: 'https://ashley1122.github.io/face-api-models/models/',
  aspectRatio: 1, // Optional: e.g. 1 for square, 16/9, 4/3, etc.
  zoomFactor: 1.2, // Optional: how much to zoom in on the face (default 1)
});

// Manual cropping
<ImageCropper
  image={...}
  onCrop={...}
  onCancel={...}
  aspectRatio={1} // Optional: same as above
  zoomFactor={1.2} // Optional: initial zoom for manual crop
/>
```

**Options:**
- `aspectRatio`: Set the crop aspect ratio (e.g. 1 for square, 16/9, 4/3, etc.).
- `zoomFactor`: Zoom in/out on the face (auto) or set initial zoom (manual). Default is 1.

**The cropped image is returned as a base64 string.**

---

MIT License
