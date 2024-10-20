require('dotenv').config();

const express = require('express');
const app = express();
const session = require('express-session');
const mongoose = require('mongoose');
const ejs = require('ejs');
const User = require('./models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local')

app.use(express.urlencoded({ extended: true }));

async function start() {
  await mongoose.connect(process.env.MONGO_URL);
}
start().catch((e => console.log(e)));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 30,
    maxAge: 1000 * 60 * 60 * 24 * 30 ,
  }
}));
// middleware
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set('view engine', 'ejs');

app.get('/home', (req, res) => {
    res.render('home',{user:req.user});
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup',async(req, res) => {
    let {username,email,password} = req.body
    const newUser = new User({username,email})
    let regUser = await User.register(newUser,password)
    req.login(regUser,(err) => {
        if(err){
            console.log(err)
        }
        res.redirect('/home')
    })
});
app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.post("/login", passport.authenticate('local',{ failureRedirect: '/login' }), (req,res) => {
    res.redirect('/home')
})

app.get('/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        console.log(err);
      }
    })
    res.redirect('/login');
});

app.get('/post', (req, res) => {
  console.log(req.user)
  if(req.isAuthenticated()){
    res.render('post');
  }else{
    res.redirect('/login')
  }
});

app.get('/docc', (req, res) => {
  console.log(req.user)
  if(req.isAuthenticated()){
    res.render('docc');
  }else{
    res.redirect('/login')
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});