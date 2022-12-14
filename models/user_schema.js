const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    cart: {
        type: [Object],
        default: []
    },
    profpic: {
        type: String,
        default: "portfolio_project1/k6o9yedyufldq1fymtuu"
    },
    rank: {
        type: String,
        default: "client"
    },
    verified: {
        type: Boolean,
        default: false
    }

},
    { collection: 'users' })

module.exports = model('users_schema', userSchema)