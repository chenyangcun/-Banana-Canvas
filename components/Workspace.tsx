import React, { useState, useMemo } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import { LoadingSpinner, XIcon, CheckIcon, CropIcon, RotateLeftIcon, RotateRightIcon, FlipVerticalIcon, FlipHorizontalIcon, ColorSwatchIcon, AdjustmentsIcon, DownloadIcon, InvertColorsIcon, BlurIcon } from './Icons';
import type { ImageState, Mode, Adjustments } from '../types.ts';
import type { TranslationKey } from '../i18n.ts';
import { DEFAULT_ADJUSTMENTS } from '../constants.ts';


const ToolbarButton: React.FC<{
  title: string;
  isActive?: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ title, isActive = false, onClick, disabled = false, children, className = '' }) => (
  <button
    title={title}
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded-md transition-colors duration-200
      ${isActive
        ? 'bg-blue-600 text-white'
        : 'bg-slate-700/80 text-slate-300 hover:bg-slate-600/90 hover:text-white'
      }
      disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed
      ${className}
    `}
  >
    {children}
  </button>
);


const TunePanel: React.FC<{
  t: (key: TranslationKey, replacements?: any) => string;
  onClose: () => void;
  setIsCropping: (cropping: boolean) => void;
  handleRotate: (degrees: 90 | -90) => void;
  handleFlip: (direction: 'horizontal' | 'vertical') => void;
  handleApplyFilter: (filter: 'grayscale' | 'sepia') => void;
  handleInvertColors: () => void;
  handleBlurImage: () => void;
  handleApplyAdjustments: (adjustments: Adjustments) => void;
}> = ({ t, onClose, setIsCropping, handleRotate, handleFlip, handleApplyFilter, handleInvertColors, handleBlurImage, handleApplyAdjustments }) => {
    
    const [activeSubMenu, setActiveSubMenu] = useState<'filters' | 'adjustments' | null>(null);
    const [liveAdjustments, setLiveAdjustments] = useState<Adjustments>(DEFAULT_ADJUSTMENTS);

    const onApplyAdjustments = () => {
        handleApplyAdjustments(liveAdjustments);
        setLiveAdjustments(DEFAULT_ADJUSTMENTS);
        onClose();
    };

    const AdjustmentSlider: React.FC<{ label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, value, onChange }) => (
        <div className="px-3">
            <label className="text-xs text-slate-400">{label}</label>
            <input type="range" min="0" max="200" value={value} onChange={onChange} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
        </div>
    );
    
    return (
        <div className="absolute top-0 left-0 bottom-0 w-72 bg-slate-900/90 backdrop-blur-md border-r border-slate-700/50 p-4 z-20 flex flex-col animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-lg font-semibold text-white">{t('tunePanel.title')}</h3>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full">
                    <XIcon className="w-5 h-5"/>
                </button>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase mb-3 tracking-wider px-1">{t('tunePanel.transform')}</h4>
                    <div className="grid grid-cols-3 gap-2">
                        <ToolbarButton title={t('toolbar.crop')} onClick={() => { setIsCropping(true); onClose(); }} className="flex flex-col items-center h-16 justify-center"><CropIcon className="w-6 h-6 mb-1"/><span className="text-xs">{t('toolbar.crop')}</span></ToolbarButton>
                        <ToolbarButton title={t('toolbar.rotateLeft')} onClick={() => handleRotate(-90)} className="flex flex-col items-center h-16 justify-center"><RotateLeftIcon className="w-6 h-6 mb-1"/><span className="text-xs">{t('toolbar.rotateLeft')}</span></ToolbarButton>
                        <ToolbarButton title={t('toolbar.rotateRight')} onClick={() => handleRotate(90)} className="flex flex-col items-center h-16 justify-center"><RotateRightIcon className="w-6 h-6 mb-1"/><span className="text-xs">{t('toolbar.rotateRight')}</span></ToolbarButton>
                        <ToolbarButton title={t('toolbar.flipHorizontal')} onClick={() => handleFlip('horizontal')} className="flex flex-col items-center h-16 justify-center"><FlipVerticalIcon className="w-6 h-6 mb-1"/><span className="text-xs">{t('toolbar.flipHorizontal')}</span></ToolbarButton>
                        <ToolbarButton title={t('toolbar.flipVertical')} onClick={() => handleFlip('vertical')} className="flex flex-col items-center h-16 justify-center"><FlipHorizontalIcon className="w-6 h-6 mb-1"/><span className="text-xs">{t('toolbar.flipVertical')}</span></ToolbarButton>
                    </div>
                </div>
                 <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase mb-3 tracking-wider px-1">{t('tunePanel.filters')}</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => {handleApplyFilter('grayscale'); onClose();}} className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">{t('toolbar.filters.grayscale')}</button>
                        <button onClick={() => {handleApplyFilter('sepia'); onClose();}} className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">{t('toolbar.filters.sepia')}</button>
                        <button onClick={() => {handleInvertColors(); onClose();}} className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">{t('tunePanel.invert')}</button>
                        <button onClick={() => {handleBlurImage(); onClose();}} className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">{t('tunePanel.blur')}</button>
                    </div>
                 </div>

                 <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase mb-3 tracking-wider px-1">{t('tunePanel.adjustments')}</h4>
                    <div className="space-y-3">
                        <AdjustmentSlider label={t('toolbar.adjustments.brightness')} value={liveAdjustments.brightness} onChange={e => setLiveAdjustments(s => ({...s, brightness: +e.target.value}))}/>
                        <AdjustmentSlider label={t('toolbar.adjustments.contrast')} value={liveAdjustments.contrast} onChange={e => setLiveAdjustments(s => ({...s, contrast: +e.target.value}))}/>
                        <AdjustmentSlider label={t('toolbar.adjustments.saturation')} value={liveAdjustments.saturation} onChange={e => setLiveAdjustments(s => ({...s, saturation: +e.target.value}))}/>
                    </div>
                 </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50 flex-shrink-0">
                <button onClick={onClose} className="px-4 py-2 text-sm bg-slate-600 hover:bg-slate-500 rounded-md transition-colors">{t('toolbar.adjustments.cancel')}</button>
                <button onClick={onApplyAdjustments} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-md transition-colors">{t('toolbar.adjustments.apply')}</button>
            </div>
        </div>
    );
};


const EditorWorkspaceDisplay: React.FC<{
  imageToShow: { src: string; mimeType: string } | null;
  generatedVideoUrl: string | null;
  isLoading: boolean;
  loadingMessage: string;
  mode: Mode;
  isCropping: boolean;
  crop: Crop | undefined;
  onCropChange: (crop: PixelCrop, percentCrop: Crop) => void;
  onCropComplete: (crop: PixelCrop) => void;
  onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  onConfirmCrop: () => void;
  onCancelCrop: () => void;
  children: React.ReactNode;
  t: (key: TranslationKey, replacements?: any) => string;
}> = ({ imageToShow, generatedVideoUrl, isLoading, loadingMessage, mode, isCropping, crop, onCropChange, onCropComplete, onImageLoad, onConfirmCrop, onCancelCrop, children, t }) => {
  const showContent = imageToShow || generatedVideoUrl;
  return (
    <div className="flex-grow bg-slate-950 rounded-lg p-4 flex items-center justify-center relative overflow-hidden">
      {!showContent && !isLoading && (
        <div className="flex flex-col items-center justify-center text-center">
            {mode === 'edit' && <p className="mt-6 text-slate-400">{t('workspace.empty.edit' as TranslationKey)}</p>}
            {mode === 'generate' && <p className="mt-6 text-slate-400">{t('workspace.empty.generate' as TranslationKey)}</p>}
            {mode === 'video' && <p className="mt-6 text-slate-400">{t('workspace.empty.video' as TranslationKey)}</p>}
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
                    onComplete={(c) => onCropComplete(c)}
                    className="max-w-full max-h-full flex items-center justify-center"
                 >
                    <img
                        src={`data:${imageToShow.mimeType};base64,${imageToShow.src}`}
                        alt={t('workspace.cropping.alt' as TranslationKey)}
                        onLoad={onImageLoad}
                        style={{ maxHeight: 'calc(100vh - 12rem)', objectFit: 'contain' }}
                    />
                 </ReactCrop>
              ) : (
                <img
                  key={imageToShow.src}
                  src={`data:${imageToShow.mimeType};base64,${imageToShow.src}`}
                  alt={t('workspace.image.alt' as TranslationKey)}
                  className="max-w-full max-h-full object-contain animate-[fadeIn_0.5s_ease-in-out]"
                />
              )
            )
        )}
       {isCropping && (
          <div className="absolute bottom-6 right-6 flex gap-4 z-20">
              <button onClick={onCancelCrop} title={t('workspace.crop.cancel' as TranslationKey)} className="flex items-center justify-center p-3 bg-red-600/80 text-white rounded-full hover:bg-red-500 transition-colors backdrop-blur-sm">
                  <XIcon className="w-5 h-5"/>
              </button>
              <button onClick={onConfirmCrop} title={t('workspace.crop.confirm' as TranslationKey)} className="flex items-center justify-center p-3 bg-green-600/80 text-white rounded-full hover:bg-green-500 transition-colors backdrop-blur-sm">
                  <CheckIcon className="w-5 h-5"/>
              </button>
          </div>
       )}
       {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-30">
            <LoadingSpinner className="w-12 h-12 text-blue-400" />
            <p className="mt-4 text-lg font-semibold text-white">{loadingMessage}</p>
        </div>
       )}
      {children}
    </div>
  );
};

interface WorkspaceProps {
    imageToShow: { src: string; mimeType: string } | null;
    generatedVideoUrl: string | null;
    isLoading: boolean;
    loadingMessage: string;
    mode: Mode;
    isCropping: boolean;
    setIsCropping: React.Dispatch<React.SetStateAction<boolean>>;
    crop: Crop | undefined;
    onCropChange: (crop: PixelCrop, percentCrop: Crop) => void;
    onCropComplete: (crop: PixelCrop) => void;
    onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
    onConfirmCrop: () => void;
    t: (key: TranslationKey, replacements?: any) => string;
    selectedImage: ImageState | null;
    handleApplyFilter: (filter: 'grayscale' | 'sepia') => void;
    handleApplyAdjustments: (adjustments: Adjustments) => void;
    handleRotate: (degrees: 90 | -90) => void;
    handleFlip: (direction: 'horizontal' | 'vertical') => void;
    handleExport: () => void;
    handleInvertColors: () => void;
    handleBlurImage: () => void;
}


export const Workspace: React.FC<WorkspaceProps> = ({
    imageToShow, generatedVideoUrl, isLoading, loadingMessage, mode, isCropping, setIsCropping, crop, onCropChange,
    onCropComplete, onImageLoad, onConfirmCrop, t, selectedImage,
    handleApplyFilter, handleApplyAdjustments, handleRotate, handleFlip, handleExport,
    handleInvertColors, handleBlurImage
}) => {
    const canEdit = !!selectedImage && !isCropping && !isLoading && mode === 'edit';
    const [isTunePanelOpen, setIsTunePanelOpen] = useState(false);
    
    return (
        <EditorWorkspaceDisplay
            imageToShow={imageToShow}
            generatedVideoUrl={generatedVideoUrl}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
            mode={mode}
            isCropping={isCropping}
            crop={crop}
            onCropChange={onCropChange}
            onCropComplete={onCropComplete}
            onImageLoad={onImageLoad}
            onConfirmCrop={onConfirmCrop}
            onCancelCrop={() => setIsCropping(false)}
            t={t}
        >
            {canEdit && (
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                    {!isTunePanelOpen && (
                        <button
                            title={t('toolbar.tune')}
                            onClick={() => setIsTunePanelOpen(true)}
                            className="p-2.5 rounded-full bg-slate-700/80 text-slate-300 hover:bg-slate-600/90 hover:text-white transition-colors duration-200"
                        >
                            <AdjustmentsIcon className="w-6 h-6"/>
                        </button>
                    )}
                    <button
                        title={t('toolbar.download')}
                        onClick={handleExport}
                        className="p-2.5 rounded-full bg-slate-700/80 text-slate-300 hover:bg-slate-600/90 hover:text-white transition-colors duration-200"
                    >
                       <DownloadIcon className="w-6 h-6"/>
                    </button>
                </div>
            )}

            {canEdit && isTunePanelOpen && (
                <TunePanel 
                    t={t}
                    onClose={() => setIsTunePanelOpen(false)}
                    setIsCropping={setIsCropping}
                    handleRotate={handleRotate}
                    handleFlip={handleFlip}
                    handleApplyFilter={handleApplyFilter}
                    handleInvertColors={handleInvertColors}
                    handleBlurImage={handleBlurImage}
                    handleApplyAdjustments={handleApplyAdjustments}
                />
            )}
        </EditorWorkspaceDisplay>
    );
};