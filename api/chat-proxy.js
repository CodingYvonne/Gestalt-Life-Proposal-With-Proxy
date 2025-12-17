/**
 * 完形行者對話代理服務 (Serverless Function)
 *
 * 這個代理函式負責處理前端的對話請求，並安全地使用環境變數中的 Gemini API 金鑰，
 * 避免將金鑰暴露在客戶端程式碼中。
 */
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // 🔑 金鑰從環境變數中安全讀取

if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY 環境變數未設置。");
}

module.exports = async (req, res) => {
    // 檢查請求方法
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    try {
        // 從請求主體中讀取對話內容和系統指令
        const { contents, systemInstruction } = req.body;

        // 檢查金鑰是否存在
        if (!GEMINI_API_KEY) {
            res.status(500).json({ error: "Server misconfiguration: API Key not found." });
            return;
        }

        // 準備傳送給 Google Gemini API 的完整 Payload
        const apiPayload = {
            contents: contents,
            systemInstruction: systemInstruction,
            // 可以在這裡加入 generationConfig, tools 等其他設定
        };

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiPayload),
            }
        );

        const data = await response.json();

        // 將 Gemini API 的回應直接回傳給前端
        res.status(response.status).json(data);

    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).json({ error: 'Internal Server Error during API call.' });
    }
};
