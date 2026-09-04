import React, { useState } from 'react';
import { Lock, Key, ShieldCheck, AlertCircle, X, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [secretKey, setSecretKey] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret_key: secretKey })
      });

      const data = await res.json();
      if (res.ok && data.access_token) {
        onLoginSuccess(data.access_token);
        onClose();
      } else {
        setErrorMsg(data.message || 'المفتاح السري غير صحيح');
      }
    } catch (err: any) {
      setErrorMsg('تعذر الاتصال بـ API Gateway');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400" />

        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/20">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">تسجيل دخول مسؤول الخدمة</h3>
          <p className="text-xs text-slate-400">
            أدخل المفتاح السري للمسؤول (Secret Key) للحصول على رمز JWT (صلاحية 24h)
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1.5 font-semibold">المفتاح السري (Admin Secret Key):</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
              <input
                type="password"
                required
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="أدخل المفتاح..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-4 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">المفتاح الافتراضي للتجربة: <code className="text-indigo-300 font-mono">admin123</code></p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-2/3 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {isLoading ? 'جاري التحقق...' : 'دخول النظام'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
