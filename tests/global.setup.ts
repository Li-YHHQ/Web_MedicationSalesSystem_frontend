import { chromium } from '@playwright/test'
import * as fs from 'fs'
import { fileURLToPath } from 'url'
import * as path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function globalSetup() {
  const authDir = path.join(__dirname, '.auth')
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true })
  }

  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.goto('http://8.131.84.80/login')
  await page.getByPlaceholder('请输入用户名').fill('123')
  await page.getByPlaceholder('请输入密码').fill('123')
  await page.getByRole('button', { name: '登录' }).click()

  await page.waitForURL('**/dashboard', { timeout: 10000 })
  await page.context().storageState({ path: 'tests/.auth/user.json' })

  console.log('✅ 全局登录成功，token 已保存')
  await browser.close()
}

export default globalSetup
