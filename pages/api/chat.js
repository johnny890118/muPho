import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-2.0-flash-lite-preview-02-05:free",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `請分析「${message}」的歌詞，並根據主題、情感或核心概念，提取 3 個最重要的關鍵字，只要列出 3 個關鍵字就好，多餘文字不需要，並用英文回覆，每個關鍵字用空格隔開。`,
              },
            ],
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json(response.data.choices[0].message);
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch response" });
  }
}
