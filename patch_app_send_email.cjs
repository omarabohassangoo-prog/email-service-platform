const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace activeTab === 'sdk' block entirely if needed, or add send-email before it
const replacement = `{activeTab === 'send-email' && (
          <EmailSendPage />
        )}
        
        {activeTab === 'sdk' && (`;
content = content.replace("{activeTab === 'sdk' && (", replacement);

// Fix QuickActions in DashboardOverview to navigate to 'send-email' instead of 'sdk'
let dashboardContent = fs.readFileSync('src/components/dashboard/QuickActions.tsx', 'utf8');
dashboardContent = dashboardContent.replace("onNavigateTab('sdk')", "onNavigateTab('send-email')");
fs.writeFileSync('src/components/dashboard/QuickActions.tsx', dashboardContent);

fs.writeFileSync('src/App.tsx', content);
console.log('App patched');
