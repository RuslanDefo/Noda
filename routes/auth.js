const express = require('express');
const {userData} = require('../models/users');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const fs = require("fs");

const router = express.Router();

let SESSION = {};

router.get('/reg-user', function (request, response) {
    response.render('reg-user.hbs');
});

router.post('/reg-user', async function (request, response) {
    if (!request.body) return response.sendStatus(400);
        const userLogin = request.body.userLogin;
        const userMail = request.body.userMail;
        const userPass = request.body.userPass;

    if (userLogin && userMail && userPass) {

        const thisID = new mongoose.Types.ObjectId()

        const User = new userData({
            _id: thisID,
            login: userLogin,
            email: userMail,
            password: userPass
        })

        const newUser = await User.save();
        if (newUser) {
            response.redirect('/sign-in')
        } else {
            response.redirect('/reg-user')
        }
    }
    }
)

router.get('/sign-in', function (request, response) {
    let data =  userData;
    response.render('sign-in.hbs');
});

router.post('/sign-in',  async (request, response) => {
    let sess = request.session;

    let data = userData;
    const user = data.findOne({email: request.body.userLogin, password: request.body.userPass}, function (err, doc) {

        if (err) return console.log(err);
        SESSION = doc;
        if (SESSION != null) {
            sess.showAd = doc
            response.redirect(301, '/')
            // console.log(SESSION)
        } else {
            response.send('Not Allowed')
        }
    })
});

module.exports = {
    router,
    SESSION
}

