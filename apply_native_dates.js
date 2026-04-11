const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'patient-register.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Completely remove any Flatpickr related scripts/styles from the head if they exist
content = content.replace(/<link rel="stylesheet" href="https:\/\/cdn\.jsdelivr\.net\/npm\/flatpickr\/dist\/flatpickr\.min\.css">/g, '');
content = content.replace(/<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/flatpickr"><\/script>/g, '');

// 2. Clear out any custom Flatpickr styles if they are present
content = content.replace(/<style>\s*\/\* Modernized Flatpickr UI \*\/[\s\S]*?<\/style>/g, '');

// 3. Replace all custom date inputs with native ones
// DOB
content = content.replace(
    /<div class="input-with-icon">\s*<input type="text" id="dob"[\s\S]*?<iconify-icon icon="mdi:calendar"><\/iconify-icon>\s*<\/div>/g,
    '<input type="date" id="dob" class="form-input" required>'
);

// LMP Date
content = content.replace(
    /<div class="input-with-icon">\s*<input type="text" id="lmpDate"[\s\S]*?<iconify-icon icon="mdi:calendar"><\/iconify-icon>\s*<\/div>/g,
    '<input type="date" id="lmpDate" class="form-input" required>'
);

// EDD
content = content.replace(
    /<div class="input-with-icon">\s*<input type="text" id="edd"[\s\S]*?<iconify-icon icon="mdi:calendar"><\/iconify-icon>\s*<\/div>/g,
    '<input type="date" id="edd" class="form-input" required>'
);

// 4. Update the JavaScript logic to work with native date inputs
const nativeJSLogic = `
        // ---- Native Date Logic ----
        const todayStr = new Date().toISOString().split('T')[0];
        document.getElementById('dob').setAttribute('max', todayStr);
        document.getElementById('lmpDate').setAttribute('max', todayStr);

        // Auto-calculate EDD from LMP
        document.getElementById('lmpDate').addEventListener('change', (e) => {
            const val = e.target.value;
            if (val) {
                const edd = new Date(val);
                edd.setDate(edd.getDate() + 280);
                document.getElementById('edd').value = edd.toISOString().split('T')[0];
            }
        });

        document.getElementById('dob').addEventListener('change', (e) => {
            const val = e.target.value;
            if (!val) return;
            const dob = new Date(val);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
            document.getElementById('age').value = age;
            document.getElementById('age-hint').textContent = \`\${age} years old\`;
            document.getElementById('age-hint').style.color = 'var(--green-500)';
        });
`;

// Remove old Flatpickr config and replacing with native logic
content = content.replace(/\/\/ ---- Calendar JS \(Flatpickr\) Integration ----[\s\S]*?\}\);\s*\n/g, nativeJSLogic);
// Also catch the individual listener for DOB if it's there
content = content.replace(/\/\/ ---- DOB → Auto-calculate Age ----[\s\S]*?\}\);/g, '');

// 5. Update the population logic for editing
const populationLogic = `
                        // Set dates natively
                        if (p.dateOfBirth) {
                            const d = new Date(p.dateOfBirth);
                            document.getElementById('dob').value = d.toISOString().split('T')[0];
                            // Trigger age calculation
                            document.getElementById('dob').dispatchEvent(new Event('change'));
                        }
                        if (p.lmpDate) {
                            document.getElementById('lmpDate').value = new Date(p.lmpDate).toISOString().split('T')[0];
                        }
                        if (p.edd) {
                            document.getElementById('edd').value = new Date(p.edd).toISOString().split('T')[0];
                        }
`;

content = content.replace(/\/\/ Set dates in Flatpickr[\s\S]*?document\.querySelector\('#lmpDate'\)\._flatpickr\.setDate\(lmpDateObj\);/g, populationLogic);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated patient-register.html to use NATIVE date pickers with easy year selection');
