const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  const baseUrl = 'http://127.0.0.1:3003'
  let user1Username
  let user2Username
  const commonPassword = 'password123'

  beforeEach(async ({ page, request }) => {
    // reset database for a clean state
    await request.post(`${baseUrl}/api/testing/reset`)

    // use unique usernames to avoid duplicate-key errors when tests run in parallel
    const uniqueSuffix = `${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`
    user1Username = `testuser1_${uniqueSuffix}`
    user2Username = `testuser2_${uniqueSuffix}`

    const user1 = {
      name: 'Test User One',
      username: user1Username,
      password: commonPassword,
    }
    const user2 = {
      name: 'Test User Two',
      username: user2Username,
      password: commonPassword,
    }

    // create two users via API
    await request.post(`${baseUrl}/api/users/`, { data: user1 })
    await request.post(`${baseUrl}/api/users/`, { data: user2 })

    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.locator('h2', { hasText: 'Login' })).toBeVisible()
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.fill('input[name="Username"]', user1Username)
      await page.fill('input[name="Password"]', commonPassword)
      await page.click('button[type="submit"]')

      await expect(page.locator(`text=Test User One logged in`)).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.fill('input[name="Username"]', user1Username)
      await page.fill('input[name="Password"]', 'wrongpassword')
      await page.click('button[type="submit"]')

      await expect(page.locator('.error')).toBeVisible()
      await expect(page.locator('.error')).toHaveText(
        /wrong username or password/i
      )

      await expect(
        page.locator('text=Test User One logged in')
      ).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await page.fill('input[name="Username"]', user1Username)
      await page.fill('input[name="Password"]', commonPassword)
      await page.click('button[type="submit"]')

      await expect(page.locator('text=Test User One logged in')).toBeVisible()
    })

    test('a new blog can be created', async ({ page }) => {
      const blogTitle = `My first E2E blog ${Date.now()}`
      await page.click('text=create new blog')
      await page.fill('input[name="Title"]', blogTitle)
      await page.fill('input[name="Author"]', 'Test Author')
      await page.fill('input[name="Url"]', 'http://testblog.com')
      await page.click('form button[type="submit"]')

      const blogListItem = page
        .locator('.blog-visible', { hasText: blogTitle })
        .first()
      await expect(blogListItem).toBeVisible()
      await expect(blogListItem).toContainText('Test Author')
    })

    test('a blog can be liked', async ({ page }) => {
      const blogTitle = `Blog to like ${Date.now()}`

      await page.click('text=create new blog')
      await page.fill('input[name="Title"]', blogTitle)
      await page.fill('input[name="Author"]', 'Liker Author')
      await page.fill('input[name="Url"]', 'http://likeblog.com')
      await page.click('form button[type="submit"]')

      const blog = page.locator('.blog-visible', { hasText: blogTitle }).first()
      await expect(blog).toBeVisible()

      await blog.locator('button', { hasText: 'view' }).click()

      const details = blog.locator('.blog-details')
      await expect(details).toBeVisible({ timeout: 5000 })

      const likesElement = details.locator('.likes-count')
      await expect(likesElement).toBeVisible({ timeout: 5000 })

      const initialLikesText = await likesElement.textContent()
      const initialLikes = parseInt(initialLikesText.replace(/\D/g, ''), 10)

      const likeButton = blog.locator('button', { hasText: 'like' })
      await likeButton.click()

      await expect(async () => {
        const newLikesText = await likesElement.textContent()
        const newLikes = parseInt(newLikesText.replace(/\D/g, ''), 10)
        expect(newLikes).toBe(initialLikes + 1)
      }).toPass()
    })

    test('the user who created a blog can delete it', async ({ page }) => {
      const blogTitle = `Blog to delete ${Date.now()}`

      // Create the blog as user1
      await page.click('text=create new blog')
      await page.fill('input[name="Title"]', blogTitle)
      await page.fill('input[name="Author"]', 'Deleter Author')
      await page.fill('input[name="Url"]', 'http://deleteblog.com')
      await page.click('form button[type="submit"]')

      // Find the created blog and open its details
      const blog = page.locator('.blog-visible', { hasText: blogTitle }).first()
      await expect(blog).toBeVisible()
      await blog.locator('button', { hasText: 'view' }).click()
      await expect(blog.locator('.blog-details')).toBeVisible({ timeout: 5000 })

      // Accept the confirm dialog that appears when deleting
      page.once('dialog', async (dialog) => {
        await dialog.accept()
      })

      // Click the delete button and verify the blog is removed from the list
      await blog.locator('button', { hasText: 'delete' }).click()
      await expect(
        page.locator('.blog-visible', { hasText: blogTitle })
      ).toHaveCount(0)
    })

    test("only the user who added the blog sees the blog's delete button", async ({
      page,
    }) => {
      const blogTitle = `Blog delete-visibility ${Date.now()}`

      // Create the blog as user1
      await page.click('text=create new blog')
      await page.fill('input[name="Title"]', blogTitle)
      await page.fill('input[name="Author"]', 'Owner Author')
      await page.fill('input[name="Url"]', 'http://ownerblog.com')
      await page.click('form button[type="submit"]')

      // Locate the blog and open its details as the creator
      const blog = page.locator('.blog-visible', { hasText: blogTitle }).first()
      await expect(blog).toBeVisible()
      await blog.locator('button', { hasText: 'view' }).click()
      await expect(blog.locator('.blog-details')).toBeVisible({ timeout: 5000 })

      // The creator (user1) should see the delete button
      const deleteButtonForOwner = blog.locator('button.delete-button')
      await expect(deleteButtonForOwner).toBeVisible()

      // Now simulate a different logged-in user:
      // clear localStorage to remove the logged-in user and reload the page,
      // then log in as user2
      await page.evaluate(() => localStorage.clear())
      await page.reload()
      await page.fill('input[name="Username"]', user2Username)
      await page.fill('input[name="Password"]', commonPassword)
      await page.click('button[type="submit"]')

      // Ensure logged in as second user
      await expect(page.locator('text=Test User Two logged in')).toBeVisible()

      // Locate the same blog and open its details as user2
      const blogAsOtherUser = page
        .locator('.blog-visible', { hasText: blogTitle })
        .first()
      await expect(blogAsOtherUser).toBeVisible()
      await blogAsOtherUser.locator('button', { hasText: 'view' }).click()
      await expect(blogAsOtherUser.locator('.blog-details')).toBeVisible({
        timeout: 5000,
      })

      // The delete button should NOT be visible to user2
      await expect(blogAsOtherUser.locator('button.delete-button')).toHaveCount(
        0
      )
    })

    test('blogs are ordered by likes (most likes first)', async ({
      page,
      request,
    }) => {
      // Create several blogs via API with specific likes counts.
      // Use API login to get token for creation.
      const loginRes = await request.post(`${baseUrl}/api/login`, {
        data: { username: user1Username, password: commonPassword },
      })
      const loginBody = await loginRes.json()
      const token = loginBody.token

      const blogsToCreate = [
        {
          title: 'Medium likes blog',
          author: 'Author A',
          url: 'http://a.com',
          likes: 10,
        },
        {
          title: 'Most liked blog',
          author: 'Author B',
          url: 'http://b.com',
          likes: 50,
        },
        {
          title: 'Least liked blog',
          author: 'Author C',
          url: 'http://c.com',
          likes: 1,
        },
      ]

      // Create them in non-sorted order to ensure the app needs to sort
      await request.post(`${baseUrl}/api/blogs`, {
        data: blogsToCreate[0],
        headers: { Authorization: `Bearer ${token}` },
      })
      await request.post(`${baseUrl}/api/blogs`, {
        data: blogsToCreate[1],
        headers: { Authorization: `Bearer ${token}` },
      })
      await request.post(`${baseUrl}/api/blogs`, {
        data: blogsToCreate[2],
        headers: { Authorization: `Bearer ${token}` },
      })

      // Reload UI to fetch the newly created blogs
      await page.goto('/')

      // Wait for at least 3 blogs to be visible
      const blogItems = page.locator('.blog-visible')
      await expect(blogItems).toHaveCount(3)

      // For each blog in the DOM order, click view to reveal likes and read them
      const likesArray = []
      const titlesArray = []
      const count = await blogItems.count()
      for (let i = 0; i < count; i++) {
        const item = blogItems.nth(i)
        // reveal details
        await item.locator('button', { hasText: 'view' }).click()
        const details = item.locator('.blog-details')
        await expect(details).toBeVisible({ timeout: 5000 })
        const likesText = await details.locator('.likes-count').textContent()
        const likesNum = parseInt((likesText || '').replace(/\D/g, ''), 10)
        const titleText = await item.textContent()
        likesArray.push(likesNum)
        titlesArray.push((titleText || '').trim())
      }

      // Check that likesArray is sorted descending
      for (let i = 0; i < likesArray.length - 1; i++) {
        expect(likesArray[i]).toBeGreaterThanOrEqual(likesArray[i + 1])
      }

      // Optional: ensure the top blog is indeed 'Most liked blog'
      expect(titlesArray[0]).toContain('Most liked blog')
    })
  })
})
