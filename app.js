const express = require('express');
const expressHbs = require('express-handlebars');
const hbs = require('hbs');
const path = require('path');
const fs = require('fs')
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const mongoose = require('mongoose');
const pagesRouter = require('./routes/posts');
const authRouter = require('./routes/auth').router;
const {route} = require("express/lib/router");
const {request} = require("express");
const {SESSION} = require("./routes/auth");

const usersBase = path.join(__dirname, 'database/users.json');
const postsBase = path.join(__dirname, 'database/posts.json');
const jsonParser = express.json();

const port = 5000;
const app = express();

app.use(express.static(__dirname + '/assets'));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({ secret: 'keyboard', resave: true , saveUninitialized: true , cookie: { maxAge: 6000000 }}))
app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials')


app.use('/', pagesRouter);
app.get('/addPost', pagesRouter);
app.post('/addPost', pagesRouter);
app.get('/readPost/', pagesRouter)

app.get('/reg-user', authRouter);
app.post('/reg-user', authRouter);
app.get('/sign-in', authRouter);
app.post('/sign-in', authRouter);

async function start(app) {
    try {
        await mongoose.connect('mongodb://localhost:27017/nodeBlog', function () {
            console.log('Database connected');
            app.listen(port, () => {
                console.log('Server started')
            })
        })
    }
    catch (error){
        console.log(error);
    }
};

start(app);

/// ВОЗМОЖНО ДОБАВЛЮ ПОЗЖЕ ЛИЧНЫЙ КАБИНЕТ И ЛОГАУТ

// app.get('/user', (req, res) => {
//     const sessionUser = req.session.user;
//     return res.send(sessionUser);
// });
//
// app.get('/logout', (req, res) => {
//     req.session.destroy();
//     sessionUser = {};
//     return res.send('User logged out!');
// })
