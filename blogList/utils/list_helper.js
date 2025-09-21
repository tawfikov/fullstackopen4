const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const reducer = (sum, blog) => {
        return sum + blog.likes
    }

    return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
    if (blogs.length ===0) return null
    return blogs.reduce((max, blog) => {
        return blog.likes > max.likes
               ? blog
               : max
    })
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}