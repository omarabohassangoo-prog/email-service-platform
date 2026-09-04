const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add imports
const importsToAdd = `
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './store';
import { logout } from './store/slices/authSlice';
import { LoginPage } from './components/pages/LoginPage';
`;

content = content.replace("import { AuthModal } from './components/AuthModal';", importsToAdd + "import { AuthModal } from './components/AuthModal';");

// Replace states
content = content.replace("const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('esp_token') || 'admin-token-demo');", `
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const authToken = auth.accessToken;
`);

// Replace handleLogout
content = content.replace(`  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem('esp_token');
  };`, `  const handleLogout = () => {
    dispatch(logout());
  };`);

// Add conditional rendering for LoginPage before the main return
const renderBlock = `  if (!auth.isAuthenticated) {
    return <LoginPage />;
  }

  return (`;

content = content.replace("  return (", renderBlock);

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx patched');
