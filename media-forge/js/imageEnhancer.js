/**
 * imageEnhancer.js
 * Client-side image enhancement using Canvas API pixel manipulation
 */

/**
 * Apply enhancement filters to an image
 * @param {File|string} source - File or dataURL
 * @param {Object} opts
 * @returns {Promise<{blob, dataUrl, originalSize, compressedSize}>}
 */
export async function enhanceImage(source, opts = {}) {
  const {
    brightness = 0,    // -100 to 100
    contrast = 0,      // -100 to 100
    saturation = 0,    // -100 to 100
    sharpness = 0,     // 0 to 100
    denoise = 0,       // 0 to 100
    warmth = 0,        // -100 to 100
    vignette = 0,      // 0 to 100
    format = 'jpeg',
    quality = 0.92
  } = opts;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;

      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      let imageData = ctx.getImageData(0, 0, w, h);
      let data = imageData.data;

      // --- Brightness & Contrast ---
      if (brightness !== 0 || contrast !== 0) {
        const bVal = brightness * 2.55;
        const cFactor = contrast > 0
          ? (259 * (contrast + 255)) / (255 * (259 - contrast))
          : 1 + contrast / 100;
        for (let i = 0; i < data.length; i += 4) {
          data[i]   = clamp(cFactor * (data[i]   - 128) + 128 + bVal);
          data[i+1] = clamp(cFactor * (data[i+1] - 128) + 128 + bVal);
          data[i+2] = clamp(cFactor * (data[i+2] - 128) + 128 + bVal);
        }
      }

      // --- Saturation ---
      if (saturation !== 0) {
        const sVal = 1 + saturation / 100;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i+1], b = data[i+2];
          const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
          data[i]   = clamp(gray + sVal * (r - gray));
          data[i+1] = clamp(gray + sVal * (g - gray));
          data[i+2] = clamp(gray + sVal * (b - gray));
        }
      }

      // --- Warmth ---
      if (warmth !== 0) {
        const wVal = warmth * 1.5;
        for (let i = 0; i < data.length; i += 4) {
          data[i]   = clamp(data[i]   + wVal);
          data[i+2] = clamp(data[i+2] - wVal);
        }
      }

      // --- Denoise (box blur) ---
      if (denoise > 0) {
        const radius = Math.round(denoise / 20); // 0-5
        if (radius > 0) {
          imageData.data.set(data);
          ctx.putImageData(imageData, 0, 0);
          ctx.filter = `blur(${radius * 0.4}px)`;
          ctx.drawImage(canvas, 0, 0);
          ctx.filter = 'none';
          imageData = ctx.getImageData(0, 0, w, h);
          data = imageData.data;
        }
      }

      // --- Sharpness (unsharp mask) ---
      if (sharpness > 0) {
        imageData.data.set(data);
        ctx.putImageData(imageData, 0, 0);
        const amount = sharpness / 100;
        const blurred = document.createElement('canvas');
        blurred.width = w; blurred.height = h;
        const bCtx = blurred.getContext('2d');
        bCtx.filter = 'blur(1px)';
        bCtx.drawImage(canvas, 0, 0);
        const blurData = bCtx.getImageData(0, 0, w, h).data;
        for (let i = 0; i < data.length; i += 4) {
          data[i]   = clamp(data[i]   + amount * (data[i]   - blurData[i]));
          data[i+1] = clamp(data[i+1] + amount * (data[i+1] - blurData[i+1]));
          data[i+2] = clamp(data[i+2] + amount * (data[i+2] - blurData[i+2]));
        }
      }

      // --- Vignette ---
      if (vignette > 0) {
        imageData.data.set(data);
        ctx.putImageData(imageData, 0, 0);
        const cx = w / 2, cy = h / 2;
        const maxDist = Math.sqrt(cx * cx + cy * cy);
        const strength = vignette / 100;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
            const factor = 1 - strength * (dist / maxDist) ** 2;
            data[idx]   = clamp(data[idx]   * factor);
            data[idx+1] = clamp(data[idx+1] * factor);
            data[idx+2] = clamp(data[idx+2] * factor);
          }
        }
      }

      imageData.data.set(data);
      ctx.putImageData(imageData, 0, 0);

      const mimeType = format === 'png' ? 'image/png' :
                       format === 'webp' ? 'image/webp' : 'image/jpeg';

      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Enhancement failed'));
        const fr = new FileReader();
        fr.onload = () => resolve({
          blob,
          dataUrl: fr.result,
          width: w,
          height: h
        });
        fr.readAsDataURL(blob);
      }, mimeType, quality);
    };
    img.onerror = reject;
    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = e => { img.src = e.target.result; };
      reader.readAsDataURL(source);
    }
  });
}

function clamp(v) { return Math.max(0, Math.min(255, Math.round(v))); }

/** Preset enhancement profiles */
export const PRESETS = {
  original:   { brightness: 0,   contrast: 0,   saturation: 0,   sharpness: 0,  denoise: 0,  warmth: 0,   vignette: 0  },
  vivid:      { brightness: 5,   contrast: 20,  saturation: 40,  sharpness: 30, denoise: 0,  warmth: 10,  vignette: 0  },
  portrait:   { brightness: 10,  contrast: 10,  saturation: -10, sharpness: 20, denoise: 30, warmth: 15,  vignette: 30 },
  landscape:  { brightness: -5,  contrast: 25,  saturation: 35,  sharpness: 25, denoise: 0,  warmth: -5,  vignette: 10 },
  cinematic:  { brightness: -10, contrast: 35,  saturation: -20, sharpness: 15, denoise: 10, warmth: 20,  vignette: 50 },
  cool:       { brightness: 0,   contrast: 15,  saturation: 10,  sharpness: 10, denoise: 0,  warmth: -40, vignette: 0  },
  warm:       { brightness: 5,   contrast: 10,  saturation: 15,  sharpness: 0,  denoise: 0,  warmth: 50,  vignette: 0  },
  dramatic:   { brightness: -15, contrast: 50,  saturation: -30, sharpness: 40, denoise: 0,  warmth: 0,   vignette: 60 },
  soft:       { brightness: 15,  contrast: -10, saturation: -5,  sharpness: 0,  denoise: 40, warmth: 10,  vignette: 20 },
};
