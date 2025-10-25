import { render, screen } from '@testing-library/react'
import Blog from './Blog'
import userEvent from '@testing-library/user-event'
import { test } from 'vitest'
import blogService from '../services/blogs'
import BlogForm from './BlogForm'
vi.mock('../services/blogs')

describe('<Blog />', () => {
  let blog
  let user
  let mockSetBlogs

  beforeEach(() => {
    blog = {
      title: 'Testing React components',
      author: 'Randrianarijaona',
      url: 'http://example.com',
      likes: 5,
      user: {
        username: 'nyhasina',
        name: 'Nyhasina',
      },
    }

    user = {
      username: 'nyhasina',
      name: 'Nyhasina',
    }

    mockSetBlogs = vi.fn()
  })
  test('renders title and author, but no url or likes by default', () => {
    render(
      <Blog blog={blog} user={user} blogs={[blog]} setBlogs={mockSetBlogs} />
    )

    //title and author visible
    expect(
      screen.getByText((content) =>
        content.includes('Testing React components')
      )
    ).toBeDefined()

    expect(
      screen.getByText((content) => content.includes('Randrianarijaona'))
    ).toBeDefined()

    // Url and likes not visible
    expect(screen.queryByText('http://example.com')).toBeNull()
    expect(screen.queryByText('likes 5')).toBeNull()
  })

  test('show url and likes view button is clicked', async () => {
    const userEventInstance = userEvent.setup()
    render(
      <Blog blog={blog} user={user} blogs={[blog]} setBlogs={mockSetBlogs} />
    )

    const button = screen.getByText('view')
    await userEventInstance.click(button)

    expect(screen.getByText('http://example.com')).toBeDefined()
    expect(screen.getByText('likes 5')).toBeDefined()
  })

  test('clicking the like button twice calls event handler twice', async () => {
    const userEventInstance = userEvent.setup()
    const blogWithLikes = {
      ...blog,
      likes: 5,
    }
    blogService.update.mockResolvedValue({ ...blog, likes: blog.likes + 1 })

    render(
      <Blog
        blog={blogWithLikes}
        user={user}
        blogs={[blogWithLikes]}
        setBlogs={mockSetBlogs}
      />
    )

    const viewButton = screen.getByText('view')
    await userEventInstance.click(viewButton)

    const likeButton = screen.getByText('like')

    await userEventInstance.click(likeButton)
    await userEventInstance.click(likeButton)

    expect(mockSetBlogs.mock.calls).toHaveLength(2)
  })
})

describe('<BlogForm />', () => {
  test('calls createBlog with correct details when a new blog is created', async () => {
    const createBlog = vi.fn()
    const userEventInstance = userEvent.setup()

    render(<BlogForm createBlog={createBlog} />)

    const inputTitle = screen.getByPlaceholderText('Title')
    const inputAuthor = screen.getByPlaceholderText('Author')
    const inputUrl = screen.getByPlaceholderText('URL')
    const createButton = screen.getByText('create')

    await userEventInstance.type(inputTitle, 'My New Blog')
    await userEventInstance.type(inputAuthor, 'Randrianarijaona')
    await userEventInstance.type(inputUrl, 'http://example.com')

    await userEventInstance.click(createButton)

    expect(createBlog.mock.calls.length).toBe(1)

    expect(createBlog.mock.calls[0][0].title).toBe('My New Blog')
    expect(createBlog.mock.calls[0][0].author).toBe('Randrianarijaona')
    expect(createBlog.mock.calls[0][0].url).toBe('http://example.com')
  })
})
