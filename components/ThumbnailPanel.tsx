import React from 'react';
import { ChevronDownIcon, PinIcon, TrashIcon } from './Icons';
import type { ImageState, Mode } from '../types.ts';

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
  onDelete: (id: string) => void;
  disabled: boolean;
  t: (key: any) => string;
}> = ({ images, selectedImageId, referenceImageIds, onSelect, onToggleReference, onDelete, disabled, t }) => {
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
               {!disabled && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(img.id); }}
                    title={t('filmstrip.delete.title')}
                    className="absolute bottom-1 right-1 bg-red-600/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-opacity"
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


interface ThumbnailPanelProps {
    images: ImageState[];
    showThumbnails: boolean;
    setShowThumbnails: (show: boolean | ((s:boolean) => boolean)) => void;
    mode: Mode;
    selectedImage: ImageState | null;
    activeHistoryIndex: number;
    handleSelectHistoryItem: (index: number) => void;
    handleDeleteHistoryItem: (index: number) => void;
    isLoading: boolean;
    isCropping: boolean;
    t: (key: any, replacements?: any) => string;
    selectedImageId: string | null;
    referenceImageIds: Set<string>;
    handleImageSelect: (id: string) => void;
    handleToggleReference: (id: string) => void;
    handleDeleteImage: (id: string) => void;
}

export const ThumbnailPanel: React.FC<ThumbnailPanelProps> = ({
    images, showThumbnails, setShowThumbnails, mode, selectedImage, activeHistoryIndex,
    handleSelectHistoryItem, handleDeleteHistoryItem, isLoading, isCropping, t,
    selectedImageId, referenceImageIds, handleImageSelect, handleToggleReference, handleDeleteImage
}) => {
    if (images.length === 0) return null;

    return (
        <>
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
                        onDelete={handleDeleteImage}
                        disabled={isLoading || isCropping} 
                        t={t}
                    />
                </div>
            )}
        </>
    );
};