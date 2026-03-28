import { test, expect } from '@playwright/test'

const TEST_CODE = `TEST${Date.now()}`
const TEST_NAME = '[TEST]测试药品'
const TEST_NAME_EDITED = '[TEST]测试药品_已修改'

async function clickSubmit(page: any) {
  // 使用 DrugList.vue 里加的 data-testid 精确定位提交按钮
  await page.locator('[data-testid="btn-drug-submit"]').click()
}

test.describe('药品管理', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/drugs')
    await page.waitForLoadState('networkidle')
  })

  test('药品列表页正常加载', async ({ page }) => {
    await expect(page.getByPlaceholder('药品名称 / 通用名称')).toBeVisible()
    await expect(page.getByRole('button', { name: '新增药品' })).toBeVisible()
    await expect(page.locator('table tbody tr').first()).toBeVisible()
  })

  test('搜索药品名称可以筛选结果', async ({ page }) => {
    await page.getByPlaceholder('药品名称 / 通用名称').fill('左氧氟沙星')
    await page.getByRole('button', { name: '搜索' }).click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('table tbody tr').first()).toContainText('左氧氟沙星')
  })

  test('点击重置清空搜索条件', async ({ page }) => {
    await page.getByPlaceholder('药品名称 / 通用名称').fill('左氧氟沙星')
    await page.getByRole('button', { name: '重置' }).click()
    await page.waitForLoadState('networkidle')
    await expect(page.getByPlaceholder('药品名称 / 通用名称')).toHaveValue('')
  })

  test('新增药品成功', async ({ page }) => {
    await page.getByRole('button', { name: '新增药品' }).click()

    // 等待弹窗出现
    await expect(page.locator('.modal-container')).toBeVisible()

    // 填写必填字段
    await page.getByPlaceholder('请输入药品编码').fill(TEST_CODE)
    await page.getByPlaceholder('请输入药品名称').fill(TEST_NAME)

    await clickSubmit(page)

    // 等待弹窗关闭
    await expect(page.locator('.modal-container')).not.toBeVisible({ timeout: 5000 })
    await page.waitForLoadState('networkidle')

    // 搜索确认新增成功
    await page.getByPlaceholder('药品名称 / 通用名称').fill(TEST_NAME)
    await page.getByRole('button', { name: '搜索' }).click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('table tbody tr').first()).toContainText(TEST_NAME)
  })

  test('编辑药品信息', async ({ page }) => {
    // 搜索测试药品
    await page.getByPlaceholder('药品名称 / 通用名称').fill(TEST_NAME)
    await page.getByRole('button', { name: '搜索' }).click()
    await page.waitForLoadState('networkidle')

    // 点击编辑按钮
    await page.locator('table tbody tr').first()
      .getByRole('button', { name: '编辑' }).click()

    // 等待弹窗出现
    await expect(page.locator('.modal-container')).toBeVisible()

    // 修改药品名称
    await page.getByPlaceholder('请输入药品名称').clear()
    await page.getByPlaceholder('请输入药品名称').fill(TEST_NAME_EDITED)

    await clickSubmit(page)

    // 等待弹窗关闭
    await expect(page.locator('.modal-container')).not.toBeVisible({ timeout: 5000 })
    await page.waitForLoadState('networkidle')

    // 搜索确认修改成功
    await page.getByPlaceholder('药品名称 / 通用名称').fill(TEST_NAME_EDITED)
    await page.getByRole('button', { name: '搜索' }).click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('table tbody tr').first()).toContainText(TEST_NAME_EDITED)
  })

  test('删除药品需要二次确认', async ({ page }) => {
    // 搜索测试药品
    await page.getByPlaceholder('药品名称 / 通用名称').fill('[TEST]')
    await page.getByRole('button', { name: '搜索' }).click()
    await page.waitForLoadState('networkidle')

    // 点击删除
    await page.locator('table tbody tr').first()
      .getByRole('button', { name: '删除' }).click()

    // 等待确认弹窗出现
    await expect(page.locator('.modal-container')).toBeVisible({ timeout: 3000 })

    await page.getByRole('button', { name: '确认' }).click()

    // 等待弹窗关闭
    await expect(page.locator('.modal-container')).not.toBeVisible({ timeout: 5000 })
    await page.waitForLoadState('networkidle')

    // 验证数据真的从表格中消失了
    await page.getByPlaceholder('药品名称 / 通用名称').fill('[TEST]')
    await page.getByRole('button', { name: '搜索' }).click()
    await page.waitForLoadState('networkidle')

    // 表格应该没有任何 [TEST] 开头的数据了
    const rows = page.locator('table tbody tr')
    const count = await rows.count()
    expect(count).toBe(0)
  })

})
