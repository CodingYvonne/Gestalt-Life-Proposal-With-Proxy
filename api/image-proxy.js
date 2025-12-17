/**
 * 圖片生成代理服務 (Serverless Function for Image Generation)
 * * 這個代理函式接收前端的 prompt，並安全地使用環境變數中的金鑰來呼叫 Imagen API。
 */
const IMAGEN_MODEL = "imagen-4.0-generate-001";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // 🔑 金鑰從環境變數中安全讀取

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: "Server misconfiguration: API Key not found in Environment Variables." });
    }

    try {
        const { prompt } = req.body;
        
        // 構造傳送給 Imagen API 的 Payload
        const apiPayload = {
            instances: { prompt: prompt }, 
            parameters: { "sampleCount": 1 } 
        };

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${IMAGEN_MODEL}:predict?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiPayload),
            }
        );

        const data = await response.json();

        // 將 Imagen API 的回應直接回傳給前端
        res.status(response.status).json(data);

    } catch (error) {
        console.error('Image Proxy Error:', error);
        res.status(500).json({ error: 'Internal Server Error during image API call.' });
    }
};
