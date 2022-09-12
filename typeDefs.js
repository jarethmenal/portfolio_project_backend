const { gql } = require('apollo-server-express');

const typeDefs = gql`

    type MedicineInCart {
        medicine: String,
        amount: Int
    }

    type User {
        id: ID!
        name: String!
        email: String!
        password: String!
        cart: [MedicineInCart]
        profpic: String
        rank: String
        verified: Boolean
    }

    type Medicine {
        name: String
        stock: Int
        quantity: String
        image: String
        information: String
        price: Float
        discount: Float
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
        loginUser(user: loginCredentials!):String!
        getAllUsers: [User]
        getUser: User
        getUserExists(email: String!): User
        getImageCollection(filter: String):[String]
        getAllMedicines:[Medicine]
        getMedicine(filter: String): Medicine
        validateToken: String
    }

    type Mutation {
        createUser(user: userInput!):User
        deleteUser(id:ID!):String
        updateUser(id:ID!, user: userInput!):User
        sendRegisterLink(email:String!, baseUrl:String!): String
        uploadImage(imageFile:String!):String
        replaceProfilePic(newImageFile:String!):String
        destroyImage(imageId:String!):String
    }
`
module.exports = { typeDefs };