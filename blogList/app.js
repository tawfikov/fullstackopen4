const express = require('express')
const mongoose = require('mongoose')
const config = require('./utils/config.js')
const logger = require('./utils/logger.js')
const blogsRouter = require('./controllers/blogs.js')
const userRouter = require('./controllers/users.js')
const loginRouter = require('./controllers/login.js')
const middleware = require('./utils/middleware.js')

const app = express()

logger.info('Connecting to MongoDB..')
mongoose.connect(config.MONGODB_URI)
    .then(()=>{
        logger.info('connected to MongoDB')
    })
    .catch((error)=>{
        logger.error('An error happend while connecting to MongoDB: ', error.message)
    })

if(process.env.NODE_ENV ==='test'){
    const testRouter = require('./controllers/test')
    app.use('/api/test', testRouter)
}
app.use(express.static('dist'))
app.use(middleware.getToken)
app.use(express.json())
app.use('/api/blogs', blogsRouter)
app.use('/api/users', userRouter)
app.use('/api/login', loginRouter)

 module.exports = app