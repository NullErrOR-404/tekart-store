import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Trash2, CheckCircle2, Copy } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface UploadItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  uploadedUrl?: string;
  error?: string;
}

export const UploadWizard: React.FC = () => {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [copiedUrlIndex, setCopiedUrlIndex] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    addFiles(Array.from(files));
  };

  const addFiles = (fileList: File[]) => {
    const newItems: UploadItem[] = fileList.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'idle',
      progress: 0
    }));
    setUploads([...uploads, ...newItems]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      addFiles(Array.from(files));
    }
  };

  const removeUploadItem = (id: string, idx: number) => {
    URL.revokeObjectURL(uploads[idx].previewUrl);
    setUploads(uploads.filter(item => item.id !== id));
  };

  const processBatchUploads = async () => {
    if (uploads.length === 0) return;
    setIsUploading(true);
    setSuccessCount(0);

    const updatedUploads = [...uploads];

    for (let i = 0; i < updatedUploads.length; i++) {
      const item = updatedUploads[i];
      if (item.status === 'success') continue;

      updatedUploads[i] = { ...item, status: 'uploading', progress: 20 };
      setUploads([...updatedUploads]);

      try {
        const file = item.file;
        const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (error) {
          updatedUploads[i] = { 
            ...item, 
            status: 'error', 
            error: error.message 
          };
        } else if (data) {
          const { data: urlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(data.path);

          updatedUploads[i] = {
            ...item,
            status: 'success',
            progress: 100,
            uploadedUrl: urlData.publicUrl
          };
          setSuccessCount(prev => prev + 1);
        }
      } catch (err: any) {
        updatedUploads[i] = {
          ...item,
          status: 'error',
          error: err.message || 'Unknown upload error'
        };
      }
      setUploads([...updatedUploads]);
    }
    setIsUploading(false);
  };

  const handleCopyUrl = (url: string, index: number) => {
    navigator.clipboard.writeText(url);
    setCopiedUrlIndex(index);
    setTimeout(() => setCopiedUrlIndex(null), 2000);
  };

  return (
    <div className="space-y-6 text-left max-w-4xl pb-12">
      {/* Back link */}
      <div>
        <Link 
          to="/owner" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-tk-text-secondary hover:text-tk-blue-deep transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-2xl md:text-3xl text-tk-text-primary">
          Batch Image Upload
        </h2>
        <p className="text-xs text-tk-text-secondary">
          Upload and compress product imagery assets. Copy URL links directly into product creation forms.
        </p>
      </div>

      {/* Upload Box Zone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-tk-border-strong hover:border-tk-blue-deep rounded-tk-modal p-8 text-center bg-white dark:bg-tk-surface cursor-pointer transition-colors duration-200"
      >
        <input
          type="file"
          id="batch-file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="batch-file" className="cursor-pointer space-y-4 flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-tk-blue-light flex items-center justify-center text-tk-blue-deep">
            <Upload className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-tk-text-primary">
              Drag & drop images here or <span className="text-tk-blue-deep hover:underline">browse files</span>
            </p>
            <p className="text-[11px] text-tk-text-tertiary">
              Supports JPEG, PNG, WEBP, and SVG formats. Recommended size below 2MB each.
            </p>
          </div>
        </label>
      </div>

      {/* Queue Listing */}
      {uploads.length > 0 && (
        <div className="bg-white dark:bg-tk-surface border border-tk-border rounded-tk-card shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between border-b border-tk-border pb-3">
            <h3 className="text-sm font-bold text-tk-text-primary">Upload Queue ({uploads.length} items)</h3>
            <div className="flex gap-2">
              <button
                disabled={isUploading}
                onClick={processBatchUploads}
                className="bg-tk-blue-deep hover:bg-tk-blue-mid text-white font-bold py-1.5 px-4 rounded-tk-input text-xs shadow-sm transition-all flex items-center gap-1"
              >
                <span>Upload All</span>
              </button>
              <button
                disabled={isUploading}
                onClick={() => setUploads([])}
                className="border border-tk-border hover:bg-red-50 hover:text-red-600 text-tk-text-secondary font-bold py-1.5 px-3 rounded-tk-input text-xs transition-colors"
              >
                Clear Queue
              </button>
            </div>
          </div>

          <div className="space-y-3.5 divide-y divide-tk-border/50 max-h-96 overflow-y-auto no-scrollbar">
            {uploads.map((item, idx) => (
              <div key={item.id} className="pt-3.5 first:pt-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.previewUrl}
                    alt="preview"
                    className="w-12 h-14 object-cover rounded bg-tk-blue-pale border border-tk-border shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-tk-text-primary truncate">{item.file.name}</p>
                    <p className="text-[10px] text-tk-text-tertiary">
                      {(item.file.size / 1024).toFixed(1)} KB · {item.file.type}
                    </p>
                    {item.status === 'uploading' && (
                      <div className="w-32 bg-tk-blue-light h-1 rounded-full overflow-hidden mt-1">
                        <div 
                          className="bg-tk-blue-deep h-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                    {item.status === 'error' && (
                      <p className="text-[10px] text-red-500 mt-0.5">Error: {item.error}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.status === 'success' && item.uploadedUrl && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 py-1 px-2.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Success</span>
                      </span>

                      <button
                        onClick={() => handleCopyUrl(item.uploadedUrl!, idx)}
                        className="p-2 border border-tk-border hover:border-tk-blue-bright hover:bg-tk-blue-light text-tk-text-secondary hover:text-tk-blue-deep rounded-tk-input flex items-center gap-1 text-[10px] font-bold transition-all"
                        title="Copy Public URL"
                      >
                        <Copy className="h-3 w-3" />
                        <span>{copiedUrlIndex === idx ? 'Copied!' : 'Copy URL'}</span>
                      </button>
                    </div>
                  )}

                  {item.status === 'idle' && (
                    <button
                      disabled={isUploading}
                      onClick={() => removeUploadItem(item.id, idx)}
                      className="p-1.5 rounded-full hover:bg-red-50 text-tk-text-tertiary hover:text-red-600 transition-colors"
                      title="Remove from queue"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {successCount > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-tk-card p-4 text-xs text-emerald-800 space-y-1">
          <p className="font-bold flex items-center gap-1">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
            <span>Successfully processed {successCount} images.</span>
          </p>
          <p>You can copy their public URL links from the listing above and paste them directly into the "Cover Image URL" or "Gallery Image URLs" fields in your Product Editor form.</p>
        </div>
      )}
    </div>
  );
};
