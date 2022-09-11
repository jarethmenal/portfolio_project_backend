const nodemailer = require('nodemailer');

require('dotenv').config();
const user = process.env.EMAIL
const pass = process.env.EMAIL_PASSWORD
module.exports = {

    sendMail: function (target, subject, content) {

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user,
                pass
            }
        });

        var mailOptions = {
            from: user,
            to: target,
            subject: subject,
            text: content
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

    }
}

