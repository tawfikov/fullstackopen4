const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('assert')
const Blog = require('../models/blog')
const app = require('../app')
const api = supertest(app)

const initialBlogs = [
    {
        title: 'xxx',
        author: 'xxx',
        url: 'xxx.com',
        likes: 5
    },
    {
        title: 'xxyyx',
        author: 'xxyyx',
        url: 'xxyyx.com',
        likes: 6
    }
]

const noLikesBlog = {
        title: 'where my likes gone',
        author: 'zzzzz',
        url: 'a7aneek.com'
    }

beforeEach(async() => {
    await Blog.deleteMany({})
    let blogObj = new Blog(initialBlogs[0])
    await blogObj.save()
    blogObj = new Blog(initialBlogs[1])
    await blogObj.save()
})

test('the initial 2 blogs are returned', async() => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, initialBlogs.length)
        
})

test('blogs are returned with a string type id property', async() => {
    const response = await api.get('/api/blogs')
    response.body.forEach(blog => {
        assert.strictEqual(typeof blog.id, 'string')
    })
})

test('adding a blog to the db is a success', async() => {
    const newTestBlog = {
        title: 'xxx',
        author: 'xxx',
        url: 'xxx.com',
        likes: 5
    }

    await api
    .post('/api/blogs')
    .send(newTestBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
    const res = await api.get('/api/blogs')
    assert.strictEqual(res.body.length, initialBlogs.length + 1)
})

test('a new blog that lacks number of likes will default to zero', async() => {
    await api.post('/api/blogs')
    .send(noLikesBlog)
    .expect(201)

    await api.get('/api/blogs')
    const targetBlog = await Blog.findOne({title: 'where my likes gone'})
    assert.strictEqual(targetBlog.likes, 0)
})

describe('required fields return 400', () => {

    const noURLBlog = {title: 'Zamboori', author: 'Mo Zambino'}
    const noTitleBlog = {author: 'Mo Zambino', url: 'zambolla.com'}
    test('a blog with no URL returns 400', async() => {
        await api.post('/api/blogs')
        .send(noURLBlog)
        .expect(400)
    })

    test('a blog with no title returns 400', async() => {
        await api.post('/api/blogs')
        .send(noTitleBlog)
        .expect(400)
    })
})

test('deleting a blog works', async() => {
    const init = await api.get('/api/blogs')
    const toDelete = init.body[1]

    await api.delete(`/api/blogs/${toDelete.id}`)
    .expect(204)

    const resAfter = await api.get('/api/blogs')
    assert.strictEqual(resAfter.body.length, init.body.length - 1)
})

test('patching a blog to edit likes works', async() => {
    const init = await api.get('/api/blogs')
    const toDelete = init.body[1]
    const newData = {likes: toDelete.likes+1}
    const updated = await api
    .patch(`/api/blogs/${toDelete.id}`)
    .send(newData)
    .expect(200)

    assert.strictEqual(updated.body.likes, toDelete.likes+1)
})

after(async () => {
    await mongoose.connection.close()
})