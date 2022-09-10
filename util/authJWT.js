require('dotenv').config();
const { AuthenticationError } = require('apollo-server-express');
const jwt = require('jsonwebtoken')
const secret = process.env.ACCESS_TOKEN_SECRET;

module.exports = (context) => {
    const authHeader = context.req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split('Bearer ')[1];
        if (token) {
            try {
                const user = jwt.verify(token, secret);
                return user;
            } catch (error) {
                throw new AuthenticationError('Token is invalid o has already expired.')
            }
        }
        throw new AuthenticationError(`Authentication in headers must be 'Bearer [TOKEN]'.`)
    }
    throw new AuthenticationError('Authentication header must be provided.')
}