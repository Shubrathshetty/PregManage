const fs = require('fs');
let content = fs.readFileSync('frontend/patient-register.html', 'utf8');

// 1. Remove Camera Capture div
content = content.replace(/<!-- Camera Capture -->[\s\S]*?<!-- Personal Info -->/, '<!-- Personal Info -->');

// 2. Remove Husband Name div
content = content.replace(/<div class=\"form-group\">\s*<label class=\"form-label\" for=\"husbandName\">Husband's Name \/ ಗಂಡನ ಹೆಸರು <span\s*style=\"color: var\(--error\);\">(.*?)<\/div>/s, '');

// 3. Remove Aadhaar div
content = content.replace(/<!-- Aadhaar -->[\s\S]*?<!-- Medical Info -->/, '<!-- Medical Info -->');

// 4. Replace Blood Group, Gravida, Para with Current Month of Pregnancy
let newMedicalInfo = `
                <div class="form-group">
                    <label class="form-label" for="currentMonthOfPregnancy">Current Month of Pregnancy / ಪ್ರಸ್ತುತ ಗರ್ಭಧಾರಣೆಯ ತಿಂಗಳು <span style="color: var(--error);">*</span></label>
                    <select id="currentMonthOfPregnancy" class="form-select" required style="background-color: #FFFFFF;">
                        <option value="">Select Month</option>
                        <option value="1">1 Month</option>
                        <option value="2">2 Months</option>
                        <option value="3">3 Months</option>
                        <option value="4">4 Months</option>
                        <option value="5">5 Months</option>
                        <option value="6">6 Months</option>
                        <option value="7">7 Months</option>
                        <option value="8">8 Months</option>
                        <option value="9">9 Months</option>
                    </select>
                </div>
`;
content = content.replace(/<div class=\"form-group\">\s*<label class=\"form-label\" for=\"bloodGroup\">Blood Group.*?(<div id=\"form-error\")/s, newMedicalInfo + '\n                $1');

// 5. Fix JS HusbandName Validation
content = content.replace(/\\['fullName', 'husbandName'\\]/, "['fullName']");

// 6. Fix JS Aadhaar Validation
content = content.replace(/\/\/ ---- Real-time Aadhaar Validation.*?\}\);/s, '');

// 7. Fix Patient load logic
content = content.replace(/document\.getElementById\('husbandName'\)\.value = p\.husbandName;/s, '');
content = content.replace(/document\.getElementById\('aadhaar'\)\.value = p\.aadhaar\.replace.*?trim\(\);/s, '');
content = content.replace(/document\.getElementById\('bloodGroup'\)\.value = p\.bloodGroup;/s, "document.getElementById('currentMonthOfPregnancy').value = p.currentMonthOfPregnancy;");
content = content.replace(/document\.getElementById\('gravida'\)\.value = p\.gravida;/s, '');
content = content.replace(/document\.getElementById\('para'\)\.value = p\.para;/s, '');

// 8. Fix JS form submission (remove validation)
content = content.replace(/const aadhaarRaw.*?;/, '');
content = content.replace(/if \(!\/\\^\[2-9\]\\\\d\{11\}\\$\/\.test\(aadhaarRaw\)\) \{.*?return;\s*\}/s, '');

// 9. Fix Form Data append
content = content.replace(/formData\.append\('husbandName'.*?;/, '');
content = content.replace(/formData\.append\('aadhaar'.*?;/, '');
content = content.replace(/formData\.append\('bloodGroup'.*?;/, "formData.append('currentMonthOfPregnancy', document.getElementById('currentMonthOfPregnancy').value);");
content = content.replace(/formData\.append\('gravida'.*?;/, '');
content = content.replace(/formData\.append\('para'.*?;/, '');

// 10. Remove Camera Setup functionality
content = content.replace(/\/\/ ---- Camera Capture ----.*?window\.addEventListener\('beforeunload'.*?\}\);/s, '');
content = content.replace(/if \(p\.photo\) \{.*?\}/s, '');
content = content.replace(/if \(capturedBlob\) \{.*?\}/s, '');
content = content.replace(/const formData = new FormData\(\);/s, "const formData = new FormData();");

fs.writeFileSync('frontend/patient-register.html', content);
console.log('done patient-register.html');
