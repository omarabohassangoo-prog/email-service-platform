const fs = require('fs');
let content = fs.readFileSync('src/store/slices/authSlice.ts', 'utf8');

content = content.replace("  accessToken: string | null;", "  accessToken: string | null;\n  apiKey: string;");
content = content.replace("  accessToken: savedToken,", "  accessToken: savedToken,\n  apiKey: 'esp_live_secret_key_8899',");

fs.writeFileSync('src/store/slices/authSlice.ts', content);
console.log('authSlice patched');
