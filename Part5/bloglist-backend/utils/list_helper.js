const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null

  return blogs.reduce((favorite, blog) => {
    return blog.likes > (favorite.likes || 0) ? blog : favorite
  }, {})
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null

  const count = {}

  blogs.forEach((blog) => {
    count[blog.author] = (count[blog.author] || 0) + 1
  })

  let maxBlogs = 0
  let topAuthor = null

  for (const author in count) {
    if (count[author] > maxBlogs) {
      maxBlogs = count[author]
      topAuthor = author
    }
  }

  return { author: topAuthor, blogs: maxBlogs }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null

  const likesCount = {}

  blogs.forEach((blog) => {
    likesCount[blog.author] = (likesCount[blog.author] || 0) + blog.likes || 0
  })

  let maxAuthor = null
  let maxLikes = 0

  for (const author in likesCount) {
    if (likesCount[author] > maxLikes) {
      maxAuthor = author
      maxLikes = likesCount[author]
    }
  }

  return { author: maxAuthor, likes: maxLikes }
}

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes }
