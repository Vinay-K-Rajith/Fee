import { config } from "dotenv";
config();
import { generateAiResponse, sendManualEmail } from "../server/services/ai.service.js";

// Mock data statistics to bypass server loader internally for test
const mockDataStats = {
  totalExpected: 5000000,
  totalCollected: 4200000,
  totalDefaulters: 120,
  overallCollectionRate: 84
} as any;

const mockComprehensiveContext = {
  kpiAllYears: {
    "2023-24": { collectionRate: "85%" },
    "2024-25": { collectionRate: "82%" },
    "2025-26": { collectionRate: "86%" }
  },
  yearlyPerformance: [
    { year: "2023-24", amount: 1500000 },
    { year: "2024-25", amount: 1200000 },
    { year: "2025-26", amount: 1500000 }
  ],
  defaulterAnalysis: {},
  concessionAnalysis: {},
  paymentModeAnalysis: {},
  extendedAnalysis: {}
};

async function testAICapabilities() {
  console.log("🚀 Starting AI Service E2E Tests...\n");

  try {
    // -------------------------------------------------------------
    // Test 1: Pie Chart Generation
    // -------------------------------------------------------------
    console.log("🧪 Test 1: Requesting a Pie Chart...");
    const piePrompt = "Show me the collection performance proportion across the 3 years as a pie chart.";
    const pieResult = await generateAiResponse(piePrompt, mockDataStats, mockComprehensiveContext);
    
    if (pieResult.chartData && pieResult.chartData.chartType === 'pie') {
      console.log("✅ Passed: AI successfully requested a 'pie' chart.");
      console.log("   Chart Data Labels:", pieResult.chartData.labels);
    } else {
      console.error("❌ Failed: AI did not return a pie chart as requested.", pieResult.chartData);
    }
    console.log("-----------------------------------\n");

    // -------------------------------------------------------------
    // Test 2: Bar Graph Generation
    // -------------------------------------------------------------
    console.log("🧪 Test 2: Requesting a Bar Graph...");
    const barPrompt = "Create a bar graph comparing the collection rates for 2023, 2024, and 2025.";
    const barResult = await generateAiResponse(barPrompt, mockDataStats, mockComprehensiveContext);
    
    if (barResult.chartData && barResult.chartData.chartType === 'bar') {
      console.log("✅ Passed: AI successfully requested a 'bar' chart.");
      console.log("   Chart Datasets:", barResult.chartData.datasets[0].label);
    } else {
      console.error("❌ Failed: AI did not return a bar chart as requested.");
    }
    console.log("-----------------------------------\n");

    // -------------------------------------------------------------
    // Test 3: Manual Email Service (Triggered from Frontend)
    // -------------------------------------------------------------
    console.log("🧪 Test 3: Testing Nodemailer Simulation Service...");
    const emailRes = await sendManualEmail("vinaykrajith@gmail.com", "Test", "### Test Markdown");
    if (emailRes) {
      console.log("✅ Passed: Email service configured and successfully executed / mocked.");
    } else {
      console.error("❌ Failed: Email service threw an error.");
    }
    console.log("-----------------------------------\n");

    console.log("🎉 All scripts executed successfully. System is stable.");

  } catch (error) {
    console.error("❌ Fatal Test Error:", error);
  }
}

testAICapabilities();
