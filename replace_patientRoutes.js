const fs = require('fs');
let code = fs.readFileSync('backend/routes/patientRoutes.js', 'utf8');

// 1. Post request destructuring
code = code.replace(/fullName, dateOfBirth, age, husbandName, phone,\s*address,\s*aadhaar, lmpDate, edd, bloodGroup, gravida, para/g, 
"fullName, dateOfBirth, age, phone, address, lmpDate, edd, currentMonthOfPregnancy");

// 2. Remove Duplicate Aadhaar checks
code = code.replace(/\/\/ Check for duplicate Aadhaar\s*const existingPatient = await Patient\.findOne\(\{ aadhaar \}\);\s*if \(existingPatient\) \{\s*return res\.status\(400\)\.json\(\{ success: false, message: 'A patient with this Aadhaar number already exists\.' \}\);\s*\}/, '');

code = code.replace(/\/\/ Check for duplicate Aadhaar \(excluding itself\)\s*const duplicateAadhaar = await Patient\.findOne\(\{ aadhaar, _id: \{ \$ne: id \} \}\);\s*if \(duplicateAadhaar\) \{\s*return res\.status\(400\)\.json\(\{ success: false, message: 'Another patient with this Aadhaar number already exists\.' \}\);\s*\}/, '');

// 3. Remove catch blocks 11000 check for aadhaar
code = code.replace(/if \(error\.code === 11000\) \{\s*return res\.status\(400\)\.json\(\{ success: false, message: 'A patient with this Aadhaar number already exists\.' \}\);\s*\}/, '');

// 4. Update Patient Creation Object
code = code.replace(/husbandName,\s*phone,/g, "phone,");
code = code.replace(/aadhaar,\s*lmpDate: new Date\(lmpDate\),/g, "lmpDate: new Date(lmpDate),");
code = code.replace(/bloodGroup,\s*gravida: parseInt\(gravida\),\s*para: parseInt\(para\),/g, "currentMonthOfPregnancy: parseInt(currentMonthOfPregnancy),");

// 5. Update Patient Modifying Object (PUT)
code = code.replace(/patient\.husbandName = husbandName;\s*/, '');
code = code.replace(/patient\.aadhaar = aadhaar;\s*/, '');
code = code.replace(/patient\.bloodGroup = bloodGroup;\s*patient\.gravida = parseInt\(gravida\);\s*patient\.para = parseInt\(para\);\s*/, "patient.currentMonthOfPregnancy = parseInt(currentMonthOfPregnancy);\n        ");

// 6. Update Search Feature to exclude Aadhaar
code = code.replace(/\{ aadhaar: \{ \$regex: query, \$options: 'i' \} \},/, '');

fs.writeFileSync('backend/routes/patientRoutes.js', code);
console.log('done patientRoutes.js');
