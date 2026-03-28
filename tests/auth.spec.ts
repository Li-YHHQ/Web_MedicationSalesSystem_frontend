import { test, expect } from '@playwright/test'

// 认证测试需要测试未登录状态，所以覆盖掉全局的 storageState，使用空状态
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('认证流程', () => {

  test('登录成功后跳转到数据看板', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('请输入用户名').fill('123')
    await page.getByPlaceholder('请输入密码').fill('123')
    await page.getByRole('button', { name: '登录' }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('密码错误时停留在登录页', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('请输入用户名').fill('123')
    await page.getByPlaceholder('请输入密码').fill('错误密码123')
    await page.getByRole('button', { name: '登录' }).click()
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })

  test('未登录直接访问看板会跳转到登录页', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })

})
