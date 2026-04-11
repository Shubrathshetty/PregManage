const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'patient-register.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove Flatpickr scripts and styles (lines 15-104 approx, but we can do it by regex)
content = content.replace(/<!-- Flatpickr Datepicker -->[\s\S]*?<\/style>/, '');

// 2. Replace dob input
content = content.replace(
    /<div class="input-with-icon">\s*<input type="text" id="dob" class="form-input flatpickr-date"(.*?)(required>|required.*?)\s*<iconify-icon icon="mdi:calendar"><\/iconify-icon>\s*<\/div>/g,
    '<input type="date" id="dob" class="form-input" required>'
);

// 3. Replace lmpDate input
content = content.replace(
    /<div class="input-with-icon">\s*<input type="text" id="lmpDate" class="form-input flatpickr-date"(.*?)(required>|required.*?)\s*<iconify-icon icon="mdi:calendar"><\/iconify-icon>\s*<\/div>/g,
    '<input type="date" id="lmpDate" class="form-input" required>'
);

// 4. Replace edd input
content = content.replace(
    /<div class="input-with-icon">\s*<input type="text" id="edd" class="form-input"(.*?)(required>|required.*?)\s*<iconify-icon icon="mdi:calendar"><\/iconify-icon>\s*<\/div>/g,
    '<input type="date" id="edd" class="form-input" required>'
);

// 5. Replace Flatpickr JS Config with Native max date setter and native change listener
const oldJS = `        // ---- Calendar JS (Flatpickr) Integration ----
        const flatpickrConfig = {
            dateFormat: "Y-m-d",
            altInput: true,
            altFormat: "d-M-Y",
            allowInput: true,
            disableMobile: true,
            position: "below"
        };

        flatpickr("#dob", {
            ...flatpickrConfig,
            maxDate: "today"
        });

        const eddPicker = flatpickr("#edd", flatpickrConfig);

        flatpickr("#lmpDate", {
            ...flatpickrConfig,
            maxDate: "today",
            onChange: function (selectedDates, dateStr, instance) {
                if (selectedDates.length > 0) {
                    // Auto-calculate EDD from LMP
                    const lmp = selectedDates[0];
                    const edd = new Date(lmp);
                    edd.setDate(edd.getDate() + 280);
                    // Update EDD field via flatpickr instance
                    eddPicker.setDate(edd);
                    // document.getElementById('edd-hint').textContent = '';
                }
            }
        });`;

const newJS = `        // ---- Native Date Setup / Max Dates ----
        const todayStr = new Date().toISOString().split('T')[0];
        document.getElementById('dob').setAttribute('max', todayStr);
        document.getElementById('lmpDate').setAttribute('max', todayStr);

        // Auto-calculate EDD from LMP natively
        document.getElementById('lmpDate').addEventListener('change', (e) => {
            const val = e.target.value;
            if (val) {
                const edd = new Date(val);
                edd.setDate(edd.getDate() + 280);
                document.getElementById('edd').value = edd.toISOString().split('T')[0];
            }
        });`;

content = content.replace(oldJS, newJS);

// If the exact match for oldJS failed because of spacing, let's use a regex
if (content.includes('flatpickrConfig')) {
    content = content.replace(/\/\/ ---- Calendar JS \(Flatpickr\) Integration ----[\s\S]*?\}\);\s*\n/g, newJS + '\n\n');
}

// 6. Update the Editing Population logic
const oldSetDates = `                        // Set dates in Flatpickr
                        const dobDate = new Date(p.dateOfBirth);
                        document.querySelector('#dob')._flatpickr.setDate(dobDate);

                        const lmpDateObj = new Date(p.lmpDate);
                        document.querySelector('#lmpDate')._flatpickr.setDate(lmpDateObj);`;

const newSetDates = `                        // Set dates natively
                        if (p.dateOfBirth) {
                            const dobDate = new Date(p.dateOfBirth);
                            document.getElementById('dob').value = dobDate.toISOString().split('T')[0];
                        }
                        if (p.lmpDate) {
                            const lmpDateObj = new Date(p.lmpDate);
                            document.getElementById('lmpDate').value = lmpDateObj.toISOString().split('T')[0];
                        }
                        if (p.edd) {
                            document.getElementById('edd').value = new Date(p.edd).toISOString().split('T')[0];
                        }`;

content = content.replace(oldSetDates, newSetDates);

if (content.includes('_flatpickr.setDate')) {
    console.log('Warn: _flatpickr.setDate found. fallback regex...');
    content = content.replace(/\/\/ Set dates in Flatpickr[\s\S]*?_flatpickr\.setDate\(lmpDateObj\);/g, newSetDates);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated patient-register.html to use native inputs');
