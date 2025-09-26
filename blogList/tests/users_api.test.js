const {test, after, beforeEach, describe} = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const User = require('../models/user')
const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)

const initialUsers = [
    {
        username: 'xxxx',
        password: 'xxxx',
        name: 'xxx xxx'
    },
    {
        username: 'yyyy',
        password: 'yyyy',
        name: 'yyyy yyy'
    }
]

const existingUsername = {
    username: 'xxxx',
    password: '123456',
    name: 'xxx xxx'
}

const noPassword = {
    username: 'xxyxx',
    name: 'xxx xxx'
}

const noUsername = {
    password: 'xxxx',
    name: 'xxx xxx'
}


const shortUsername = {
    username: 'xx',
    password: '12345',
    name: 'xxx xxx'
}

const shortPassword = {
    username: 'xxyyxx',
    password: '12',
    name: 'xxx xxx'
}

beforeEach(async () => {
    await User.deleteMany()

    const bcrypt = require('bcrypt')
    const hashedPassword1 = await bcrypt.hash(initialUsers[0].password, 10)
    const hashedPassword2 = await bcrypt.hash(initialUsers[1].password, 10)
    let userObj = new User({
        username: initialUsers[0].username,
        name: initialUsers[0].name,
        hashedPassword: hashedPassword1
    })
    await userObj.save()

    userObj = new User({
        username: initialUsers[1].username,
        name: initialUsers[1].name,
        hashedPassword: hashedPassword2
    })
    await userObj.save()
})

describe('Creating new user validation', () => {
    test('duplicate usernames give 400', async()=>{
        const res = await api
            .post('/api/users')
            .send(existingUsername)
            .expect(400)
        assert.match(res.body.error, /taken/)
    })

    test('no username gives 400', async()=>{
        const res = await api
            .post('/api/users')
            .send(noUsername)
            .expect(400)
        assert.match(res.body.error, /required/)
    })

    test('no password gives 400', async()=>{
        const res = await api
            .post('/api/users')
            .send(noPassword)
            .expect(400)
        assert.match(res.body.error, /required/)
    })

    test('short usernames give 400', async()=>{
        const res = await api
            .post('/api/users')
            .send(shortUsername)
            .expect(400)
        assert.match(res.body.error, /3 characters/)
    })

    test('short passwords give 400', async()=>{
        const res = await api
            .post('/api/users')
            .send(shortPassword)
            .expect(400)
        assert.match(res.body.error, /3 characters/)
    })
} )

after(async()=> {
    await mongoose.connection.close()
})