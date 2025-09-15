const { GoogleGenerativeAI } = require("@google/generative-ai")

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
}

module.exports = { getGeminiModel }
