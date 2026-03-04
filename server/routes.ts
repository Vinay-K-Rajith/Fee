import type { Express } from "express";
import type { Server } from "node:http";
import { dataLoader } from "./dataLoader";
import { generateAiResponse } from "./services/ai.service";


export function registerRoutes(
  httpServer: Server,
  app: Express
): Server {
  // Initialize data loader
  dataLoader.loadData();

  // ========================================
  // Dashboard & KPI Endpoints
  // ========================================

  // Get KPI Summary
  app.get("/api/kpi/summary", (_req, res) => {
    try {
      const summary = dataLoader.getKPISummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching KPI summary:", error);
      res.status(500).json({ error: "Failed to fetch KPI summary" });
    }
  });

  // Get Benchmarks
  app.get("/api/benchmarks", (_req, res) => {
    try {
      const benchmarks = dataLoader.getBenchmarks();
      res.json(benchmarks);
    } catch (error) {
      console.error("Error fetching benchmarks:", error);
      res.status(500).json({ error: "Failed to fetch benchmarks" });
    }
  });

  // ========================================
  // Performance Analysis Endpoints
  // ========================================

  // Year-on-Year Performance
  app.get("/api/performance/yearly", (_req, res) => {
    try {
      const yearlyData = dataLoader.getYearlyPerformance();
      res.json(yearlyData);
    } catch (error) {
      console.error("Error fetching yearly performance:", error);
      res.status(500).json({ error: "Failed to fetch yearly performance" });
    }
  });

  // Month-on-Month Performance
  app.get("/api/performance/monthly", (_req, res) => {
    try {
      const monthlyData = dataLoader.getMonthlyPerformance();
      res.json(monthlyData);
    } catch (error) {
      console.error("Error fetching monthly performance:", error);
      res.status(500).json({ error: "Failed to fetch monthly performance" });
    }
  });

  // ========================================
  // Defaulter Analysis Endpoints
  // ========================================

  // Complete defaulter analysis
  app.get("/api/defaulters/analysis", (_req, res) => {
    try {
      const analysis = dataLoader.getDefaulterAnalysis();
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching defaulter analysis:", error);
      res.status(500).json({ error: "Failed to fetch defaulter analysis" });
    }
  });

  // Occupation-wise defaulters
  app.get("/api/defaulters/occupation", (_req, res) => {
    try {
      const analysis = dataLoader.getDefaulterAnalysis();
      res.json(analysis.occupationWise);
    } catch (error) {
      console.error("Error fetching occupation defaulters:", error);
      res.status(500).json({ error: "Failed to fetch occupation defaulters" });
    }
  });

  // Location-wise defaulters
  app.get("/api/defaulters/location", (_req, res) => {
    try {
      const analysis = dataLoader.getDefaulterAnalysis();
      res.json(analysis.locationWise);
    } catch (error) {
      console.error("Error fetching location defaulters:", error);
      res.status(500).json({ error: "Failed to fetch location defaulters" });
    }
  });

  // Salary slab-wise defaulters
  app.get("/api/defaulters/salary-slab", (_req, res) => {
    try {
      const analysis = dataLoader.getDefaulterAnalysis();
      res.json(analysis.salarySlabWise);
    } catch (error) {
      console.error("Error fetching salary slab defaulters:", error);
      res.status(500).json({ error: "Failed to fetch salary slab defaulters" });
    }
  });

  // Class-wise defaulters
  app.get("/api/defaulters/class", (_req, res) => {
    try {
      const analysis = dataLoader.getDefaulterAnalysis();
      res.json(analysis.classWise);
    } catch (error) {
      console.error("Error fetching class defaulters:", error);
      res.status(500).json({ error: "Failed to fetch class defaulters" });
    }
  });

  // ========================================
  // Concession Analysis Endpoints
  // ========================================

  // Complete concession analysis
  app.get("/api/concessions/analysis", (_req, res) => {
    try {
      const analysis = dataLoader.getConcessionAnalysis();
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching concession analysis:", error);
      res.status(500).json({ error: "Failed to fetch concession analysis" });
    }
  });

  // ========================================
  // TC/Dropout Analysis Endpoints
  // ========================================

  // Complete TC/Dropout analysis
  app.get("/api/tc-dropout/analysis", (_req, res) => {
    try {
      const analysis = dataLoader.getTcDropoutAnalysis();
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching TC/Dropout analysis:", error);
      res.status(500).json({ error: "Failed to fetch TC/Dropout analysis" });
    }
  });

  // ========================================
  // Class-wise & Installment Analysis
  // ========================================

  // Class-wise analysis
  app.get("/api/class-wise/analysis", (_req, res) => {
    try {
      const analysis = dataLoader.getClassWiseAnalysis();
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching class-wise analysis:", error);
      res.status(500).json({ error: "Failed to fetch class-wise analysis" });
    }
  });

  // Installment-wise analysis
  app.get("/api/installments/analysis", (_req, res) => {
    try {
      const analysis = dataLoader.getInstallmentAnalysis();
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching installment analysis:", error);
      res.status(500).json({ error: "Failed to fetch installment analysis" });
    }
  });

  // ========================================
  // Revenue & Financial Analysis
  // ========================================

  // Revenue waterfall
  app.get("/api/revenue/waterfall", (_req, res) => {
    try {
      const waterfall = dataLoader.getRevenueWaterfall();
      res.json(waterfall);
    } catch (error) {
      console.error("Error fetching revenue waterfall:", error);
      res.status(500).json({ error: "Failed to fetch revenue waterfall" });
    }
  });

  // Fee pay masters (reliable payers)
  app.get("/api/fee-pay-masters", (_req, res) => {
    try {
      const payMasters = dataLoader.getFeePayMasters();
      res.json(payMasters);
    } catch (error) {
      console.error("Error fetching fee pay masters:", error);
      res.status(500).json({ error: "Failed to fetch fee pay masters" });
    }
  });

  // ========================================
  // Action Recommendations
  // ========================================

  // Get all recommendations
  app.get("/api/recommendations", (_req, res) => {
    try {
      const recommendations = dataLoader.getActionRecommendations();
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  // ========================================
  // Raw Data Endpoints
  // ========================================

  // Get all students summary
  app.get("/api/students", (_req, res) => {
    try {
      const students = dataLoader.getStudentSummaryData();
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ error: "Failed to fetch students" });
    }
  });

  // Get fee collection records
  app.get("/api/fee-collections", (_req, res) => {
    try {
      const feeData = dataLoader.getFeeCollectionData();
      res.json(feeData);
    } catch (error) {
      console.error("Error fetching fee collections:", error);
      res.status(500).json({ error: "Failed to fetch fee collections" });
    }
  });

  // ========================================
  // Dashboard Aggregate Endpoint
  // ========================================

  // Get all dashboard data in one call
  app.get("/api/dashboard", (_req, res) => {
    try {
      const dashboard = {
        kpi: dataLoader.getKPISummary(),
        benchmarks: dataLoader.getBenchmarks(),
        monthlyPerformance: dataLoader.getMonthlyPerformance(),
        yearlyPerformance: dataLoader.getYearlyPerformance(),
        defaulterAnalysis: dataLoader.getDefaulterAnalysis(),
        concessionAnalysis: dataLoader.getConcessionAnalysis(),
        tcDropoutAnalysis: dataLoader.getTcDropoutAnalysis(),
        classWiseAnalysis: dataLoader.getClassWiseAnalysis(),
        installmentAnalysis: dataLoader.getInstallmentAnalysis(),
        revenueWaterfall: dataLoader.getRevenueWaterfall(),
        recommendations: dataLoader.getActionRecommendations(),
      };
      res.json(dashboard);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  // ========================================
  // Geocoding Endpoint (CORS-friendly)
  // ========================================

  // Geocode location - proxies Nominatim API to avoid CORS issues
  app.get("/api/geocode", async (req, res) => {
    try {
      const { location } = req.query;
      if (!location || typeof location !== "string") {
        return res.status(400).json({ error: "Location parameter is required" });
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location + ', India')}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        return res.json({
          lat: Number.parseFloat(data[0].lat),
          lng: Number.parseFloat(data[0].lon),
        });
      }

      res.status(404).json({ error: "Location not found" });
    } catch (error) {
      console.error("Geocoding error:", error);
      res.status(500).json({ error: "Geocoding failed" });
    }
  });

  // ========================================
  // AI Chat Endpoint
  // ========================================

  // POST /api/ai/chat
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { prompt, context } = req.body;

      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt is required" });
      }

      // Combine prompt with context if provided
      const fullPrompt = context
        ? `${context}\n\nUser Question: ${prompt}`
        : prompt;

      const response = await generateAiResponse(fullPrompt);
      res.json({ text: response });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ error: "AI assistant failed to respond" });
    }
  });

  return httpServer;
}
