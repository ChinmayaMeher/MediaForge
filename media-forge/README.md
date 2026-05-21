# MediaForge 🎬🖼️
### A fully client-side media compression & enhancement web app

> **Zero uploads. Zero servers. 100% in the browser.**

---

## 📁 Folder Structure

```
media-forge/
│
├── index.html                  ← Home / landing page
│
├── pages/
│   ├── compress-image.html     ← Image Compressor tool
│   ├── compress-video.html     ← Video Compressor tool
│   ├── enhance-image.html      ← Photo Enhancer tool
│   └── batch.html              ← Batch Processor tool
│
├── css/
│   └── main.css                ← All shared styles (variables, nav, buttons, tool pages)
│
├── js/
│   ├── nav.js                  ← Mobile nav toggle
│   ├── utils.js                ← Shared helpers (formatBytes, downloadBlob, setupDropzone…)
│   ├── imageCompressor.js      ← Canvas-based image compression engine
│   ├── imageEnhancer.js        ← Canvas pixel-manipulation enhancement engine
│   └── videoCompressor.js      ← MediaRecorder-based video compression engine
│
└── README.md                   ← This file
```

---

## 🚀 How to Run

### Option A — Just open in browser (no server needed for most features)
```bash
open index.html
# or double-click index.html
```

### Option B — Local dev server (recommended, needed for ES modules)
```bash
# Using Python
python3 -m http.server 3000

# Using Node.js
npx serve .

# Using VS Code
# Install "Live Server" extension → right-click index.html → "Open with Live Server"
```
Then visit: `http://localhost:3000`

---

## ✨ Features

### 🖼️ Image Compressor (`compress-image.html`)
- Supports JPEG, PNG, WebP input
- Adjustable quality (1–100%)
- Max width/height control
- Output format: JPEG / WebP / PNG
- Real-time before/after preview
- Shows savings % and size comparison
- Multi-file batch mode with per-file download
- Uses **Canvas API** (no libraries needed)

### 🎬 Video Compressor (`compress-video.html`)
- Supports MP4, WebM, MOV input
- Adjustable video bitrate (500kbps – 5Mbps)
- Resolution scaling (25% / 50% / 75% / 100%)
- Frame rate control (15 / 24 / 30 / 60 FPS)
- Audio bitrate control
- Real-time progress bar
- Before/after playback preview
- Uses **MediaRecorder API** (Chrome/Edge recommended)

### ✨ Photo Enhancer (`enhance-image.html`)
- 9 built-in presets: Vivid, Portrait, Landscape, Cinematic, Cool, Warm, Dramatic, Soft
- Manual sliders: Brightness, Contrast, Saturation, Sharpness, Denoise, Warmth, Vignette
- **Side-by-side** and **drag-to-compare slider** views
- Output: JPEG / WebP / PNG
- Uses Canvas **pixel manipulation** (no external deps)

### 📦 Batch Processor (`batch.html`)
- Upload dozens of images at once
- Modes: Compress Only / Enhance Only / Compress + Enhance
- Per-file status indicators (Pending → Processing → Done)
- Total savings summary
- Per-file and bulk download

---

## 🛠 Tech Stack

| Technology | Used For |
|---|---|
| Canvas API | Image compression & pixel enhancement |
| MediaRecorder API | Video compression |
| FileReader API | Reading uploaded files |
| Web Audio API | Audio capture during video compression |
| ES Modules (import/export) | Code organization |
| CSS Custom Properties | Theming |
| Google Fonts (Syne + DM Sans) | Typography |

**No frameworks. No build tools. No npm install. Pure HTML/CSS/JS.**

---

## 🌐 Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| Image Compression | ✅ | ✅ | ✅ | ✅ |
| Photo Enhancement | ✅ | ✅ | ✅ | ✅ |
| Video Compression | ✅ | ⚠️ Limited | ❌ | ✅ |
| Batch Processing | ✅ | ✅ | ✅ | ✅ |

> Video compression requires MediaRecorder with VP8/VP9 support. Chrome/Edge recommended.

---

## 🔒 Privacy

- **No files are ever uploaded** to any server
- All processing happens in your browser using native Web APIs
- No analytics, no tracking, no external requests (except Google Fonts)
- Closing the tab discards everything

---

## 📦 Extending the Project

### Add FFmpeg.wasm for better video compression
```bash
npm install @ffmpeg/ffmpeg @ffmpeg/util
```
Then replace `videoCompressor.js` with an FFmpeg.wasm implementation for true MP4 output.

### Add JSZip for ZIP downloads
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
```
Then use `JSZip` in `batch.html` to bundle all processed files into a single `.zip` download.

### Deploy
Upload the entire `media-forge/` folder to any static host:
- GitHub Pages
- Netlify (drag and drop)
- Vercel
- Cloudflare Pages

---

## 📄 License

MIT — free to use, modify, and distribute.
