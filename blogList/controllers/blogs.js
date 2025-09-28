blogsRouter = require('express').Router()
const Blog = require('../models/blog.js')
const logger = require('../utils/logger.js')
const User = require('../models/user.js')
const middleware = require('../utils/middleware.js')

blogsRouter.get('/', async(request, response) => {
  const blogs = await Blog.find({}).populate('user', {username: 1, name: 1})
  response.json(blogs)
})

blogsRouter.post('/', middleware.getUser, async(request, response) => {
  const user = request.user
  
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

blogsRouter.delete('/:id', middleware.getUser, async(request, response) => {
  try{
    const user = request.user
    const blog = await Blog.findById(request.params.id)
    if (user._id.toString() !== blog.user._id.toString()) {
      return response.status(403).json({error: 'user is not authorized'})
    }
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } catch(error) {
    logger.error(error.message)
    response.status(500).json({error: error.message})
  }
})

blogsRouter.patch('/:id', middleware.getUser, async(request, response) =>{
  const user = request.user
  try {
    const blog = await Blog.findById(request.params.id)
    if (user._id.toString() !== blog.user._id.toString()) {
      return response.status(403).json({error: 'user is not authorized'})
    }
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, request.body, {new: true, runValidators: true, context: 'query'})
    response.json(updatedBlog)
  } catch(error) {
    logger.error(error.message)
    response.status(500).json({error: error.message})
  }
})

module.exports = blogsRouter
