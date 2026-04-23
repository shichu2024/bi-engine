import Pixelmatch from 'pixelmatch';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IgnoreRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CompareOptions {
  baselineImage: HTMLImageElement | HTMLCanvasElement;
  currentImage: HTMLImageElement | HTMLCanvasElement;
  threshold?: number;
  ignoreRegions?: IgnoreRegion[];
}

export interface CompareResult {
  match: boolean;
  diffPixelCount: number;
  totalPixels: number;
  diffPercentage: number;
  diffImageDataURL: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Draw an image source onto a new off-screen canvas and return the canvas
 * together with its pixel data.
 */
function drawToCanvas(
  source: HTMLImageElement | HTMLCanvasElement,
  width: number,
  height: number,
): { canvas: HTMLCanvasElement; imageData: ImageData } {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to obtain 2D rendering context');
  }

  ctx.drawImage(source, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);

  return { canvas, imageData };
}

/**
 * Build a boolean mask (`Uint8Array`, 1 = ignore, 0 = compare) from the
 * list of ignore regions.  Every pixel inside an ignore region is masked out.
 */
function buildIgnoreMask(
  width: number,
  height: number,
  regions: IgnoreRegion[],
): Uint8Array {
  const mask = new Uint8Array(width * height);

  for (const region of regions) {
    const maxX = Math.min(region.x + region.width, width);
    const maxY = Math.min(region.y + region.height, height);

    for (let y = region.y; y < maxY; y++) {
      for (let x = region.x; x < maxX; x++) {
        mask[y * width + x] = 1;
      }
    }
  }

  return mask;
}

/**
 * Apply an ignore mask by painting masked pixels in both image data arrays
 * to the same colour so that pixelmatch treats them as identical.
 */
function applyIgnoreMask(
  img1: Uint8ClampedArray,
  img2: Uint8ClampedArray,
  mask: Uint8Array,
): void {
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] === 1) {
      const offset = i * 4;
      // Set both images to the same neutral colour at masked positions
      img1[offset] = 0;
      img1[offset + 1] = 0;
      img1[offset + 2] = 0;
      img1[offset + 3] = 255;

      img2[offset] = 0;
      img2[offset + 1] = 0;
      img2[offset + 2] = 0;
      img2[offset + 3] = 255;
    }
  }
}

/**
 * Render the ignore regions as semi-transparent overlays on the diff canvas.
 */
function renderIgnoreOverlays(
  ctx: CanvasRenderingContext2D,
  regions: IgnoreRegion[],
): void {
  ctx.fillStyle = 'rgba(128, 128, 128, 0.4)';
  for (const region of regions) {
    ctx.fillRect(region.x, region.y, region.width, region.height);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compare two images (baseline vs. current) using pixelmatch.
 *
 * Both images are drawn onto identically-sized off-screen canvases.  If
 * `ignoreRegions` are provided, pixels inside those regions are masked so
 * that pixelmatch skips them.  The diff image is rendered on a third canvas
 * and exported as a data URL.
 */
export function compareImages(options: CompareOptions): Promise<CompareResult> {
  const {
    baselineImage,
    currentImage,
    threshold = 0.1,
    ignoreRegions = [],
  } = options;

  return new Promise((resolve, reject) => {
    try {
      // Determine the common dimensions – both images must share the same size
      const width = Math.max(
        baselineImage instanceof HTMLImageElement
          ? baselineImage.naturalWidth
          : baselineImage.width,
        currentImage instanceof HTMLImageElement
          ? currentImage.naturalWidth
          : currentImage.width,
      );

      const height = Math.max(
        baselineImage instanceof HTMLImageElement
          ? baselineImage.naturalHeight
          : baselineImage.height,
        currentImage instanceof HTMLImageElement
          ? currentImage.naturalHeight
          : currentImage.height,
      );

      if (width === 0 || height === 0) {
        reject(new Error('Image dimensions cannot be zero'));
        return;
      }

      // Draw both images to off-screen canvases
      const { imageData: baselineData } = drawToCanvas(
        baselineImage,
        width,
        height,
      );
      const { imageData: currentData } = drawToCanvas(
        currentImage,
        width,
        height,
      );

      // Build and apply ignore mask
      const totalPixels = width * height;
      if (ignoreRegions.length > 0) {
        const mask = buildIgnoreMask(width, height, ignoreRegions);
        applyIgnoreMask(baselineData.data, currentData.data, mask);
      }

      // Prepare diff output canvas
      const diffCanvas = document.createElement('canvas');
      diffCanvas.width = width;
      diffCanvas.height = height;
      const diffCtx = diffCanvas.getContext('2d');
      if (!diffCtx) {
        reject(new Error('Unable to obtain 2D rendering context for diff'));
        return;
      }

      const diffImageData = diffCtx.createImageData(width, height);

      // Run pixelmatch
      const diffPixelCount = Pixelmatch(
        baselineData.data,
        currentData.data,
        diffImageData.data,
        width,
        height,
        { threshold },
      );

      // Draw diff pixels onto the diff canvas
      diffCtx.putImageData(diffImageData, 0, 0);

      // Render ignore region overlays on top of the diff
      if (ignoreRegions.length > 0) {
        renderIgnoreOverlays(diffCtx, ignoreRegions);
      }

      const diffPercentage = (diffPixelCount / totalPixels) * 100;
      const diffImageDataURL = diffCanvas.toDataURL('image/png');

      resolve({
        match: diffPixelCount === 0,
        diffPixelCount,
        totalPixels,
        diffPercentage,
        diffImageDataURL,
      });
    } catch (error) {
      reject(
        new Error(
          `图像对比失败：${error instanceof Error ? error.message : String(error)}`,
        ),
      );
    }
  });
}
