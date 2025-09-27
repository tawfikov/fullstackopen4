const getToken = (request, response, next) => {
    const auth = request.get('authorization')
    if (auth && auth.startsWith('Bearer ')) {
        request.token = auth.replace('Bearer ', '')
    } else {
    request.token = null
    }
    next()
}
module.exports = {getToken}