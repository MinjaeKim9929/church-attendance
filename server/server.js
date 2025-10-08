const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');

const connectDB = require('./lib/db.js');

dotenv.config();
connectDB();

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
