import React from 'react';
import { ChevronDownIcon, DownloadIcon, FolderOpenIcon, PencilIcon, PhotoIcon, ResetIcon, SaveIcon, SparklesIcon, UploadIcon, VideoCameraIcon, XCircleIcon, LoadingSpinner, GridIcon } from './Icons';
// FIX: Import ImageState from types.ts instead of App.tsx
import type { ImageState, Mode } from '../types.ts';
import type { Language, TranslationKey } from '../i18n.ts';
import { promptCategoriesEn, videoPromptCategoriesEn } from '../recipes.en.ts';
import { promptCategoriesZh, videoPromptCategoriesZh } from '../recipes.zh.ts';

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
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

const RecipeItem: React.FC<{ text: string, onClick: () => void }> = ({ text, onClick }) => (
    <button onClick={onClick} className="w-full text-left p-2 rounded-md bg-slate-700/50 hover:bg-slate-600/80 transition-colors text-sm text-slate-300">
        {text}
    </button>
);

const RecipeCategory: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    return (
        <div className="py-1">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between text-left group">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-300 transition-colors">{title}</h4>
                <ChevronDownIcon className={`w-4 h-4 text-slate-500 group-hover:text-slate-400 transition-all duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="space-y-1.5 pt-2 animate-[fadeIn_0.3s_ease-in-out]">
                    {children}
                </div>
            )}
        </div>
    );
};

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

interface SidebarProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: any, replacements?: any) => string;
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleImageFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleExport: () => void;
    generatedVideoUrl: string | null;
    selectedImage: ImageState | null;
    isLoading: boolean;
    draftInputRef: React.RefObject<HTMLInputElement>;
    handleDraftFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleExportDraft: () => void;
    images: ImageState[];
    handleClearDraft: () => void;
    mode: Mode;
    handleSetMode: (mode: Mode) => void;
    referenceImages: ImageState[];
    handleToggleReference: (id: string) => void;
    prompt: string;
    setPrompt: (prompt: string) => void;
    selectedImageId: string | null;
    referenceImageIds: Set<string>;
    handlePromptSubmit: () => void;
    handleCombineImages: () => void;
    handleReset: () => void;
    error: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
    language, setLanguage, t, fileInputRef, handleImageFileChange, handleExport, generatedVideoUrl, selectedImage,
    isLoading, draftInputRef, handleDraftFileChange, handleExportDraft, images, handleClearDraft, mode,
    handleSetMode, referenceImages, handleToggleReference, prompt, setPrompt, selectedImageId, referenceImageIds,
    handlePromptSubmit, handleCombineImages, handleReset, error
}) => {
    const currentPromptCategories = React.useMemo(() => {
        return language === 'en' ? promptCategoriesEn : promptCategoriesZh;
    }, [language]);

    const currentVideoPromptCategories = React.useMemo(() => {
        return language === 'en' ? videoPromptCategoriesEn : videoPromptCategoriesZh;
    }, [language]);
    
    const uniqueSelectedIds = React.useMemo(() => {
        const ids = new Set(referenceImageIds);
        if (selectedImageId) {
          ids.add(selectedImageId);
        }
        return ids;
    }, [selectedImageId, referenceImageIds]);
    
    const canCombine = uniqueSelectedIds.size === 4;

    return (
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

                <button 
                    onClick={handleClearDraft} 
                    disabled={images.length === 0 || isLoading} 
                    title={t('sidebar.button.clearDraft.title' as TranslationKey)}
                    className="col-span-2 flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-700 text-red-400 rounded-md hover:bg-red-900/50 hover:text-red-300 disabled:bg-slate-700/50 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
                >
                <XCircleIcon className="w-5 h-5" />
                {t('sidebar.button.clearDraft')}
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
                        className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm text-gray-200 placeholder-gray-500"
                    ></textarea>
                    <div className="flex items-center justify-between mt-3">
                        <button
                            onClick={handlePromptSubmit}
                            disabled={isLoading || !prompt || (mode === 'edit' && !selectedImage)}
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-slate-600 transition-colors font-semibold"
                        >
                            {isLoading ? (
                            <LoadingSpinner className="w-5 h-5"/>
                            ) : (
                            <SparklesIcon className="w-5 h-5"/>
                            )}
                            <span>
                                {mode === 'edit' ? t('sidebar.button.applyEdit') : mode === 'generate' ? t('sidebar.button.generateImage') : t('sidebar.button.generateVideo')}
                            </span>
                        </button>
                        {mode === 'edit' && selectedImage && selectedImage.history.length > 0 && (
                            <button onClick={handleReset} title={t('sidebar.button.reset.title')} disabled={isLoading} className="ml-3 p-2.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors">
                                <ResetIcon className="w-5 h-5"/>
                            </button>
                        )}
                    </div>
                     {canCombine && (
                        <button
                            onClick={handleCombineImages}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-slate-600 transition-colors font-semibold mt-3"
                        >
                            <GridIcon className="w-5 h-5" />
                            <span>{t('sidebar.button.combineGrid')}</span>
                        </button>
                    )}
                    {error && <p className="mt-3 text-sm text-red-400 bg-red-900/50 p-2 rounded-md animate-[fadeIn_0.3s_ease-in-out]">{error}</p>}
                </div>
            </div>
            
            <div className="flex-grow overflow-y-auto pr-1">
                <CollapsibleSection title={t('sidebar.recipeLibrary')} defaultOpen={true}>
                    <div className="space-y-1">
                        {(mode === 'video' ? currentVideoPromptCategories : currentPromptCategories).map((category, index) => (
                            <RecipeCategory key={category.category} title={category.category} defaultOpen={index === 0}>
                                {category.prompts.map(p => (
                                    <RecipeItem key={p.name} text={p.name} onClick={() => setPrompt(p.prompt)} />
                                ))}
                            </RecipeCategory>
                        ))}
                    </div>
                </CollapsibleSection>
            </div>
        </aside>
    );
};