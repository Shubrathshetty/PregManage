const fs = require('fs');
let content = fs.readFileSync('frontend/summary.html', 'utf8');

// 1. Remove Service Type Step HTML
content = content.replace(/<!-- ====== STEP 3: Service Type Selection ====== -->.*?<!-- ====== STEP 3\.5: Hospital Details Form ====== -->/s, '<!-- ====== STEP 3.5: Hospital Details Form ====== -->');

// 2. Remove Home Visit Form HTML
content = content.replace(/<!-- ====== STEP 3\.6: Home Visit Form ====== -->.*?<!-- ====== WhatsApp Confirmation Modal ====== -->/s, '<!-- ====== WhatsApp Confirmation Modal ====== -->');

// 3. Fix JS selectConsultation to target step-hospital-form directly
content = content.replace(/document\.getElementById\('step-service-type'\)\.classList\.remove\('hidden'\);/, "document.getElementById('step-hospital-form').classList.remove('hidden');");

// 4. Also fix the Back button on the Hospital Details Form so it goes back to step-consultation instead of step-service-type
content = content.replace(/document\.getElementById\('step-hospital-form'\)\.classList\.add\('hidden'\); document\.getElementById\('step-service-type'\)\.classList\.remove\('hidden'\);/, "document.getElementById('step-hospital-form').classList.add('hidden'); document.getElementById('step-consultation').classList.remove('hidden');");

// 5. Remove selectServiceType function JS
content = content.replace(/async function selectServiceType\(type\) \{.*?\}/s, '');

// 6. Remove Home form submit JS
content = content.replace(/\/\/ Handle home form submission.*?\}\);/s, '');

fs.writeFileSync('frontend/summary.html', content);
console.log('done summary.html');
