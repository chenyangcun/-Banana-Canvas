import { useEffect, useRef } from 'react';
import type { ImageState, ImageHistory, Mode } from '../types.ts';
import { AUTOSAVE_KEY } from '../constants.ts';
import { getImageData, putImageData } from '../services/dbService.ts';

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

export const useLoadState = (
  setImages: SetState<ImageState[]>,
  setSelectedImageId: SetState<string | null>,
  setReferenceImageIds: SetState<Set<string>>,
  setPrompt: SetState<string>,
  setActiveHistoryIndex: SetState<number>,
  setShowThumbnails: SetState<boolean>,
  setMode: SetState<Mode>
) => {
  useEffect(() => {
    const loadState = async () => {
      try {
        const savedStateJSON = localStorage.getItem(AUTOSAVE_KEY);
        if (savedStateJSON) {
          const savedState = JSON.parse(savedStateJSON);
          if (savedState && savedState.images) {
            const rehydratedImages = await Promise.all(
              (savedState.images as any[]).map(async (img: any) => {
                const originalImage = await getImageData(img.originalSrcKey);
                if (!originalImage) return null;

                const rehydratedHistory = await Promise.all(
                  (img.history || []).map(async (histItem: any) => {
                    const historyImage = await getImageData(histItem.srcKey);
                    if (!historyImage) return null;
                    return {
                      prompt: histItem.prompt,
                      src: historyImage.data,
                      mimeType: historyImage.mimeType,
                    };
                  })
                );

                return {
                  id: img.id,
                  name: img.name,
                  originalSrc: originalImage.data,
                  originalMimeType: originalImage.mimeType,
                  history: rehydratedHistory.filter(Boolean) as ImageHistory[],
                };
              })
            );
            
            setImages(rehydratedImages.filter(Boolean) as ImageState[]);
            setSelectedImageId(savedState.selectedImageId || null);
            setReferenceImageIds(new Set(savedState.referenceImageIds || []));
            setPrompt(savedState.prompt || '');
            setActiveHistoryIndex(savedState.activeHistoryIndex ?? -1);
            setShowThumbnails(savedState.showThumbnails ?? true);
            setMode(savedState.mode || 'edit');
          }
        }
      } catch (e) {
        console.error("Failed to load state", e);
        localStorage.removeItem(AUTOSAVE_KEY);
      }
    };
    loadState();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on initial mount
};


export const useAutoSave = (
  images: ImageState[],
  selectedImageId: string | null,
  referenceImageIds: Set<string>,
  prompt: string,
  activeHistoryIndex: number,
  showThumbnails: boolean,
  mode: Mode
) => {
  const autoSaveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = window.setTimeout(async () => {
      if (images.length === 0) {
         localStorage.removeItem(AUTOSAVE_KEY);
         return;
      }
      try {
        const imagesToSave = await Promise.all(
          images.map(async (img) => {
            const originalSrcKey = `${img.id}_original`;
            await putImageData(originalSrcKey, { data: img.originalSrc, mimeType: img.originalMimeType });

            const historyToSave = await Promise.all(
              (img.history || []).map(async (histItem, index) => {
                const srcKey = `${img.id}_history_${index}`;
                await putImageData(srcKey, { data: histItem.src, mimeType: histItem.mimeType });
                
                return {
                  prompt: histItem.prompt,
                  srcKey: srcKey,
                };
              })
            );

            return {
              id: img.id,
              name: img.name,
              originalSrcKey: originalSrcKey,
              history: historyToSave,
            };
          })
        );
        
        const stateToSave = {
          images: imagesToSave,
          selectedImageId,
          referenceImageIds: Array.from(referenceImageIds),
          prompt,
          activeHistoryIndex,
          showThumbnails,
          mode,
        };
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(stateToSave));
      } catch (e) {
         console.error("Failed to save state", e);
      }
    }, 1000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [images, selectedImageId, referenceImageIds, prompt, activeHistoryIndex, showThumbnails, mode]);
};