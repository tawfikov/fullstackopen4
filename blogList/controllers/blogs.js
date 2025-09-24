blogsRouter = require('express').Router()
const Blog = require('../models/blog.js')
const logger = require('../utils/logger.js')

blogsRouter.get('/', async(request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async(request, response) => {
  try{
    const blog = new Blog(request.body)
    const result = await blog.save()
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
