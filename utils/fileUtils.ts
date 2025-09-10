export const fileToDataUri = (file: File): Promise<{ data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        const base64Data = event.target.result.split(',')[1];
        resolve({ data: base64Data, mimeType: file.type });
      } else {
        reject(new Error('Failed to read file.'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
