// server.js
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '56tyghbn',
  database: 'DishDatabase'
});

db.connect(err => {
  if (err) throw err;
  console.log('Database connected!');
});

// Api for get all dish inforation
app.get('/dishes', (req, res) => {
  db.query('SELECT * FROM dishes', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});
//Api for publish or unpulish for particular customer
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

  
  

server.listen(3001, () => {
  console.log('Server running on port 3001');
});
