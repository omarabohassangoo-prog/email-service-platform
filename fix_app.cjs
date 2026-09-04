const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Fix the useEffect
content = content.replace(`    if (!auth.isAuthenticated) {
    return <LoginPage />;
  }
  return () => clearInterval(interval);`, `    return () => clearInterval(interval);`);

// Find the last return ( which is for the component rendering
const lastReturnIndex = content.lastIndexOf('  return (');
if (lastReturnIndex !== -1) {
  const replacement = `  if (!auth.isAuthenticated) {
    return <LoginPage />;
  }

  return (`;
  content = content.substring(0, lastReturnIndex) + replacement + content.substring(lastReturnIndex + '  return ('.length);
}

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx fixed');
