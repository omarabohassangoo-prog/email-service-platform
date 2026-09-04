import React from 'react';
import { Eye } from 'lucide-react';

interface EmailPreviewProps {
  subject: string;
  htmlContent: string;
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({ subject, htmlContent }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-full flex flex-col">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Eye className="w-5 h-5 text-sky-400" />
        <span>معاينة البريد (Live Preview)</span>
      </h3>
      
      <div className="bg-white rounded-xl flex-1 overflow-hidden flex flex-col shadow-inner">
        <div className="border-b border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-800">
            <span className="text-slate-500 font-normal mr-2">الموضوع:</span>
            {subject || 'بدون عنوان'}
          </p>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
          {htmlContent ? (
            <div 
              className="prose max-w-none text-slate-800" 
              dir="auto"
              dangerouslySetInnerHTML={{ __html: htmlContent }} 
            />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
              المحتوى فارغ...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
