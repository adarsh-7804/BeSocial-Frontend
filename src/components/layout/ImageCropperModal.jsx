import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { useCropImage } from "../../hooks/useCropImage";

const ImageCropperModal = ({
  isOpen,
  imageSrc,
  onCropComplete,
  onCancel,
  aspectRatio = 4 / 3   ,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropArea, setCropArea] = useState(null);
  const [loading, setLoading] = useState(false);
  const { generateCroppedImage } = useCropImage();

  const handleCropAreaChange = useCallback((croppedArea, croppedAreaPixels) => {
    setCropArea(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!cropArea) return;

    try {
      setLoading(true);
      const croppedBlob = await generateCroppedImage(imageSrc, cropArea, zoom);
      onCropComplete(croppedBlob);
    } catch (err) {
      console.log("Crop error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mt-[5vw]">
        <h2 className="text-lg font-bold text-[#2C1A0E] mb-4">Crop Image</h2>

        {/* Crop Container */}
        <div className="relative w-full bg-gray-200 rounded-xl overflow-hidden mb-4" style={{ height: '400px' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect= {aspectRatio}
            cropShape="circle"
            showGrid={false}
            onCropChange={setCrop}
            onCropAreaChange={handleCropAreaChange}
            onZoomChange={setZoom}
          />
        </div>

        {/* Zoom Slider */}
        <div className="mb-4">
          <label className="text-xs font-bold text-[#8C5A3C] mb-2 block">
            Zoom
          </label>
          <input
            type="range"
            min="1"
            max="2"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-[#C08552] text-[#8C5A3C] rounded-lg font-medium hover:bg-[#FFF8F0] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-[#C08552] text-white rounded-lg font-medium hover:bg-[#A67448] disabled:opacity-50"
          >
            {loading ? "Processing..." : "Crop & Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
