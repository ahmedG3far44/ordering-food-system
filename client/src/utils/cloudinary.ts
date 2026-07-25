import api from '../api/axios';

const MAX_SIZE = 4 * 1024 * 1024;

export interface UploadResult {
  url: string;
  publicId: string;
}

export interface UploadError {
  message: string;
  code?: string;
}

export function validateFile(file: File): UploadError | null {
  if (!file.type.startsWith('image/')) {
    return { message: 'Only JPG, PNG, WEBP, and GIF images are allowed', code: 'INVALID_TYPE' };
  }
  if (file.size > MAX_SIZE) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1);
    return { message: `File size (${sizeMB}MB) exceeds the 4MB limit. Please choose a smaller image.`, code: 'FILE_TOO_LARGE' };
  }
  return null;
}

export async function uploadToCloudinary(
  file: File,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post<UploadResult>('/upload', formData, {
    signal,
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });

  return response.data;
}
