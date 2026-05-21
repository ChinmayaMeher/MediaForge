/**
 * videoCompressor.js
 * Client-side video compression using MediaRecorder + OffscreenCanvas/Canvas API
 * Works entirely in the browser — no server needed.
 */

/**
 * Compress a video file
 * @param {File} file
 * @param {Object} opts
 * @param {Function} onProgress - callback(percent 0-100)
 * @returns {Promise<{blob, originalSize, compressedSize, duration}>}
 */
export async function compressVideo(file, opts = {}, onProgress) {
  const {
    videoBitrate = 1_500_000,   // bps
    audioBitrate = 96_000,
    scale = 1.0,                // 0.25 | 0.5 | 0.75 | 1.0
    fps = 30,
    format = 'webm'             // 'webm' (widely supported in browser)
  } = opts;

  return new Promise((resolve, reject) => {
    const videoEl = document.createElement('video');
    videoEl.src = URL.createObjectURL(file);
    videoEl.muted = false;
    videoEl.crossOrigin = 'anonymous';

    videoEl.onloadedmetadata = async () => {
      const origW = videoEl.videoWidth;
      const origH = videoEl.videoHeight;
      const newW = Math.round(origW * scale / 2) * 2;
      const newH = Math.round(origH * scale / 2) * 2;
      const duration = videoEl.duration;

      const canvas = document.createElement('canvas');
      canvas.width = newW;
      canvas.height = newH;
      const ctx = canvas.getContext('2d');

      // Build MediaStream from canvas + audio
      const canvasStream = canvas.captureStream(fps);

      // Try to get audio track from video
      let audioStream = null;
      try {
        // Use Web Audio to capture audio
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioCtx.createMediaElementSource(videoEl);
        const dest = audioCtx.createMediaStreamDestination();
        source.connect(dest);
        source.connect(audioCtx.destination);
        audioStream = dest.stream;
      } catch (e) {
        console.warn('Audio capture not available, compressing video only');
      }

      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...(audioStream ? audioStream.getAudioTracks() : [])
      ]);

      // Pick best supported mime type
      const mimeType = getSupportedMimeType(format);
      if (!mimeType) return reject(new Error('No supported video codec found in this browser'));

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: videoBitrate,
        audioBitsPerSecond: audioBitrate
      });

      const chunks = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        URL.revokeObjectURL(videoEl.src);
        resolve({
          blob,
          originalSize: file.size,
          compressedSize: blob.size,
          duration,
          mimeType,
          width: newW,
          height: newH
        });
      };

      recorder.onerror = reject;

      // Draw frames
      videoEl.currentTime = 0;
      await videoEl.play();
      recorder.start(100); // collect in 100ms chunks

      const interval = 1000 / fps;
      let lastTime = performance.now();

      const drawFrame = () => {
        if (videoEl.ended || videoEl.paused) {
          recorder.stop();
          return;
        }
        const now = performance.now();
        if (now - lastTime >= interval) {
          ctx.drawImage(videoEl, 0, 0, newW, newH);
          lastTime = now;
        }
        if (onProgress && duration > 0) {
          onProgress(Math.min(99, Math.round((videoEl.currentTime / duration) * 100)));
        }
        requestAnimationFrame(drawFrame);
      };

      requestAnimationFrame(drawFrame);
      videoEl.onended = () => { recorder.stop(); };
    };

    videoEl.onerror = () => reject(new Error('Could not load video file'));
  });
}

function getSupportedMimeType(format) {
  const types = format === 'webm'
    ? ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
    : ['video/mp4;codecs=h264,aac', 'video/mp4'];
  return types.find(t => MediaRecorder.isTypeSupported(t)) || null;
}

/** Get video metadata (dimensions, duration, size) */
export function getVideoMeta(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    v.src = url;
    v.onloadedmetadata = () => {
      resolve({
        width: v.videoWidth,
        height: v.videoHeight,
        duration: v.duration,
        size: file.size
      });
      URL.revokeObjectURL(url);
    };
    v.onerror = reject;
  });
}
