/**
 * utils.js — Shared helpers across all tool pages
 */

export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export function savings(orig, comp) {
  if (!orig || !comp) return 0;
  return Math.max(0, Math.round((1 - comp / orig) * 100));
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

export function changeExtension(filename, newExt) {
  const base = filename.substring(0, filename.lastIndexOf('.')) || filename;
  return `${base}.${newExt}`;
}

/** Setup drag-and-drop on a dropzone element */
export function setupDropzone(el, accept, onFiles) {
  el.addEventListener('dragover', e => {
    e.preventDefault();
    el.classList.add('drag-over');
  });
  el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
  el.addEventListener('drop', e => {
    e.preventDefault();
    el.classList.remove('drag-over');
    const files = [...e.dataTransfer.files].filter(f => {
      if (!accept) return true;
      return accept.some(ext => f.name.toLowerCase().endsWith(ext) || f.type.startsWith(ext));
    });
    if (files.length) onFiles(files);
  });
  // File input inside dropzone
  const input = el.querySelector('input[type=file]');
  if (input) {
    input.addEventListener('change', e => {
      const files = [...e.target.files];
      if (files.length) onFiles(files);
    });
  }
}

/** Animate progress bar */
export function setProgress(wrapEl, barFillEl, labelEl, percent, msg) {
  wrapEl.classList.add('show');
  barFillEl.style.width = percent + '%';
  if (labelEl) labelEl.textContent = msg || `${percent}%`;
}

export function hideProgress(wrapEl) {
  wrapEl.classList.remove('show');
}
