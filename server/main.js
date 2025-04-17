import express from 'express';
import mongoose from 'mongoose';
import Student from './schemas/student.js';
import Fee from './schemas/Fee.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import User from './schemas/user.js';

dotenv.config();

const app = express();

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max:  5, // Limit requests per window
    message: 'Too many requests from this IP, please try again later.',
    headers: true,
  });
  
  app.use(limiter);
  
  
app.use(express.json())
app.listen(3004, () => {
    console.log("Server is running ")
})
app.use(cors({
    origin: '*',  
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.get('/test', async(req, res) => {
    res.status(200).send("Hello world")
})

app.post('/student', async (req, res) => {
    console.log("Req body", req.body)
    try{
        const { name, class: classId, rollNo} = req.body;

        if (!name || !classId || !rollNo) {
            return res.status(400).send("All fields are required")
        }
        
        if (typeof name !== 'string' || typeof classId !== 'string' || typeof rollNo !== 'number') {
            return res.status(400).send("Invalid data types")
        }
        const newStudent = new Student({
            name, class: classId, rollNo
        })
        await newStudent.save();
        res.send("Student created successfully")
    }
    catch(error){
        res.json({error: error.message})
    }
})

app.post('/fee', async(req, res)=> {
    try{
        const {student,amount, date } = req.body;
        const newFee = new Fee({
            student, amount, date
        })
        await newFee.save();
        res.send("Fee created successfully")
    }catch{
        res.send("internal server error")
    }
})


app.get('/studentfee/:id', async(req, res) => {
    try{
        const studentId= req.params.id;
        const student = await Fee.find({student: studentId}).populate('student', 'name class')
        res.send(student)
    } catch{
        res.send("internal server error")
    }
})

app.post('/register', async(req, res) => {
    try{
    const { username, password, role} = req.body;

    const userExists = await User.findOne({username});
        if (userExists) {
            return res.status(400).send("User already exists")
        }
    const newUser = new User({
        username,
        password,
        role
    })
    await newUser.save();
    res.send("User created successfully")
} 
catch(error){
    console.log(error.message)
    res.status(500).send("Internal server error")
}
})


app.post('/login', async (req, res) => {
    try{
    const {username, password} = req.body
    console.log("Login request received", req.body);
    const user = await User.findOne({username});
    if (!user) {
        return res.status(400).send("User not found")
    }
    if (user.password !== password) {
        return res.status(400).send("Invalid credentials")
    }
    // Generate JWT token
    const token = jwt.sign({id:user._id, username: user.username, role: user.role}, process.env.JWT_SECRET, { expiresIn: '10m' });
    res.json({ token });
} catch(error){
    console.log(error.message)
    res.status(500).send("Internal server error")
    }
  });

  // Middleware to verify JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  }

  function authorizeRoles(roles) {
    return (req, res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).send('Access denied');
      }
      next();
    };
  }

app.get('/profile', authenticateToken, (req, res) => {  
    res.json({ message: 'Welcome to private route', user: req.user });
  })

  // Only admin can access this
app.get('/admin', authenticateToken, authorizeRoles(['admin']), (req, res) => {
    res.json({ message: 'Admin Access Granted', user: req.user });
  });
  
mongoose.connect(process.env.MONGO)
.then(()=> {
    console.log("Mongo DB is connected")
})
.catch(()=>{
    console.log("connection not successful")
})

app.get('/dashboard', (req, res) => {
    res.send("Hello welcome to my server")
})
