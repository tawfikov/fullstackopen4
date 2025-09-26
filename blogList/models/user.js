const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    name: String,
    hashedPassword: String,

})

userSchema.set('toJSON', {
    transform: (document, returnedObj) => {
        returnedObj.id = returnedObj._id.toString(),
        delete returnedObj._id,
        delete returnedObj.__v,
        delete returnedObj.hashedPassword
    }
})

module.exports = mongoose.model('User', userSchema)