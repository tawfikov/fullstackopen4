blogsRouter = require('express').Router()
const Blog = require('../models/blog.js')
const logger = require('../utils/logger.js')
const User = require('../models/user.js')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async(request, response) => {
  const blogs = await Blog.find({}).populate('user', {username: 1, name: 1})
  response.json(blogs)
})

blogsRouter.post('/', async(request, response) => {
  const body = request.body
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({error: 'Invalid token'})
  }
  const user = await User.findById({_id: decodedToken.id})
  if (!user) {
    return response.status(400).json({error: 'Invalid user ID'})
  }

  try{
    
    const blog = new Blog({
      ...request.body,
      user: user._id
    })
    const result = await blog.save()
    user.blogs = user.blogs.concat(result._id)
    await user.save()
    response.status(201).json(result)
  } catch(error){
    logger.error(error.message)
    response.status(400).json({error: error.message})
  }
})

blogsRouter.delete('/:id', async(request, response) => {
  try{
    const blog = await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } catch(error) {
    logger.error(error.message)
    response.status(500).json({error: error.message})
  }
})

blogsRouter.patch('/:id', async(request, response) =>{
  try {
    const blog = await Blog.findByIdAndUpdate(request.params.id, request.body, {new: true, runValidators: true, context: 'query'})
    response.json(blog)
  } catch(error) {
    logger.error(error.message)
    response.status(500).json({error: error.message})
  }
})

module.exports = blogsRouter
