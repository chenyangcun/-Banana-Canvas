
import React, { useCallback } from 'react';
import type { ImageState } from '../types';
import { UploadIcon } from './Icons';

interface ImageUploaderProps {
  onImagesUploaded: (images: ImageState[]) => void;
  disabled: boolean;
}

const fileToDataUri = (file: File): Promise<{ data: string; mimeType: string }> => {
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

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesUploaded, disabled }) => {
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newImages: ImageState[] = [];
    for (const file of Array.from(files)) {
      try {
        const { data, mimeType } = await fileToDataUri(file);
        newImages.push({
          id: `${file.name}-${Date.now()}`,
          name: file.name,
          originalSrc: data,
          originalMimeType: mimeType,
          history: [],
        });
      } catch (error) {
        console.error("Error processing file:", file.name, error);
      }
    }
    onImagesUploaded(newImages);
     // Reset file input to allow re-uploading the same file
    event.target.value = '';
  }, [onImagesUploaded]);

  return (
    <div className="w-full">
      <label
        htmlFor="image-upload"
        className={`
          flex flex-col items-center justify-center w-full h-32 px-4 
          border-2 border-dashed rounded-lg cursor-pointer
          transition-colors duration-200 ease-in-out
          ${disabled 
            ? 'border-gray-600 bg-gray-800 cursor-not-allowed' 
            : 'border-gray-500 bg-gray-800 hover:bg-gray-700 hover:border-blue-400'
          }
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
          <UploadIcon className={`w-10 h-10 mb-3 ${disabled ? 'text-gray-500' : 'text-gray-400'}`} />
          <p className={`mb-2 text-sm ${disabled ? 'text-gray-500' : 'text-gray-400'}`}>
            <span className="font-semibold">点击上传</span> 或拖拽文件到此处
          </p>
          <p className={`text-xs ${disabled ? 'text-gray-600' : 'text-gray-500'}`}>
            支持 PNG, JPG, GIF, 最大 10MB
          </p>
        </div>
        <input
          id="image-upload"
          type="file"
          className="hidden"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </label>
    </div>
  );
};
