const express = require('express');
const app = express();
const {Server} = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = new Server(server);
const port = 5001;
const path = require ('path');
const message = require('./models/message');
const connectDB = require('./DBconnect');
const User = require('./models/users');
const bcrypt = require('bcryptjs');
const dotenv = require ('dotenv');
dotenv.config();
app.use(express.static(path.join(__dirname)));
app.use(express.json());
connectDB();
let refreshTokens = [];
app.post('/user/signup', async(req,res)=>{
    const{username,password} = req.body;
    const existingUser = await User.findOne({username});
    if (existingUser)
        return res.status(409).send('user already exists');
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({username, password: hashedPassword});
    await newUser.save();
    res.send('sign up sucsesfuly');
});
const JWT = require('jsonwebtoken');
app.post('/user/login', async (req,res)=>{
    const {username,password} = req.body;
    try{
        const user = await User.findOne({username});
        if (!user) return res.status(401).send('user not found');
        const ispasswordvalid = await bcrypt.compare(password, user.password);
        if(!ispasswordvalid) return res.status(401).send('invalid credentials');
        const accessToken = JWT.sign (
            {username:user.username},
            process.env.JWT_SECRET_KEY,
            {expiresIn:'1h'}
        );
        const refreshToken = JWT.sign(
            {username:user.username},
            process.env.JWT_REFRESH_SECRET_KEY,
            {expiresIn:'7d'}
        );
        refreshTokens.push(refreshToken);

        res.send({accessToken, refreshToken});  // send token to frontend
  } catch (err) {
    console.error(err);
    res.status(500).send('Error logging in');
    }
});
app.post('/user/refreshToken', (req,res)=>{
    const {token} = req.body;
    if(!token)return res.status(401).send('No refresh token provided.');
    if(!refreshTokens.includes(token)){
        return res.status(403).send('Invalid refresh token');

    };
    JWT.verify(token, process.env.JWT_REFRESH_SECRET_KEY, (err, user)=>{
        if(err)
            return res.status(403).send('forbidden');
        const newAccessToken = JWT.sign(
             {username:user.username},
            process.env.JWT_SECRET_KEY,
            {expiresIn:'1h'}
        );
        res.json({accessToken:newAcessToken});

    });
});

app.get('/signup.html', (req,res)=>{
    res.sendFile(path.join(__dirname, 'signup.html'));
})
app.get('/', (req,res)=>{
res.sendFile(__dirname + '/index.html'
)
});
io.on('connection', async (socket)=>{
    console.log('user connected')
    const oldMessage = await  message.find().sort({createdAt:1});
    oldMessage.forEach(msg=>{
        socket.emit('send name', msg.name);
        socket.emit('send message', msg.message);

    })
    socket.on('send name', (username)=>{
    socket.username = username;
    });
    socket.on('send message', async (chat)=>{
        if(!socket.username)return;
        const newMessage = new message({name:socket.username, message:chat});
        await newMessage.save();
          io.emit('send name', socket.username);
        io.emit('send message', chat);
    });
})
server.listen(port, ()=>{
    console.log('server is running on http://localhost:5001')
})