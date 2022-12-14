const { Schema, model } = require('mongoose');

const registrationSentSchema = new Schema({
    email: {
        type: String,
    },
    url: {
        type: String,
    },
}, { timestamps: true });

registrationSentSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 })
// { collection: 'temporal_register' }
module.exports = model('registration_sent_schema', registrationSentSchema)

