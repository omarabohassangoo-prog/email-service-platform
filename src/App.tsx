import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { DashboardOverview } from './components/DashboardOverview';
import { QueueMonitor } from './components/QueueMonitor';
import { TemplateManager } from './components/TemplateManager';
import { ApiKeysManager } from './components/ApiKeysManager';
import { ProvidersManager } from './components/ProvidersManager';
import { SchedulesManager } from './components/SchedulesManager';
import { EmailSendPage } from './components/pages/EmailSendPage';
import { SdkPlayground } from './components/SdkPlayground';
import { AnalyticsView } from './components/AnalyticsView';
import { LibrariesView } from './components/LibrariesView';
import { PerformanceSpecsView } from './components/PerformanceSpecsView';
import { DeliverabilityStandardsView } from './components/DeliverabilityStandardsView';
import { VercelSpecsView } from './components/VercelSpecsView';
import { DeploymentSpecsView } from './components/DeploymentSpecsView';
import { DevEnvSetupView } from './components/DevEnvSetupView';
import { DatabaseSchemaView } from './components/DatabaseSchemaView';
import { RedisCacheView } from './components/RedisCacheView';
import { ProjectStructureView } from './components/ProjectStructureView';
import { EntitiesDesignView } from './components/EntitiesDesignView';
import { CoreServicesView } from './components/CoreServicesView';
import { ApiRoutesDesignView } from './components/ApiRoutesDesignView';
import { FrontendArchitectureView } from './components/FrontendArchitectureView';
import { RiskAnalysisView } from './components/RiskAnalysisView';
import { AuditLogsView } from './components/AuditLogsView';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './store';
import { logout } from './store/slices/authSlice';
import { LoginPage } from './components/pages/LoginPage';

