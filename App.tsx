// Author: chenyangcun
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { ImageState, ImageHistory } from './types';
import { editImageWithPrompt, generateImageFromPrompt, generateVideoFromPrompt, ImagePartData } from './services/geminiService';
import { SparklesIcon, LoadingSpinner, ResetIcon, UploadIcon, DownloadIcon, ChevronDownIcon, TrashIcon, PencilIcon, PhotoIcon, SaveIcon, FolderOpenIcon, PinIcon, CropIcon, RotateLeftIcon, RotateRightIcon, CheckIcon, XIcon, FlipHorizontalIcon, FlipVerticalIcon, ColorSwatchIcon, AdjustmentsIcon, VideoCameraIcon } from './components/Icons';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { putImageData, getImageData } from './services/dbService';
// FIX: Import TranslationKey to fix type error when handling error messages.
import { useTranslation, Language, TranslationKey } from './i18n';
import { promptCategoriesEn, videoPromptCategoriesEn } from './recipes.en';
import { promptCategoriesZh, videoPromptCategoriesZh } from './recipes.zh';

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


type Mode = 'edit' | 'generate' | 'video';
type Adjustments = { brightness: number, contrast: number, saturation: number };
const DEFAULT_ADJUSTMENTS: Adjustments = { brightness: 100, contrast: 100, saturation: 100 };

const applyCanvasOperation = (
    imageSrcWithMime: string,
    operation: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, img: HTMLImageElement) => void,
): Promise<{ base64Data: string; mimeType: string }> => {
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

const EditorWorkspace: React.FC<{
  imageToShow: { src: string; mimeType: string } | null;
  generatedVideoUrl: string | null;
  isLoading: boolean;
  loadingMessage: string;
  mode: Mode;
  isCropping: boolean;
  crop: Crop | undefined;
  onCropChange: (crop: Crop) => void;
  onCropComplete: (crop: PixelCrop) => void;
  onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  onConfirmCrop: () => void;
  onCancelCrop: () => void;
  children: React.ReactNode;
  liveAdjustmentsStyle: React.CSSProperties;
  t: (key: any) => string;
}> = ({ imageToShow, generatedVideoUrl, isLoading, loadingMessage, mode, isCropping, crop, onCropChange, onCropComplete, onImageLoad, onConfirmCrop, onCancelCrop, children, liveAdjustmentsStyle, t }) => {
  const showContent = imageToShow || generatedVideoUrl;
  return (
    <div className="flex-grow bg-slate-950 rounded-lg p-4 flex items-center justify-center relative overflow-hidden">
      {!showContent && (
        <div className="flex flex-col items-center justify-center text-center">
            {mode === 'edit' && <p className="mt-6 text-slate-400">{t('workspace.empty.edit')}</p>}
            {mode === 'generate' && <p className="mt-6 text-slate-400">{t('workspace.empty.generate')}</p>}
            {mode === 'video' && <p className="mt-6 text-slate-400">{t('workspace.empty.video')}</p>}
        </div>
      )}
      {showContent && (
           generatedVideoUrl ? (
            <video
              key={generatedVideoUrl}
              src={generatedVideoUrl}
              controls
              autoPlay
              loop
              className="max-w-full max-h-full object-contain animate-[fadeIn_0.5s_ease-in-out]"
            />
           ) : imageToShow && (
              isCropping ? (
                 <ReactCrop
                    crop={crop}
                    onChange={onCropChange}
                    onComplete={onCropComplete}
                    className="max-w-full max-h-full flex items-center justify-center"
                 >
                    <img
                        src={`data:${imageToShow.mimeType};base64,${imageToShow.src}`}
                        alt={t('workspace.cropping.alt')}
                        onLoad={onImageLoad}
                        style={{ maxHeight: 'calc(100vh - 12rem)', objectFit: 'contain' }}
                    />
                 </ReactCrop>
              ) : (
                <img
                  key={imageToShow.src}
                  src={`data:${imageToShow.mimeType};base64,${imageToShow.src}`}
                  alt={t('workspace.image.alt')}
                  className="max-w-full max-h-full object-contain animate-[fadeIn_0.5s_ease-in-out]"
                  style={liveAdjustmentsStyle}
                />
              )
            )
        )}
       {isCropping && (
          <div className="absolute bottom-6 right-6 flex gap-4 z-20">
              <button onClick={onCancelCrop} title={t('workspace.crop.cancel')} className="flex items-center justify-center p-3.5 bg-red-600/90 text-white rounded-full shadow-lg hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400">
                  <XIcon className="w-6 h-6" />
              </button>
              <button onClick={onConfirmCrop} title={t('workspace.crop.confirm')} className="flex items-center justify-center p-3.5 bg-green-600/90 text-white rounded-full shadow-lg hover:bg-green-500 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400">
                  <CheckIcon className="w-6 h-6" />
              </button>
          </div>
      )}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-900/70 flex flex-col items-center justify-center rounded-lg backdrop-blur-sm z-10">
          <LoadingSpinner className="w-12 h-12 text-blue-400" />
          <p className="mt-4 text-lg font-semibold text-gray-200">{loadingMessage}</p>
        </div>
      )}
      {children}
    </div>
  );
};

