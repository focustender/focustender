import { pipeline } from "@huggingface/transformers";

// Client-side object cutout tool. Segmentation runs entirely in the
// browser (WASM/ONNX via transformers.js) — no backend exists on this
// static site, and photos never leave the visitor's device.

// General salient-object segmentation (not a portrait/person model) —
// the target subjects here are objects like ceramics, not people.
const MODEL_ID = "xrds/isnet-general-onnx-int8";
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // generous for phone photos, blocks pathological uploads
const MAX_SOURCE_DIMENSION = 1600; // downscale before segmentation to bound inference cost

const dropzone = document.getElementById("sticker-dropzone");
const fileInput = document.getElementById("sticker-file-input");
const status = document.getElementById("sticker-status");
const previewCanvas = document.getElementById("sticker-canvas");
const previewWrap = previewCanvas.parentElement;
const downloadBtn = document.getElementById("sticker-download");

let segmenter = null; // lazy-loaded pipeline, memoized after first use
let croppedCutoutCanvas = null; // tight bounding-box crop of the current cutout

function handleFile(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showError("That doesn't look like an image — try a JPG or PNG.");
    return;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    showError("That photo is too large (max 15MB) — try a smaller export from your camera app.");
    return;
  }
  processFile(file);
}

fileInput.addEventListener("change", () => handleFile(fileInput.files[0]));
dropzone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropzone.classList.add("is-dragover");
});
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("is-dragover"));
dropzone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropzone.classList.remove("is-dragover");
  handleFile(event.dataTransfer.files[0]);
});

async function loadDownscaled(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SOURCE_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas;
}

async function getSegmenter() {
  if (!segmenter) {
    setStatus("Loading background-removal model (first time only — a bigger download, cached after)…");
    segmenter = await pipeline("background-removal", MODEL_ID, { device: "wasm", dtype: "q8" });
  }
  return segmenter;
}

async function processFile(file) {
  setBusy(true);
  downloadBtn.disabled = true;
  try {
    const sourceCanvas = await loadDownscaled(file);
    const model = await getSegmenter();
    setStatus("Removing background…");
    const cutout = await model(sourceCanvas); // RawImage, RGBA, alpha already masked
    const cropped = autoCropToAlpha(cutout.toCanvas());
    if (!cropped) {
      showError("Couldn't find a clear object in that photo — try one with more contrast between the object and its background.");
      return;
    }
    croppedCutoutCanvas = cropped;
    renderCutout();
    downloadBtn.disabled = false;
    setStatus("");
  } catch (err) {
    console.error(err);
    showError("Something went wrong removing the background. Check your connection and try again.");
  } finally {
    setBusy(false);
  }
}

function autoCropToAlpha(canvas, alphaThreshold = 10) {
  const { width, height } = canvas;
  const { data } = canvas.getContext("2d").getImageData(0, 0, width, height);
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > alphaThreshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX || maxY < minY) return null; // segmentation found nothing
  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  const cropped = document.createElement("canvas");
  cropped.width = cropW;
  cropped.height = cropH;
  cropped.getContext("2d").drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
  return cropped;
}

function renderCutout() {
  previewCanvas.width = croppedCutoutCanvas.width;
  previewCanvas.height = croppedCutoutCanvas.height;
  previewCanvas.getContext("2d").drawImage(croppedCutoutCanvas, 0, 0);
  previewWrap.classList.remove("is-empty");
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

downloadBtn.addEventListener("click", () => {
  croppedCutoutCanvas.toBlob((blob) => triggerDownload(blob, "sticker.png"), "image/png");
});

function setStatus(text) {
  status.textContent = text;
  status.classList.remove("is-error");
}

function showError(text) {
  status.textContent = text;
  status.classList.add("is-error");
}

function setBusy(isBusy) {
  fileInput.disabled = isBusy;
  dropzone.classList.toggle("is-busy", isBusy);
}
