
const { AuthenticationError } = require('apollo-server-express');
const jwt = require('jsonwebtoken')

module.exports = (context, tokenType) => {
    const authHeader = context.req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split('Bearer ')[1];
        if (token) {
            try {
                const content = jwt.verify(token, tokenType);
                return content;
            } catch (error) {
                throw new AuthenticationError('Token is invalid o has already expired.')
            }
        }
        throw new AuthenticationError(`Authentication in headers must be 'Bearer [TOKEN]'.`)
    }
    throw new AuthenticationError('Authentication header must be provided in headers.')
}