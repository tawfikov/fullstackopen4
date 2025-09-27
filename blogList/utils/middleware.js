const jwt = require('jsonwebtoken')
const User = require('../models/user.js')

const getToken = (request, response, next) => {
    const auth = request.get('authorization')
    if (auth && auth.startsWith('Bearer ')) {
        request.token = auth.replace('Bearer ', '')
    } else {
    request.token = null
    }
    next()
}

const getUser = async(request, response, next) => {
    if (!request.token) {
        return response.status(401).json({error: 'Missing token'})
    }
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!decodedToken) {
        return response.status(401).json({error: 'Invalid token'})
    }
    request.user = await User.findById(decodedToken.id)
    next()
}
module.exports = {getToken, getUser}