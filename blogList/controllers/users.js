const userRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

userRouter.post('/', async(req, res) => {
    const {username, password, name} = req.body

    if (!username || !password) {
        return res.status(400).json({error: 'username and password are required'})
    }
    if (username.length < 3 || password.length < 3) {
        return res.status(400).json({error: 'username and password must be at least 3 characters'})
    }
    const duplicateUsername = await User.findOne({username: username})
    if (duplicateUsername) {
        return res.status(400).json({error: 'This username is already taken'})
    }

    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        hashedPassword
    })

    const savedUser = await user.save()
    res.status(201).json(savedUser)
})

userRouter.get('/', async(req, res) => {
    const users = await User.find({}).populate('blogs', {
        title: 1,
        author: 1,
        url: 1,
    })
    res.json(users)
})

module.exports = userRouter