blogsRouter = require('express').Router()
const Blog = require('../models/blog.js')
const logger = require('../utils/logger.js')
const User = require('../models/user.js')
const middleware = require('../utils/middleware.js')

blogsRouter.get('/', async(request, response) => {
  try {
    const blogs = await Blog.find({})
    .populate('user', {username: 1, name: 1}).populate('comments.user', { username: 1, name: 1 })
  response.json(blogs)
  } catch(error) {
    console.error('Error fetching blogs:', error)
    response.status(500).json({error: error.message})
  }
})

blogsRouter.post('/', middleware.getUser, async(request, response) => {
  const user = request.user
  
  if (!user) {
    return response.status(401).json({error: 'Invalid user ID'})
  }

  try{
    
    const blog = new Blog({
      ...request.body,
      user: user._id,
      date: Date.now()
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

blogsRouter.patch('/:id/like', middleware.getUser, async(request, response) =>{
  const user = request.user
  try {
    if (!user){
      return response.status(400).json({error: 'You must log in first'})
    }
    const blog = await Blog.findById(request.params.id)
    if (!blog) {
      return response.status(404).json({error: 'Blog not found'})
    }
    
    const userId = user._id.toString()
    const hasLiked = blog.likes.map(id => id.toString()).includes(userId)

    if (hasLiked) {
      blog.likes = blog.likes.filter(id => id.toString() !== userId)
    } else {
      blog.likes.push(user._id)
    }
    await blog.save()
    const updatedBlog = await Blog.findById(blog._id)
      .populate('user', { username: 1, name: 1 })
      .populate('comments.user', { username: 1, name: 1 })
    response.json(updatedBlog)
  } catch(error) {
    logger.error(error.message)
    response.status(500).json({error: error.message})
  }
})

blogsRouter.put('/:id/comment', middleware.getUser, async (request, response) => {
  const user = request.user
  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).json({error: 'Blog not found'})
    }
  if (!user) {
    return response.status(401).json({error: 'You must log in first'})
  }
  const comment = {
    content: request.body.content,
    user: user._id,
    date: Date.now()
  }
  if (!comment.content || !comment.content.trim()) {
    return response.status(400).json({error: 'You can\'t add an empty comment'})
  }
  try {
    blog.comments.push(comment)
    const updatedBlog = await blog.save()
    let populatedBlog = updatedBlog
    if (updatedBlog.comments.length > 0) {
      populatedBlog = await Blog.findById(updatedBlog._id)
      .populate('user', {username: 1, name: 1}).populate('comments.user', { username: 1, name: 1 })
    }
  return response.json(populatedBlog)
  } catch(error) {
    logger.error(error.message)
    response.status(500).json({error: error.message})
  }
})

module.exports = blogsRouter
