const express = require('express');
const { Server } = require('ws');
const os = require('os');
const cors = require('cors');

const app = express();
const port = 5600;

app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST'], // Allow only GET and POST methods
    allowedHeaders: ['Content-Type'], // Allow only specific headers
}));
app.use(express.json());

const server = app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

const wss = new Server({ server });

// Get system stats function
function getSystemStats() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    return {
        cpu: os.cpus().map(cpu => ({
            model: cpu.model,
            speed: cpu.speed,
            usage: ((cpu.times.user + cpu.times.sys) / (cpu.times.user + cpu.times.sys + cpu.times.idle)) * 100,
        })),
        memory: {
            total: totalMemory,
            free: freeMemory,
            used: usedMemory,
            usage: (usedMemory / totalMemory) * 100,
        },
        uptime: os.uptime(),
        loadavg: os.loadavg(),
        networkInterfaces: os.networkInterfaces(),
    };
}

// Handle GET request to fetch system stats
app.get('/system-stats', (req, res) => {
    const stats = getSystemStats();
    res.json(stats); // Send the stats as a JSON response
});

// Serve static files from 'public' folder
app.use(express.static('public'));

console.log(`Static files are served from the public directory at http://localhost:${port}/`);
