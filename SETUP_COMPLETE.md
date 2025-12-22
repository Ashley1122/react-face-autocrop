# React Face Autocrop - Testing Guide

## ✅ Setup Complete!

Your autocrop library has been successfully set up as an npm-ready package. Here's what was created:

### Library Structure
```
autocrop library/
├── src/                          # Source files
│   ├── index.ts                  # Main entry point
│   ├── useFaceAutoCrop.ts       # Auto crop hook
│   └── ImageCropper.tsx         # Manual cropper component
├── dist/                         # Compiled JavaScript (generated)
├── models/                       # face-api.js model files
├── example/                      # Test application
│   ├── src/
│   │   ├── App.tsx              # Example usage
│   │   ├── main.tsx
│   │   └── index.css
│   └── public/models/           # Models copied here
├── package.json                  # Library configuration
├── tsconfig.json                # TypeScript config
├── README.md                     # Documentation
├── .npmignore                   # Files to exclude from npm
└── .gitignore                   # Files to exclude from git
```

## 🧪 Testing Your Library

### Option 1: Run the Example App (Recommended)

```bash
cd example
npm run dev
```

This will start a development server (usually at http://localhost:5173). The example app demonstrates:
- ✅ Automatic face detection and cropping
- ✅ Manual cropping with the ImageCropper component

### Option 2: Test in Another Project

1. In your other project, install the library locally:
   ```bash
   npm install "a:\Coding Projects\autocrop library"
   ```

2. Use it in your React app:
   ```tsx
   import { useFaceAutoCrop, ImageCropper } from 'react-face-autocrop';
   ```

## 📦 Publishing to npm

When you're ready to publish:

1. **Update package.json**:
   - Change the `name` to your desired package name (must be unique on npm)
   - Update `author`, `repository`, and `homepage` fields
   - Verify the version number

2. **Create an npm account**: https://www.npmjs.com/signup

3. **Login via terminal**:
   ```bash
   npm login
   ```

4. **Publish**:
   ```bash
   npm publish
   ```

5. **Install in any project**:
   ```bash
   npm install react-face-autocrop
   ```

## 🔄 Development Workflow

When making changes to the library:

1. Edit files in `src/`
2. Rebuild: `npm run build`
3. The example app will automatically use the updated library
4. Test in the example app

## 📋 Key Features Implemented

✅ Configurable model path
✅ TypeScript support with type definitions
✅ Customizable cropping parameters
✅ Both auto and manual cropping options
✅ React hooks-based API
✅ Proper npm package structure
✅ Example application for testing
✅ Complete documentation

## 🚀 Next Steps

1. Run `cd example && npm run dev` to test the library
2. Upload test images to verify both auto and manual cropping
3. Customize the library name and author in package.json
4. Add your own branding/styling if needed
5. Publish to npm when ready!

## 📚 Usage Example

```tsx
import { useFaceAutoCrop } from 'react-face-autocrop';

function MyComponent() {
  const { autoCrop, loading, error } = useFaceAutoCrop({
    modelUrl: '/models',
    zoomOutFactor: 2.3,
    passportAspectRatio: 36 / 45,
  });

  const handleUpload = async (file: File) => {
    const cropped = await autoCrop(file);
    if (cropped) {
      // Use the cropped image (base64 string)
    }
  };

  return (
    <input 
      type="file" 
      onChange={(e) => handleUpload(e.target.files[0])} 
    />
  );
}
```
