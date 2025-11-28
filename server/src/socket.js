const socketIo = require('socket.io');

let io;

const initSocket = (server, allowedOrigins) => {
    io = socketIo(server, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('join_user', (userId) => {
            if (userId) {
                socket.join(userId);
                console.log(`Socket ${socket.id} joined room user:${userId}`);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = { initSocket, getIo };
