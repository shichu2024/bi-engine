import html2canvas from 'html2canvas';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CaptureOptions {
  element: HTMLElement;
  disableAnimation: boolean;
  scale?: number;
  backgroundColor?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ANIMATION_DISABLE_ID = 'vrt-disable-animation-style';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function injectAnimationDisableStyle(): void {
  if (document.getElementById(ANIMATION_DISABLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = ANIMATION_DISABLE_ID;
  style.textContent =
    '* { animation: none !important; transition: none !important; }';
  document.head.appendChild(style);
}

function removeAnimationDisableStyle(): void {
  const style = document.getElementById(ANIMATION_DISABLE_ID);
  if (style) {
    style.remove();
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Capture an HTML element as a PNG Blob using html2canvas.
 *
 * When `disableAnimation` is true a temporary `<style>` element is injected
 * that forces `animation: none` and `transition: none` on all elements so
 * that animations do not produce non-deterministic screenshots.
 */
export async function captureElement(options: CaptureOptions): Promise<Blob> {
  const { element, disableAnimation, scale = 1, backgroundColor } = options;

  try {
    if (disableAnimation) {
      injectAnimationDisableStyle();
    }

    const canvas = await html2canvas(element, {
      scale,
      backgroundColor: backgroundColor ?? '#ffffff',
      useCORS: true,
      allowTaint: false,
      logging: false,
    });

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas toBlob returned null'));
          }
        },
        'image/png',
        1,
      );
    });
  } catch (error) {
    throw new Error(
      `截图捕获失败：${error instanceof Error ? error.message : String(error)}`,
    );
  } finally {
    if (disableAnimation) {
      removeAnimationDisableStyle();
    }
  }
}
