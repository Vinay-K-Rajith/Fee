import { config } from "dotenv";
config();
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("[ai-service] GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");
// Use the lite model for faster, more cost-effective responses as requested
const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

export async function generateAiResponse(userMessage: string, systemContext?: string) {
    try {
        const parts = [];
        if (systemContext) {
            parts.push({ text: systemContext });
        }
        parts.push({ text: `User Query: ${userMessage}` });

        const result = await model.generateContent(parts);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("[ai-service] Error generating AI response:", error);
        throw new Error("Failed to generate AI response");
    }
}
