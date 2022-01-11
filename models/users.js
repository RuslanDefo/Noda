const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    login:  String,
    email:  String,
    password:  String,
});

const model = mongoose.model('User', User, 'users');

module.exports = {
    userData: model
}