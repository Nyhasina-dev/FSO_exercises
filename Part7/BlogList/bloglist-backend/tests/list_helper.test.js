const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

test('dummy returns 1', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

describe('total likes', () => {
  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      __v: 0,
    },
  ]

  const listWithMultipleBlogs = [
    ...listWithOneBlog,
    {
      _id: '5a422a851b54a676234d17f7',
      title: 'React patterns',
      author: 'Michael Chan',
      url: 'https://reactpatterns.com/',
      likes: 7,
      __v: 0,
    },
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
      __v: 0,
    },
    {
      _id: '5a422b3a1b54a676234d17f9',
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12,
      __v: 0,
    },
    {
      _id: '5a422b891b54a676234d17fa',
      title: 'First class tests',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
      likes: 10,
      __v: 0,
    },
    {
      _id: '5a422ba71b54a676234d17fb',
      title: 'TDD harms architecture',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
      likes: 0,
      __v: 0,
    },
    {
      _id: '5a422bc61b54a676234d17fc',
      title: 'Type wars',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
      likes: 2,
      __v: 0,
    },
  ]
  // total likes
  test('of empty list is zero', () => {
    const result = listHelper.totalLikes([])
    assert.strictEqual(result, 0)
  })

  test('when list has only one blog equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 5)
  })

  test('of a bigger list is calculated right', () => {
    const result = listHelper.totalLikes(listWithMultipleBlogs)
    assert.strictEqual(result, 41)
  })
})

// favorite blog
describe('favorite blog', () => {
  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      __v: 0,
    },
  ]

  const listWithMultipleBlogs = [
    ...listWithOneBlog,
    {
      _id: '5a422b891b54a676234d17f9',
      title: 'Second blog',
      author: 'Someone Else',
      url: 'http://example.com/2',
      likes: 12,
      __v: 0,
    },
    {
      _id: '5a422ba71b54a676234d17fa',
      title: 'Third blog',
      author: 'Another Author',
      url: 'http://example.com/3',
      likes: 7,
      __v: 0,
    },
  ]

  test('when list has only one blog, returns that blog', () => {
    const result = listHelper.favoriteBlog(listWithOneBlog)
    assert.deepStrictEqual(result, listWithOneBlog[0])
  })

  test('when list has multiple blogs, returns the on with most likes', () => {
    const result = listHelper.favoriteBlog(listWithMultipleBlogs)
    assert.deepStrictEqual(result, listWithMultipleBlogs[1])
  })

  test('when list is empty, returns null', () => {
    const result = listHelper.favoriteBlog([])
    assert.strictEqual(result, null)
  })
})

const blogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    likes: 7,
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    likes: 5,
  },
  {
    title: 'Canonical string reduction',
    author: 'Michael Chan',
    likes: 12,
  },
  {
    title: 'First class tests',
    author: 'Robert C. Martin',
    likes: 10,
  },
  {
    title: 'TDD harms architecture',
    author: 'Michael Chan',
    likes: 0,
  },
  {
    title: 'Type wars',
    author: 'Robert C. Martin',
    likes: 2,
  },
]

// most Top blog

describe('mostBlogs', () => {
  test('returns the author with the most blogs', () => {
    const result = listHelper.mostBlogs(blogs)
    assert.deepStrictEqual(result, { author: 'Michael Chan', blogs: 3 })
  })

  test('return null for empty list', () => {
    assert.strictEqual(listHelper.mostBlogs([]), null)
  })

  test('returns correct result if only one blog', () => {
    assert.deepStrictEqual(
      listHelper.mostBlogs([{ title: 'A', author: 'Author 1', likes: 5 }]),
      { author: 'Author 1', blogs: 1 }
    )
  })
})

// most liked blog

describe('mostLikes', () => {
  test('returns the author with the most total likes', () => {
    const result = listHelper.mostLikes(blogs)
    assert.deepStrictEqual(result, { author: 'Michael Chan', likes: 19 })
  })

  test('returns null for empty list', () => {
    assert.strictEqual(listHelper.mostLikes([]), null)
  })

  test('returns correct if only one blog', () => {
    assert.deepStrictEqual(
      listHelper.mostLikes([{ title: 'A', author: 'Alice', likes: 5 }]),
      { author: 'Alice', likes: 5 }
    )
  })
})
