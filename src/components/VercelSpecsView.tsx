import React, { useState } from 'react';
import { 
  Cloud, Server, HardDrive, FileUp, Cpu, Clock, Zap, Shield, 
  Terminal, Copy, Check, ExternalLink, Code, Layers, Sliders, AlertCircle, FileText, CheckCircle2
} from 'lucide-react';

export const VercelSpecsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'limits' | 'presigned' | 'blob' | 'config' | 'optimization'>('limits');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // File Upload Strategy Simulator State
  const [simulatedFileSizeMB, setSimulatedFileSizeMB] = useState<number>(12);
  const [simulatedFileName, setSimulatedFileName] = useState<string>('campaign_report_2026.pdf');
  const [simulatedFileType, setSimulatedFileType] = useState<string>('application/pdf');

  // Presigned URL Generator Simulator State
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const [isGeneratingUrl, setIsGeneratingUrl] = useState<boolean>(false);

  // vercel.json Generator Config
  const [selectedPlan, setSelectedPlan] = useState<'hobby' | 'pro' | 'enterprise'>('pro');
  const [enableFluidCompute, setEnableFluidCompute] = useState<boolean>(true);
  const [enableLargeFunctions, setEnableLargeFunctions] = useState<boolean>(true);
  const [bulkTimeout, setBulkTimeout] = useState<number>(300);

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleGeneratePresignedUrl = () => {
    setIsGeneratingUrl(true);
    setTimeout(() => {
      const generated = `https://esp-attachment-bucket.s3.us-east-1.amazonaws.com/uploads/${Date.now()}-${simulatedFileName}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20260904%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260904T133000Z&X-Amz-Expires=300&X-Amz-SignedHeaders=host&X-Amz-Signature=8f9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a2b3c4d5e6f7a8b9c0d1e2f3a`;
      setPresignedUrl(generated);
      setIsGeneratingUrl(false);
    }, 600);
  };

  const generatedVercelJson = `{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "functions": {
    "api/email/send.js": {
      "maxDuration": 60,
      "memory": 1024
    },
    "api/email/bulk.js": {
      "maxDuration": ${bulkTimeout},
      "memory": 2048
    },
    "api/attachments/upload.js": {
      "maxDuration": 30,
      "memory": 512
    }
  },
  "env": {
    "VERCEL_SUPPORT_LARGE_FUNCTIONS": "${enableLargeFunctions ? '1' : '0'}"
  }
}`;

  return (
    <div className="space-y-6">
      
      {/* Document Header Banner */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500" />

        <div>
          <div className="flex items-center gap-2">
            <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold">
              VER-ESP-2026-001 v1.0.0
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
              معتمد وموثق لـ Vercel Serverless
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-sky-400" />
            <span>مواصفات استضافة Vercel وإدارة الملفات الكبيرة (Serverless Specs & Storage)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            دليل إعدادات البيئة السحابية وتجاوز حد الـ 4.5 MB بواسطة Presigned URLs و Vercel Blob مع Fluid Compute
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://vercel.com/docs/functions/serverless-functions/runtimes"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
            <span>Vercel Limits Docs</span>
          </a>
        </div>
      </div>

      {/* Plans Comparison KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Hobby Plan */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">خطة Hobby (المجانية)</span>
            <span className="text-xs bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded">مجاني</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">حجم الطلب (Body Limit):</span>
              <span className="font-mono font-bold text-amber-400">4.5 MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">مدة التنفيذ (Timeout):</span>
              <span className="font-mono font-bold text-slate-200">10-60 ثانية</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">الذاكرة (RAM):</span>
              <span className="font-mono text-slate-200">1024 MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">حجم الوظيفة (Bundle):</span>
              <span className="font-mono text-slate-200">250 MB</span>
            </div>
          </div>
        </div>

        {/* Pro Plan (Highlighted) */}
        <div className="bg-slate-900 p-5 rounded-2xl border-2 border-indigo-500 space-y-3 relative overflow-hidden shadow-lg shadow-indigo-500/10">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">خطة Pro (الاحترافية - موصى به)</span>
            <span className="text-xs bg-indigo-600 text-white font-bold px-2 py-0.5 rounded">$20 / شهر</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">حجم الطلب المباشر:</span>
              <span className="font-mono font-bold text-amber-400">4.5 MB (Presigned لتجاوزه)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">مدة التنفيذ (Fluid Compute):</span>
              <span className="font-mono font-bold text-emerald-400">300 ثانية (5 دقائق)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">الذاكرة المتاحة:</span>
              <span className="font-mono font-bold text-sky-400">حتى 3072 MB (3 GB)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">حجم الوظائف الكبيرة:</span>
              <span className="font-mono font-bold text-indigo-300">5 GB (Large Functions)</span>
            </div>
          </div>
        </div>

        {/* Enterprise Plan */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">خطة Enterprise (المؤسسات)</span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded">مخصص</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">حجم الطلب المباشر:</span>
              <span className="font-mono font-bold text-amber-400">4.5 MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">مدة التنفيذ الممتدة:</span>
              <span className="font-mono font-bold text-emerald-400">حتى 1800 ثانية (30 دقيقة)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">الذاكرة والتوزيع:</span>
              <span className="font-mono text-slate-200">3072 MB مخصص</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">حزم التخزين والـ Build:</span>
              <span className="font-mono text-slate-200">غير محدود</span>
            </div>
          </div>
        </div>

      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('limits')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'limits' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          1. محاكي استراتيجية رفع الملفات (File Upload Strategy)
        </button>

        <button
          onClick={() => setActiveTab('presigned')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'presigned' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          2. توليد الروابط الموقعة (Presigned S3 Upload)
        </button>

        <button
          onClick={() => setActiveTab('blob')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'blob' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          3. تخزين Vercel Blob
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'config' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          4. مولد vercel.json المتقدم
        </button>

        <button
          onClick={() => setActiveTab('optimization')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'optimization' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          5. توصيات التحسين والتكلفة (Best Practices)
        </button>
      </div>

      {/* Tab 1: File Size Simulator & Decision Matrix */}
      {activeTab === 'limits' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileUp className="w-5 h-5 text-indigo-400" />
                <span>حاسبة القرار الآلي لرفع المرفقات (File Size Strategy Selector)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تحديد المسار البرمجي المناسب بناءً على حد الـ Serverless Request Body Limit (4.5 MB)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Input Form */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">اسم الملف التجريبي المرفق:</label>
                <input
                  type="text"
                  value={simulatedFileName}
                  onChange={(e) => setSimulatedFileName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-300 font-bold">حجم الملف بالميجابايت (File Size):</label>
                  <span className="font-mono text-indigo-400 font-bold text-sm">{simulatedFileSizeMB} MB</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={100}
                  step={0.5}
                  value={simulatedFileSizeMB}
                  onChange={(e) => setSimulatedFileSizeMB(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-slate-950 rounded-lg cursor-pointer h-2"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>0.5 MB (صغير)</span>
                  <span className="text-amber-400 font-bold">4.5 MB (حد Vercel الأقصى)</span>
                  <span>100 MB (كبير جداً)</span>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">نوع الملف (MIME Type):</label>
                <select
                  value={simulatedFileType}
                  onChange={(e) => setSimulatedFileType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                >
                  <option value="application/pdf">PDF Document (application/pdf)</option>
                  <option value="image/png">PNG Image (image/png)</option>
                  <option value="application/zip">ZIP Archive (application/zip)</option>
                  <option value="text/csv">CSV Data File (text/csv)</option>
                </select>
              </div>
            </div>

            {/* Recommendation Box */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-white border-b border-slate-800 pb-2">الاستراتيجية الموصى بها للـ Backend:</h4>

              {simulatedFileSizeMB <= 4.5 ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>المسار المباشر عبر API Route (Direct Multipart Upload)</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    بما أن حجم الملف <strong>{simulatedFileSizeMB} MB</strong> أقل من الحد الأقصى (4.5 MB)، يمكن استقباله مباشرة عبر Express Multer أو Next.js API Routes وتخزينه بالذاكرة المؤقتة.
                  </p>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-300">
                    POST /api/v1/attachments/upload &rarr; Multer MemoryStorage &rarr; S3 PutObject
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 font-bold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    <span>المسار الآلي: Presigned Upload URL (Direct S3 / Cloud Storage)</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    حجم الملف <strong>{simulatedFileSizeMB} MB</strong> يتجاوز حد Vercel Serverless (4.5 MB). يتعين إنشاء رابط موثق ومؤقت (Presigned URL) ليرفع العميل الملف مباشرة إلى S3 أو Vercel Blob بدلاً من المرور بالسيرفر.
                  </p>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-amber-300">
                    1. POST /api/get-upload-url &rarr; Get Signed S3 Put URL<br/>
                    2. PUT Presigned_URL (Client-Side Direct Upload to AWS/Blob)
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Tab 2: Presigned URL Generator Simulator */}
      {activeTab === 'presigned' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <span>محاكي توليد الروابط الموقعة (Presigned S3 URL Simulator)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                توليد رابط AWS S3 مؤقت (صالِح لمدة 5 دقائق) لرفع المرفقات الضخمة مباشرة
              </p>
            </div>

            <button
              onClick={handleGeneratePresignedUrl}
              disabled={isGeneratingUrl}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>{isGeneratingUrl ? 'جاري التوليد...' : 'توليد Presigned URL جديد'}</span>
            </button>
          </div>

          {presignedUrl && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>الرابط الموقع المولد للرفع المباشر:</span>
                <button onClick={() => copyCode(presignedUrl, 'purl')} className="text-amber-400 hover:text-white text-[11px] flex items-center gap-1">
                  {copiedCodeId === 'purl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>نسخ الرابط</span>
                </button>
              </div>
              <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-amber-300 break-all leading-relaxed">
                {presignedUrl}
              </pre>
            </div>
          )}

          {/* Code Example */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>pages/api/get-upload-url.ts</span>
              <button
                onClick={() => copyCode(`import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function getPresignedUrl(filename: string, contentType: string) {
  const s3 = new S3Client({ region: 'us-east-1' });
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: \`uploads/\${Date.now()}-\${filename}\`,
    ContentType: contentType,
  });
  
  return await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 minutes
}`, 's3code')}
                className="text-indigo-400 hover:text-white text-[11px] flex items-center gap-1"
              >
                {copiedCodeId === 's3code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>نسخ الكود</span>
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-200 overflow-x-auto leading-relaxed">
              <code>{`import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function getPresignedUrl(filename: string, contentType: string) {
  const s3 = new S3Client({ region: 'us-east-1' });
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: \`uploads/\${Date.now()}-\${filename}\`,
    ContentType: contentType,
  });
  
  return await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 minutes
}`}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3: Vercel Blob Storage */}
      {activeTab === 'blob' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-sky-400" />
                <span>استخدام Vercel Blob Storage للمرفقات</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                خدمة تخزين متكاملة مدمجة مع منصة Vercel للرفع المباشر السريع بدون إعداد مفاتيح AWS
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-sky-400 font-bold block">ميزات Vercel Blob:</span>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                <li>تكامل تلقائي بدون إعداد تعقيدات S3 IAM.</li>
                <li>توزيع عالمي سري عبر Vercel Edge Network.</li>
                <li>دعم الرفع المباشر بحزم تصل إلى عدة جيجابايت.</li>
                <li>10 GB مجاني شهرياً و $0.01/GB بعدها.</li>
              </ul>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-bold block">خطوات التفعيل:</span>
              <ol className="list-decimal list-inside text-slate-300 space-y-1">
                <li>تثبيت المكتبة: <code className="text-emerald-300 font-mono">npm install @vercel/blob</code></li>
                <li>ربط الـ Blob Store في لوحة تحكم Vercel.</li>
                <li>إضافة المتغير <code className="text-emerald-300 font-mono">BLOB_READ_WRITE_TOKEN</code>.</li>
              </ol>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>app/api/upload/route.ts</span>
              <button
                onClick={() => copyCode(`import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename') || 'attachment.pdf';
  
  const blob = await put(filename, request.body, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  
  return NextResponse.json(blob);
}`, 'blobCode')}
                className="text-indigo-400 hover:text-white text-[11px] flex items-center gap-1"
              >
                {copiedCodeId === 'blobCode' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>نسخ النص</span>
              </button>
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-sky-200 overflow-x-auto leading-relaxed">
              <code>{`import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename') || 'attachment.pdf';
  
  const blob = await put(filename, request.body, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  
  return NextResponse.json(blob);
}`}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Tab 4: vercel.json Config Generator */}
      {activeTab === 'config' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-400" />
                <span>مولد ملف vercel.json المخصص للمشروع</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تعديل وتحديد حدود maxDuration والذاكرة ونطاقات Large Functions
              </p>
            </div>

            <button
              onClick={() => copyCode(generatedVercelJson, 'vjson')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              {copiedCodeId === 'vjson' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCodeId === 'vjson' ? 'تم النسخ' : 'نسخ vercel.json'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Controls */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">الخطة المستهدفة:</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="hobby">Hobby (Max 60s)</option>
                  <option value="pro">Pro (Max 300s with Fluid Compute)</option>
                  <option value="enterprise">Enterprise (Max 1800s)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">مهلة معالجة الإرسال الجماعي (bulk.js maxDuration):</label>
                <input
                  type="number"
                  value={bulkTimeout}
                  onChange={(e) => setBulkTimeout(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={enableLargeFunctions}
                    onChange={(e) => setEnableLargeFunctions(e.target.checked)}
                  />
                  <span>تفعيل VERCEL_SUPPORT_LARGE_FUNCTIONS=1 (حتى 5 GB)</span>
                </label>
              </div>
            </div>

            {/* Generated vercel.json preview */}
            <div className="lg:col-span-2">
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto leading-relaxed">
                <code>{generatedVercelJson}</code>
              </pre>
            </div>

          </div>
        </div>
      )}

      {/* Tab 5: Optimization & Best Practices */}
      {activeTab === 'optimization' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>أفضل الممارسات المعتمدة لاستضافة منصات البريد على Vercel</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-bold block">1. تجاوز القيود وتجنب أخطاء OOM:</span>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                <li>استخدم Presigned URLs للرفع المباشر لعدم تجاوز حد 4.5 MB.</li>
                <li>ارفع ذاكرة الوظائف إلى 1024 MB أو 2048 MB للخدمات الحساسة.</li>
                <li>تأكد من تفعيل Fluid Compute للحصول على maxDuration 300s.</li>
              </ul>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-sky-400 font-bold block">2. تحسين حزمة البناء وضغط البيانات:</span>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                <li>أضف <code className="text-sky-300 font-mono">VERCEL_ANALYZE_BUILD_OUTPUT=1</code> لرصد الحزم الضخمة.</li>
                <li>استخدم Tree Shaking وفلترة التبعيات غير الضرورية.</li>
                <li>انقل المرفقات الثابتة والقوالب الضخمة إلى CDN خارجي.</li>
              </ul>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
