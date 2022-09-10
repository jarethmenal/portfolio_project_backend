const Users = require('./models/user_schema')
const authJWT = require('./util/authJWT')
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const secret = process.env.ACCESS_TOKEN_SECRET;

const resolvers = {
    Query: {
        login: async (parent, { user }) => {
            const dataUser = await Users.findOne({ email: user.email });

            if (!dataUser) {
                throw new Error('Email inserted does not match with any of our accounts.')
            }
            if (await bcrypt.compare(user.password, dataUser.password)) {
                accessToken = jwt.sign(dataUser.toJSON(), secret, { expiresIn: "2m" })
                return (`Bearer ${accessToken}`)
            }

        },
        getAllUsers: async () => {
            const response = await Users.find();
            return response;
        },
        getSingleUser: async (parent, body, context) => {
            const user = authJWT(context);
            const response = await Users.findById(user._id);
            return response;
        }
    },


    Mutation: {
        createUser: async (parent, { user }, context, info) => {
            const { name, email, password, profpic } = user;
            const response = new Users({ name, email, password, profpic })
            await response.save();
            return response;
        },
        deleteUser: async (parent, { id }) => {
            await Users.findByIdAndDelete(id);
            return `User ${id} was deleted.`;
        },
        updateUser: async (parent, { id, user }) => {
            const response = await Users.findByIdAndUpdate(id, {
                $set: user
            }, { new: true });

            return response;
        }
    }
}

module.exports = { resolvers }