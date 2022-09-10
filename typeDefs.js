const { gql } = require('apollo-server-express');

const typeDefs = gql`

    type MedicineInCart {
        medicine: String,
        amount: Int
    }

    type User {
        id: ID
        name: String
        email: String
        password: String
        cart: [MedicineInCart]
        profpic: String
        rank: String
        verified: Boolean
    }

    input loginCredentials {
        email: String!
        password: String!
    }
    
    input userInput {
        name: String
        email: String
        password: String
        profpic: String 
    }

    type Query {
        login(user: loginCredentials):String
        getAllUsers: [User]
        getSingleUser(id: ID): User
        
    }

    type Mutation {
        createUser(user: userInput):User
        deleteUser(id:ID!):String
        updateUser(id:ID!, user: userInput):User
    }
`
module.exports = { typeDefs };