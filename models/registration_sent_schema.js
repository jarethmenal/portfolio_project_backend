const { Schema, model } = require('mongoose');

const registrationSentSchema = new Schema({
    createdAt: {
        type: Date,
        expires: 300,
        default: Date.now
    },
    email: {
        type: String,
    },
    url: {
        type: String,
    }
}, { collection: 'registration_sent', timestamps: true })

registrationSentSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

module.exports = model('registration_sent_schema', registrationSentSchema)