const HistoryTimeline: React.FC<{
  image: ImageState | null;
  activeIndex: number;
  onSelect: (index: number) => void;
  onDelete: (index: number) => void;
  disabled: boolean;
  t: (key: any, replacements?: any) => string;
}> = ({ image, activeIndex, onSelect, onDelete, disabled, t }) => {
  if (!image || image.history.length === 0) return null;

  const historyWithOriginal = [
    { src: image.originalSrc, mimeType: image.originalMimeType, prompt: 'Original' },
    ...image.history,
  ];

  return (
    <div className="w-full bg-slate-950 p-3 rounded-lg mt-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-3 px-1">{t('history.title')}</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
            {historyWithOriginal.map((item, index) => {
                const historyIndex = index - 1;
                const isSelected = activeIndex === historyIndex;
                return (
                    <div
                        key={index === 0 ? image.id : item.src}
                        onClick={() => !disabled && onSelect(historyIndex)}
                        className={`
                            relative flex-shrink-0 w-24 h-24 rounded-md overflow-hidden transition-all duration-200 group
                            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-100'}
                            ${isSelected ? 'ring-4 ring-blue-500 opacity-100' : 'ring-2 ring-slate-700 opacity-60 hover:ring-blue-400'}
                        `}
                    >
                        <img src={`data:${item.mimeType};base64,${item.src}`} alt={t('history.version', { version: index })} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                        <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-sm font-semibold">
                            {index === 0 ? t('history.original') : t('history.version', {version: index})}
                        </span>
                        {index > 0 && !disabled && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(historyIndex); }}
                                className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-opacity"
                                title={t('history.delete.title', { version: index })}
                            >
                                <TrashIcon className="w-3 h-3"/>
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    </div>
  );
};


const Filmstrip: React.FC<{
  images: ImageState[];
  selectedImageId: string | null;
  referenceImageIds: Set<string>;
  onSelect: (id: string) => void;
  onToggleReference: (id: string) => void;
  disabled: boolean;
  t: (key: any) => string;
}> = ({ images, selectedImageId, referenceImageIds, onSelect, onToggleReference, disabled, t }) => {
  if (images.length === 0) return null;

  return (
    <div className="w-full bg-slate-950 p-3 rounded-lg mt-4">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {images.map(img => {
          const isSelected = selectedImageId === img.id;
          const isReference = referenceImageIds.has(img.id);

          let ringClass = 'ring-slate-700 opacity-60 hover:ring-blue-400';
          if (isSelected) {
            ringClass = 'ring-blue-500 opacity-100';
          } else if (isReference) {
            ringClass = 'ring-purple-500 opacity-100';
          }

          return (
            <div
              key={img.id}
              onClick={() => !disabled && onSelect(img.id)}
              className={`
                relative flex-shrink-0 w-24 h-24 rounded-md overflow-hidden transition-all duration-200 group
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-100'}
                ring-2 ${ringClass}
              `}
            >
              <img
                src={`data:${img.originalMimeType};base64,${img.originalSrc}`}
                alt={img.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-colors"></div>
              {img.history.length > 0 && <div className="absolute top-1 left-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md">{img.history.length}</div>}
              
              {!isSelected && !disabled && (
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleReference(img.id); }}
                    title={isReference ? t('filmstrip.reference.remove.title') : t('filmstrip.reference.add.title')}
                    className={`absolute top-1 right-1 p-1.5 rounded-full transition-all duration-200
                      ${isReference 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-slate-800/60 text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-purple-600 hover:text-white'
                      }
                    `}
                >
                    <PinIcon className="w-4 h-4" filled={isReference} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-t border-slate-700/60 first:border-t-0">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between py-3 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                <span>{title}</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="pl-2 pr-1 pb-3 animate-[fadeIn_0.3s_ease-in-out]">{children}</div>}
        </div>
    );
};

const AUTOSAVE_KEY = 'ai-image-editor-autosave-metadata';

function App() {
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
  const [activeToolbar, setActiveToolbar] = useState<string | null>(null);
  const [liveAdjustments, setLiveAdjustments] = useState<Adjustments>(DEFAULT_ADJUSTMENTS);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);


  const fileInputRef = useRef<HTMLInputElement>(null);
  const draftInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimeoutRef = useRef<number | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  
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

  // Load state from localStorage and IndexedDB on initial render
  useEffect(() => {
    const loadState = async () => {
      try {
        const savedStateJSON = localStorage.getItem(AUTOSAVE_KEY);
        if (savedStateJSON) {
          const savedState = JSON.parse(savedStateJSON);
          if (savedState && savedState.images) {
            // Rehydrate image data from IndexedDB
            const rehydratedImages = await Promise.all(
              (savedState.images as any[]).map(async (img: any) => {
                const originalImage = await getImageData(img.originalSrcKey);
                if (!originalImage) return null; // Skip corrupted/missing entries

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
        // Clear potentially corrupted state
        localStorage.removeItem(AUTOSAVE_KEY);
      }
    };
    loadState();
  }, []);

  // Auto-save state to localStorage (metadata) and IndexedDB (image data)
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
        // Dehydrate images: store base64 data in IndexedDB and get keys
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
            setReferenceImageIds(new Set()); // Clear references when selecting a new main image
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
          setImages(prevImages => {
            const newImages = prevImages.map(img => {
              if (img.id === selectedImageId) {
                const newHistoryBase = activeHistoryIndex > -1 ? img.history.slice(0, activeHistoryIndex + 1) : [];
                const updatedHistory = [...newHistoryBase, { src: result.newImageBase64, mimeType: result.newMimeType, prompt }];
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
        const inputImage = selectedImage;
        const imagePartData = inputImage ? { base64Data: inputImage.originalSrc, mimeType: inputImage.originalMimeType } : null;
        const videoUrl = await generateVideoFromPrompt(prompt, imagePartData, handleProgressUpdate);
        setGeneratedVideoUrl(videoUrl);
        setSelectedImageId(null);
      }
    } catch (e: any) {
      // FIX: Cast e.message to TranslationKey to satisfy the `t` function's type requirement.
      // This is safe because API calls are designed to throw errors with valid translation keys.
      setError(t(e.message as TranslationKey) || t("error.unknown"));
    } finally {
      setIsLoading(false);
    }
  }, [prompt, selectedImage, selectedImageId, imageToShow, referenceImages, activeHistoryIndex, mode, generatedVideoUrl, handleSetMode, t, handleProgressUpdate]);
  
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

  const handleExportDraft = () => {
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
  
  const handleDraftFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error(t('error.readFile'));
        }
        const parsedData = JSON.parse(text);
        
        // Basic validation
        if (parsedData.appName !== 'AI Image Editor Draft' || !Array.isArray(parsedData.data?.images)) {
          throw new Error(t('error.invalidDraft'));
        }

        const importedImages: ImageState[] = parsedData.data.images;
        
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
        console.error("导入草稿失败:", err);
        setError(`${t('error.importFailed')}: ${err.message}`);
      }
    };
    reader.onerror = () => {
        setError(t("error.readFile"));
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };
  
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

  const handleBasicEdit = useCallback(async (
    operation: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, img: HTMLImageElement) => void,
    prompt: string,
  ) => {
      if (!imageToShow) return;
      setIsLoading(true);
      setError(null);
      try {
          const { base64Data, mimeType } = await applyCanvasOperation(
              `data:${imageToShow.mimeType};base64,${imageToShow.src}`,
              operation
          );
          updateImageHistory({ src: base64Data, mimeType }, prompt);
      } catch (e: any) {
          setError(t('error.imageEditFailed'));
      } finally {
          setIsLoading(false);
      }
  }, [imageToShow, updateImageHistory, t]);

  const handleRotate = (degrees: 90 | -90) => handleBasicEdit(
    (canvas, ctx, img) => {
        canvas.width = img.height;
        canvas.height = img.width;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((degrees * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
    },
    degrees > 0 ? t('edit.rotateRight') : t('edit.rotateLeft')
  );
  
  const handleFlip = (direction: 'horizontal' | 'vertical') => handleBasicEdit(
    (canvas, ctx, img) => {
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
    },
    direction === 'horizontal' ? t('edit.flipHorizontal') : t('edit.flipVertical')
  );

  const handleApplyFilter = (filter: 'grayscale' | 'sepia') => handleBasicEdit(
      (canvas, ctx, img) => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.filter = `${filter}(100%)`;
          ctx.drawImage(img, 0, 0);
      },
      t(filter === 'grayscale' ? 'edit.grayscaleFilter' : 'edit.sepiaFilter')
  );

  const handleApplyAdjustments = () => {
      const { brightness, contrast, saturation } = liveAdjustments;
      const filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      handleBasicEdit(
          (canvas, ctx, img) => {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.filter = filterString;
              ctx.drawImage(img, 0, 0);
          },
          t('edit.adjustments')
      );
      setLiveAdjustments(DEFAULT_ADJUSTMENTS);
      setActiveToolbar(null);
  };
  
  const handleCancelAdjustments = () => {
    setLiveAdjustments(DEFAULT_ADJUSTMENTS);
    setActiveToolbar(null);
  }

  const handleConfirmCrop = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !imageToShow) return;

    setIsLoading(true);
    setIsCropping(false);
    setError(null);
    
    try {
        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        
        canvas.width = Math.floor(completedCrop.width * scaleX);
        canvas.height = Math.floor(completedCrop.height * scaleY);
        
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');
        
        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0, 0,
            canvas.width, canvas.height
        );

        const mimeType = imageToShow.mimeType;
        const base64Data = canvas.toDataURL(mimeType).split(',')[1];
        
        updateImageHistory({ src: base64Data, mimeType }, t('edit.crop'));
    } catch (e: any) {
        setError(t('error.cropFailed'));
    } finally {
        setIsLoading(false);
    }
  }, [completedCrop, imageToShow, updateImageHistory, t]);
  
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

  const RecipeItem: React.FC<{ text: string, onClick: () => void }> = ({ text, onClick }) => (
    <button onClick={onClick} className="w-full text-left p-2 rounded-md bg-slate-700/50 hover:bg-slate-600/80 transition-colors text-sm text-slate-300">
        {text}
    </button>
  );

  const ModeButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors rounded-t-md ${
            active
                ? 'bg-slate-900/50 text-white'
                : 'bg-transparent text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
        }`}
    >
        {children}
    </button>
  );
  
  const ToolbarButton: React.FC<{ title: string; onClick: () => void; children: React.ReactNode; isActive?: boolean; }> = ({ title, onClick, children, isActive }) => (
      <button
          title={title}
          onClick={onClick}
          className={`p-2.5 rounded-md transition-colors ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-600'}`}
      >
          {children}
      </button>
  );

  const liveAdjustmentsStyle = useMemo(() => {
    if (activeToolbar !== 'adjustments') return {};
    const { brightness, contrast, saturation } = liveAdjustments;
    return {
        filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
    };
  }, [liveAdjustments, activeToolbar]);

  const currentPromptCategories = useMemo(() => {
    return language === 'en' ? promptCategoriesEn : promptCategoriesZh;
  }, [language]);

  const currentVideoPromptCategories = useMemo(() => {
      return language === 'en' ? videoPromptCategoriesEn : videoPromptCategoriesZh;
  }, [language]);


  return (
    <div className="h-screen w-screen flex flex-col lg:flex-row bg-slate-900 overflow-hidden">
      <main className="flex-grow flex flex-col p-4">
        <EditorWorkspace
          imageToShow={imageToShow}
          generatedVideoUrl={generatedVideoUrl}
          isLoading={isLoading}
          loadingMessage={loadingMessage}
          mode={mode}
          isCropping={isCropping}
          crop={crop}
          onCropChange={setCrop}
          onCropComplete={setCompletedCrop}
          onImageLoad={onImageLoadForCrop}
          onConfirmCrop={handleConfirmCrop}
          onCancelCrop={() => setIsCropping(false)}
          liveAdjustmentsStyle={liveAdjustmentsStyle}
          t={t}
        >
          {selectedImage && !isCropping && !isLoading && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
                  {activeToolbar === 'filters' && (
                       <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm p-2 rounded-lg shadow-lg animate-[fadeInUp_0.2s_ease-out]">
                           <button onClick={() => handleApplyFilter('grayscale')} className="px-3 py-1.5 text-sm rounded-md bg-slate-700 hover:bg-slate-600 transition-colors">{t('toolbar.filters.grayscale')}</button>
                           <button onClick={() => handleApplyFilter('sepia')} className="px-3 py-1.5 text-sm rounded-md bg-slate-700 hover:bg-slate-600 transition-colors">{t('toolbar.filters.sepia')}</button>
                       </div>
                  )}
                  {activeToolbar === 'adjustments' && (
                       <div className="flex flex-col gap-3 bg-slate-800/80 backdrop-blur-sm p-4 rounded-lg shadow-lg w-64 animate-[fadeInUp_0.2s_ease-out]">
                          <div className="grid grid-cols-[auto,1fr,auto] items-center gap-2 text-xs">
                              <label htmlFor="brightness">{t('toolbar.adjustments.brightness')}</label>
                              <input id="brightness" type="range" min="0" max="200" value={liveAdjustments.brightness} onChange={e => setLiveAdjustments(s => ({ ...s, brightness: +e.target.value }))} className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer range-sm" />
                              <span>{liveAdjustments.brightness}%</span>
                          </div>
                          <div className="grid grid-cols-[auto,1fr,auto] items-center gap-2 text-xs">
                              <label htmlFor="contrast">{t('toolbar.adjustments.contrast')}</label>
                              <input id="contrast" type="range" min="0" max="200" value={liveAdjustments.contrast} onChange={e => setLiveAdjustments(s => ({ ...s, contrast: +e.target.value }))} className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer range-sm" />
                              <span>{liveAdjustments.contrast}%</span>
                          </div>
                           <div className="grid grid-cols-[auto,1fr,auto] items-center gap-2 text-xs">
                              <label htmlFor="saturation">{t('toolbar.adjustments.saturation')}</label>
                              <input id="saturation" type="range" min="0" max="200" value={liveAdjustments.saturation} onChange={e => setLiveAdjustments(s => ({ ...s, saturation: +e.target.value }))} className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer range-sm" />
                              <span>{liveAdjustments.saturation}%</span>
                           </div>
                           <div className="flex gap-2 mt-2">
                                <button onClick={handleCancelAdjustments} className="flex-1 px-3 py-1.5 text-sm rounded-md bg-slate-600 hover:bg-slate-500 transition-colors">{t('toolbar.adjustments.cancel')}</button>
                                <button onClick={handleApplyAdjustments} className="flex-1 px-3 py-1.5 text-sm rounded-md bg-blue-600 hover:bg-blue-500 transition-colors">{t('toolbar.adjustments.apply')}</button>
                           </div>
                       </div>
                  )}

                  <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm p-2 rounded-lg shadow-lg">
                      <ToolbarButton title={t('toolbar.crop')} onClick={() => setIsCropping(true)}><CropIcon className="w-5 h-5"/></ToolbarButton>
                      <ToolbarButton title={t('toolbar.rotateLeft')} onClick={() => handleRotate(-90)}><RotateLeftIcon className="w-5 h-5"/></ToolbarButton>
                      <ToolbarButton title={t('toolbar.rotateRight')} onClick={() => handleRotate(90)}><RotateRightIcon className="w-5 h-5"/></ToolbarButton>
                      <div className="w-px h-6 bg-slate-600 mx-1"></div>
                      <ToolbarButton title={t('toolbar.flipVertical')} onClick={() => handleFlip('horizontal')}><FlipVerticalIcon className="w-5 h-5"/></ToolbarButton>
                      <ToolbarButton title={t('toolbar.flipHorizontal')} onClick={() => handleFlip('vertical')}><FlipHorizontalIcon className="w-5 h-5"/></ToolbarButton>
                      <div className="w-px h-6 bg-slate-600 mx-1"></div>
                      <ToolbarButton title={t('toolbar.filters')} onClick={() => setActiveToolbar(t => t === 'filters' ? null : 'filters')} isActive={activeToolbar==='filters'}><ColorSwatchIcon className="w-5 h-5"/></ToolbarButton>
                      <ToolbarButton title={t('toolbar.adjustments')} onClick={() => { setActiveToolbar(t => t === 'adjustments' ? null : 'adjustments'); setLiveAdjustments(DEFAULT_ADJUSTMENTS); }} isActive={activeToolbar==='adjustments'}><AdjustmentsIcon className="w-5 h-5"/></ToolbarButton>
                      <div className="w-px h-6 bg-slate-600 mx-1"></div>
                      <ToolbarButton title={t('toolbar.download')} onClick={handleExport}><DownloadIcon className="w-5 h-5"/></ToolbarButton>
                  </div>
              </div>
          )}
        </EditorWorkspace>
        
        {images.length > 0 && (
          <div className="flex justify-center">
              <button
                  onClick={() => setShowThumbnails(prev => !prev)}
                  className="my-2 px-4 py-1.5 bg-slate-800 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-slate-600"
                  title={showThumbnails ? t('thumbnails.toggle.hide') : t('thumbnails.toggle.show')}
                  aria-expanded={showThumbnails}
                  aria-controls="thumbnails-container"
              >
                  <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${!showThumbnails ? 'rotate-180' : ''}`} />
              </button>
          </div>
        )}
        
        {showThumbnails && (
            <div id="thumbnails-container" className="animate-[fadeIn_0.3s_ease-in-out]">
                 {mode !== 'video' && (
                    <HistoryTimeline 
                         image={selectedImage}
                         activeIndex={activeHistoryIndex}
                         onSelect={handleSelectHistoryItem}
                         onDelete={handleDeleteHistoryItem}
                         disabled={isLoading || isCropping}
                         t={t}
                    />
                 )}
                 <Filmstrip 
                    images={images} 
                    selectedImageId={selectedImageId}
                    referenceImageIds={referenceImageIds}
                    onSelect={handleImageSelect}
                    onToggleReference={handleToggleReference}
                    disabled={isLoading || isCropping} 
                    t={t}
                 />
            </div>
        )}
      </main>

      <aside className="w-full lg:w-96 bg-slate-800 p-4 flex-shrink-0 flex flex-col gap-4">
        <div className="border-b border-slate-700 pb-4 flex-shrink-0 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{t('app.title')}</h2>
            <div className="relative">
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="bg-slate-700 border border-slate-600 rounded-md py-1 pl-3 pr-8 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                    aria-label={t('lang.switcher.label')}
                >
                    <option value="zh">{t('lang.zh')}</option>
                    <option value="en">{t('lang.en')}</option>
                </select>
                <ChevronDownIcon className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 flex-shrink-0">
            <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-slate-600 transition-colors font-semibold text-sm">
                <UploadIcon className="w-5 h-5"/>
                {t('sidebar.button.importImage')}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageFileChange} multiple accept="image/*" className="hidden" />
            
            <button onClick={handleExport} disabled={(!selectedImage && !generatedVideoUrl) || isLoading} className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 disabled:bg-slate-700 disabled:text-slate-500 transition-colors font-semibold text-sm">
                <DownloadIcon className="w-5 h-5"/>
                {generatedVideoUrl ? t('sidebar.button.exportVideo') : t('sidebar.button.exportImage')}
            </button>

            <button onClick={() => draftInputRef.current?.click()} disabled={isLoading} className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 disabled:bg-slate-700 disabled:text-slate-500 transition-colors font-semibold text-sm">
              <FolderOpenIcon className="w-5 h-5" />
              {t('sidebar.button.importDraft')}
            </button>
            <input type="file" ref={draftInputRef} onChange={handleDraftFileChange} accept=".json" className="hidden" />

            <button onClick={handleExportDraft} disabled={images.length === 0 || isLoading} className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 disabled:bg-slate-700 disabled:text-slate-500 transition-colors font-semibold text-sm">
              <SaveIcon className="w-5 h-5" />
              {t('sidebar.button.exportDraft')}
            </button>
        </div>
        
        <div id="ai-operations" className="bg-slate-900/50 rounded-lg border border-slate-700 flex-shrink-0">
            <div className="flex bg-slate-800/60 rounded-t-md">
                <ModeButton active={mode === 'edit'} onClick={() => handleSetMode('edit')}>
                    <PhotoIcon className="w-5 h-5"/>{t('sidebar.mode.edit')}
                </ModeButton>
                <ModeButton active={mode === 'generate'} onClick={() => handleSetMode('generate')}>
                    <PencilIcon className="w-5 h-5"/>{t('sidebar.mode.generate')}
                </ModeButton>
                <ModeButton active={mode === 'video'} onClick={() => handleSetMode('video')}>
                    <VideoCameraIcon className="w-5 h-5"/>{t('sidebar.mode.video')}
                </ModeButton>
            </div>
             <div className="p-4">
                {mode === 'edit' && selectedImage && <p className="text-sm text-slate-400 mb-2 truncate">{t('sidebar.editing', { name: '' })}<span className="font-medium text-slate-300">{selectedImage.name}</span></p>}
                 {referenceImages.length > 0 && (
                    <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-semibold text-slate-400">{t('sidebar.referenceImagesTitle')}</h4>
                            {mode === 'video' && referenceImages.length > 0 && (
                                <p className="text-xs text-slate-500">{t('sidebar.referenceImagesHint')}</p>
                            )}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {referenceImages.map(img => (
                                <div key={img.id} className="relative group">
                                    <img 
                                        src={`data:${img.originalMimeType};base64,${img.originalSrc}`} 
                                        alt={`Reference: ${img.name}`}
                                        className="w-12 h-12 rounded-md object-cover border-2 border-purple-500"
                                    />
                                    <button 
                                        onClick={() => handleToggleReference(img.id)}
                                        className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-opacity"
                                        title={t('filmstrip.reference.remove.title')}
                                    >
                                       <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                 )}
                 <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder={
                        mode === 'edit'
                            ? (selectedImage ? (referenceImageIds.size > 0 ? t('sidebar.prompt.placeholder.editWithRef') : t('sidebar.prompt.placeholder.edit')) : t('sidebar.prompt.placeholder.editEmpty'))
                            : mode === 'generate'
                                ? t('sidebar.prompt.placeholder.generate')
                                : (selectedImageId || referenceImageIds.size > 0)
                                    ? t('sidebar.prompt.placeholder.videoWithRef')
                                    : t('sidebar.prompt.placeholder.video')
                    }
                    rows={4}
                    disabled={isLoading || (mode === 'edit' && !selectedImage)}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                 />
                 {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                 <div className="flex gap-3 mt-3">
                    <button
                        onClick={handlePromptSubmit}
                        disabled={!prompt || isLoading || (mode === 'edit' && !selectedImage) || isCropping}
                        className="flex-grow inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all"
                    >
                        {isLoading ? <LoadingSpinner className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                        {mode === 'edit' ? t('sidebar.button.applyEdit') : mode === 'generate' ? t('sidebar.button.generateImage') : t('sidebar.button.generateVideo')}
                    </button>
                    {mode === 'edit' && (
                        <button onClick={handleReset} title={t('sidebar.button.reset.title')} disabled={!selectedImage || selectedImage.history.length === 0 || isLoading || isCropping} className="p-2.5 bg-slate-600 hover:bg-slate-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <ResetIcon className="w-5 h-5"/>
                        </button>
                    )}
                 </div>
             </div>
        </div>
        
        <div className="flex-grow min-h-0">
            <div id="recipe-library" className="bg-slate-900/50 rounded-lg border border-slate-700 h-full overflow-y-auto">
                 <h3 className="text-md font-semibold text-slate-200 mb-1 px-4 pt-4">{t('sidebar.recipeLibrary')}</h3>
                 <div className="flex flex-col">
                     {(mode === 'video' ? currentVideoPromptCategories : currentPromptCategories).map((category, index) => (
                        <CollapsibleSection key={category.category} title={category.category} defaultOpen={index === 0}>
                            <div className="flex flex-col gap-2 px-2">
                                {category.prompts.map(p => (
                                    <RecipeItem key={p.name} text={p.name} onClick={() => setPrompt(p.prompt)} />
                                ))}
                            </div>
                        </CollapsibleSection>
                    ))}
                 </div>
            </div>
        </div>
        <div className="flex-shrink-0 mt-2 text-center">
            <p className="text-xs text-slate-500">
                {t('app.author')}
                <a 
                    href="https://github.com/chenyangcun" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="font-medium text-slate-400 hover:text-blue-400 transition-colors underline"
                >
                    chenyangcun
                </a>
            </p>
        </div>
      </aside>
    </div>
  );
}

export default App;