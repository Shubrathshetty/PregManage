const fs = require('fs');

function fixTests(file) {
    if (!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf8');
    
    // Replace valid dummy objects
    code = code.replace(/husbandName:\s*['"`].*?['"`],/g, '');
    code = code.replace(/aadhaar:\s*['"`].*?['"`],/g, '');
    code = code.replace(/bloodGroup:\s*['"`].*?['"`],/g, "currentMonthOfPregnancy: 5,");
    code = code.replace(/gravida:\s*\d+,/g, '');
    code = code.replace(/para:\s*\d+,?/g, '');
    
    fs.writeFileSync(file, code);
    console.log('Fixed', file);
}

fixTests('backend/tests/patient.test.js');
fixTests('backend/tests/patient.api.test.js');
