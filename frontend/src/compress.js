// Shrinks a photo in the browser so uploads are small and fast.
// Returns a JPEG File no larger than maxBytes, or throws a readable error.
export async function compressImage(file, maxBytes) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file (JPG, PNG or WebP)");
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch (e) {
    throw new Error("Could not read this image. Try a JPG, PNG or WebP photo.");
  }

  let scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  for (let attempt = 0; attempt < 8; attempt++) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    for (const quality of [0.85, 0.7, 0.55, 0.4]) {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (blob && blob.size <= maxBytes) {
        const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
        return new File([blob], name, { type: "image/jpeg" });
      }
    }
    scale *= 0.75;
  }
  throw new Error("Could not make this image small enough. Try a different photo.");
}

// Cuts off an even coloured margin around a picture (the white or grey edge many poster tools leave).
// Returns the file unchanged when there is no such margin.
export async function trimBorders(file) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch (e) {
    return file;
  }
  const w = bitmap.width;
  const h = bitmap.height;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(bitmap, 0, 0);
  const px = ctx.getImageData(0, 0, w, h).data;

  const at = (x, y) => {
    const i = (y * w + x) * 4;
    return [px[i], px[i + 1], px[i + 2], px[i + 3]];
  };
  const near = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) < 60;

  const bg = at(0, 0);
  // the margin only counts when all four corners agree
  if (!near(bg, at(w - 1, 0)) || !near(bg, at(0, h - 1)) || !near(bg, at(w - 1, h - 1))) return file;

  const rowIsBg = (y) => {
    for (let x = 0; x < w; x += 2) if (!near(bg, at(x, y))) return false;
    return true;
  };
  const colIsBg = (x) => {
    for (let y = 0; y < h; y += 2) if (!near(bg, at(x, y))) return false;
    return true;
  };

  let top = 0;
  let bottom = h - 1;
  let left = 0;
  let right = w - 1;
  while (top < bottom && rowIsBg(top)) top++;
  while (bottom > top && rowIsBg(bottom)) bottom--;
  while (left < right && colIsBg(left)) left++;
  while (right > left && colIsBg(right)) right--;

  const nw = right - left + 1;
  const nh = bottom - top + 1;
  // nothing to trim, or the result looks wrong (almost blank picture): keep the original
  if ((top === 0 && left === 0 && nw === w && nh === h) || nw < w * 0.5 || nh < h * 0.5) return file;

  const out = document.createElement("canvas");
  out.width = nw;
  out.height = nh;
  out.getContext("2d").drawImage(canvas, left, top, nw, nh, 0, 0, nw, nh);
  const blob = await new Promise((resolve) => out.toBlob(resolve, "image/png"));
  return blob ? new File([blob], file.name.replace(/\.[^.]+$/, "") + ".png", { type: "image/png" }) : file;
}
