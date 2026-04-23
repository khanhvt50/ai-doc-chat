require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { searchDocs } = require("./rag");

const app = express();
app.use(cors());
app.use(express.json());

// ===== Detect language =====
function detectLanguage(text) {
  const viRegex = /[àáạảãâăđêôơư]/i;
  if (viRegex.test(text)) return "vi";
  return "en";
}

// ===== Memory =====
let chatHistory = [];

// ===== CHAT API =====
app.post("/chat", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.json({ answer: "Bạn chưa nhập câu hỏi" });
  }

  const lang = detectLanguage(question);

  // ===== RAG =====
  const knowledge = searchDocs(question);

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/auto",
        messages: [
          {
            role: "system",
            content: `
You are a smart AI assistant.

- Always reply in the SAME language as the user
- DO NOT translate the answer
- DO NOT include multiple languages
- ONLY use Vietnamese if user writes Vietnamese
- ONLY use English if user writes English
- ONLY include time if the user explicitly asks about time/date
- Keep answers clean, concise, natural
            `
          },

          ...chatHistory,

          {
            role: "user",
            content: `
Use the following knowledge if relevant:
${knowledge}

Question:
${question}
            `
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    // ===== GET ANSWER =====
    let answer = response.data.choices[0].message.content;

    // 🔥 REMOVE TRANSLATION nếu AI vẫn trả
    answer = answer.replace(/\(Translation:[\s\S]*?\)/gi, "");
    answer = answer.replace(/Translation:[\s\S]*/gi, "");

    // ===== SAVE MEMORY =====
    chatHistory.push({ role: "user", content: question });
    chatHistory.push({ role: "assistant", content: answer });

    // limit memory
    if (chatHistory.length > 10) {
      chatHistory = chatHistory.slice(-10);
    }

    return res.json({ answer });

  } catch (err) {
    console.log("❌ ERROR:", err.response?.data || err.message);

    if (err.response?.status === 429) {
      return res.json({ answer: "Server đang bận, thử lại sau" });
    }

    if (err.response?.status === 401) {
      return res.json({ answer: "API key không hợp lệ" });
    }

    return res.json({ answer: "Lỗi AI" });
  }
});

// ===== START SERVER =====
app.listen(3000, () => {
  console.log("🚀 Backend chạy tại http://localhost:3000");
});