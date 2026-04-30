import { useCallback } from "react";

export const useCropImage = () => {
  const generateCroppedImage = useCallback(async (imageSrc, cropArea, zoom) => {
    return new Promise((resolve) => {
      const image = new Image();
      image.src = imageSrc;

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Calculate dimensions
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        canvas.width = cropArea.width;
        canvas.height = cropArea.height;

        // Draw cropped image
        ctx.drawImage(
          image,
          cropArea.x * scaleX,
          cropArea.y * scaleY,
          cropArea.width * scaleX,
          cropArea.height * scaleY,
          0,
          0,
          cropArea.width,
          cropArea.height
        );

        // Convert to blob
        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/jpeg", 0.95);
      };
    });
  }, []);

  return { generateCroppedImage };
};