import type { ImageState } from '../types.ts';

export const exportDraft = (images: ImageState[]): void => {
  if (images.length === 0) return;
  const draftData = {
    version: '1.0',
    appName: 'AI Image Editor Draft',
    data: {
      images: images,
    },
  };
  const jsonString = JSON.stringify(draftData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ai-image-editor-draft-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};


export const importDraft = (file: File): Promise<ImageState[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error('Could not read file content.');
        }
        const parsedData = JSON.parse(text);
        
        if (parsedData.appName !== 'AI Image Editor Draft' || !Array.isArray(parsedData.data?.images)) {
          throw new Error('Invalid draft file format.');
        }

        const importedImages: ImageState[] = parsedData.data.images;
        resolve(importedImages);
      } catch (err: any) {
        reject(err);
      }
    };
    reader.onerror = () => {
        reject(new Error("Error reading the file."));
    };
    reader.readAsText(file);
  });
};