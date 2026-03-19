import { config } from "dotenv";
config();
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { DataStatistics } from "./dataStats.service.js";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("[ai-service] GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");
// Use the latest powerful model for accurate data analysis and descriptive responses
const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

export interface AIAnalysisResponse {
  response: string;
  insights: string[];
  recommendations: string[];
}

export interface ComprehensiveContext {
  kpiAllYears: Record<string, any>;
  yearlyPerformance: any[];
  defaulterAnalysis: any;
  concessionAnalysis: any;
  paymentModeAnalysis: any;
  extendedAnalysis: any;
}

export async function generateAiResponse(
  userQuery: string,
  dataStats: DataStatistics,
  comprehensiveContext: ComprehensiveContext
): Promise<AIAnalysisResponse> {
  try {
    const systemPrompt = `You are an expert school fee collection data analyst. You have **complete access to 3 academic years** (2023-24, 2024-25, 2025-26) of fee collection data from a school in Udaipur.

Below is the FULL statistical context you must reference when answering:

═══════════════════════════════════════════════
SECTION 1: AGGREGATE STATISTICS (ALL YEARS)
═══════════════════════════════════════════════
${JSON.stringify(dataStats, null, 2)}

═══════════════════════════════════════════════
SECTION 2: PER-YEAR KPI SUMMARIES
═══════════════════════════════════════════════
${JSON.stringify(comprehensiveContext.kpiAllYears, null, 2)}

═══════════════════════════════════════════════
SECTION 3: YEARLY PERFORMANCE & FORECASTS
═══════════════════════════════════════════════
${JSON.stringify(comprehensiveContext.yearlyPerformance, null, 2)}

═══════════════════════════════════════════════
SECTION 4: DEFAULTER ANALYSIS
═══════════════════════════════════════════════
${JSON.stringify(comprehensiveContext.defaulterAnalysis, null, 2)}

═══════════════════════════════════════════════
SECTION 5: CONCESSION ANALYSIS
═══════════════════════════════════════════════
${JSON.stringify(comprehensiveContext.concessionAnalysis, null, 2)}

═══════════════════════════════════════════════
SECTION 6: PAYMENT MODE ANALYSIS
═══════════════════════════════════════════════
${JSON.stringify(comprehensiveContext.paymentModeAnalysis, null, 2)}

═══════════════════════════════════════════════
SECTION 7: EXTENDED ANALYSIS (Late Fees, Outstanding %, Cheque Bounces)
═══════════════════════════════════════════════
${JSON.stringify(comprehensiveContext.extendedAnalysis, null, 2)}

═══════════════════════════════════════════════
YOUR ROLE & INSTRUCTIONS
═══════════════════════════════════════════════
1. Analyze user queries deeply against the COMPLETE dataset above.
2. Provide descriptive, actionable, and insightful responses.
3. Highlight patterns, trends, and anomalies across years.
4. Give specific recommendations backed by data.
5. Always cite exact numbers, percentages, and facts from the data.

═══════════════════════════════════════════════
RESPONSE FORMATTING (CRITICAL — follow exactly)
═══════════════════════════════════════════════
You MUST format your response using **rich Markdown**:
- Use **## Headers** to organize sections clearly
- Use **bold text** for key metrics, amounts and percentages
- Use bullet points and numbered lists for clarity
- When comparing data across years or categories, ALWAYS use a **Markdown table** like:

| Year | Total Expected | Total Collected | Collection Rate |
|------|---------------|-----------------|-----------------|
| 2023-24 | ₹X | ₹Y | Z% |

- Format all currency amounts with ₹ symbol and Indian numbering (e.g., ₹12,45,000)
- Use --- horizontal rules to separate major sections
- End with a clear **## Recommendations** section with actionable items
- Be conversational yet professional
- If trends exist, explain them with year-on-year comparisons
- If problems exist, suggest concrete solutions`;

    const userPrompt = `User Query: ${userQuery}

Respond with a detailed, well-structured Markdown analysis addressing the user's query. Use tables, bold metrics, and clear sections.`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${systemPrompt}\n\n${userPrompt}`,
            },
          ],
        },
      ],
    });

    const responseText = result.response?.text?.() || String(result.response?.candidates?.[0]?.content?.parts?.[0]?.text || '');

    // Parse response to extract key insights and recommendations
    const lines = responseText.split("\n").filter((line: string) => line.trim());
    const insights: string[] = [];
    const recommendations: string[] = [];

    for (const line of lines) {
      if (line.toLowerCase().includes("insight") || line.toLowerCase().includes("trend")) {
        insights.push(line.replace(/^[-•*]\s*/, "").trim());
      }
      if (
        line.toLowerCase().includes("recommend") ||
        line.toLowerCase().includes("suggest") ||
        line.toLowerCase().includes("should")
      ) {
        recommendations.push(line.replace(/^[-•*]\s*/, "").trim());
      }
    }

    return {
      response: responseText,
      insights: insights.slice(0, 3),
      recommendations: recommendations.slice(0, 3),
    };
  } catch (error) {
    console.error("[ai-service] Error generating AI response:", error);
    throw new Error("Failed to generate AI analysis");
  }
}
