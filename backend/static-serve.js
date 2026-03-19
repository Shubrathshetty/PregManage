const express = require('express');
const path = require('path');
const app = express();

const PORT = 4444;

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`\n======================================`);
    console.log(`✨ UI Preview Server Running ✨`);
    console.log(`Open your browser to: http://localhost:${PORT}`);
    console.log(`======================================\n`);
});
