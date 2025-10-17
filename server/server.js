const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

const connectDB = require('./lib/db.js');
const userRoutes = require('./routes/userRoutes.js');
const studentRoutes = require('./routes/studentRoutes.js');
const attendanceRoutes = require('./routes/attendanceRoutes.js');
const classConfigurationRoutes = require('./routes/classConfigurationRoutes.js');

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration
const corsOptions = {
	origin: 'http://localhost:5173',
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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
