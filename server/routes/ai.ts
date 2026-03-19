import type { Express } from "express";
import { dataLoader } from "../dataLoader.js";
import { generateAiResponse } from "../services/ai.service.js";
import { computeDataStatistics } from "../services/dataStats.service.js";

export function registerAiRoutes(app: Express) {

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) return res.status(400).json({ error: "Query is required" });

      // Compute aggregate data statistics
      const dataStats = computeDataStatistics(
        dataLoader.summaryData,
        dataLoader.getAllCollectionData()
      );

      // Build comprehensive context with all computed analyses
      const comprehensiveContext = {
        kpiAllYears: {
          "2023-24": dataLoader.getKPISummary("2023-24"),
          "2024-25": dataLoader.getKPISummary("2024-25"),
          "2025-26": dataLoader.getKPISummary("2025-26"),
          "all": dataLoader.getKPISummary(),
        },
        yearlyPerformance: dataLoader.getYearlyPerformance(),
        defaulterAnalysis: dataLoader.getDefaulterAnalysis(),
        concessionAnalysis: dataLoader.getConcessionAnalysis(),
        paymentModeAnalysis: dataLoader.getPaymentModeAnalysis(),
        extendedAnalysis: dataLoader.getExtendedAnalysis(),
      };

      // Generate AI response with full context
      const aiResponse = await generateAiResponse(query, dataStats, comprehensiveContext);

      res.json({
        response: aiResponse.response,
        insights: aiResponse.insights,
        recommendations: aiResponse.recommendations,
      });

    } catch (error: any) {
      console.error("[ai/chat] Error:", error);
      res.status(500).json({ error: error.message || "Failed to process AI query." });
    }
  });
}