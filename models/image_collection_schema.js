const { Schema, model } = require('mongoose');

const imageCollectionSchema = new Schema({
    name: {
        type: String
    },
    cart: {
        type: [String],
        default: []
    }
},
    { collection: 'image_collection' })

module.exports = model('image_collection_schema', imageCollectionSchema)