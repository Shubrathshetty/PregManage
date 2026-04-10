const fs = require('fs');
let content = fs.readFileSync('frontend/admin-dashboard.html', 'utf8');

// 1. Remove home visits stat card
content = content.replace(/<div class=\"stat-card\" style=\"cursor: pointer;\" onclick=\"window\.location\.href='\/home-visits\.html'\">[\s\S]*?<\/div>/s, '');

// 2. Remove loadStats logic for home visits
content = content.replace(/const resV = await apiClient\.fetch\(`\$\{API_BASE\}\/admin\/home-visits`.*?document\.getElementById\('home-visits-count'\)\.textContent = dataV\.visits\.length;\s*\}/s, '');

fs.writeFileSync('frontend/admin-dashboard.html', content);
console.log('done admin-dashboard.html');
