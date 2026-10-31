import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Enterprise FileUploader Component
 * Simulates document capture and IndexedDB metadata storage
 */
export function FileUploader({
  onFileSelect = null,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSizeMb = 10,
  label = 'Upload document or image',
  hint = 'PDF, PNG, JPG up to 10 MB',
  className = '',
}) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    const valid = [];
    Array.from(files).forEach((file) => {
      if (file.size > maxSizeMb * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds the maximum limit of ${maxSizeMb} MB`);
        return;
      }
      const fileObj = {
        id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      };
      valid.push(fileObj);
    });

    if (valid.length > 0) {
      setUploadedFiles((prev) => [...prev, ...valid]);
      if (onFileSelect) onFileSelect(valid);
      toast.success(`Attached ${valid.length} file(s)`);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (id) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-brand-primary bg-blue-50/50'
            : 'border-border hover:border-slate-400 bg-slate-50/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-2">
          <UploadCloud className="w-5 h-5 text-brand-primary" />
        </div>
        <p className="text-xs font-bold text-text-main">{label}</p>
        <p className="text-[11px] text-text-muted mt-0.5">{hint}</p>
      </div>

      {/* Selected file list */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-1.5">
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border text-xs"
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <FileText className="w-4 h-4 text-brand-primary shrink-0" />
                <span className="font-medium text-text-main truncate">{file.name}</span>
                <span className="text-[10px] text-text-muted shrink-0">
                  ({Math.round(file.size / 1024)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file.id);
                }}
                className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
