import type { Express } from "express";
import type { Server } from "node:http";
import { dataLoader } from "./dataLoader.js";
import { generateAiResponse } from "./services/ai.service.js";
import { registerAiRoutes } from "./routes/ai.js";

export function registerRoutes(
  httpServer: Server,
  app: Express
): Server {
  // Initialize data loader
  dataLoader.loadData();
  
  // Register AI endpoints
  registerAiRoutes(app);

  // ========================================
  // Dashboard & KPI Endpoints
  // ========================================

  // Get KPI Summary
  app.get("/api/kpi/summary", (req, res) => {
    try {
      const yearFilter = req.query.year as string;
      const summary = dataLoader.getKPISummary(yearFilter);
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
  app.get("/api/performance/monthly", (req, res) => {
    try {
      const yearFilter = req.query.year as string;
      const monthlyData = dataLoader.getMonthlyPerformance(yearFilter);
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
  app.get("/api/defaulters/analysis", (req, res) => {
    try {
      const yearFilter = req.query.year as string;
      const analysis = dataLoader.getDefaulterAnalysis(yearFilter);
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching defaulter analysis:", error);
      res.status(500).json({ error: "Failed to fetch defaulter analysis" });
    }
  });

  // Occupation-wise defaulters
  app.get("/api/defaulters/occupation", (req, res) => {
    try {
      const yearFilter = req.query.year as string;
      const analysis = dataLoader.getDefaulterAnalysis(yearFilter);
      res.json(analysis.occupationWise);
    } catch (error) {
      console.error("Error fetching occupation defaulters:", error);
      res.status(500).json({ error: "Failed to fetch occupation defaulters" });
    }
  });

  // Location-wise defaulters
  app.get("/api/defaulters/location", (req, res) => {
    try {
      const yearFilter = req.query.year as string;
      const analysis = dataLoader.getDefaulterAnalysis(yearFilter);
      res.json(analysis.locationWise);
    } catch (error) {
      console.error("Error fetching location defaulters:", error);
      res.status(500).json({ error: "Failed to fetch location defaulters" });
    }
  });

  // Salary slab-wise defaulters (removed - not in new data structure)
  
  // Class-wise defaulters
  app.get("/api/defaulters/class", (req, res) => {
    try {
      const yearFilter = req.query.year as string;
      const analysis = dataLoader.getDefaulterAnalysis(yearFilter);
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
  app.get("/api/concessions/analysis", (req, res) => {
    try {
      const yearFilter = req.query.year as string;
      const analysis = dataLoader.getConcessionAnalysis(yearFilter);
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching concession analysis:", error);
      res.status(500).json({ error: "Failed to fetch concession analysis" });
    }
  });

  // ========================================
  // Payment Mode Analysis Endpoints
  // ========================================

  // Payment mode analysis
  app.get("/api/payment-modes/analysis", (req, res) => {
    try {
      const yearFilter = req.query.year as string;
      const analysis = dataLoader.getPaymentModeAnalysis(yearFilter);
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching payment mode analysis:", error);
      res.status(500).json({ error: "Failed to fetch payment mode analysis" });
    }
  });

  // ========================================
  // Admission Type Analysis Endpoints
  // ========================================

  // Admission type analysis
  app.get("/api/admission-types/analysis", (req, res) => {
    try {
      const yearFilter = req.query.year as string;
      const analysis = dataLoader.getAdmissionTypeAnalysis(yearFilter);
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching admission type analysis:", error);
      res.status(500).json({ error: "Failed to fetch admission type analysis" });
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

  // Get collection records by year
  app.get("/api/collections/:year", (req, res) => {
    try {
      const { year } = req.params;
      let data;
      
      switch (year) {
        case '2023':
        case '2023-24':
          data = dataLoader.getCollection2023Data();
          break;
        case '2024':
        case '2024-25':
          data = dataLoader.getCollection2024Data();
          break;
        case '2025':
        case '2025-26':
          data = dataLoader.getCollection2025Data();
          break;
        case 'all':
          data = dataLoader.getAllCollectionData();
          break;
        default:
          return res.status(400).json({ error: "Invalid year parameter. Use 2023, 2024, 2025, or all" });
      }
      
      res.json(data);
    } catch (error) {
      console.error("Error fetching collections:", error);
      res.status(500).json({ error: "Failed to fetch collections" });
    }
  });

  // ========================================
  // Dashboard Aggregate Endpoint
  // ========================================

  // Get all dashboard data in one call
  app.get("/api/dashboard", (req, res) => {
    try {
      const yearFilter = req.query.year as string;
      const dashboard = {
        kpi: dataLoader.getKPISummary(yearFilter),
        benchmarks: dataLoader.getBenchmarks(),
        monthlyPerformance: dataLoader.getMonthlyPerformance(yearFilter),
        yearlyPerformance: dataLoader.getYearlyPerformance(), // Kept unfiltered since we want to see YoY usually
        defaulterAnalysis: dataLoader.getDefaulterAnalysis(yearFilter),
        concessionAnalysis: dataLoader.getConcessionAnalysis(yearFilter),
        paymentModeAnalysis: dataLoader.getPaymentModeAnalysis(yearFilter),
        admissionTypeAnalysis: dataLoader.getAdmissionTypeAnalysis(yearFilter),
        extendedAnalysis: dataLoader.getExtendedAnalysis(yearFilter),
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
  // Cache results in memory to avoid hammering the API (Nominatim has strict rate limits)
  const geocodeCache = new Map<string, { lat: number; lng: number } | null>();

  app.get("/api/geocode", async (req, res) => {
    try {
      const { location } = req.query;
      if (!location || typeof location !== "string") {
        return res.status(400).json({ error: "Location parameter is required" });
      }

      // Return cached result immediately
      if (geocodeCache.has(location)) {
        const cached = geocodeCache.get(location);
        if (cached) return res.json(cached);
        return res.status(404).json({ error: "Location not found" });
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location + ', Udaipur, Rajasthan, India')}&limit=1`,
        {
          headers: {
            // Nominatim REQUIRES a descriptive User-Agent — without it the API returns an XML error page
            'User-Agent': 'FeeInsightsDashboard/1.0 (school-fee-analytics; contact@entab.in)',
            'Accept': 'application/json',
          }
        }
      );

      // Guard: Nominatim may return HTML/XML on rate-limits or policy violations
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        console.warn(`Geocode non-JSON response for "${location}" (status ${response.status}):`, text.slice(0, 120));
        geocodeCache.set(location, null); // cache the failure to stop retries
        return res.status(404).json({ error: "Location not found" });
      }

      const data = await response.json();
      if (data && data.length > 0) {
        const result = {
          lat: Number.parseFloat(data[0].lat),
          lng: Number.parseFloat(data[0].lon),
        };
        geocodeCache.set(location, result);
        return res.json(result);
      }

      geocodeCache.set(location, null);
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

      // Supply the AI with the literal directory of all students so it can answer individual-level queries
      const studentsData = dataLoader.getStudentSummaryData().map(s => ({
        id: s.admissionNo,
        name: s.name,
        class: s.className,
        father: s.fatherName,
        due: s.dueAmount,
        paid: s.paidAmount,
        balance: s.balanceAmount
      }));

      const enrichedContext = context
        ? `${context}\n\nSTUDENT DATA DIRECTORY (Use this to retrieve details on individual students):\n${JSON.stringify(studentsData)}`
        : `STUDENT DATA DIRECTORY:\n${JSON.stringify(studentsData)}`;

      const response = await generateAiResponse(prompt, enrichedContext);
      res.json({ text: response });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ error: "AI assistant failed to respond" });
    }
  });

  return httpServer;
}
