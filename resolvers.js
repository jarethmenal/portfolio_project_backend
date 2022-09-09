const Users = require('./models/user_schema')

const resolvers = {
    Query: {
        getAllUsers: async () => {
            const response = await Users.find();
            return response;
        },
        getSingleUser: async (parent, { id }) => {
            const response = await Users.findById(id);
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