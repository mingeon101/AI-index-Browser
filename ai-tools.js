// 브라우저 조작을 위한 헬퍼 함수들
async function performAction(page, decision) {
    const { action, selector, value } = decision;
    
    try {
        if (action === "CLICK") {
            await page.click(selector, { timeout: 5000 });
        } else if (action === "TYPE") {
            await page.fill(selector, value);
            await page.keyboard.press('Enter');
        } else if (action === "SCROLL") {
            await page.mouse.wheel(0, 600);
        }
        // 액션 후 렌더링 대기
        await page.waitForTimeout(2000);
        return true;
    } catch (e) {
        console.error(`Action Failed: ${e.message}`);
        return false;
    }
}

module.exports = { performAction };
