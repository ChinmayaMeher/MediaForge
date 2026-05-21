/**
 * imageCompressor.js
 * Client-side image compression using Canvas API
 */

/**
 * Compress an image file
 * @param {File} file
 * @param {Object} opts - { quality: 0-1, maxWidth, maxHeight, format: 'jpeg'|'png'|'webp' }
 * @returns {Promise<{blob: Blob, dataUrl: string, originalSize: number, compressedSize: number}>}
 */
export async function compressImage(file, opts = {}) {
  const {
    quality = 0.7,
    maxWidth = 3840,
    maxHeight = 2160,
    format = 'jpeg'
  } = opts;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.naturalWidth;
        let h = img.naturalHeight;

        // Maintain aspect ratio
        if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
        if (h > maxHeight) { w = Math.round(w * maxHeight / h); h = maxHeight; }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        const mimeType = format === 'png' ? 'image/png' :
                         format === 'webp' ? 'image/webp' : 'image/jpeg';

        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Compression failed'));
          const fr = new FileReader();
          fr.onload = () => resolve({
            blob,
            dataUrl: fr.result,
            originalSize: file.size,
            compressedSize: blob.size,
            width: w,
            height: h,
            mimeType
          });
          fr.readAsDataURL(blob);
        }, mimeType, quality);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Format bytes to human-readable */
export function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/** Calculate compression savings percentage */
export function savings(orig, comp) {
  return Math.max(0, Math.round((1 - comp / orig) * 100));
}

/** Trigger download of a blob */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