import { 
  SystemHealth, QueueMetrics, EmailJob, EmailTemplate, 
  ApiKey, ProviderConfig, AuditLog, AnalyticsStats 
} from './types';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const authToken = auth.accessToken;


  // System States
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [queueMetrics, setQueueMetrics] = useState<QueueMetrics | null>(null);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [jobs, setJobs] = useState<EmailJob[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const getAuthHeaders = (extraHeaders: Record<string, string> = {}) => {
    const headers: Record<string, string> = { ...extraHeaders };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      const authHeaders = getAuthHeaders();
      const [healthRes, statsRes, tmplRes, keysRes, provRes, auditRes, jobsRes] = await Promise.all([
        fetch('/api/v1/admin/health', { headers: authHeaders }).then(r => r.json()).catch(() => null),
        fetch('/api/v1/admin/stats', { headers: authHeaders }).then(r => r.json()).catch(() => null),
        fetch('/api/v1/templates', { headers: authHeaders }).then(r => r.json()).catch(() => ({ templates: [] })),
        fetch('/api/v1/api-keys', { headers: authHeaders }).then(r => r.json()).catch(() => ({ keys: [] })),
        fetch('/api/v1/providers', { headers: authHeaders }).then(r => r.json()).catch(() => ({ providers: [] })),
        fetch('/api/v1/audit-logs', { headers: authHeaders }).then(r => r.json()).catch(() => ({ logs: [] })),
        fetch('/api/v1/admin/jobs', { headers: authHeaders }).then(r => r.json()).catch(() => ({ jobs: [] }))
      ]);

      if (healthRes) setHealth(healthRes);
      if (statsRes) {
        setStats(statsRes);
        setQueueMetrics(statsRes.queue);
      }
      if (tmplRes?.templates) setTemplates(tmplRes.templates);
      if (keysRes?.keys) setApiKeys(keysRes.keys);
      if (provRes?.providers) setProviders(provRes.providers);
      if (auditRes?.logs) setAuditLogs(auditRes.logs);
      if (jobsRes?.jobs) setJobs(jobsRes.jobs);

      // Fetch recent email jobs using first API key
      const firstKey = keysRes?.keys?.[0]?.key || 'esp_live_9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c';
      const statusRes = await fetch('/api/v1/email/status/job-101', {
        headers: getAuthHeaders({ 'X-API-Key': firstKey })
      }).catch(() => null);

    } catch (err) {
      console.error('Error fetching ESP platform data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 4s polling for queue & metrics

  return () => clearInterval(interval);
  }, [authToken]); // refetch when token changes

  // Action handlers
  const handlePauseQueue = async () => {
    await fetch('/api/v1/admin/queue/pause', { 
      method: 'POST',
      headers: getAuthHeaders()
    });
    fetchData();
  };

  const handleResumeQueue = async () => {
    await fetch('/api/v1/admin/queue/resume', { 
      method: 'POST',
      headers: getAuthHeaders()
    });
    fetchData();
  };

  const handleRetryJob = async (jobId: string) => {
    fetchData();
  };

  // Templates
  const handleCreateTemplate = async (data: Partial<EmailTemplate>) => {
    await fetch('/api/v1/templates', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data)
    });
    fetchData();
  };

  const handleUpdateTemplate = async (id: string, data: Partial<EmailTemplate>) => {
    await fetch(`/api/v1/templates/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data)
    });
    fetchData();
  };

  const handleDeleteTemplate = async (id: string) => {
    await fetch(`/api/v1/templates/${id}`, { 
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    fetchData();
  };

  const handleDuplicateTemplate = async (id: string) => {
    await fetch(`/api/v1/templates/${id}/duplicate`, { 
      method: 'POST',
      headers: getAuthHeaders()
    });
    fetchData();
  };

  const handleSendTestEmail = async (id: string, to: string, data: Record<string, any>) => {
    const firstKey = apiKeys[0]?.key || 'esp_live_9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c';
    await fetch(`/api/v1/templates/${id}/test`, {
      method: 'POST',
      headers: getAuthHeaders({ 
        'Content-Type': 'application/json',
        'X-API-Key': firstKey
      }),
      body: JSON.stringify({ to, data })
    });
    fetchData();
  };

  // API Keys
  const handleCreateApiKey = async (data: Partial<ApiKey>) => {
    await fetch('/api/v1/api-keys', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data)
    });
    fetchData();
  };

  const handleToggleApiKey = async (id: string) => {
    await fetch(`/api/v1/api-keys/${id}/toggle`, { 
      method: 'PUT',
      headers: getAuthHeaders()
    });
    fetchData();
  };

  const handleDeleteApiKey = async (id: string) => {
    await fetch(`/api/v1/api-keys/${id}`, { 
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    fetchData();
  };

  // Providers
  const handleUpdateProvider = async (id: string, data: Partial<ProviderConfig>) => {
    await fetch(`/api/v1/providers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data)
    });
    fetchData();
  };

  const handleTestProvider = async (providerId: string, testEmail: string) => {
    const res = await fetch('/api/v1/admin/test', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ to: testEmail, provider: providerId })
    });
    return res.json();
  };

  // SDK Execution
  const handleExecuteSdkTest = async (action: string, params: any, apiKeyStr: string) => {
    const res = await fetch('/api/v1/sdk/test', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-API-Key': apiKeyStr
      },
      body: JSON.stringify({ action, params })
    });
    fetchData();
    return res.json();
  };


  const handleLogout = () => {
    dispatch(logout());
  };

  if (!auth.isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Cairo',sans-serif]">
      
      {/* Top Header Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAuthenticated={!!authToken}
        onLogout={handleLogout}
        health={health}
        queueMetrics={queueMetrics}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            stats={stats}
            health={health}
            queue={queueMetrics}
            recentJobs={jobs}
            onRefresh={fetchData}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'queue' && (
          <QueueMonitor
            jobs={jobs}
            queueMetrics={queueMetrics}
            onPauseQueue={handlePauseQueue}
            onResumeQueue={handleResumeQueue}
            onRefresh={fetchData}
            onRetryJob={handleRetryJob}
          />
        )}

        {activeTab === 'templates' && (
          <TemplateManager
            templates={templates}
            onCreateTemplate={handleCreateTemplate}
            onUpdateTemplate={handleUpdateTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onDuplicateTemplate={handleDuplicateTemplate}
            onSendTestEmail={handleSendTestEmail}
          />
        )}

        {activeTab === 'api-keys' && (
          <ApiKeysManager
            apiKeys={apiKeys}
            onCreateKey={handleCreateApiKey}
            onToggleKey={handleToggleApiKey}
            onDeleteKey={handleDeleteApiKey}
          />
        )}

        {activeTab === 'providers' && (
          <ProvidersManager
            providers={providers}
            onUpdateProvider={handleUpdateProvider}
            onTestProvider={handleTestProvider}
          />
        )}

        {activeTab === 'schedules' && (
          <SchedulesManager />
        )}

        {activeTab === 'performance' && (
          <PerformanceSpecsView />
        )}

        {activeTab === 'deliverability' && (
          <DeliverabilityStandardsView />
        )}

        {activeTab === 'vercel' && (
          <VercelSpecsView />
        )}

        {activeTab === 'devenv' && (
          <DevEnvSetupView />
        )}

        {activeTab === 'dbschema' && (
          <DatabaseSchemaView />
        )}

        {activeTab === 'rediscache' && (
          <RedisCacheView />
        )}

        {activeTab === 'projectstruct' && (
          <ProjectStructureView />
        )}

        {activeTab === 'entitiesdesign' && (
          <EntitiesDesignView />
        )}

        {activeTab === 'coreservices' && (
          <CoreServicesView />
        )}

        {activeTab === 'apiroutes' && (
          <ApiRoutesDesignView />
        )}

        {activeTab === 'frontendui' && (
          <FrontendArchitectureView />
        )}

        {activeTab === 'deployment' && (
          <DeploymentSpecsView />
        )}

        {activeTab === 'send-email' && (
          <EmailSendPage />
        )}
        
        {activeTab === 'sdk' && (
          <SdkPlayground
            apiKeys={apiKeys}
            onExecuteSdkTest={handleExecuteSdkTest}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView stats={stats} />
        )}

        {activeTab === 'risk' && (
          <RiskAnalysisView />
        )}

        {activeTab === 'libraries' && (
          <LibrariesView />
        )}

        {activeTab === 'audit' && (
          <AuditLogsView logs={auditLogs} />
        )}
      </main>

      {/* Auth Modal */}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>Enterprise Email Service Platform (ESP) v1.0.0 &bull; Microservices Architecture &bull; 99.99% Uptime SLA</p>
      </footer>

    </div>
  );
}

export default App;
