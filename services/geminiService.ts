import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import type { Part } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("Gemini API 密钥未设置。请设置 API_KEY 环境变量。");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const handleGeminiError = (error: any, defaultKey: string): Error => {
  console.error("Gemini API Error:", error);

  let rawMessage = '';

  if (error && typeof error.message === 'string') {
    // The SDK sometimes stringifies the actual error object in the message
    try {
      const parsed = JSON.parse(error.message);
      if (parsed.error) {
        rawMessage = parsed.error.message || 'No details provided.';
        const status = parsed.error.status;
        const code = parsed.error.code;

        if (status === 'RESOURCE_EXHAUSTED' || code === 429) {
          return new Error('error.api.resourceExhausted');
        }
        if (code >= 500) {
            return new Error('error.api.serverError');
        }
      }
    } catch (e) {
      // The message is not a JSON string, treat it as the raw message.
      rawMessage = error.message;
    }
  }

  // Check the raw message for keywords if parsing failed or didn't yield a specific error
  if (rawMessage) {
    const lowerCaseMessage = rawMessage.toLowerCase();
    if (lowerCaseMessage.includes('quota')) {
        return new Error('error.api.resourceExhausted');
    }
    if (lowerCaseMessage.includes('api key not valid')) {
        return new Error('error.api.invalidKey');
    }
    if (lowerCaseMessage.includes('rpc failed') || lowerCaseMessage.includes('server error')) {
        return new Error('error.api.serverError');
    }
    // For other cases, return the specific message from the API.
    // App.tsx will display this raw message.
    return new Error(rawMessage);
  }

  // Fallback to the default error key for the specific operation
  return new Error(defaultKey);
};


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
    throw handleGeminiError(error, "error.generateFailed");
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
    throw handleGeminiError(error, "error.editFailed");
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
    const knownErrors = ['error.video.noLink', 'error.video.downloadFailed'];
    if (knownErrors.includes(error.message)) {
        throw error;
    }
    throw handleGeminiError(error, "error.video.generationFailed");
  }
};