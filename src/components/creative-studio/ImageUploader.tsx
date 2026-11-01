import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useImages } from '../../hooks/useImages';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { formatBytes } from '../../utils/formatters';

export const ImageUploader: React.FC<{
  onUploadComplete?: () => void;
}> = ({ onUploadComplete }) => {
  const { uploadImage, remainingSlots, uploading } = useImages();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please select a JPEG, PNG, or WebP image file.');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setError(null);
    setSuccess(null);

    try {
      const res = await uploadImage(selectedFile, {
        caption,
        fileName: selectedFile.name,
        imageType: 'moodboard',
      });

      setSuccess(`Image saved to Realtime Database (${formatBytes(res.metadata.sizeBytes)})`);
      setSelectedFile(null);
      setCaption('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onUploadComplete) onUploadComplete();
    } catch (err: any) {
      setError(err.message || 'Image upload failed');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-charcoal-100 p-5 sm:p-6 shadow-subtle space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-charcoal">Add Reference / Moodboard Image</h4>
          <p className="text-xs text-charcoal-400 mt-0.5">
            Client-side compressed and securely persisted in Firebase Realtime Database
          </p>
        </div>
        <span className="text-[11px] font-semibold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full border border-primary-200">
          {remainingSlots} slots remaining (20 max)
        </span>
      </div>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        aria-label={selectedFile ? `Selected image: ${selectedFile.name}. Click to change` : 'Click to select or upload moodboard photo'}
        className={`w-full border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          selectedFile
            ? 'border-primary-400 bg-primary-50/20'
            : 'border-charcoal-200 hover:border-primary/50 hover:bg-background-subtle/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          aria-label="Upload moodboard photo"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-10 h-10 rounded-xl bg-background-subtle text-primary flex items-center justify-center mx-auto mb-2 border border-charcoal-200">
          {selectedFile ? (
            <ImageIcon className="w-5 h-5 text-accent-500" aria-hidden="true" />
          ) : (
            <Upload className="w-5 h-5" aria-hidden="true" />
          )}
        </div>

        {selectedFile ? (
          <div>
            <p className="text-xs font-semibold text-charcoal">{selectedFile.name}</p>
            <p className="text-[11px] text-charcoal-500 mt-0.5">
              Original: {formatBytes(selectedFile.size)} • Will compress to &lt; 1 MB Base64
            </p>
          </div>
        ) : (
          <div>
            <p className="text-xs font-medium text-charcoal">
              Click to select or drag and drop decor, floral, or stage photo
            </p>
            <p className="text-[11px] text-charcoal-500 mt-0.5">
              JPEG, PNG, WebP up to 1600px
            </p>
          </div>
        )}
      </button>

      {selectedFile && (
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <Input
              label="Caption / Tag (Optional)"
              placeholder="e.g. Mandap Floral Arch Concept"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
          <Button
            type="button"
            onClick={handleUpload}
            loading={uploading}
            disabled={remainingSlots <= 0}
            className="shrink-0 w-full sm:w-auto"
          >
            Compress &amp; Save Image
          </Button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-200"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          role="status"
          aria-live="polite"
          className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2 border border-emerald-200"
        >
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
};

