const { Schema, model } = require('mongoose');

const recoverySentSchema = new Schema({
    email: {
        type: String,
    },
    url: {
        type: String,
    },
}, { timestamps: true });

recoverySentSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 })
// { collection: 'temporal_register' }
module.exports = model('recovery_sent_schema', recoverySentSchema)

