const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    name: String,
    hashedPassword: String,
    blogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
    }]

})

userSchema.set('toJSON', {
    transform: (document, returnedObj) => {
        if (!returnedObj) return

        if (returnedObj._id) {
            returnedObj.id = returnedObj._id.toString(),
            delete returnedObj._id
        }
        delete returnedObj.__v,
        delete returnedObj.hashedPassword
    }
})

module.exports = mongoose.model('User', userSchema)