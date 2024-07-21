const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config(); 
const port = process.env.PORT || 3001; // Default to 3001 locally

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://aravindhacker.github.io/Dishes_Frontend/",
    methods: ["GET", "POST"]
  }
});

const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB
});

db.connect(err => {
  if (err) throw err;
  console.log('Database connected!');
});

// API for getting all dish information
app.get('/dishes', (req, res) => {
  db.query('SELECT * FROM dishes', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// API for toggling publish status for a particular customer
app.post('/toggle-publish/:id', (req, res) => {
  const { id } = req.params;
  console.log(`Received request to toggle publish status for dishId: ${id}`);
  db.query('UPDATE dishes SET isPublished = NOT isPublished WHERE dishId = ?', [id], (err, result) => {
    if (err) {
      console.error('Error updating dish status:', err);
      res.status(500).json({ message: 'Error updating dish status' });
    } else {
      console.log('Dish status updated successfully');
      // Emit the change to all connected clients
      io.emit('dishStatusUpdated', { id });
      res.json({ message: 'Dish status updated!' });
    }
  });
});

// Listen for connections
io.on('connection', (socket) => {
  console.log('user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
