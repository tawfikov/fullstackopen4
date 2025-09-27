const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('assert')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')

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

let auth

beforeEach(async() => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const hashed = await bcrypt.hash('123456', 10)
    const user = new User({username: 'testuser', name: 'Test Name', hashedPassword: hashed})
    await user.save()

    const login = await api
        .post('/api/login')
        .send({username: 'testuser', password: '123456'})
    auth = {Authorization: `Bearer ${login.body.token}`}
    
    let blogObj = new Blog({...initialBlogs[0], user: user._id})
    await blogObj.save()
    blogObj = new Blog({...initialBlogs[1], user: user._id})
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
    .set(auth)
    .send(newTestBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
    const res = await api.get('/api/blogs')
    assert.strictEqual(res.body.length, initialBlogs.length + 1)
})

test('a new blog that lacks number of likes will default to zero', async() => {
    await api.post('/api/blogs').set(auth)
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
        await api.post('/api/blogs').set(auth)
        .send(noURLBlog)
        .expect(400)
    })

    test('a blog with no title returns 400', async() => {
        await api.post('/api/blogs').set(auth)
        .send(noTitleBlog)
        .expect(400)
    })
})

test('deleting a blog works', async() => {
    const init = await api.get('/api/blogs')
    const toDelete = init.body[1]

    await api.delete(`/api/blogs/${toDelete.id}`).set(auth)
    .expect(204)

    const resAfter = await api.get('/api/blogs')
    assert.strictEqual(resAfter.body.length, init.body.length - 1)
})

test('patching a blog to edit likes works', async() => {
    const init = await api.get('/api/blogs')
    const toDelete = init.body[1]
    const newData = {likes: toDelete.likes+1}
    const updated = await api
    .patch(`/api/blogs/${toDelete.id}`).set(auth)
    .send(newData)
    .expect(200)

    assert.strictEqual(updated.body.likes, toDelete.likes+1)
})

test('adding a block with no token fails with 401'), async () => {
    const res = await api
        .post('/api/blogs')
        .send(newTestBlog)
        .expect(401)
    assert.match(res.body.err, /missing/)
}

after(async () => {
    await mongoose.connection.close()
})