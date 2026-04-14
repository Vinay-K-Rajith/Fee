import { config } from "dotenv";
config();
import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from "@google/generative-ai";
import nodemailer from "nodemailer";
import { marked } from "marked";
// @ts-ignore
import htmlToDocx from "html-to-docx";
import type { DataStatistics } from "./dataStats.service.js";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("[ai-service] GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

// 1. Data Chart Tool Schema
const generateChartTool: FunctionDeclaration = {
  name: "generate_chart",
  description: "Generates data for visualizing a chart (line, bar, or pie chart) when the user asks for a visual representation or trend chart. Use vibrant, contrasting colors for better visualization.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      chartType: {
        type: SchemaType.STRING,
        description: "The type of chart to display: 'line', 'bar', or 'pie'",
      },
      labels: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description: "The X-axis labels or Pie slices (e.g., ['Q1', 'Q2'], ['2023', '2024'])",
      },
      datasets: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            label: { type: SchemaType.STRING, description: "Label for the dataset series" },
            data: { type: SchemaType.ARRAY, items: { type: SchemaType.NUMBER }, description: "The data points for this series corresponding to the labels" }
          },
          required: ["label", "data"]
        },
        description: "The datasets to plot on the Y-axis. Usually 1 or 2 series.",
      },
      colors: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description: "Optional: Hex color codes for each dataset (e.g., ['#3B82F6', '#10B981', '#F59E0B']). Leave empty to use defaults."
      }
    },
    required: ["chartType", "labels", "datasets"],
  },
};

// 2. Email Tool Schema
const sendEmailTool: FunctionDeclaration = {
  name: "send_email_report",
  description: "Sends a generated data report to a specific email address when requested.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      toAddress: {
        type: SchemaType.STRING,
        description: "The email address to send the report to.",
      },
      subject: {
        type: SchemaType.STRING,
        description: "A catchy subject line for the email.",
      },
      reportContent: {
        type: SchemaType.STRING,
        description: "The full markdown content of the report to send.",
      },
    },
    required: ["toAddress", "subject", "reportContent"],
  },
};

// Use the latest powerful model configuration (note: moved inside function for dynamic prompt, removing global initialization)

// Configure Nodemailer 
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "fake@example.com",
    pass: process.env.EMAIL_APP_PASSWORD || "fakepassword", 
  },
  tls: {
    // Do not fail on invalid certs during local development
    rejectUnauthorized: false
  }
});

export async function sendManualEmail(toAddress: string, subject: string, reportContent: string) {
  if (process.env.EMAIL_USER && process.env.EMAIL_USER !== "fake@example.com") {
    // 1. Convert Markdown to HTML
    const htmlContent = await marked.parse(reportContent);
    
    // 2. Convert HTML to DOCX Buffer
    const docxBuffer = await htmlToDocx(htmlContent, null, {
      margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 }, // 1 inch margins
    });

    return await transporter.sendMail({
      from: `"Fee Insights AI" <${process.env.EMAIL_USER}>`,
      to: toAddress,
      subject: subject,
      text: "Please find your Fee Insights Data Report attached as a Word Document.",
      html: "<p>Please find your <b>Fee Insights Data Report</b> attached as a Word Document.</p>",
      attachments: [
        {
          filename: `Fee-Insights-Report-${new Date().toISOString().split('T')[0]}.docx`,
          content: Buffer.from(docxBuffer as any),
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }
      ]
    });
  } else {
    // Mock simulation for missing credentials
    console.log(`[MOCK EMAIL SENT] To: ${toAddress}, Subject: ${subject}`);
    return { mock: true, messageId: 'mock-1234' };
  }
}

