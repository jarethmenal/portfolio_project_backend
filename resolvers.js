require('dotenv').config();
const userSchema = require('./models/user_schema')
const registrationSentSchema = require('./models/registration_sent_schema')
const recoverySentSchema = require('./models/recovery_sent_schema')
const image_collection_schema = require('./models/image_collection_schema')
const medicine_schema = require('./models/medicine_schema')
const authJWT = require('./util/authJWT')
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const { cloudinary } = require('./util/cloudinary')
const access = process.env.ACCESS_TOKEN_SECRET;
const register = process.env.REGISTER_TOKEN_SECRET;
const recover = process.env.RECOVER_TOKEN_SECRET;
const validateMail = require("./util/validateMail");
const sendMail = require("./util/sendMail");

const resolvers = {
    Query: {
        loginUser: async (parent, { user }) => {
            const { email, password } = user;

            console.log(email, password)
            if (!email) {
                throw new Error(`Please insert your email's account.`)
            }
            if (!password) {
                throw new Error(`Please insert your account's password.`)
            }
            const dataUser = await resolvers.Query.getUserExists([], { email: email });
            console.log(dataUser)
            if (!dataUser) {
                throw new Error('Email inserted does not match with any of our accounts.')
            }
            if (await bcrypt.compare(password, dataUser.password)) {
                accessToken = jwt.sign(dataUser.toJSON(), access, { expiresIn: "1h" })
                return (`Bearer ${accessToken}`)
            }
            throw new Error(`Email and Password don't match.`)

        },
        getAllUsers: async () => {
            return await userSchema.find();
        },
        getUser: async (parent, body, context) => {
            const user = await resolvers.Query.validateToken(null, { type: access }, context);
            return await userSchema.findById(user._id);
        },
        getUserExists: async (parent, { email }) => {
            return await userSchema.findOne({ email });
        },
        getImageCollection: async (parent, { filter }, context) => {
            const { list } = await image_collection_schema.findOne({ name: filter });
            console.log(list)
            return list;
        },
        getAllMedicines: async (parent, body, context) => {
            await resolvers.Query.validateToken(null, { type: access }, context);
            return await medicine_schema.find();
        },
        getMedicine: async (parent, { filter }, context) => {
            await resolvers.Query.validateToken(null, { type: access }, context);
            return await medicine_schema.findOne({ name: filter });
        },
        validateToken: async (parent, { type }, context) => {
            return await authJWT(context, type);
        },
        getEmailRegister: async (parent, body, context) => {
            const { email } = await resolvers.Query.validateToken(null, { type: register }, context);

            const userExists = await resolvers.Query.getUserExists([], { email });
            if (userExists) {
                throw new Error('This email has already been registered.')
            }
            const userRegistrationSent = await registrationSentSchema.findOne({ email });
            if (!userRegistrationSent) {
                throw new Error('This email has not solicited any registration.')
            }

            return email;
        },
        getEmailRecovery: async (parent, body, context) => {
            const { email } = await resolvers.Query.validateToken(null, { type: recover }, context);

            const userExists = await resolvers.Query.getUserExists([], { email });
            if (!userExists) {
                throw new Error('This email does not have any account associated with.')
            }
            const userRecoverySent = await recoverySentSchema.findOne({ email });
            if (!userRecoverySent) {
                throw new Error('This email has not solicited any recovery process.')
            }
            return email;
        }
    },

    Mutation: {
        sendRegisterLink: async (parent, { email, baseUrl }) => {
            if (!validateMail.validate(email)) {
                throw new Error('Email format is not valid, please use "emailname@company.ext".')
            }
            const userExists = await resolvers.Query.getUserExists([], { email });
            if (userExists) {
                throw new Error('This email has already been registered.')
            }
            const userRegistrationSent = await registrationSentSchema.findOne({ email });
            if (userRegistrationSent) {
                sendMail.sendMail(userRegistrationSent.email, "Email Validation and Registration", `Please click the following link to proceed with your registration: ${userRegistrationSent.url}\nTHANKS!`)
                return `An email has been re-sent to ${email}. Please click on the URL inside the mail we sent. Try not to lose it this time.`
            }
            try {
                const registerToken = jwt.sign({ email }, register, { expiresIn: "1h" });
                const url = `${baseUrl}${registerToken}`;
                const newRegisterSent = new registrationSentSchema({ email, url });
                await newRegisterSent.save()
                sendMail.sendMail(email, "Email Validation and Registration", `Please click the following link to proceed with your registration: ${url}\nTHANKS!`)
                return `An email has been sent to ${email}. Please click on the URL inside the mail we sent.`
            } catch (error) {
                throw new Error(error)
            }
        },
        sendRecoveryLink: async (parent, { email, baseUrl }) => {
            console.log(email)
            if (!validateMail.validate(email)) {
                throw new Error('Email format is not valid, please use "emailname@company.ext".')
            }
            const userExists = await resolvers.Query.getUserExists([], { email });
            if (!userExists) {
                throw new Error('This email does not have an account associated with.')
            }
            const userRecoverySent = await recoverySentSchema.findOne({ email });
            if (userRecoverySent) {
                sendMail.sendMail(userRecoverySent.email, "Email Password Recovery", `Please click the following link to proceed with your password recovery: ${userRecoverySent.url}\nTHANKS!`)
                return `An email has been re-sent to ${email}. Please click on the URL inside the mail we sent. Try not to lose it this time.`
            }

            const recoverToken = jwt.sign({ email }, recover, { expiresIn: "1h" });
            const url = `${baseUrl}${recoverToken}`;
            const newRecoverSent = new recoverySentSchema({ email, url });

            await newRecoverSent.save()
            sendMail.sendMail(email, "Email Password Recovery", `Please click the following link to proceed with your password recovery: ${url}\nTHANKS!`)
            return `An email has been sent to ${email}. Please click on the URL inside the mail we sent.`

        },
        createUser: async (parent, { user }, context, info) => {
            const { name, email, password, profpic, confirmPassword } = user;
            const possible_register_errors = {
                name: `Please don't leave your name field in blank.`,
                email: `Please don't leave your email field in blank.`,
                password: `Please don't leave your password field in blank.`,
                confirmPassword: `Please don't leave your password confirmation field in blank.`
            };
            for (const key in { name, email, password, confirmPassword }) {
                if (user[key].trim() === '') {
                    throw new Error(possible_register_errors[key])
                }
            }

            if (confirmPassword !== password) { throw new Error('Please make sure that both passwords are the same.') }

            resolvers.Query.validateToken(null, { type: register }, context)

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = { name, email, password: hashedPassword };

            if (profpic !== null) {
                newUser.profpic = await resolvers.Mutation.uploadImage(null, profpic)
            }
            const response = new userSchema(newUser)
            await resolvers.Mutation.deleteRegisterLink('', { email: email });
            await response.save();
            return response;
        },
        deleteUser: async (parent, { id }) => {
            await userSchema.findByIdAndDelete(id);
            return `User ${id} was deleted.`;
        },
        deleteRegisterLink: async (parent, { email }) => {
            await registrationSentSchema.findOneAndDelete({ email: email });
            return `User ${email} was deleted.`;
        },
        updatePassword: async (parent, { email, newPassword, confirmPassword, location }, context) => {
            const locationType = location === 'recover' ? recover : access;
            await resolvers.Query.validateToken(null, { type: locationType }, context);
            if (newPassword.trim() === '' || confirmPassword.trim() === '') {
                throw new Error('Please do not leave any whitespaces in the form.')
            }
            if (confirmPassword !== newPassword) { throw new Error('Please make sure that both passwords are the same.') }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await userSchema.findOneAndUpdate({ email: email }, { password: hashedPassword });
            await recoverySentSchema.findOneAndDelete({ email: email });

        },

        updateUser: async (_, { id, user }) => {
            return await userSchema.findByIdAndUpdate(id, {
                $set: user
            }, { new: true });
        },
        uploadImage: async (parent, imageFile) => {
            try {
                console.log('file: ', imageFile)
                const uploadResponse = await cloudinary.uploader.upload(imageFile, {
                    upload_preset: 'portfolio_project1'
                })
                return uploadResponse.public_id;
            } catch (error) {
                throw new Error(error)
            }
        },
        destroyImage: async (parent, imageId, context) => {
            await resolvers.Query.validateToken(null, { type: access }, context);
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