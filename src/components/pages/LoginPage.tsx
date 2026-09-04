import React, { useState } from 'react';
import { Key, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';

export const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({ secretKey: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.secretKey) return;
    
    // Dispatch the async thunk, which handles API call, localStorage, and state updates
    dispatch(loginUser({ secretKey: formData.secretKey }));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative font-['Cairo',sans-serif] overflow-hidden text-right" dir="rtl">
      
      {/* Background Decorators */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400" />
          
          <div className="text-center space-y-3 mb-8">
            <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl mx-auto flex items-center justify-center font-bold">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-white">تسجيل دخول المسؤول</h2>
            <p className="text-sm text-slate-400">بوابة إدارة منصة البريد الإلكتروني عالية الأداء (ESP)</p>
          </div>

          {auth.error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{auth.error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-slate-300 block mb-2 font-semibold text-sm">المفتاح السري (Admin Secret Key):</label>
              <div className="relative">
                <Key className="w-5 h-5 text-slate-500 absolute top-3.5 right-4" />
                <input
                  type="password"
                  required
                  value={formData.secretKey}
                  onChange={(e) => setFormData({ secretKey: e.target.value })}
                  placeholder="أدخل المفتاح السري..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-11 pl-4 py-3 text-white font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-left"
                  dir="ltr"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                المفتاح الافتراضي: <code className="text-indigo-400 font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded">admin123</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={auth.loading || !formData.secretKey}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {auth.loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري التحقق...</span>
                </>
              ) : (
                <>
                  <span>دخول النظام</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>نظام حماية صارم 256-bit AES</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
