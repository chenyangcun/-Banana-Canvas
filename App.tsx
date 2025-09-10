// Author: chenyangcun
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { ImageState, Mode, Adjustments } from './types.ts';
import { editImageWithPrompt, generateImageFromPrompt, generateVideoFromPrompt, ImagePartData } from './services/geminiService.ts';
import { useTranslation, TranslationKey } from './i18n.ts';
import { Sidebar } from './components/Sidebar.tsx';
import { Workspace } from './components/Workspace.tsx';
import { ThumbnailPanel } from './components/ThumbnailPanel.tsx';
import { ConfirmDialog } from './components/ConfirmDialog.tsx';
import type { Crop, PixelCrop } from 'react-image-crop';
import { centerCrop, makeAspectCrop } from 'react-image-crop';

import { useLoadState, useAutoSave } from './hooks/usePersistence.ts';
import { fileToDataUri } from './utils/fileUtils.ts';
import { exportDraft, importDraft } from './services/draftService.ts';
import { rotateImage, flipImage, applyFilter, applyAdjustments, cropImage, combineImagesToGrid, invertColors, blurImage } from './services/imageProcessor.ts';
import { DEFAULT_ADJUSTMENTS } from './constants.ts';


export default function App() {
  const { language, setLanguage, t } = useTranslation();
  const [images, setImages] = useState<ImageState[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [referenceImageIds, setReferenceImageIds] = useState<Set<string>>(new Set());
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>(t('workspace.loading.default'));
  const [error, setError] = useState<string | null>(null);
  const [activeHistoryIndex, setActiveHistoryIndex] = useState<number>(-1); // -1 for original, 0 and up for history
  const [showThumbnails, setShowThumbnails] = useState<boolean>(true);
  const [mode, setMode] = useState<Mode>('edit');
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText: string;
    cancelText: string;
    confirmVariant: 'danger' | 'primary';
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const draftInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  
  // Custom hooks for state persistence
  useLoadState(setImages, setSelectedImageId, setReferenceImageIds, setPrompt, setActiveHistoryIndex, setShowThumbnails, setMode);
  useAutoSave(images, selectedImageId, referenceImageIds, prompt, activeHistoryIndex, showThumbnails, mode);

  const handleSetMode = useCallback((newMode: Mode) => {
    if (generatedVideoUrl) {
      URL.revokeObjectURL(generatedVideoUrl);
      setGeneratedVideoUrl(null);
    }
    if (newMode !== 'edit') {
        setSelectedImageId(null);
        setActiveHistoryIndex(-1);
    }
    setMode(newMode);
  }, [generatedVideoUrl]);

  const selectedImage = useMemo(() => {
    return images.find(img => img.id === selectedImageId) ?? null;
  }, [images, selectedImageId]);

  const referenceImages = useMemo(() => {
    return Array.from(referenceImageIds).map(id => images.find(img => img.id === id)).filter(Boolean) as ImageState[];
  }, [images, referenceImageIds]);

  const imageToShow = useMemo(() => {
    if (!selectedImage) return null;
    if (activeHistoryIndex === -1) {
      return { src: selectedImage.originalSrc, mimeType: selectedImage.originalMimeType };
    }
    const historyItem = selectedImage.history[activeHistoryIndex];
    return historyItem ?? { src: selectedImage.originalSrc, mimeType: selectedImage.originalMimeType };
  }, [selectedImage, activeHistoryIndex]);


  const handleImageFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsLoading(true);
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
    
    setImages(prev => [...prev, ...newImages]);
    if (newImages.length > 0) {
      handleSetMode('edit');
      if (!selectedImageId || images.length === 0) {
        setSelectedImageId(newImages[0].id);
        setActiveHistoryIndex(-1);
      }
    }
    event.target.value = ''; // Reset file input
    setIsLoading(false);
  }, [selectedImageId, images.length, handleSetMode]);

  const handleImageSelect = useCallback((id: string) => {
    const image = images.find(img => img.id === id);
    if (image) {
        setSelectedImageId(id);
        if (mode !== 'video') {
            setActiveHistoryIndex(image.history.length - 1);
            setReferenceImageIds(new Set());
            handleSetMode('edit');
        }
    }
  }, [images, mode, handleSetMode]);

  const handleToggleReference = useCallback((id: string) => {
    setReferenceImageIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        return newSet;
    });
  }, []);

  const handleProgressUpdate = useCallback((messageKey: string) => {
      setLoadingMessage(t(messageKey as TranslationKey));
  }, [t]);

  const updateImageHistory = useCallback((
    newImage: { src: string, mimeType: string },
    prompt: string
  ) => {
    if (!selectedImageId) return;

    setImages(prevImages => {
        const newImages = prevImages.map(img => {
            if (img.id === selectedImageId) {
                const newHistoryBase = activeHistoryIndex > -1 ? img.history.slice(0, activeHistoryIndex + 1) : [];
                const updatedHistory = [...newHistoryBase, { ...newImage, prompt }];
                return { ...img, history: updatedHistory };
            }
            return img;
        });

        const updatedImage = newImages.find(img => img.id === selectedImageId);
        if (updatedImage) {
            setActiveHistoryIndex(updatedImage.history.length - 1);
        }
        return newImages;
    });
  }, [selectedImageId, activeHistoryIndex]);

  const handlePromptSubmit = useCallback(async () => {
    if (!prompt) {
      setError(t("error.promptRequired"));
      return;
    }
    if (mode === 'edit' && (!selectedImage || !imageToShow)) {
      setError(t("error.imageRequired"));
      return;
    }
    
    setIsLoading(true);
    setLoadingMessage(t('workspace.loading.default'));
    setError(null);
    if (generatedVideoUrl) {
      URL.revokeObjectURL(generatedVideoUrl);
      setGeneratedVideoUrl(null);
    }
    
    try {
      if (mode === 'edit' && selectedImage && imageToShow) {
        const imagePartsData: ImagePartData[] = [
          { base64Data: imageToShow.src, mimeType: imageToShow.mimeType },
          ...referenceImages.map(img => ({
            base64Data: img.originalSrc,
            mimeType: img.originalMimeType,
          }))
        ];
        
        const result = await editImageWithPrompt(imagePartsData, prompt);
        if (result) {
          updateImageHistory({ src: result.newImageBase64, mimeType: result.newMimeType }, prompt);
        } else {
          setError(t("error.editFailed"));
        }
      } else if (mode === 'generate') {
         const result = await generateImageFromPrompt(prompt);
         if (result) {
            const newImage: ImageState = {
              id: `generated-${Date.now()}`,
              name: `Generated: ${prompt.slice(0, 30)}...`,
              originalSrc: result.newImageBase64,
              originalMimeType: result.newMimeType,
              history: [],
            };
            setImages(prev => [...prev, newImage]);
            setSelectedImageId(newImage.id);
            setActiveHistoryIndex(-1);
            setReferenceImageIds(new Set());
            handleSetMode('edit');
         } else {
            setError(t("error.generateFailed"));
         }
      } else if (mode === 'video') {
        const inputImage = selectedImage ?? (referenceImages.length > 0 ? referenceImages[referenceImages.length - 1] : null);
        const imagePartData = inputImage ? { base64Data: inputImage.originalSrc, mimeType: inputImage.originalMimeType } : null;
        const videoUrl = await generateVideoFromPrompt(prompt, imagePartData, handleProgressUpdate);
        setGeneratedVideoUrl(videoUrl);
      }
    } catch (e: any) {
      setError(t(e.message as TranslationKey, { GEME_API_ERROR: e.message }) || t("error.unknown"));
    } finally {
      setIsLoading(false);
    }
  }, [prompt, selectedImage, imageToShow, referenceImages, mode, generatedVideoUrl, handleSetMode, t, handleProgressUpdate, updateImageHistory]);

  const handleCombineImages = useCallback(async () => {
    const imageIdsForGrid = new Set<string>();
    if (selectedImageId) {
        imageIdsForGrid.add(selectedImageId);
    }
    referenceImageIds.forEach(id => imageIdsForGrid.add(id));

    if (imageIdsForGrid.size !== 4) {
        setError(t('error.fourImagesRequired' as TranslationKey));
        return;
    }
    
    const orderedIds: string[] = [];
    if (selectedImageId) {
        orderedIds.push(selectedImageId);
    }
    referenceImageIds.forEach(id => {
        if (id !== selectedImageId) {
            orderedIds.push(id);
        }
    });

    const finalImagesToCombine = orderedIds.map(id => {
        const image = images.find(img => img.id === id);
        if (!image) return null;

        if (id === selectedImageId) {
            const currentView = imageToShow;
            if (currentView) {
                return { base64Data: currentView.src, mimeType: currentView.mimeType };
            }
            return { base64Data: image.originalSrc, mimeType: image.originalMimeType };
        } else {
            return { base64Data: image.originalSrc, mimeType: image.originalMimeType };
        }
    }).filter((item): item is ImagePartData => !!item);

    if (finalImagesToCombine.length !== 4) {
        setError(t('error.fourImagesRequired' as TranslationKey));
        return;
    }

    setIsLoading(true);
    setLoadingMessage(t('edit.combining' as TranslationKey));
    setError(null);

    try {
        const result = await combineImagesToGrid(finalImagesToCombine);
        const newImage: ImageState = {
            id: `combined-${Date.now()}`,
            name: t('edit.combineGrid' as TranslationKey),
            originalSrc: result.base64Data,
            originalMimeType: result.mimeType,
            history: [],
        };
        setImages(prev => [...prev, newImage]);
        setSelectedImageId(newImage.id);
        setActiveHistoryIndex(-1);
        setReferenceImageIds(new Set());
        handleSetMode('edit');
    } catch (e: any) {
        setError(t('error.combineFailed' as TranslationKey));
    } finally {
        setIsLoading(false);
    }
}, [selectedImageId, referenceImageIds, images, imageToShow, t, handleSetMode, setImages, setSelectedImageId, setActiveHistoryIndex, setReferenceImageIds]);
  
  const handleReset = useCallback(() => {
    if (!selectedImageId) return;
    setImages(prevImages => prevImages.map(img => {
        if (img.id === selectedImageId) {
            return { ...img, history: [] };
        }
        return img;
    }));
    setActiveHistoryIndex(-1);
  }, [selectedImageId]);
  
  const handleSelectHistoryItem = useCallback((index: number) => {
    setActiveHistoryIndex(index);
  }, []);

  const handleDeleteHistoryItem = useCallback((indexToDelete: number) => {
    if (!selectedImageId) return;
    setImages(prevImages => prevImages.map(img => {
        if (img.id === selectedImageId) {
            const newHistory = img.history.slice(0, indexToDelete);
            return { ...img, history: newHistory };
        }
        return img;
    }));
    setActiveHistoryIndex(indexToDelete - 1);
  }, [selectedImageId]);

  const handleDeleteImage = useCallback((idToDelete: string) => {
    setConfirmDialog({
      isOpen: true,
      title: t('filmstrip.delete.title' as TranslationKey),
      message: t('filmstrip.delete.confirm' as TranslationKey),
      confirmText: t('filmstrip.delete.title' as TranslationKey),
      cancelText: t('toolbar.adjustments.cancel' as TranslationKey),
      confirmVariant: 'danger',
      onConfirm: () => {
        setImages(prevImages => {
            const remainingImages = prevImages.filter(img => img.id !== idToDelete);
            
            if (selectedImageId === idToDelete) {
                if (remainingImages.length > 0) {
                    setSelectedImageId(remainingImages[0].id);
                    setActiveHistoryIndex(remainingImages[0].history.length - 1);
                } else {
                    setSelectedImageId(null);
                    setActiveHistoryIndex(-1);
                }
            }
            return remainingImages;
        });

        setReferenceImageIds(prevIds => {
            const newIds = new Set(prevIds);
            newIds.delete(idToDelete);
            return newIds;
        });
      },
    });
  }, [selectedImageId, t, setImages, setSelectedImageId, setActiveHistoryIndex, setReferenceImageIds]);

  const handleExport = () => {
    const link = document.createElement('a');
    
    if (generatedVideoUrl) {
      link.href = generatedVideoUrl;
      link.download = `generated-video-${Date.now()}.mp4`;
    } else if (imageToShow) {
      link.href = `data:${imageToShow.mimeType};base64,${imageToShow.src}`;
      const fileExtension = imageToShow.mimeType.split('/')[1] || 'png';
      const fileName = selectedImage ? selectedImage.name.split('.')[0] : 'image';
      link.download = `edited-${fileName}-v${activeHistoryIndex + 1}.${fileExtension}`;
    } else {
      return;
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleDraftFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
        const importedImages = await importDraft(file);
        setImages(importedImages);

        if (importedImages.length > 0) {
            const firstImage = importedImages[0];
            setSelectedImageId(firstImage.id);
            setActiveHistoryIndex(firstImage.history.length - 1);
            handleSetMode('edit');
        } else {
            setSelectedImageId(null);
            setActiveHistoryIndex(-1);
        }
        setReferenceImageIds(new Set());
        setError(null);
    } catch (err: any) {
        console.error("Failed to import draft:", err);
        const errorMessage = err.message === 'Invalid draft file format.' 
            ? t('error.invalidDraft') 
            : t('error.importFailed');
        setError(`${errorMessage}: ${err.message}`);
    } finally {
        event.target.value = '';
    }
  };

  const handleClearDraft = useCallback(() => {
    setConfirmDialog({
      isOpen: true,
      title: t('sidebar.button.clearDraft' as TranslationKey),
      message: t('sidebar.confirm.clearDraft' as TranslationKey),
      confirmText: t('sidebar.button.clearDraft' as TranslationKey),
      cancelText: t('toolbar.adjustments.cancel' as TranslationKey),
      confirmVariant: 'danger',
      onConfirm: () => {
        setImages([]);
        setSelectedImageId(null);
        setReferenceImageIds(new Set());
        setPrompt('');
        setError(null);
        setActiveHistoryIndex(-1);
        setMode('edit');
        setIsCropping(false);
        if (generatedVideoUrl) {
            URL.revokeObjectURL(generatedVideoUrl);
            setGeneratedVideoUrl(null);
        }
      }
    });
  }, [t, generatedVideoUrl, setImages, setSelectedImageId, setReferenceImageIds, setPrompt, setError, setActiveHistoryIndex, setMode, setIsCropping, setGeneratedVideoUrl]);

  const handleImageOperation = useCallback(async (
    operation: Promise<{ base64Data: string, mimeType: string }>,
    prompt: string
  ) => {
    if (!imageToShow) return;
    setIsLoading(true);
    setError(null);
    try {
        const { base64Data, mimeType } = await operation;
        updateImageHistory({ src: base64Data, mimeType }, prompt);
    } catch (e: any) {
        setError(t('error.imageEditFailed'));
    } finally {
        setIsLoading(false);
    }
  }, [imageToShow, t, updateImageHistory]);
  
  const handleRotate = (degrees: 90 | -90) => {
    if (!imageToShow) return;
    const operation = rotateImage(`data:${imageToShow.mimeType};base64,${imageToShow.src}`, degrees);
    const prompt = degrees > 0 ? t('edit.rotateRight') : t('edit.rotateLeft');
    handleImageOperation(operation, prompt);
  };
  
  const handleFlip = (direction: 'horizontal' | 'vertical') => {
    if (!imageToShow) return;
    const operation = flipImage(`data:${imageToShow.mimeType};base64,${imageToShow.src}`, direction);
    const prompt = direction === 'horizontal' ? t('edit.flipHorizontal') : t('edit.flipVertical');
    handleImageOperation(operation, prompt);
  };

  const handleApplyFilter = (filter: 'grayscale' | 'sepia') => {
    if (!imageToShow) return;
    const operation = applyFilter(`data:${imageToShow.mimeType};base64,${imageToShow.src}`, filter);
    const prompt = t(filter === 'grayscale' ? 'edit.grayscaleFilter' : 'edit.sepiaFilter');
    handleImageOperation(operation, prompt);
  };

  const handleInvertColors = () => {
    if (!imageToShow) return;
    const operation = invertColors(`data:${imageToShow.mimeType};base64,${imageToShow.src}`);
    handleImageOperation(operation, t('edit.invert' as TranslationKey));
  };

  const handleBlurImage = () => {
      if (!imageToShow) return;
      const operation = blurImage(`data:${imageToShow.mimeType};base64,${imageToShow.src}`);
      handleImageOperation(operation, t('edit.blur' as TranslationKey));
  };
  
  const handleApplyAdjustments = (adjustments: Adjustments) => {
      if (!imageToShow) return;
      const operation = applyAdjustments(`data:${imageToShow.mimeType};base64,${imageToShow.src}`, adjustments);
      handleImageOperation(operation, t('edit.adjustments'));
  };

  const handleConfirmCrop = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !imageToShow) return;
    setIsLoading(true);
    setIsCropping(false);
    setError(null);
    try {
        const { base64Data, mimeType } = await cropImage(imgRef.current, completedCrop, imageToShow.mimeType);
        updateImageHistory({ src: base64Data, mimeType }, t('edit.crop'));
    } catch (e: any) {
        setError(t('error.cropFailed'));
    } finally {
        setIsLoading(false);
        setCompletedCrop(undefined);
    }
  }, [completedCrop, imageToShow, t, updateImageHistory]);
  
  function onImageLoadForCrop(e: React.SyntheticEvent<HTMLImageElement>) {
      imgRef.current = e.currentTarget;
      const { width, height } = e.currentTarget;
      const newCrop = centerCrop(
          makeAspectCrop({ unit: '%', width: 90 }, 16/9, width, height),
          width,
          height
      );
      setCrop(newCrop);
      setCompletedCrop(undefined);
  }


  return (
    <div className="h-screen w-screen flex flex-col lg:flex-row bg-slate-900 overflow-hidden">
      <main className="flex-grow flex flex-col p-4">
        <Workspace
          imageToShow={imageToShow}
          generatedVideoUrl={generatedVideoUrl}
          isLoading={isLoading}
          loadingMessage={loadingMessage}
          mode={mode}
          isCropping={isCropping}
          setIsCropping={setIsCropping}
          crop={crop}
          onCropChange={(_, pc) => setCrop(pc)}
          onCropComplete={setCompletedCrop}
          onImageLoad={onImageLoadForCrop}
          onConfirmCrop={handleConfirmCrop}
          t={t}
          selectedImage={selectedImage}
          handleApplyFilter={handleApplyFilter}
          handleApplyAdjustments={handleApplyAdjustments}
          handleRotate={handleRotate}
          handleFlip={handleFlip}
          handleExport={handleExport}
          handleInvertColors={handleInvertColors}
          handleBlurImage={handleBlurImage}
        />
        
        <ThumbnailPanel
          images={images}
          showThumbnails={showThumbnails}
          setShowThumbnails={setShowThumbnails}
          mode={mode}
          selectedImage={selectedImage}
          activeHistoryIndex={activeHistoryIndex}
          handleSelectHistoryItem={handleSelectHistoryItem}
          handleDeleteHistoryItem={handleDeleteHistoryItem}
          isLoading={isLoading}
          isCropping={isCropping}
          t={t}
          selectedImageId={selectedImageId}
          referenceImageIds={referenceImageIds}
          handleImageSelect={handleImageSelect}
          handleToggleReference={handleToggleReference}
          handleDeleteImage={handleDeleteImage}
        />
      </main>

      <Sidebar
        language={language}
        setLanguage={setLanguage}
        t={t}
        fileInputRef={fileInputRef}
        handleImageFileChange={handleImageFileChange}
        handleExport={handleExport}
        generatedVideoUrl={generatedVideoUrl}
        selectedImage={selectedImage}
        isLoading={isLoading}
        draftInputRef={draftInputRef}
        handleDraftFileChange={handleDraftFileChange}
        handleExportDraft={() => exportDraft(images)}
        images={images}
        handleClearDraft={handleClearDraft}
        mode={mode}
        handleSetMode={handleSetMode}
        referenceImages={referenceImages}
        handleToggleReference={handleToggleReference}
        prompt={prompt}
        setPrompt={setPrompt}
        selectedImageId={selectedImageId}
        referenceImageIds={referenceImageIds}
        handlePromptSubmit={handlePromptSubmit}
        handleCombineImages={handleCombineImages}
        handleReset={handleReset}
        error={error}
      />
      
      <ConfirmDialog
        isOpen={confirmDialog?.isOpen || false}
        title={confirmDialog?.title || ''}
        message={confirmDialog?.message || ''}
        confirmText={confirmDialog?.confirmText || 'Confirm'}
        cancelText={confirmDialog?.cancelText || 'Cancel'}
        confirmVariant={confirmDialog?.confirmVariant || 'primary'}
        onConfirm={() => {
          confirmDialog?.onConfirm();
          setConfirmDialog(null);
        }}
        onCancel={() => setConfirmDialog(null)}
      />
    </div>
  );
}