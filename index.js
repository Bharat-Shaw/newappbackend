const express = require('express');
const { connection } = require('./db')
const { Usermodel } = require('./models/user.model');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const { Postmodel } = require('./models/post.model');
require('dotenv').config();
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

const authmiddleware = (req, res, next) => {
    const { authorization } = req.headers;
    const userav = (authorization.split(' ')[1])
    if (!userav) {
        res.send('Please login')
    } else {
        jwt.verify(userav, process.env.SECRET, (err, decoded) => {
            if (decoded) {
                next();
            } else {
                res.send('Please login')
            }
        })
    }
}

const authorise = async (req, res, next) => {
    const user = await Usermodel.findOne({ _id: req.userID })
    const userrole = user.role
    if (userrole === permittedRole) {
        next()
    }
    else {
        res.send("You are not Authorized")
    }
}

app.post('/users/register', async (req, res) => {
    const { name, email, password, gender } = req.body;
    const User = await Usermodel.findOne({ email })
    if(User){
        res.send("User already exist");
    }else{
        const hashpassword = bcrypt.hashSync(password, 6);
        const newuser = new Usermodel({
            name,
            email,
            password: hashpassword,
            gender
        })
        await newuser.save();
        res.send("Signup successful");
    }
    
})

app.post('/users/login', async (req, res) => {
    const { email, password } = req.body;
    const User = await Usermodel.findOne({ email })
    if (!User) {
        res.send("Please signUp")
    } else {
        const hash = User.password;
        const genuser = bcrypt.compareSync(password, hash);
        if (genuser) {
            const token = jwt.sign({ UID: User._id }, process.env.SECRET);
            res.send({ msg: token })
        }
    }
})

app.get('/posts/:_id', authmiddleware, async (req, res) => {
    const { _id } = req.params;
    console.log(_id)
    const post = await Postmodel.findById(_id)
    res.send(post)

})

app.get('/posts', authmiddleware, async (req, res) => {
    const query = req.query;
    console.log(query)
    const post = await Postmodel.find(query)
    res.send(post)
})

app.post('/posts', authmiddleware, async (req, res) => {
    const { title, body, device } = req.body;
    const newpost = new Postmodel({
        title,
        body,
        device
    })
    await newpost.save();
    res.send("Post Created")
})

app.put('/posts/update/:_id', authmiddleware, async (req, res) => {
    const { _id } = req.params;
    console.log(_id)
    const { title, body, device } = req.body;
    try {
        const updatedpost = await Postmodel.findByIdAndUpdate(_id, { title: title, body: body, device: device });

        if (!updatedpost) {
            res.status(404).send("No post found");
        } else {
            res.send("Post updated");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
})

app.delete('/posts/delete/:_id', authmiddleware, async (req, res) => {
    const { _id } = req.params;
    console.log(_id)
    try {
        const deleted = await Postmodel.findByIdAndDelete(_id)
        console.log(deleted)
        if (deleted) {
            res.send("Post deleted");
        } else {
            res.send("Post not found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
})

app.listen(4000, async () => {
    try {
        await connection;
        console.log('connected to database')
    } catch (error) {
        console.log('error while connecting db')
    }
    console.log('http://localhost:4000/ started at 4000')
})

