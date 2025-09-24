const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://tawfikov:${password}@myfirstnosql.ztoda1c.mongodb.net/blogList_test?retryWrites=true&w=majority&appName=MyFirstNoSQL`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: {type:Number, default:0},
})

const Blog = mongoose.model('Blog', blogSchema)

const blog = new Blog({
    title: process.argv[3],
    author: process.argv[4],
    url: process.argv[5],
    likes: process.argv[6]
})

blog.save().then((result) => {
    console.log('blog saved!')
    mongoose.connection.close()
 })
