require('dotenv').config();
const userSchema = require('./models/user_schema')
const registrationSentSchema = require('./models/registration_sent_schema')
const image_collection_schema = require('./models/image_collection_schema')
const authJWT = require('./util/authJWT')
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const { cloudinary } = require('./util/cloudinary')
const access = process.env.ACCESS_TOKEN_SECRET;
const register = process.env.REGISTER_TOKEN_SECRET;
const validateMail = require("./util/validateMail");
const sendMail = require("./util/sendMail");

const resolvers = {
    Query: {
        loginUser: async (parent, { user }) => {
            const dataUser = await resolvers.Query.getUserExists([], { email: user.email });
            if (!dataUser) {
                throw new Error('Email inserted does not match with any of our accounts.')
            }
            if (await bcrypt.compare(user.password, dataUser.password)) {
                accessToken = jwt.sign(dataUser.toJSON(), access, { expiresIn: "2m" })
                return (`Bearer ${accessToken}`)
            }
            throw new Error(`Email and Password don't match.`)

        },
        getAllUsers: async () => {
            const response = await userSchema.find();
            return response;
        },
        getUser: async (parent, body, context) => {
            const user = authJWT(context, access);
            console.log(user)
            const response = await userSchema.findById(user._id);
            return response;
        },
        getUserExists: async (parent, { email }) => {
            return await userSchema.findOne({ email });
        },
        getImageCollection: async (parent, { filter }) => {
            const response = await image_collection_schema.findOne({ name: filter });
            return response;
        },
        // checkAuthJWT: async () => {

        // }
    },

    Mutation: {
        sendRegisterCode: async (parent, { email, baseUrl }) => {
            if (!validateMail.validate(email)) {
                throw new Error('Email format is not valid, please use "emailname@company.ext".')
            }
            userExists = await resolvers.Query.getUserExists([], { email });
            if (userExists) {
                throw new Error('This email has already been registered.')
            }
            userRegistrationSent = await registrationSentSchema.findOne({ email });
            if (userRegistrationSent) {
                throw new Error('This email has already been sent a registration link. If another code is needed, 5 minutes shall be waited.')
            }
            try {
                const registerToken = jwt.sign({ email }, register, { expiresIn: "5m" });
                const url = `${baseUrl}${registerToken}`;
                const newRegisterSent = new registrationSentSchema({ email, url });
                await newRegisterSent.save()
                sendMail.sendMail(email, "Email Validation and Registration", `Please click the following link to proceed with your registration: ${url}\nTHANKS!`)
                return `An email has been sent to ${email}. Please click on the URL inside the mail we sent.`
            } catch (error) {
                throw new Error(error)
            }
        },
        createUser: async (parent, { user }, context, info) => {
            const { name, email, password, profpic } = user;
            const response = new userSchema({ name, email, password, profpic })
            await response.save();
            return response;
        },
        deleteUser: async (parent, { id }) => {
            await userSchema.findByIdAndDelete(id);
            return `User ${id} was deleted.`;
        },
        updateUser: async (parent, { id, user }) => {
            const response = await userSchema.findByIdAndUpdate(id, {
                $set: user
            }, { new: true });
            return response;
        },
        uploadImage: async (parent, { imageFile }) => {
            try {
                const uploadResponse = await cloudinary.uploader.upload(imageFile, {
                    upload_preset: 'portfolio_project1'
                })
                return uploadResponse.public_id;
            } catch (error) {
                throw new Error(error)
            }
        },
        destroyImage: async (parent, imageId) => {
            const result = await cloudinary.uploader.destroy(imageId);
            if (result.result === 'not found') {
                throw new Error('Image requested for deletion has not been found.')
            }
            return result;
        },
        replaceProfilePic: async (parent, { newImageFile }, context) => {
            const userResult = await resolvers.Query.getUser(null, null, context);
            await resolvers.Mutation.destroyImage(null, userResult.profpic);
            const newImageId = await resolvers.Mutation.uploadImage(null, { newImageFile });
            userResult.profpic = newImageId;
            await resolvers.Mutation.updateUser(null, { id: userResult.id, user: userResult });
            return 'Your profile picture has been succesfully updated!'
        }
    }
}

module.exports = { resolvers }