const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const http = require('http');

const connectDB = require('./lib/db.js');
const userRoutes = require('./routes/userRoutes.js');
const studentRoutes = require('./routes/studentRoutes.js');
const attendanceRoutes = require('./routes/attendanceRoutes.js');
const classConfigurationRoutes = require('./routes/classConfigurationRoutes.js');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize socket.io server
const io = new Server(server, {
	cors: { origin: '*' },
});

// Store online users
const userSocketMap = {}; // { userId: socketId }

// Socket.io connection handler
io.on('connection', (socket) => {
	const userId = socket.handshake.query.userId;
	console.log('User Connected', userId);

	if (userId) userSocketMap[userId] = socket.id;

	// Emit online users to all connected clients
	io.emit('getOnlineUsers', Object.keys(userSocketMap));

	socket.on('disconnect', () => {
		console.log('User Disconnected', userId);
		delete userSocketMap[userId];
		io.emit('getOnlineUsers', Object.keys(userSocketMap));
	});
});

// Connect to MongoDB
connectDB();

// CORS configuration
const corsOptions = {
	origin: ['http://localhost:5173', 'https://standrewkimlondon.pages.dev'],
	credentials: true,
	optionsSuccessStatus: 200,
};

// Middleware setup
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Router setup
app.use('/api/auth', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/class-config', classConfigurationRoutes);

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Export for use in other modules
module.exports = { io, userSocketMap };
