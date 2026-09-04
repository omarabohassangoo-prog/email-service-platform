import React, { useState } from 'react';
import { Webhook, Key, CheckCircle2, RefreshCw } from 'lucide-react';

interface WebhookSettingsProps {
  data: any;
  onChange: (data: any) => void;
}

export const WebhookSettings: React.FC<WebhookSettingsProps> = ({ data, onChange }) => {
  const [form, setForm] = useState(data || {
    url: 'https://api.myapp.com/webhooks/email',
    secret: 'whsec_AbC123XyZ7890SecretKey',
    events: ['email.sent', 'email.delivered', 'email.bounced', 'email.complained'],
    enabled: true
  });

  const availableEvents = [
    { id: 'email.sent', label: 'تمت جدولة أو إرسال البريد (email.sent)' },
    { id: 'email.delivered', label: 'تم التسجيل والتسليم بنجاح (email.delivered)' },
    { id: 'email.bounced', label: 'ارتداد البريد والفشل (email.bounced)' },
    { id: 'email.complained', label: 'شكوى بلاغ رسائل مزعجة (email.complained)' },
    { id: 'email.opened', label: 'فتح الرسالة (email.opened)' },
    { id: 'email.clicked', label: 'النقر على الروابط (email.clicked)' }
  ];

  const handleChange = (field: string, value: any) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    onChange(updated);
  };

  const handleToggleEvent = (eventId: string) => {
    const events = form.events || [];
    const updatedEvents = events.includes(eventId)
      ? events.filter((e: string) => e !== eventId)
      : [...events, eventId];
    handleChange('events', updatedEvents);
  };

  const generateSecret = () => {
    const randomSecret = 'whsec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    handleChange('secret', randomSecret);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 rounded-xl bg-sky-600/15 text-sky-400">
          <Webhook className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">إعدادات الـ Webhooks وإشعارات الأحداث</h3>
          <p className="text-xs text-slate-400">ربط النظام بتطبيقاتك الخارجية لاستقبال تحديثات تسليم البريد لحظياً</p>
        </div>
      </div>

      <div className="space-y-4 text-xs">
        <div>
          <label className="text-slate-400 block mb-1 font-bold">رابط مستقبل الـ Webhook (Endpoint URL)</label>
          <input
            type="url"
            value={form.url}
            onChange={(e) => handleChange('url', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-indigo-500 outline-none"
            dir="ltr"
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-bold">مفتاح التوقيع السري (Webhook Secret)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={form.secret}
              onChange={(e) => handleChange('secret', e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-indigo-300 font-mono focus:border-indigo-500 outline-none"
              dir="ltr"
            />
            <button
              type="button"
              onClick={generateSecret}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> توليد جديد
            </button>
          </div>
        </div>

        <div>
          <label className="text-slate-400 block mb-2 font-bold">الأحداث المشتركة (Event Subscriptions)</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableEvents.map((evt) => {
              const isChecked = form.events?.includes(evt.id);
              return (
                <div
                  key={evt.id}
                  onClick={() => handleToggleEvent(evt.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                    isChecked
                      ? 'bg-indigo-600/10 border-indigo-500/50 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-700 bg-slate-900 pointer-events-none"
                  />
                  <span className="font-mono">{evt.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <input
            type="checkbox"
            id="webhook_enabled"
            checked={form.enabled}
            onChange={(e) => handleChange('enabled', e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded border-slate-700 bg-slate-900"
          />
          <label htmlFor="webhook_enabled" className="text-slate-300 font-bold cursor-pointer">
            تفعيل إرسال طلبات الـ Webhooks فور وقوع الأحداث
          </label>
        </div>
      </div>
    </div>
  );
};
