/**
 * Compresses an image client-side using HTML5 Canvas
 * @param {File} file - Original file
 * @param {number} maxWidth - Max bounding width
 * @param {number} maxHeight - Max bounding height
 * @param {number} quality - JPEG compression quality (0 to 1)
 * @returns {Promise<{ compressedBlob: Blob, thumbnailBase64: string }>}
 */
export async function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio within bounding box
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Draw onto canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Generate small thumbnail for localStorage (max 150px)
        const thumbCanvas = document.createElement('canvas');
        const thumbScale = Math.min(150 / width, 150 / height, 1);
        thumbCanvas.width = Math.round(width * thumbScale);
        thumbCanvas.height = Math.round(height * thumbScale);
        const thumbCtx = thumbCanvas.getContext('2d');
        thumbCtx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
        const thumbnailBase64 = thumbCanvas.toDataURL('image/jpeg', 0.6);

        // Export compressed blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({
                compressedBlob: blob,
                thumbnailBase64
              });
            } else {
              // Fallback to original file if canvas blob creation fails
              resolve({
                compressedBlob: file,
                thumbnailBase64: event.target.result
              });
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
}
