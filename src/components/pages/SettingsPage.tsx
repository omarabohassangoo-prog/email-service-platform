import React, { useState, useEffect } from 'react';
import { Server, ShieldCheck, Gauge, ShieldAlert, Webhook, Save, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { settingsService, SystemSettings } from '../../services/settings.service';
import { ProviderSettings } from '../settings/ProviderSettings';
import { SecuritySettings } from '../settings/SecuritySettings';
import { LimitsSettings } from '../settings/LimitsSettings';
import { ComplianceSettings } from '../settings/ComplianceSettings';
import { WebhookSettings } from '../settings/WebhookSettings';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'providers' | 'security' | 'limits' | 'compliance' | 'webhooks'>('providers');
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const data = await settingsService.getSettings();
        setSettings(data);
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSaveAll = async () => {
    if (!settings) return;
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await settingsService.updateSettings(settings);
      setStatusMessage({ type: 'success', text: 'تم حفظ وتطبيق الإعدادات بنجاح فوري على خوادم النظام والـ API!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'فشل حفظ الإعدادات' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin ml-2 text-indigo-400" />
        <span>جاري تحميل إعدادات الخدمة...</span>
      </div>
    );
  }

  const tabs = [
    { id: 'providers', label: 'مزودو البريد (SMTP)', icon: Server },
    { id: 'security', label: 'الأمان والـ JWT', icon: ShieldCheck },
    { id: 'limits', label: 'الحصص والحدود', icon: Gauge },
    { id: 'compliance', label: 'التوافق (SPF/DKIM)', icon: ShieldAlert },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-['Cairo',sans-serif]" dir="rtl">
      
      {/* Header & Save Action */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-400" />
            <span>إعدادات الخدمة والأمان الشاملة</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            إدارة خوادم SMTP، حدود الإرسال، مفتاح الأمان، سجلات التوافق، وإشعارات Webhooks
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>حفظ وتطبيق فوري</span>
        </button>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${statusMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'}`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span className="font-semibold text-sm">{statusMessage.text}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex space-x-2 space-x-reverse overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'providers' && (
          <ProviderSettings 
            data={settings.providers} 
            onChange={(providers) => setSettings({ ...settings, providers })} 
          />
        )}
        {activeTab === 'security' && (
          <SecuritySettings 
            data={settings.security} 
            onChange={(security) => setSettings({ ...settings, security })} 
          />
        )}
        {activeTab === 'limits' && (
          <LimitsSettings 
            data={settings.limits} 
            onChange={(limits) => setSettings({ ...settings, limits })} 
          />
        )}
        {activeTab === 'compliance' && (
          <ComplianceSettings 
            data={settings.compliance} 
            onChange={(compliance) => setSettings({ ...settings, compliance })} 
          />
        )}
        {activeTab === 'webhooks' && (
          <WebhookSettings 
            data={settings.webhooks} 
            onChange={(webhooks) => setSettings({ ...settings, webhooks })} 
          />
        )}
      </div>
    </div>
  );
};
