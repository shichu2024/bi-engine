// ---------------------------------------------------------------------------
// Ambient type declarations for VRT dependencies that lack types or need
// augmentation.  html2canvas and pixelmatch already ship their own type
// definitions (@types/pixelmatch + html2canvas bundled), so only resemblejs
// is declared here for future use.
// ---------------------------------------------------------------------------

declare module 'resemblejs' {
  interface ResembleResult {
    misMatchPercentage: number;
    isSameDimensions: boolean;
    dimensionDifference: { width: number; height: number };
    getImageDataUrl(): string;
  }

  interface ResembleComparison {
    ignoreAntialiasing(): ResembleOnComplete;
    ignoreColors(): ResembleOnComplete;
    onComplete(callback: (result: ResembleResult) => void): void;
  }

  interface ResembleOnComplete {
    onComplete(callback: (result: ResembleResult) => void): void;
  }

  interface ResembleChained {
    compareTo(file: Blob | string): ResembleComparison;
  }

  function resemble(file: Blob | string): ResembleChained;

  export default resemble;
}