export interface AIAnalysisResponse {
  response: string;
  insights: string[];
  recommendations: string[];
  chartData?: any; // To pass back to frontend if requested
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
  comprehensiveContext: ComprehensiveContext,
  history: any[] = []
): Promise<AIAnalysisResponse> {
  try {
    const systemPrompt = `You are an expert school fee collection data analyst. You have **complete access to 3 academic years** (2023-24, 2024-25, 2025-26) of fee collection data from a school in Udaipur.

Below is the FULL statistical context you must reference when answering:

═══════════════════════════════════════════════
SECTION 1: AGGREGATE STATISTICS (ALL YEARS)
═══════════════════════════════════════════════
${JSON.stringify(dataStats)}

═══════════════════════════════════════════════
SECTION 2: PER-YEAR KPI SUMMARIES
═══════════════════════════════════════════════
${JSON.stringify(comprehensiveContext.kpiAllYears)}

═══════════════════════════════════════════════
SECTION 3: YEARLY PERFORMANCE & FORECASTS
═══════════════════════════════════════════════
${JSON.stringify(comprehensiveContext.yearlyPerformance)}

═══════════════════════════════════════════════
SECTION 4: DEFAULTER ANALYSIS
═══════════════════════════════════════════════
${JSON.stringify(comprehensiveContext.defaulterAnalysis)}

═══════════════════════════════════════════════
SECTION 5: CONCESSION ANALYSIS
═══════════════════════════════════════════════
${JSON.stringify(comprehensiveContext.concessionAnalysis)}

═══════════════════════════════════════════════
SECTION 6: PAYMENT MODE ANALYSIS
═══════════════════════════════════════════════
${JSON.stringify(comprehensiveContext.paymentModeAnalysis)}

═══════════════════════════════════════════════
SECTION 7: EXTENDED ANALYSIS (Late Fees, Outstanding %, Cheque Bounces)
═══════════════════════════════════════════════
${JSON.stringify(comprehensiveContext.extendedAnalysis)}

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
- If problems exist, suggest concrete solutions

═══════════════════════════════════════════════
CRITICAL: CHART DATA HANDLING
═══════════════════════════════════════════════
**IMPORTANT**: When generating charts:
1. Use the generate_chart tool to pass chart data — DO NOT include raw chart JSON or code blocks in your text response
2. Your text should contain ONLY: analysis, context, and insights about the data
3. Never paste chart definitions, JSON objects, or raw data structures into the response text
4. Let the tool call handle 100% of the chart visualization — just provide your narrative analysis`;

    const userPrompt = `User Query: ${userQuery}\n\nRespond with a detailed, well-structured Markdown analysis. Use tables, bold metrics, and clear sections. If requested or highly relevant, generate a chart (bar, line, or pie) using the tool. Also, summarize the data efficiently.`;

    // 2. Initialize the model INSIDE the function so it gets the dynamic system context
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-lite",
      systemInstruction: {
        role: "system",
        parts: [{ text: systemPrompt }]
      },
      tools: [{ functionDeclarations: [generateChartTool, sendEmailTool] }]
    });

    let formattedHistory = history
      .map((msg: any) => {
        // Create message with parts containing only non-empty content
        const validParts = [];
        if (msg.content && typeof msg.content === 'string' && msg.content.trim() !== '') {
          validParts.push({ text: msg.content.trim() });
        }
        
        return {
          role: msg.role === 'user' ? 'user' : 'model',
          parts: validParts
        };
      })
      // Remove messages that ended up with no valid parts (empty messages)
      .filter((msg: any) => msg.parts.length > 0);

    // Gemini requires the history to start with a 'user' role. 
    // If the frontend passed an initial AI greeting, strip leading model messages.
    while (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
      formattedHistory.shift();
    }

    const chat = model.startChat({
      history: formattedHistory
    });

    let result = await chat.sendMessage(userPrompt);
    let functionCalls = result.response.functionCalls();
    
    let chartData = null;

    // 3. Handle Tool Execution Loop (Supporting Parallel Calls in Gemini 2.5)
    while (functionCalls && functionCalls.length > 0) {
      const functionResponses = [];

      for (const call of functionCalls) {
        if (call.name === "generate_chart") {
          chartData = call.args;
          functionResponses.push({
            functionResponse: {
              name: "generate_chart",
              response: { status: "success", notice: "Chart data queued successfully for frontend." }
            }
          });
        } else if (call.name === "send_email_report") {
          const { toAddress, subject, reportContent } = call.args as any;
          let emailStatus = "";
          try {
            await sendManualEmail(toAddress, subject, reportContent);
            emailStatus = "Email sent successfully.";
          } catch (error) {
            console.error("Email send error: ", error);
            emailStatus = "Failed to send email. Ensure platform credentials.";
          }
          
          functionResponses.push({
            functionResponse: {
              name: "send_email_report",
              response: { status: emailStatus }
            }
          });
        }
      }

      result = await chat.sendMessage(functionResponses);
      functionCalls = result.response.functionCalls();
    }

    // Attempt to extract response safely
    const responseText = result.response?.text?.() || result.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';

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
      chartData // Return this payload to the frontend
    };
  } catch (error) {
    console.error("[ai-service] Error generating AI response:", error);
    throw new Error("Failed to generate AI analysis");
  }
}
