
export interface ImageHistory {
  src: string; // Base64 encoded image data
  mimeType: string;
  prompt: string;
}

export interface ImageState {
  id: string;
  name: string;
  originalSrc: string; // Base64 encoded image data
  originalMimeType: string;
  history: ImageHistory[];
}
