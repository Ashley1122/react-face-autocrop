import React, { useState, useEffect } from 'react';
import { useFaceAutoCrop, ImageCropper, loadFaceApiModels } from 'react-face-autocrop';
import 'cropperjs/dist/cropper.css';

const MODEL_URL = 'https://ashley1122.github.io/face-api-models/models/';

function App() {
  // Auto crop state
  const [autoCroppedImage, setAutoCroppedImage] = useState<string | null>(null);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelsError, setModelsError] = useState<string | null>(null);
  
  const { autoCrop, loading, error } = useFaceAutoCrop({
    modelUrl: MODEL_URL,
    zoomOutFactor: 2.3,
    passportAspectRatio: 36 / 45,
  });

  // Manual crop state
  const [manualImage, setManualImage] = useState<string | null>(null);
  const [manualCroppedImage, setManualCroppedImage] = useState<string | null>(null);

  // Load models on app startup
  useEffect(() => {
    const initModels = async () => {
      try {
        setModelsLoading(true);
        await loadFaceApiModels(MODEL_URL);
        setModelsLoading(false);
      } catch (err: any) {
        setModelsError(err?.message || 'Failed to load face detection models');
        setModelsLoading(false);
      }
    };
    initModels();
  }, []);

  const handleAutoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAutoCroppedImage(null);
      const result = await autoCrop(file);
      setAutoCroppedImage(result);
    }
  };

  const handleManualFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setManualImage(e.target?.result as string);
      reader.readAsDataURL(file);
      setManualCroppedImage(null);
    }
  };

  return (
    <div className="container">
      <h1>React Face Autocrop Example</h1>
      
      {modelsLoading && (
        <div className="section">
          <p className="loading">Loading face detection models...</p>
        </div>
      )}

      {modelsError && (
        <div className="section">
          <p className="error">Error loading models: {modelsError}</p>
        </div>
      )}

      {!modelsLoading && !modelsError && (
        <>
          <div className="section">
            <h2>🎯 Automatic Face Detection & Crop</h2>
            <input
              type="file"
              accept="image/*"
              onChange={handleAutoFileChange}
              className="file-input"
              disabled={loading}
            />
            {loading && <p className="loading">Processing image...</p>}
            {error && <p className="error">Error: {error}</p>}
            {autoCroppedImage && (
              <div>
                <h3>Result:</h3>
                <img src={autoCroppedImage} alt="Auto cropped" className="result-image" />
              </div>
            )}
          </div>

          <div className="section">
            <h2>✂️ Manual Cropping</h2>
            <input
              type="file"
              accept="image/*"
              onChange={handleManualFileChange}
              className="file-input"
            />
            {manualImage && (
              <ImageCropper
                image={manualImage}
                onCrop={(cropped: string) => {
                  setManualCroppedImage(cropped);
                  setManualImage(null);
                }}
                onCancel={() => setManualImage(null)}
                aspectRatio={55 / 71}
                buttonClassName="button"
              />
            )}
            {manualCroppedImage && (
              <div>
                <h3>Result:</h3>
                <img src={manualCroppedImage} alt="Manually cropped" className="result-image" />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
