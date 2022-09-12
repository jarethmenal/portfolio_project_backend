const { Schema, model } = require('mongoose');

const medicineSchema = new Schema({
    name: {
        type: String
    },
    stock: {
        type: Number
    },
    quantity: {
        type: String
    },
    image: {
        type: String,
        default: "portfolio_project1/no-found_of2sn3"
    },
    information: {
        type: String
    },
    price: {
        type: Number
    },
    discount: {
        type: Number
    }

},
    { collection: 'medicines' })

module.exports = model('medicine_schema', medicineSchema)