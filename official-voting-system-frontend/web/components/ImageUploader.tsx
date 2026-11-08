import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import sjbuApi from '../src/api/sjbuApi';
import axios from 'axios';

// Compress and upload utilities left intact (kept as in your file)
const compressImage = (file: File, maxWidth = 500, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = height * (maxWidth / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not get canvas context.'));
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

const uploadToCloudinary = async (file: File): Promise<string> => {
  const compressedBase64 = await compressImage(file);
  const signatureResponse = await sjbuApi.getCloudinarySignature();
  const { signature, timestamp, cloud_name, api_key, folder } = signatureResponse.data;
  const cloudName = cloud_name;
  const apiKey = api_key;
  if (!signature || !cloudName || !apiKey) {
    throw new Error('Missing Cloudinary signature, API key, or cloud name from backend response.');
  }
  const formData = new FormData();
  formData.append('file', compressedBase64);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  if (folder) formData.append('folder', folder);
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const uploadResponse = await axios.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  if (uploadResponse.data && uploadResponse.data.secure_url) return uploadResponse.data.secure_url;
  throw new Error('Cloudinary upload failed: Missing secure URL in response.');
};

interface ImageUploaderProps {
  imageUrl: string | null;
  onUploadSuccess: (cloudinaryUrl: string) => void;
  disabled?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ imageUrl, onUploadSuccess, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (file && file.type.startsWith('image/')) {
        setError(null);
        setIsLoading(true);
        try {
          const publicUrl = await uploadToCloudinary(file);
          onUploadSuccess(publicUrl);
        } catch (e: any) {
          console.error('Upload failed:', e);
          setError(`Upload failed: ${e?.message || 'An unknown error occurred.'}`);
          onUploadSuccess('');
        } finally {
          setIsLoading(false);
        }
      } else {
        setError('Invalid file type selected.');
      }
    },
    [onUploadSuccess]
  );

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled && !isLoading && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled && !isLoading && e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  // Local placeholder svg (keeps layout stable if image missing)
  const placeholder = (
    <svg className="mx-auto h-20 w-20 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden>
      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Candidate Photo</label>
      <div
        className={`mt-1 flex justify-center items-center px-4 pt-5 pb-6 border-2 rounded-md transition-colors ${
          isDragging && !disabled ? 'border-dmi-blue-500 bg-dmi-blue-50 border-dashed' : 'border-dashed border-gray-300 bg-white'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        role="region"
        aria-label="Image uploader dropzone"
      >
        <div className="space-y-2 text-center w-full max-w-md">
          {isLoading ? (
            <div className="flex flex-col items-center py-6">
              <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-dmi-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm text-gray-500 mt-2">Uploading and compressing...</p>
            </div>
          ) : imageUrl ? (
            <img src={imageUrl} alt="Candidate preview" className="mx-auto h-40 w-40 rounded-full object-cover shadow-md" />
          ) : (
            placeholder
          )}

          <div className="flex text-sm text-gray-600 justify-center items-center">
            <label
              htmlFor="file-upload"
              className={`relative cursor-pointer bg-white rounded-md font-medium text-dmi-blue-600 hover:text-dmi-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-dmi-blue-500 px-3 py-1 ${disabled || isLoading ? 'pointer-events-none text-gray-400' : ''}`}
            >
              <span>{isLoading ? 'Processing...' : imageUrl ? 'Change image' : 'Upload a file'}</span>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={onFileSelect} accept="image/jpeg,image/png" disabled={disabled || isLoading} aria-hidden={disabled || isLoading} />
            </label>
            <p className="pl-2">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">(Recommended: PNG/JPG up to 500px, compressed for speed)</p>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600 text-center" role="status">{error}</p>}
    </div>
  );
};

export default ImageUploader;
