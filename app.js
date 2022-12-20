require('dotenv').config();
const express = require('express')
const cors = require('cors')
const { ApolloServer, AuthenticationError } = require('apollo-server-express')
const { typeDefs } = require('./typeDefs')
const { resolvers } = require('./resolvers')
const { connectDB } = require('./db');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT;
connectDB();
module.exports = app;

const start = async () => {

    const apolloServer = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req }) => ({ req }),
        formatError: (err) => {
            return { code: err.extensions.code, message: err.message };
        },
        formatResponse: (res) => {
            return res.errors ? { errors: res.errors[0] } : res
        }
    })
    app.use(bodyParser.json({ limit: '5mb' }));
    app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
    await apolloServer.start();
    apolloServer.applyMiddleware({ app });
    app.get('/', (req, res) => res.send('WELCOME TO MY APOLLO/REST API.'));
    app.use('*', (req, res) => res.status(404).send('ERROR <404>: NOT FOUND.'));
    app.use(cors({ origin: `http://localhost:${port}` }));
    bodyParsers = require('body-parser');

    app.use((err, req, res, next) => {
        if (err) {
            console.log(err)
            return res.send({ errors: { message: "Image uploaded is too large", code: 400 } });
        }
        next();
    });

    app.listen(port, () => {
        console.log(`Server currently hosted on port: ${port}.`)
    })


}

start();