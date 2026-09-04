import React, { useRef } from 'react';
import { Paperclip, X, Upload } from 'lucide-react';

export interface Attachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  content: string; // Base64
}

interface AttachmentManagerProps {
  attachments: Attachment[];
  onAdd: (att: Attachment) => void;
  onRemove: (id: string) => void;
}

export const AttachmentManager: React.FC<AttachmentManagerProps> = ({ attachments, onAdd, onRemove }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Content = event.target?.result?.toString().split(',')[1] || '';
        onAdd({
          id: Math.random().toString(36).substr(2, 9),
          filename: file.name,
          contentType: file.type || 'application/octet-stream',
          size: file.size,
          content: base64Content,
        });
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-slate-300 font-semibold text-sm flex items-center gap-2">
        <Paperclip className="w-4 h-4 text-slate-400" />
        <span>المرفقات</span>
      </label>
      
      <div className="flex flex-wrap gap-3">
        {attachments.map((att) => (
          <div key={att.id} className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 px-3 py-1.5 rounded-lg">
            <span className="text-xs text-slate-200 truncate max-w-[150px]">{att.filename}</span>
            <span className="text-[10px] text-slate-500">{(att.size / 1024).toFixed(1)}KB</span>
            <button
              type="button"
              onClick={() => onRemove(att.id)}
              className="text-slate-400 hover:text-rose-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-slate-600 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-all text-xs"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>إضافة مرفق</span>
        </button>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};
