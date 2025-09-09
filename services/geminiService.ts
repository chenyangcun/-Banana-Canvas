import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import type { Part } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("Gemini API 密钥未设置。请设置 API_KEY 环境变量。");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateImageFromPrompt = async (
  prompt: string
): Promise<{ newImageBase64: string; newMimeType: string } | null> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return {
        newImageBase64: base64ImageBytes,
        newMimeType: 'image/png',
      };
    }

    console.warn("Gemini API 未返回任何生成的图片。");
    return null;

  } catch (error) {
    console.error("使用 Gemini API 生成图片时出错:", error);
    throw new Error("error.generateFailed");
  }
};

export interface ImagePartData {
  base64Data: string;
  mimeType: string;
}

export const editImageWithPrompt = async (
  imagePartsData: ImagePartData[],
  prompt: string
): Promise<{ newImageBase64: string; newMimeType: string } | null> => {
  if (imagePartsData.length === 0) {
    throw new Error("error.atLeastOneImageRequired");
  }

  try {
    const parts: Part[] = imagePartsData.map(imgData => ({
      inlineData: {
        data: imgData.base64Data,
        mimeType: imgData.mimeType,
      },
    }));
    
    // Add the text prompt as the last part
    parts.push({
      text: prompt,
    });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: parts,
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return {
          newImageBase64: part.inlineData.data,
          newMimeType: part.inlineData.mimeType,
        };
      }
    }
    
    console.warn("在 Gemini API 响应中未找到图片部分。");
    return null;

  } catch (error) {
    console.error("使用 Gemini API 编辑图片时出错:", error);
    throw new Error("error.editFailed");
  }
};


export const generateVideoFromPrompt = async (
  prompt: string,
  image: ImagePartData | null,
  onProgressUpdate: (messageKey: string) => void
): Promise<string> => {
  try {
    onProgressUpdate('video.progress.init');
    let operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: prompt,
      ...(image && {
        image: {
          imageBytes: image.base64Data,
          mimeType: image.mimeType,
        }
      }),
      config: {
        numberOfVideos: 1,
      },
    });

    const progressMessages = [
      'video.progress.analyzing',
      'video.progress.generating',
      'video.progress.processing',
      'video.progress.rendering',
      'video.progress.finishing',
    ];
    let messageIndex = 0;
    
    while (!operation.done) {
      onProgressUpdate(progressMessages[messageIndex % progressMessages.length]);
      messageIndex++;
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    onProgressUpdate('video.progress.fetching');
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
      throw new Error('error.video.noLink');
    }

    const response = await fetch(`${downloadLink}&key=${API_KEY}`);
    if (!response.ok) {
        throw new Error(`error.video.downloadFailed`);
    }
    
    const videoBlob = await response.blob();
    return URL.createObjectURL(videoBlob);

  } catch (error: any) {
    console.error("使用 Gemini API 生成视频时出错:", error);
    // If it's already a key, re-throw it. Otherwise, wrap it.
    const knownErrors = ['error.video.noLink', 'error.video.downloadFailed'];
    if (knownErrors.includes(error.message)) {
        throw error;
    }
    throw new Error("error.video.generationFailed");
  }
};
