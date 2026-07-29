import { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2, ImageIcon, AlertCircle, Check } from 'lucide-react';
import { validateFile, uploadToCloudinary, type UploadError } from '../../utils/cloudinary';

interface ImageUploaderProps {
  currentUrl?: string;
  onUploadComplete: (url: string) => void;
  onClear: () => void;
}

type UploadState = 'idle' | 'preview' | 'uploading' | 'done' | 'error';

const ImageUploader = ({ currentUrl, onUploadComplete, onClear }: ImageUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(currentUrl || '');
  const [state, setState] = useState<UploadState>(currentUrl ? 'done' : 'idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<UploadError | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (currentUrl) {
      setPreview(currentUrl);
      setState('done');
    }
  }, [currentUrl]);

  useEffect(() => {
    return () => {
      if (preview && state === 'preview') {
        URL.revokeObjectURL(preview);
      }
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const validation = validateFile(f);
    if (validation) {
      setError(validation);
      setState('error');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setError(null);
    setFile(f);

    if (preview && state === 'preview') {
      URL.revokeObjectURL(preview);
    }
    const objectUrl = URL.createObjectURL(f);
    setPreview(objectUrl);
    setState('preview');
    setProgress(0);
  };

  function mapErrorMessage(err: any): UploadError {
    if (err.response?.data?.message) {
      const msg = err.response.data.message;
      if (msg.toLowerCase().includes('file too large') || msg.toLowerCase().includes('exceeds')) {
        return { message: 'Image size exceeds the 4MB limit. Please upload a smaller image.', code: 'FILE_TOO_LARGE' };
      }
      return { message: msg, code: err.response.data.code };
    }

    if (err.message === 'Network Error') {
      return { message: 'Could not reach the server. Check your internet connection and try again.', code: 'NETWORK_ERROR' };
    }

    if (err.message) {
      return { message: err.message };
    }

    return { message: 'Upload failed. Please try again.', code: 'UNKNOWN' };
  }

  const handleUpload = async () => {
    if (!file) return;

    setState('uploading');
    setProgress(0);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await uploadToCloudinary(file, (pct) => setProgress(pct), controller.signal);
      onUploadComplete(result.url);
      setState('done');
      setPreview(result.url);
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        setState('preview');
        setProgress(0);
        return;
      }
      setState('error');
      setError(mapErrorMessage(err));
    }
  };

  const handleCancel = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    clearSelection();
  };

  const clearSelection = () => {
    if (preview && state === 'preview') {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview('');
    setState('idle');
    setProgress(0);
    setError(null);
    onClear();
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-primary uppercase mb-1">Image</label>

      {state === 'idle' && (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-primary p-6 text-center cursor-pointer hover:bg-primary/5 transition-colors"
        >
          <ImageIcon size={32} className="mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-bold text-primary uppercase">Click to upload</p>
          <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP up to 4MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {state === 'preview' && preview && (
        <div className="border-2 border-primary p-2">
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-40 object-cover border-2 border-slate-200"
            />
            <button
              type="button"
              onClick={handleCancel}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={handleUpload}
              className="flex-1 nb-button bg-primary text-white text-xs py-2 flex items-center justify-center gap-1"
            >
              <Upload size={14} />
              Upload Image
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-2 border-2 border-slate-200 text-slate-500 hover:border-primary text-xs"
            >
              Cancel
            </button>
          </div>
          {file && (
            <p className="text-[10px] text-slate-400 mt-1">
              {(file.size / 1024 / 1024).toFixed(1)}MB — {file.name}
            </p>
          )}
        </div>
      )}

      {state === 'uploading' && (
        <div className="border-2 border-primary p-4 text-center">
          <Loader2 size={28} className="mx-auto text-primary animate-spin mb-2" />
          <p className="text-sm font-bold text-primary uppercase">Uploading...</p>
          <div className="w-full bg-slate-200 h-2 mt-3 border-2 border-primary">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1">{progress}%</p>
          <button
            type="button"
            onClick={handleCancel}
            className="mt-3 text-xs font-bold text-red-500 hover:underline"
          >
            Cancel Upload
          </button>
        </div>
      )}

      {state === 'done' && preview && (
        <div className="border-2 border-primary p-2">
          <div className="relative">
            <img
              src={preview}
              alt="Uploaded"
              className="w-full h-40 object-cover border-2 border-slate-200"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1">
              <Check size={14} />
            </div>
            <button
              type="button"
              onClick={clearSelection}
              className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          <p className="text-[10px] text-green-600 font-bold mt-1 flex items-center gap-1">
            <Check size={10} /> Image uploaded successfully
          </p>
        </div>
      )}

      {state === 'error' && error && (
        <div className="border-2 border-red-500 p-4 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-bold text-red-700 uppercase">Upload Failed</p>
              <p className="text-xs text-red-600 mt-1">{error.message}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            {!file && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="nb-button bg-primary text-white text-xs py-1.5 px-3"
              >
                Try Again
              </button>
            )}
            {file && (
              <button
                type="button"
                onClick={() => {
                  setState('preview');
                  setError(null);
                }}
                className="nb-button bg-primary text-white text-xs py-1.5 px-3"
              >
                Try Again
              </button>
            )}
            <button
              type="button"
              onClick={clearSelection}
              className="px-3 py-1.5 border-2 border-slate-200 text-slate-500 hover:border-primary text-xs"
            >
              Dismiss
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
