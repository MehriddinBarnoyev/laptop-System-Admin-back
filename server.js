const express = require('express');
const { Server } = require('ws');
const os = require('os');
const cors = require('cors');
require('dotenv').config();
const authRouter = require("./routers/authRouter")

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());


app.use("/api/auth", authRouter)

const server = app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

const wss = new Server({ server });
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
app.get('/system-stats', (req, res) => {
    const stats = getSystemStats();
    res.json(stats);
});
app.use(express.static('public'));