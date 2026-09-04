import React, { useState } from 'react';
import { 
  FileCode2, Plus, Copy, Trash2, Eye, Send, Code, Sparkles, 
  Check, Edit3, Smartphone, Monitor, AlertCircle, RefreshCw
} from 'lucide-react';
import { EmailTemplate } from '../types';

interface TemplateManagerProps {
  templates: EmailTemplate[];
  onCreateTemplate: (data: Partial<EmailTemplate>) => void;
  onUpdateTemplate: (id: string, data: Partial<EmailTemplate>) => void;
  onDeleteTemplate: (id: string) => void;
  onDuplicateTemplate: (id: string) => void;
  onSendTestEmail: (templateId: string, to: string, data: Record<string, any>) => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  templates,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onDuplicateTemplate,
  onSendTestEmail
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(templates[0] || null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  
  // Editor form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'transactional' | 'marketing' | 'security' | 'onboarding' | 'system'>('transactional');
  const [formSubject, setFormSubject] = useState('');
  const [formHtml, setFormHtml] = useState('');
  const [formText, setFormText] = useState('');

  // Test Email Modal
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testEmailTo, setTestEmailTo] = useState('developer@enterprise.com');
  const [testParamsJson, setTestParamsJson] = useState('{\n  "user_name": "أحمد علي",\n  "otp_code": "849201",\n  "valid_minutes": "5"\n}');
  const [testSuccessMsg, setTestSuccessMsg] = useState('');

  // Scope and Category Filter state
  const [scopeFilter, setScopeFilter] = useState<'all' | 'global' | 'app-ecommerce-001' | 'app-saas-001'>('all');

  // Filter templates
  const filteredTemplates = templates.filter(tmpl => {
    if (scopeFilter === 'all') return true;
    if (scopeFilter === 'global') return tmpl.scope === 'global' || !tmpl.scope;
    if (scopeFilter === 'app-ecommerce-001') return tmpl.app_id === 'app-ecommerce-001';
    if (scopeFilter === 'app-saas-001') return tmpl.app_id === 'app-saas-001';
    return true;
  });

