import type { PixelCrop } from 'react-image-crop';
import type { Adjustments } from '../types.ts';

type ImageData = { base64Data: string; mimeType: string };

const applyCanvasOperation = (
  imageSrcWithMime: string,
  operation: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, img: HTMLImageElement) => void,
): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Could not get canvas context'));
      
      operation(canvas, ctx, img);
      
      const mimeType = imageSrcWithMime.split(';')[0].split(':')[1] || 'image/png';
      resolve({
          base64Data: canvas.toDataURL(mimeType).split(',')[1],
          mimeType: mimeType
      });
    };
    img.onerror = (error) => reject(error);
    img.src = imageSrcWithMime;
  });
};

export const rotateImage = (imageSrcWithMime: string, degrees: 90 | -90): Promise<ImageData> => {
  return applyCanvasOperation(imageSrcWithMime, (canvas, ctx, img) => {
    canvas.width = img.height;
    canvas.height = img.width;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((degrees * Math.PI) / 180);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
  });
};

export const flipImage = (imageSrcWithMime: string, direction: 'horizontal' | 'vertical'): Promise<ImageData> => {
  return applyCanvasOperation(imageSrcWithMime, (canvas, ctx, img) => {
    canvas.width = img.width;
    canvas.height = img.height;
    if (direction === 'horizontal') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(0, canvas.height);
      ctx.scale(1, -1);
    }
    ctx.drawImage(img, 0, 0);
  });
};

export const applyFilter = (imageSrcWithMime: string, filter: 'grayscale' | 'sepia'): Promise<ImageData> => {
  return applyCanvasOperation(imageSrcWithMime, (canvas, ctx, img) => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.filter = `${filter}(100%)`;
    ctx.drawImage(img, 0, 0);
  });
};

export const applyAdjustments = (imageSrcWithMime: string, adjustments: Adjustments): Promise<ImageData> => {
  const { brightness, contrast, saturation } = adjustments;
  const filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
  return applyCanvasOperation(imageSrcWithMime, (canvas, ctx, img) => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.filter = filterString;
    ctx.drawImage(img, 0, 0);
  });
};

export const invertColors = (imageSrcWithMime: string): Promise<ImageData> => {
    return applyCanvasOperation(imageSrcWithMime, (canvas, ctx, img) => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.filter = 'invert(100%)';
      ctx.drawImage(img, 0, 0);
    });
};

export const blurImage = (imageSrcWithMime: string): Promise<ImageData> => {
    return applyCanvasOperation(imageSrcWithMime, (canvas, ctx, img) => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.filter = 'blur(4px)';
      ctx.drawImage(img, 0, 0);
    });
};

export const cropImage = (imageElement: HTMLImageElement, completedCrop: PixelCrop, mimeType: string): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const scaleX = imageElement.naturalWidth / imageElement.width;
        const scaleY = imageElement.naturalHeight / imageElement.height;
        
        canvas.width = Math.floor(completedCrop.width * scaleX);
        canvas.height = Math.floor(completedCrop.height * scaleY);
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not get canvas context'));
        
        ctx.drawImage(
            imageElement,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0, 0,
            canvas.width, canvas.height
        );
        
        resolve({
            base64Data: canvas.toDataURL(mimeType).split(',')[1],
            mimeType: mimeType
        });
    });
};

const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = src;
    });
};

export const combineImagesToGrid = async (imagesData: ImageData[]): Promise<ImageData> => {
    if (imagesData.length !== 4) {
        throw new Error("Exactly 4 images are required for a 2x2 grid.");
    }

    const images = await Promise.all(
        imagesData.map(data => loadImage(`data:${data.mimeType};base64,${data.base64Data}`))
    );

    const [img1, img2, img3, img4] = images;

    const col1Width = Math.max(img1.width, img3.width);
    const col2Width = Math.max(img2.width, img4.width);
    const row1Height = Math.max(img1.height, img2.height);
    const row2Height = Math.max(img3.height, img4.height);

    const canvas = document.createElement('canvas');
    canvas.width = col1Width + col2Width;
    canvas.height = row1Height + row2Height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw images centered in their quadrant
    ctx.drawImage(img1, (col1Width - img1.width) / 2, (row1Height - img1.height) / 2);
    ctx.drawImage(img2, col1Width + (col2Width - img2.width) / 2, (row1Height - img2.height) / 2);
    ctx.drawImage(img3, (col1Width - img3.width) / 2, row1Height + (row2Height - img3.height) / 2);
    ctx.drawImage(img4, col1Width + (col2Width - img4.width) / 2, row1Height + (row2Height - img4.height) / 2);

    const mimeType = 'image/png';
    return {
        base64Data: canvas.toDataURL(mimeType).split(',')[1],
        mimeType: mimeType
    };
};