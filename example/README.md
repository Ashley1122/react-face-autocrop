# Example App

This example demonstrates how to use the `react-face-autocrop` library.

## Setup

1. Copy your face-api.js model files to `public/models/`
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to the URL shown in the terminal (usually http://localhost:5173)

## Testing the Library

The example includes two sections:

1. **Automatic Face Detection & Crop**: Upload an image with a face, and it will automatically detect and crop it in passport style.

2. **Manual Cropping**: Upload any image and manually crop it using the interactive cropper.

## Local Development

To test changes to the library:

1. Make changes in the parent `src/` folder
2. Rebuild the library: `npm run build` (in the parent folder)
3. The example app will automatically use the updated local library

## Models

The example expects model files in `public/models/`. You need these files:
- ssd_mobilenetv1_model files
- face_landmark_68_model files  
- face_recognition_model files

Download them from: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
