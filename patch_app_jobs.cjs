const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace("fetch('/api/v1/audit-logs', { headers: authHeaders }).then(r => r.json()).catch(() => ({ logs: [] }))", "fetch('/api/v1/audit-logs', { headers: authHeaders }).then(r => r.json()).catch(() => ({ logs: [] })),\n        fetch('/api/v1/admin/jobs', { headers: authHeaders }).then(r => r.json()).catch(() => ({ jobs: [] }))");

content = content.replace("const [healthRes, statsRes, tmplRes, keysRes, provRes, auditRes] = await Promise.all([", "const [healthRes, statsRes, tmplRes, keysRes, provRes, auditRes, jobsRes] = await Promise.all([");

content = content.replace("if (auditRes?.logs) setAuditLogs(auditRes.logs);", "if (auditRes?.logs) setAuditLogs(auditRes.logs);\n      if (jobsRes?.jobs) setJobs(jobsRes.jobs);");

content = content.replace("const interval = setInterval(fetchData, 4000);", "const interval = setInterval(fetchData, 30000);");

fs.writeFileSync('src/App.tsx', content);
console.log('App patched');
