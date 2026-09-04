import React, { useState } from 'react';
import { 
  Zap, Cpu, Server, Activity, Flame, ShieldAlert, CheckCircle2, 
  Layers, Database, ArrowUpRight, Play, RefreshCw, Copy, Check,
  Sliders, Gauge, FileCode, Terminal, LineChart
} from 'lucide-react';
import { ResponsiveContainer, LineChart as ReLineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const PerformanceSpecsView: React.FC = () => {
  const [activeLevel, setActiveLevel] = useState<'level1' | 'level2' | 'level3' | 'config'>('level1');
  const [activeConfigTab, setActiveConfigTab] = useState<'nginx' | 'docker' | 'cluster' | 'k6'>('nginx');
  
  // Load Test Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Simulated metrics during load test
  const [simulatedData, setSimulatedData] = useState([
    { time: '00:00', vus: 100, rps: 100, latency: 18 },
    { time: '00:05', vus: 250, rps: 250, latency: 22 },
    { time: '00:10', vus: 500, rps: 500, latency: 29 },
    { time: '00:15', vus: 750, rps: 750, latency: 36 },
    { time: '00:20', vus: 1000, rps: 1000, latency: 42 },
  ]);

  const handleRunLoadSimulation = () => {
    setIsSimulating(true);
    setSimStep(1);

    setTimeout(() => setSimStep(2), 1200);
    setTimeout(() => setSimStep(3), 2400);
    setTimeout(() => {
      setSimStep(4);
      setIsSimulating(false);
    }, 3600);
  };

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const nginxConfig = `upstream email_backend {
  least_conn;
  server backend1:3000 weight=3;
  server backend2:3000 weight=2;
  server backend3:3000 weight=1;
  keepalive 32;
}

server {
  listen 80;
  location /api/ {
    proxy_pass http://email_backend;
    proxy_http_version 1.1;
    proxy_set_header Connection 'upgrade';
    proxy_connect_timeout 5s;
    proxy_read_timeout 30s;
  }
}`;

  const dockerCompose = `version: '3.8'
services:
  api-gateway:
    image: email-service-api
    ports: ["3000:3000"]
    deploy:
      replicas: 3
      resources:
        limits: { cpus: '1', memory: '1G' }

  email-processor:
    image: email-service-processor
    deploy:
      replicas: 5
      resources:
        limits: { cpus: '2', memory: '2G' }

  redis:
    image: redis:7-alpine
    deploy:
      replicas: 3`;

  const clusterCode = `import cluster from 'cluster';
import os from 'os';
import { app } from './app';

const workers = Math.max(1, os.cpus().length - 1);

if (cluster.isPrimary) {
  for (let i = 0; i < workers; i++) cluster.fork();
  cluster.on('exit', () => cluster.fork());
} else {
  app.listen(3000);
}`;

  const k6Script = `import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '3m', target: 500 },
    { duration: '5m', target: 1000 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.post('http://localhost:3000/api/v1/email/send', JSON.stringify({
    to: 'test@example.com', subject: 'Load Test', html: '<h1>High Load</h1>'
  }), { headers: { 'Content-Type': 'application/json', 'X-API-Key': __ENV.API_KEY } });
  check(res, { 'status is 202': (r) => r.status === 202 });
  sleep(1);
}`;

  return (
    <div className="space-y-6">
      
      {/* Header Banner Document Info */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-400" />

        <div>
          <div className="flex items-center gap-2">
            <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold">
              HP-ESP-2026-001 v1.0.0
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
              أهداف الأداء العالي والتوسع
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            <span>استراتيجيات التعامل مع الضغط العالي والتحسين المتقدم</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            دليل التوسع لمواجهة 10,000 اتصال متزامن و 100 بريد/ثانية مع معمارية العمال الموزعين وإدارة الاتصالات
          </p>
        </div>

        <button
          onClick={handleRunLoadSimulation}
          disabled={isSimulating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50"
        >
          {isSimulating ? (
            <RefreshCw className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span>{isSimulating ? 'جاري محاكاة ضغط k6...' : 'محاكاة اختبار الإجهاد (k6 Benchmark)'}</span>
        </button>
      </div>

      {/* Load Simulation Result Toast */}
      {simStep > 0 && (
        <div className="p-4 bg-slate-900 border border-rose-500/30 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {simStep === 1 && '🚀 بدء ضغط k6: 100 مستخدم متزامن (100 req/s)'}
                {simStep === 2 && '🔥 تصاعد الحمل: 500 مستخدم متزامن (500 req/s)'}
                {simStep === 3 && '⚡ أقصى حمولة: 1000 مستخدم متزامن (1000 req/s)'}
                {simStep === 4 && '✅ اكتمل إجهاد k6 بنجاح! جميع الطلبات استجابت خلال < 42ms دون أي فقد'}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                معدل الاستجابة المتوسط p95: <strong className="text-emerald-400 font-mono">34ms</strong> &bull; معدل النجاح: <strong className="text-emerald-400 font-mono">100%</strong>
              </p>
            </div>
          </div>

          <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
            Pass SLA &lt; 50ms
          </span>
        </div>
      )}

      {/* Target Objectives KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>سرعة الاستجابة Target SLA</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">&lt; 50ms</div>
          <span className="text-[11px] text-emerald-400 font-semibold block">Processing &lt; 500ms</span>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>معدل الإنتاجية المستهدف</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">100 /sec</div>
          <span className="text-[11px] text-indigo-400 font-semibold block">360,000 بريد / ساعة</span>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>الاتصالات المتزامنة</span>
            <Sliders className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">10,000</div>
          <span className="text-[11px] text-amber-400 font-semibold block">حجم الطابور 1,000,000</span>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>التوفر والتعافي SLA</span>
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">99.99%</div>
          <span className="text-[11px] text-sky-400 font-semibold block">Failover &lt; 10s</span>
        </div>

      </div>

      {/* Performance Latency Graph Simulation */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <LineChart className="w-5 h-5 text-indigo-400" />
            <span>منحنى زمن الاستجابة والتحمل تحت الضغط العالي (k6 Benchmark Curve)</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">VUs: Virtual Users</span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ReLineChart data={simulatedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} />
              <Line type="monotone" dataKey="latency" name="Latency (ms)" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="rps" name="Requests/sec" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            </ReLineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Level Strategy Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveLevel('level1')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeLevel === 'level1'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          المستوى 1: التحسينات الأساسية (Pooling, Cache, Compression)
        </button>

        <button
          onClick={() => setActiveLevel('level2')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeLevel === 'level2'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          المستوى 2: التحسينات المتقدمة (Parallel Workers, Partitioning)
        </button>

        <button
          onClick={() => setActiveLevel('level3')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeLevel === 'level3'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          المستوى 3: تحسينات خبيرة (Microservices & Cluster)
        </button>

        <button
          onClick={() => setActiveLevel('config')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeLevel === 'config'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          إعدادات البنية والتست (Docker & Nginx & k6)
        </button>
      </div>

      {/* Level 1 Content */}
      {activeLevel === 'level1' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <Database className="w-4 h-4" />
              <span>إدارة الاتصالات (Connection Pooling)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              تحديد Pool Size لـ PostgreSQL بـ 50 اتصال ولـ Redis بـ 100 عميل مع مهلة استراحة idleTimeout = 10s لمنع استهلاك الموارد.
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300">
              poolSize: 50<br />
              idleTimeoutMillis: 10000<br />
              connectionTimeoutMillis: 2000
            </div>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Zap className="w-4 h-4" />
              <span>الضغط المتكيف (Gzip/Deflate)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              تطبيق ضغط zlib على الردود البرمجية وبدء الضغط فقط عند تجاوز الاستجابة 1KB وتقليل حجم استهلاك النطاق الترددي.
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300">
              threshold: 1024<br />
              compressionLevel: 6<br />
              chunkSize: 16384
            </div>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
              <Layers className="w-4 h-4" />
              <span>التخزين المؤقت (Multi-Tier Caching)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              تخزين القوالب لـ 3600 ثانية، ومفاتيح API لـ 300 ثانية، وإعدادات المزودين لـ 600 ثانية لتسريع القراءة الفورية.
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300">
              Template Cache: 3600s<br />
              API Key Cache: 300s<br />
              Status Cache: 60s
            </div>
          </div>
        </div>
      )}

      {/* Level 2 Content */}
      {activeLevel === 'level2' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>توزيع العمال الموازين بحسب الأولوية (Priority Worker Scaling)</span>
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-rose-400 font-bold">قناة الأولوية العالية (High)</span>
                <span className="font-mono text-white">20 Workers &bull; Timeout 30s</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-indigo-400 font-bold">قناة البريد العادي (Normal)</span>
                <span className="font-mono text-white">15 Workers &bull; Timeout 60s</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-sky-400 font-bold">قناة البريد الجماعي (Bulk)</span>
                <span className="font-mono text-white">10 Workers &bull; Timeout 120s</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-bold">قناة المنخفض (Low)</span>
                <span className="font-mono text-white">5 Workers &bull; Timeout 120s</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>فهارس الجداول المتقاطعة والتقسيم (Partitioning & Indexing)</span>
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <p>فهارس كفؤة معتمدة لتقليل زمن الاستعلامات إلى &lt; 10ms:</p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-indigo-300">
                CREATE INDEX idx_email_jobs_status_created ON email_jobs(status, created_at DESC);<br />
                CREATE INDEX idx_email_jobs_api_key ON email_jobs(api_key_id, status);
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Level 3 Content */}
      {activeLevel === 'level3' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-rose-400" />
            <span>معمارية الخدمات المصغرة (Microservices Topography)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-indigo-400 font-bold block">API Gateway (Port 3000)</span>
              <span className="text-slate-400 block">3 Replicas &bull; JWT & Rate Limit</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-emerald-400 font-bold block">Email Processor (Port 3001)</span>
              <span className="text-slate-400 block">5 Replicas &bull; Nodemailer SMTP</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-sky-400 font-bold block">Queue Manager (Port 3002)</span>
              <span className="text-slate-400 block">2 Replicas &bull; Bull & Redis Coordinator</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-amber-400 font-bold block">Analytics Service (Port 3003)</span>
              <span className="text-slate-400 block">2 Replicas &bull; Prometheus Engine</span>
            </div>
          </div>
        </div>
      )}

      {/* Infrastructure Config Viewer */}
      {activeLevel === 'config' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveConfigTab('nginx')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  activeConfigTab === 'nginx' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Nginx Load Balancer
              </button>
              <button
                onClick={() => setActiveConfigTab('docker')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  activeConfigTab === 'docker' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Docker Compose
              </button>
              <button
                onClick={() => setActiveConfigTab('cluster')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  activeConfigTab === 'cluster' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Node.js Cluster TS
              </button>
              <button
                onClick={() => setActiveConfigTab('k6')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  activeConfigTab === 'k6' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                k6 Script Benchmark
              </button>
            </div>

            <button
              onClick={() => {
                const codeMap = { nginx: nginxConfig, docker: dockerCompose, cluster: clusterCode, k6: k6Script };
                copyCode(codeMap[activeConfigTab], activeConfigTab);
              }}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-white"
            >
              {copiedCode === activeConfigTab ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode === activeConfigTab ? 'تم النسخ' : 'نسخ النص'}</span>
            </button>
          </div>

          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-200 overflow-x-auto leading-relaxed">
            <code>
              {activeConfigTab === 'nginx' && nginxConfig}
              {activeConfigTab === 'docker' && dockerCompose}
              {activeConfigTab === 'cluster' && clusterCode}
              {activeConfigTab === 'k6' && k6Script}
            </code>
          </pre>
        </div>
      )}

    </div>
  );
};
