const mongoose = require('mongoose')

const blogSchema = mongoose.Schema({
  title: {type: String, required: true},
  author: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  url: {type: String, required: true},
  date: {type: Date, default: Date.now},
  likes: [{type: mongoose.Schema.Types.ObjectId, ref: 'User', default: []}],
  comments: [{
    content: {type: String, required: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    date: {type: Date, default: Date.now}
  }]
})

blogSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString(),
        delete returnedObject._id,
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Blog', blogSchema)