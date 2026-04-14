import type { Express } from "express";
import type { Server } from "node:http";
import { dataLoader } from "./dataLoader.js";
import { generateAiResponse } from "./services/ai.service.js";
import { computeDataStatistics } from "./services/dataStats.service.js";
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
      
      // Determine previous year to fetch previous KPI comparisons
      let prevYearFilter: string | undefined = undefined;
      if (yearFilter === '2025-26') prevYearFilter = '2024-25';
      else if (yearFilter === '2024-25') prevYearFilter = '2023-24';

      const dashboard = {
        kpi: dataLoader.getKPISummary(yearFilter),
        previousKpi: prevYearFilter ? dataLoader.getKPISummary(prevYearFilter) : null,
        previousMonthlyPerformance: prevYearFilter ? dataLoader.getMonthlyPerformance(prevYearFilter) : null,
        benchmarks: dataLoader.getBenchmarks(),
        monthlyPerformance: dataLoader.getMonthlyPerformance(yearFilter),
        yearlyPerformance: dataLoader.getYearlyPerformance(), // Kept unfiltered since we want to see YoY usually
        defaulterAnalysis: dataLoader.getDefaulterAnalysis(yearFilter),
        concessionAnalysis: dataLoader.getConcessionAnalysis(yearFilter),
        lossAnalysis: dataLoader.getLossAnalysis(yearFilter),
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
  // AI Dashboard Insights Endpoint
  // ========================================
  let insightsCache: { ts: number; data: any } | null = null;
  let insightsInflight: Promise<void> | null = null;
  const INSIGHTS_TTL_MS = 5 * 60 * 1000; // 5 minutes

  app.get("/api/dashboard-insights", async (_req, res) => {
    try {
      // Serve from cache if still fresh
      if (insightsCache && Date.now() - insightsCache.ts < INSIGHTS_TTL_MS) {
        return res.json(insightsCache.data);
      }

      // Validate API key up-front before any work
      const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
      if (!geminiApiKey) {
        console.error("[dashboard-insights] GEMINI_API_KEY is not configured");
        return res.status(503).json({ error: "AI insights service is not configured" });
      }

      // Deduplicate concurrent requests — only one Gemini call runs at a time
      if (!insightsInflight) {
        insightsInflight = (async () => {
          try {
            const years = ['2023-24', '2024-25', '2025-26'];
            const snapshot = years.map(y => {
              const kpi = dataLoader.getKPISummary(y);
              const ext = dataLoader.getExtendedAnalysis(y);
              const con = dataLoader.getConcessionAnalysis(y);
              const loss = dataLoader.getLossAnalysis(y);
              return {
                year: y,
                totalExpected: kpi.totalExpected,
                totalCollected: kpi.totalFeeCollection,
                collectionRate: kpi.collectionRate,
                studentCount: kpi.totalStudents ?? null,
                defaulterCount: kpi.activeDefaultersCount,
                defaulterRate: kpi.defaulterRate,
                concessionTotal: con.totalConcession,
                concessionRate: con.concessionRate,
                studentsWithConcession: con.studentsWithConcession,
                lossTotal: loss?.totalLoss ?? 0,
                lossByTC: loss?.lossByTC ?? 0,
                lossByDropout: loss?.lossByDropout ?? 0,
                digitalAdoption: kpi.digitalAdoption,
                outstanding: ext?.outstandingPercent ?? null,
                lateFeeTotal: ext?.totalLateFee ?? 0,
              };
            });

            const prompt = `You are a school fee analytics expert. Below is 3 years of fee data (2023-24, 2024-25, 2025-26):

${JSON.stringify(snapshot, null, 2)}

Analyze year-on-year collection performance changes. Identify the SPECIFIC REASONS why collection went up or down between years. Consider:
- Enrollment size changes (more/fewer students = more/less revenue potential)
- Defaulter rate rise or fall
- Concession policy impact (higher concessions = less collected)
- Revenue loss from TC students and dropouts
- Digital payment adoption shifts
- Outstanding dues trends

Return EXACTLY 4 short, sharp, data-backed insights as a JSON array. Format:
[
  { "icon": "trending_up|trending_down|alert|info", "text": "...", "highlight": "key metric" }
]
Rules:
- Each insight must cite exact numbers/percentages
- Focus on WHY collection changed, not just that it changed
- Be specific about which year drove the change
- Keep each text under 120 characters
- Return only valid JSON, no markdown`;

            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(geminiApiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
            const result = await model.generateContent(prompt);
            const raw = result.response.text().trim();

            const jsonMatch = raw.match(/\[[\s\S]*\]/);
            if (!jsonMatch) throw new Error("No JSON array in Gemini response");
            const insights = JSON.parse(jsonMatch[0]);

            insightsCache = { ts: Date.now(), data: { insights, generatedAt: new Date().toISOString() } };
          } finally {
            insightsInflight = null;
          }
        })();
      }

      await insightsInflight;

      if (!insightsCache) throw new Error("Insights generation failed silently");
      res.json(insightsCache.data);
    } catch (error) {
      console.error("[dashboard-insights] Error:", error);
      res.status(500).json({ error: "Failed to generate insights" });
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

  // POST /api/ai/chat (General chat endpoint)
  app.post("/api/ai/chat-general", async (req, res) => {
    try {
      const { prompt } = req.body;

      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt is required" });
      }

      // Compute statistics for context
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

      // Generate response with full context
      const aiResponse = await generateAiResponse(prompt, dataStats, comprehensiveContext);

      res.json({ text: aiResponse.response, insights: aiResponse.insights, recommendations: aiResponse.recommendations, chartData: aiResponse.chartData });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ error: "AI assistant failed to respond" });
    }
  });

  return httpServer;
}
