import React, { useState } from 'react';
import { Terminal } from 'lucide-react';
import { ApiKey } from '../types';
import { sdkService } from '../services/sdk.service';
import { SDKTestForm } from './sdk/SDKTestForm';
import { TestResults } from './sdk/TestResults';
import { PerformanceMetrics } from './sdk/PerformanceMetrics';

interface SdkPlaygroundProps {
  apiKeys: ApiKey[];
  onExecuteSdkTest?: (action: string, params: any, apiKeyStr: string) => Promise<any>;
}

export const SdkPlayground: React.FC<SdkPlaygroundProps> = ({ apiKeys }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentResult, setCurrentResult] = useState<any>(null);
  const [testHistory, setTestHistory] = useState<Array<{ success: boolean; responseTimeMs: number }>>([]);

  const handleRunTest = async (testType: 'send' | 'status' | 'template', params: any, apiKey: string) => {
    setIsRunning(true);
    try {
      const res = await sdkService.executeTest({
        action: testType,
        apiKey,
        params
      });
      setCurrentResult(res);
      setTestHistory(prev => [{ success: res.success, responseTimeMs: res.responseTimeMs }, ...prev]);
    } catch (err: any) {
      const errRes = {
        success: false,
        status: 500,
        data: { error: err.message },
        responseTimeMs: 120,
        timestamp: new Date().toISOString()
      };
      setCurrentResult(errRes);
      setTestHistory(prev => [{ success: false, responseTimeMs: 120 }, ...prev]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-['Cairo',sans-serif]" dir="rtl">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <span>مختبر واجهات SDK واختبار الـ API</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            اختبار تفاعلي لعمليات الإرسال، التحقق من الحالة، واستدعاء القوالب مع قياس الأداء اللحظي
          </p>
        </div>
      </div>

      {/* Performance Metrics Summary */}
      <PerformanceMetrics history={testHistory} />

      {/* Main Grid: Form & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SDKTestForm 
            apiKeys={apiKeys} 
            onRunTest={handleRunTest} 
            isRunning={isRunning} 
          />
        </div>

        <div>
          <TestResults result={currentResult} />
        </div>
      </div>

    </div>
  );
};