  const handleSelectTemplate = (tmpl: EmailTemplate) => {
    setSelectedTemplate(tmpl);
    setFormName(tmpl.name);
    setFormCategory(tmpl.category);
    setFormSubject(tmpl.subject);
    setFormHtml(tmpl.html);
    setFormText(tmpl.text || '');
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!selectedTemplate) {
      // Create new
      onCreateTemplate({
        name: formName || 'قالب جديد',
        category: formCategory,
        subject: formSubject,
        html: formHtml,
        text: formText
      });
    } else {
      // Update
      onUpdateTemplate(selectedTemplate.id, {
        name: formName,
        category: formCategory,
        subject: formSubject,
        html: formHtml,
        text: formText
      });
    }
    setIsEditing(false);
  };

  const handleNewTemplateClick = () => {
    setSelectedTemplate(null);
    setFormName('قالب رسالة بريدية جديد');
    setFormCategory('transactional');
    setFormSubject('مرحباً بك في {{app_name}}');
    setFormHtml('<div style="padding: 20px; font-family: sans-serif;"><h2>مرحباً {{user_name}}</h2><p>شكراً للتسجيل معنا في {{app_name}}.</p></div>');
    setFormText('مرحباً {{user_name}}، شكراً للتسجيل معنا.');
    setIsEditing(true);
  };

  const handleSendTestSubmit = () => {
    if (!selectedTemplate) return;
    try {
      const parsedData = JSON.parse(testParamsJson);
      onSendTestEmail(selectedTemplate.id, testEmailTo, parsedData);
      setTestSuccessMsg(`تم إرسال بريد اختبار بنجاح إلى ${testEmailTo}`);
      setTimeout(() => setTestSuccessMsg(''), 4000);
    } catch (e) {
      alert('صيغة JSON غير صحيحة للمتغيرات');
    }
  };

  // Render Mustache Preview
  const renderLivePreview = (htmlStr: string) => {
    try {
      const mockVars: Record<string, string> = {
        app_name: selectedTemplate?.app_name || 'التطبيق الموحد',
        app_logo: selectedTemplate?.app_logo || 'https://shop.example.com/logo.png',
        app_url: selectedTemplate?.app_url || 'https://app.example.com',
        app_visit_url: selectedTemplate?.app_visit_url || 'https://app.example.com/visit',
        user_name: 'سارة الشمري',
        customer_name: 'أحمد المحمود',
        welcome_message: 'نحن سعيدون جداً بوجودك معنا في هذه التجربة المميزة.',
        notification_title: 'تنبيه تحديث النظام والمميزات الجديدة',
        notification_message: 'تم إضافة ميزات جديدة لنظام المعالجة السريعة والتنبيهات المباشرة.',
        action_url: selectedTemplate?.app_visit_url || '#',
        action_text: 'استعراض التحديثات',
        order_id: 'ORD-2026-8891',
        total_amount: '2,597',
        currency: 'SAR',
        shipping_address: 'الرياض، حي النخيل، شارع الأمير سلطان',
        phone_number: '0501234567',
        order_tracking_url: '#',
        otp_code: '948210',
        valid_minutes: '5',
        year: '2026'
      };

      let rendered = htmlStr;
      Object.keys(mockVars).forEach(k => {
        const regex = new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, 'g');
        rendered = rendered.replace(regex, mockVars[k]);
      });
      return rendered;
    } catch (e) {
      return htmlStr;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-indigo-400" />
            <span>نظام قوالب البريد الإلكتروني الذكية</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            تصميم ومعاينة القوالب مع إدخال المتغيرات الديناميكية <code className="text-indigo-300 font-mono">{"{{variable}}"}</code> والمعاينة اللحظية
          </p>
        </div>

        <button
          onClick={handleNewTemplateClick}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء قالب جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Template List Sidebar */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              القوالب ({filteredTemplates.length})
            </h3>
          </div>

          {/* Scope Filters */}
          <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80 text-[11px]">
            <button
              onClick={() => setScopeFilter('all')}
              className={`flex-1 py-1 rounded-lg font-bold transition-all ${
                scopeFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setScopeFilter('global')}
              className={`flex-1 py-1 rounded-lg font-bold transition-all ${
                scopeFilter === 'global' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              عامة (Global)
            </button>
            <button
              onClick={() => setScopeFilter('app-ecommerce-001')}
              className={`flex-1 py-1 rounded-lg font-bold transition-all ${
                scopeFilter === 'app-ecommerce-001' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              متجر
            </button>
            <button
              onClick={() => setScopeFilter('app-saas-001')}
              className={`flex-1 py-1 rounded-lg font-bold transition-all ${
                scopeFilter === 'app-saas-001' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              SaaS
            </button>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredTemplates.map((tmpl) => {
              const isSelected = selectedTemplate?.id === tmpl.id;
              const isGlobal = tmpl.scope === 'global' || !tmpl.scope;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-slate-800 border-indigo-500 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-xs text-white truncate max-w-[170px]">
                      {tmpl.name}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isGlobal ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                    }`}>
                      {isGlobal ? 'Global' : tmpl.app_name || 'App'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 truncate">{tmpl.subject}</p>
                  
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                    <span className="capitalize">{tmpl.category}</span>
                    <span>{tmpl.variables.length} متغيرات</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Editor & Preview Main Panel */}
        <div className="lg:col-span-2 space-y-4">
          
          {selectedTemplate || isEditing ? (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
              
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="اسم القالب..."
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500"
                  />
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none"
                  >
                    <option value="security">أمان (Security)</option>
                    <option value="transactional">فواتير ومعاملات (Transactional)</option>
                    <option value="marketing">تسويق (Marketing)</option>
                    <option value="onboarding">ترحيب (Onboarding)</option>
                    <option value="system">نظام (System)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>حفظ القالب</span>
                  </button>

                  {selectedTemplate && (
                    <>
                      <button
                        onClick={() => onDuplicateTemplate(selectedTemplate.id)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                        title="نسخ القالب"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setTestModalOpen(true)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>اختبار الإرسال</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Form Controls */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">عنوان الرسالة (Subject Line):</label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-400">محتوى القالب (HTML Code):</label>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500">المعاينة على:</span>
                      <button
                        onClick={() => setPreviewDevice('desktop')}
                        className={`p-1 rounded ${previewDevice === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-800'}`}
                      >
                        <Monitor className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setPreviewDevice('mobile')}
                        className={`p-1 rounded ${previewDevice === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-800'}`}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={8}
                    value={formHtml}
                    onChange={(e) => setFormHtml(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-indigo-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>

                {/* Live Preview Frame */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-2">المعاينة الحية (Live Rendered Preview):</label>
                  <div className={`mx-auto bg-slate-950 rounded-2xl border border-slate-800 p-4 overflow-hidden transition-all ${
                    previewDevice === 'mobile' ? 'max-w-sm' : 'w-full'
                  }`}>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 mb-3 text-xs text-slate-300">
                      <span className="text-slate-500 font-bold block">الموضوع المعاين:</span>
                      <span>{renderLivePreview(formSubject)}</span>
                    </div>

                    <div 
                      className="bg-slate-950 text-slate-100 p-2 rounded-xl border border-slate-800 overflow-x-auto min-h-[180px]"
                      dangerouslySetInnerHTML={{ __html: renderLivePreview(formHtml) }}
                    />
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center text-slate-500 text-xs">
              اختر قالباً من القائمة للبدء بالتعديل والمعاينة
            </div>
          )}

        </div>
      </div>

      {/* Modal Test Send */}
      {testModalOpen && selectedTemplate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-400" />
                <span>اختبار إرسال القالب: {selectedTemplate.name}</span>
              </h3>
              <button onClick={() => setTestModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            {testSuccessMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl">
                {testSuccessMsg}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">البريد المستلم للاختبار:</label>
                <input
                  type="email"
                  value={testEmailTo}
                  onChange={(e) => setTestEmailTo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">متغيرات الاختبار (JSON Parameters):</label>
                <textarea
                  rows={5}
                  value={testParamsJson}
                  onChange={(e) => setTestParamsJson(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-indigo-200 font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setTestModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                إلغاء
              </button>
              <button
                onClick={handleSendTestSubmit}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md"
              >
                إرسال بريد الاختبار
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
