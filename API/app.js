const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// This line connects the database (creates it if needed)
require('./src/db');

const studentRoutes = require('./src/routes/studentRoutes');
app.use('/api/students', studentRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Student Performance Tracker API 🎓', version: '1.0.0' });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});