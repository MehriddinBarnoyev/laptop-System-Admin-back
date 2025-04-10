const { Server } = require('ws');
const server = require('../server'); // server.js dan server obyekti

// WebSocket serverini yaratish
const wss = new Server({ server });

wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');

    // Xabar kelganda
    ws.on('message', (message) => {
        console.log('Received:', message);
        ws.send(`Echo: ${message}`); // Misol uchun echo qaytarish
    });

    // Ulanish yopilganda
    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });

    // Xatolarni ushlash
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Real vaqtda tizim statistikasini yuborish (ixtiyoriy)
setInterval(() => {
    const os = require('os');
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    const stats = {
        memory: {
            total: totalMemory,
            free: freeMemory,
            used: usedMemory,
            usage: (usedMemory / totalMemory) * 100,
        },
        uptime: os.uptime(),
    };

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(stats));
        }
    });
}, 1000); // Har 1 soniyada yangilash

console.log('WebSocket server is running');