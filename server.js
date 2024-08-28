const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 5000;

app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/backontrack', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    email: String,
    password: String,
    role: String,
    classOrDegree: String,
    institution: String,
    city: String,
    occupation: String
});

const User = mongoose.model('User', userSchema);

app.post('/signup', async (req, res) => {
    const { name, mobile, email, password, role, classOrDegree, institution, city, occupation } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, mobile, email, password: hashedPassword, role, classOrDegree, institution, city, occupation });
        await user.save();
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

app.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.json({ success: false, message: 'Invalid email or password' });
        }
        const token = jwt.sign({ id: user._id }, 'your_jwt_secret');
        res.json({ success: true, user, token });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('sendMessage', (message) => {
        console.log('Message received:', message);
        io.emit('receiveMessage', message);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
