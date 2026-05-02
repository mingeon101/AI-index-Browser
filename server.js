require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { performAction } = require('./agent-tools');

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" }); // Gemini 3.1 호환 엔진

app.post('/agent/execute', async (req, res) => {
    const { task } = req.body;
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    let history = [];

    try {
        // 검색 시작 (Brave Search)
        await page.goto(`https://search.brave.com/search?q=${encodeURIComponent(task)}`);

        for (let step = 1; step <= 8; step++) {
            const screenshot = await page.screenshot({ encoding: 'base64' });
            
            const prompt = `
            사용자 목표: "${task}"
            현재 단계: ${step}/8
            이 화면을 보고 목표 달성을 위한 다음 행동을 결정해.
            반드시 JSON으로만 응답해:
            {"thought": "현재 상황 분석", "action": "CLICK"|"TYPE"|"SCROLL"|"FINISH", "selector": "CSS선택자", "value": "입력값", "final_answer": "완료시 답변"}
            `;

            const result = await model.generateContent([
                prompt,
                { inlineData: { data: screenshot, mimeType: "image/png" } }
            ]);

            const responseText = result.response.text().replace(/```json|```/g, '').trim();
            const decision = JSON.parse(responseText);
            
            history.push({ step, thought: decision.thought, action: decision.action });

            if (decision.action === "FINISH") {
                await browser.close();
                return res.json({ success: true, answer: decision.final_answer, history });
            }

            await performAction(page, decision);
        }
        res.json({ success: false, answer: "목표 도달 전 단계 초과", history });
    } catch (err) {
        res.status(500).json({ error: err.message, history });
    } finally {
        if (browser) await browser.close();
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

