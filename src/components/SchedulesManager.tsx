import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Plus, Trash2, Play, Pause, AlertCircle, 
  CheckCircle, RefreshCw, Mail, Check, CalendarDays, Bell
} from 'lucide-react';
import { ScheduledTask } from '../types';

export const SchedulesManager: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduledTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'one_shot' | 'recurring'>('one_shot');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [scheduledTime, setScheduledTime] = useState(''); // HH:MM or ISO
  const [dayOfWeek, setDayOfWeek] = useState<number>(0);
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [fromEmail, setFromEmail] = useState('noreply@enterprise-esp.com');
  const [toEmails, setToEmails] = useState('');
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');

  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/schedules');
      const data = await res.json();
      if (data.success) {
        setSchedules(data.schedules);
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!name || !scheduledTime || !toEmails || !subject) {
      setMessage({ text: 'يرجى ملء جميع الحقول الإلزامية', type: 'error' });
      return;
    }

    const payload = {
      name,
      fromEmail,
      toEmails: toEmails.split(',').map(e => e.trim()),
      subject,
      htmlContent,
      scheduledTime: type === 'one_shot' ? new Date(scheduledTime).toISOString() : scheduledTime,
      ...(type === 'recurring' && {
        frequency,
        dayOfWeek: frequency === 'weekly' ? Number(dayOfWeek) : undefined,
        dayOfMonth: frequency === 'monthly' ? Number(dayOfMonth) : undefined,
      })
    };

    const endpoint = type === 'one_shot' ? '/api/v1/schedules/one-shot' : '/api/v1/schedules/recurring';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: `تم جدولة المهمة "${name}" بنجاح`, type: 'success' });
        setIsFormOpen(false);
        // Reset form
        setName('');
        setScheduledTime('');
        setSubject('');
        setToEmails('');
        setHtmlContent('');
        fetchSchedules();
      } else {
        setMessage({ text: data.error || 'حدث خطأ أثناء حفظ المهمة', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'خطأ في الاتصال بالخادم', type: 'error' });
    }
  };

  const handleToggleActive = async (task: ScheduledTask) => {
    try {
      const res = await fetch(`/api/v1/schedules/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !task.is_active })
      });
      const data = await res.json();
      if (data.success) {
        fetchSchedules();
      }
    } catch (err) {
      console.error('Error toggling schedule state:', err);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في إلغاء وحذف هذه الجدولة؟')) return;
    try {
      const res = await fetch(`/api/v1/schedules/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'تم حذف المهمة المجدولة بنجاح', type: 'success' });
        fetchSchedules();
      }
    } catch (err) {
      console.error('Error deleting schedule:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Upper header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Calendar className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">جدولة المهام وحملات البريد الدورية (Scheduling Engine)</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            أنشئ حملات بريد مجدولة لمرة واحدة أو مهام تكرارية دورية (يومية، أسبوعية، شهرية) مع تتبع أوقات الإرسال القادمة والتبيهات المسبقة.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchSchedules}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all flex items-center gap-2 text-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            تحديث القائمة
          </button>
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all flex items-center gap-2 text-xs shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            إنشاء مهمة جدولة جديدة
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span className="font-semibold">{message.text}</span>
        </div>
      )}

      {/* Campaign Scheduling Form */}
      {isFormOpen && (
        <form onSubmit={handleCreateSchedule} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" />
            تحديد خيارات الجدولة والإرسال
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Task Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">اسم المهمة / الحملة *</label>
              <input
                type="text"
                required
                placeholder="مثال: النشرة الإخبارية الأسبوعية للعملاء"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Task Type */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">نوع الجدولة *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType('one_shot')}
                  className={`py-2.5 rounded-xl border font-semibold text-xs transition-all ${
                    type === 'one_shot'
                      ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-md shadow-indigo-500/5'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  مرة واحدة (One-shot)
                </button>
                <button
                  type="button"
                  onClick={() => setType('recurring')}
                  className={`py-2.5 rounded-xl border font-semibold text-xs transition-all ${
                    type === 'recurring'
                      ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-md shadow-indigo-500/5'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  متكرر دورياً (Recurring)
                </button>
              </div>
            </div>

            {/* Dynamic frequency controls */}
            {type === 'recurring' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">دورية التكرار *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['daily', 'weekly', 'monthly'] as const).map(freq => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setFrequency(freq)}
                      className={`py-2 rounded-lg border font-medium text-xs capitalize transition-all ${
                        frequency === freq
                          ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {freq === 'daily' ? 'يومي' : freq === 'weekly' ? 'أسبوعي' : 'شهري'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Scheduled Time */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                {type === 'one_shot' ? 'تاريخ ووقت الإرسال *' : 'وقت الإرسال المعتاد (HH:MM) *'}
              </label>
              <input
                type={type === 'one_shot' ? 'datetime-local' : 'text'}
                required
                placeholder={type === 'one_shot' ? '' : 'مثال: 09:30'}
                value={scheduledTime}
                onChange={e => setScheduledTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Day of Week for weekly */}
            {type === 'recurring' && frequency === 'weekly' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">يوم الإرسال المفضل *</label>
                <select
                  value={dayOfWeek}
                  onChange={e => setDayOfWeek(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                >
                  <option value="0">الأحد (Sunday)</option>
                  <option value="1">الاثنين (Monday)</option>
                  <option value="2">الثلاثاء (Tuesday)</option>
                  <option value="3">الأربعاء (Wednesday)</option>
                  <option value="4">الخميس (Thursday)</option>
                  <option value="5">الجمعة (Friday)</option>
                  <option value="6">السبت (Saturday)</option>
                </select>
              </div>
            )}

            {/* Day of Month for monthly */}
            {type === 'recurring' && frequency === 'monthly' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">يوم الإرسال من الشهر *</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={dayOfMonth}
                  onChange={e => setDayOfMonth(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            )}

            {/* From Email */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">عنوان البريد المرسل منه</label>
              <input
                type="email"
                value={fromEmail}
                onChange={e => setFromEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* To Emails */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block">عناوين المستلمين (مفصولة بفواصل) *</label>
              <input
                type="text"
                required
                placeholder="customer1@domain.com, customer2@domain.com"
                value={toEmails}
                onChange={e => setToEmails(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Subject */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block">عنوان الرسالة (Subject) *</label>
              <input
                type="text"
                required
                placeholder="أدخل موضوع البريد الإلكتروني"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Body */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block">محتوى البريد (HTML Content)</label>
              <textarea
                rows={5}
                placeholder="<p>محتوى البريد الإلكتروني المنسق...</p>"
                value={htmlContent}
                onChange={e => setHtmlContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono transition-all"
              />
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/10"
            >
              حفظ وجدولة الإرسال
            </button>
          </div>
        </form>
      )}

      {/* Schedules List Dashboard */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 space-x-reverse">
            <CalendarDays className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-sm">الحملات والمهام المجدولة النشطة</h3>
          </div>
          <span className="bg-slate-950 text-slate-400 text-[11px] px-3 py-1 rounded-full border border-slate-800 font-mono">
            العدد الإجمالي: {schedules.length} مهمة مجدولة
          </span>
        </div>

        {schedules.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
            <Calendar className="w-12 h-12 text-slate-700 mb-3" />
            <h4 className="text-sm font-bold text-slate-400">لا توجد مهام مجدولة حالياً</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              اضغط على زر "إنشاء مهمة جدولة جديدة" لتجربة معالج الجدولة الدورية والتحكم التلقائي.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-950/50 border-b border-slate-800 text-xs text-slate-400 font-semibold">
                  <th className="p-4">اسم المهمة والنوع</th>
                  <th className="p-4">جدول الإرسال</th>
                  <th className="p-4">المستلمون</th>
                  <th className="p-4">العنوان الرئيسي (Subject)</th>
                  <th className="p-4">الإرسال القادم</th>
                  <th className="p-4">التحذيرات (24h Alert)</th>
                  <th className="p-4 text-left">التحكم والعمليات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {schedules.map(task => {
                  const isUpcoming24h = new Date(task.next_run_at).getTime() - Date.now() <= 24 * 60 * 60 * 1000 && new Date(task.next_run_at).getTime() > Date.now();
                  return (
                    <tr key={task.id} className="hover:bg-slate-900/40 transition-colors">
                      {/* Name & Type */}
                      <td className="p-4">
                        <div className="font-semibold text-white">{task.name}</div>
                        <div className="mt-1">
                          {task.type === 'one_shot' ? (
                            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md text-[10px] font-medium">
                              مرة واحدة
                            </span>
                          ) : (
                            <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-md text-[10px] font-medium">
                              متكرر ({task.frequency === 'daily' ? 'يومياً' : task.frequency === 'weekly' ? 'أسبوعياً' : 'شهرياً'})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Config time */}
                      <td className="p-4 font-mono text-slate-300">
                        {task.type === 'recurring' ? (
                          <div className="flex items-center gap-1.5 justify-end">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>{task.scheduled_time}</span>
                            {task.frequency === 'weekly' && <span className="text-slate-500 text-[10px]">(يوم {task.day_of_week})</span>}
                            {task.frequency === 'monthly' && <span className="text-slate-500 text-[10px]">(يوم {task.day_of_month} بالشهر)</span>}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 justify-end">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>{new Date(task.scheduled_time).toLocaleString('ar-EG')}</span>
                          </div>
                        )}
                      </td>

                      {/* Recipients */}
                      <td className="p-4 text-slate-300 max-w-xs truncate">
                        <div className="flex items-center gap-1.5 justify-end">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>{task.to_emails.join(', ')}</span>
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="p-4 font-medium text-slate-200">
                        {task.subject}
                      </td>

                      {/* Next Send Run */}
                      <td className="p-4">
                        {task.is_active ? (
                          <div className="font-mono text-indigo-400 font-semibold">
                            {new Date(task.next_run_at).toLocaleString('ar-EG')}
                          </div>
                        ) : (
                          <span className="text-slate-500">متوقف</span>
                        )}
                      </td>

                      {/* 24 hour Alert Warning Indicator */}
                      <td className="p-4">
                        {task.is_active && isUpcoming24h ? (
                          <span className="bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5 w-max">
                            <Bell className="w-3.5 h-3.5 animate-bounce" />
                            على وشك البدء (&lt;24س)
                          </span>
                        ) : task.is_active ? (
                          <span className="text-slate-500 font-medium flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            مجدول بأمان
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      {/* Controls */}
                      <td className="p-4 text-left">
                        <div className="flex items-center gap-2 justify-start">
                          <button
                            onClick={() => handleToggleActive(task)}
                            className={`p-2 rounded-lg border transition-all ${
                              task.is_active 
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20' 
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            }`}
                            title={task.is_active ? 'إيقاف مؤقت' : 'تفعيل'}
                          >
                            {task.is_active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(task.id)}
                            className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
                            title="حذف وإلغاء"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
