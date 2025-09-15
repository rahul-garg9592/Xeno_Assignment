const { getGeminiModel } = require("../config/gemini");

class AIService {
  static async generateSegmentRules(textDescription) {
    try {
      const model = getGeminiModel();

      const prompt = `
You are an assistant that converts plain English descriptions into valid MongoDB query filters.

### Rules:
1. Input: Any natural language description from a user (it may be vague, informal, or inconsistent).
2. Output: A strictly valid MongoDB query as a **JSON object only** (no explanations, no extra text).
3. If input is unclear or partially specified, make the closest reasonable mapping using supported fields.
4. If the description includes unsupported fields, ignore them safely.
5. Always prefer simplicity: if multiple interpretations exist, choose the most direct query.
6. Normalize common synonyms:
   - "spent", "purchased", "bought" → totalSpend
   - "active", "last login", "inactive", "not seen" → lastSeenAt
   - "VIP", "premium", "gold member" → tags
7. Dates:
   - For relative time like "inactive for 90 days", use placeholders (e.g., "NOW_MINUS_90_DAYS").
   - Do not insert hardcoded dates. Placeholders will be resolved in backend code.
8. Supported fields: firstName, lastName, email, totalSpend, lastSeenAt, tags
9. Supported operators: $lt, $lte, $gt, $gte, $in, $nin, $eq, $ne, $and, $or
10. If the description is too vague to map to MongoDB, return {}.

### Examples:
- "inactive for 90 days" -> {"lastSeenAt": {"$lt": "NOW_MINUS_90_DAYS"}}
- "spent more than 5000" -> {"totalSpend": {"$gt": 5000}}
- "VIP customers" -> {"tags": {"$in": ["VIP"]}}
- "VIPs who spent more than 5000" -> {"$and": [{"tags": {"$in": ["VIP"]}}, {"totalSpend": {"$gt": 5000}}]}
- "customers named John" -> {"firstName": {"$eq": "John"}}
- "customers with gmail emails" -> {"email": {"$regex": "@gmail.com$"}}

Now convert this description into a MongoDB query:
"${textDescription}"
`;


      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);

      throw new Error("Could not parse AI response");
    } catch (error) {
      console.error("AI Service Error:", error);
      throw new Error("Failed to generate segment rules");
    }
  }

  static async generateMessageSuggestions(objective, audienceDescription = "") {
    try {
      const model = getGeminiModel();

      const prompt = `
You are an assistant that creates concise marketing messages.

Task:
- Objective: "${objective}"
${audienceDescription ? `- Target audience: ${audienceDescription}` : ""}
- Generate 3 engaging, action-oriented SMS templates.
- Each message must be under 160 characters.
- Use {{first_name}} placeholder for personalization.
- Return ONLY a JSON array of strings.

Example:
["Hi {{first_name}}, message 1", "Hello {{first_name}}, message 2", "Hey {{first_name}}, message 3"]
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);

      throw new Error("Could not parse AI response");
    } catch (error) {
      console.error("AI Service Error:", error);
      throw new Error("Failed to generate message suggestions");
    }
  }

  static async generateCampaignSummary(campaignStats) {
    try {
      const model = getGeminiModel();

      const prompt = `
You are an assistant that generates professional campaign summaries.

Stats:
- Total audience: ${campaignStats.audienceSize}
- Messages sent: ${campaignStats.sentCount}
- Messages failed: ${campaignStats.failedCount}
- Success rate: ${(
        (campaignStats.sentCount / campaignStats.audienceSize) *
        100
      ).toFixed(1)}%

Task:
- Write a concise summary (1-2 sentences).
- Tone: professional and neutral.
- Return only the summary, no extra commentary.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error("AI Service Error:", error);
      return "Campaign completed successfully.";
    }
  }
}

module.exports = AIService;
