import type { Express } from "express";
import { dataLoader } from "../dataLoader.js";
import { generateAiResponse } from "../services/ai.service.js";
import * as aq from "arquero";
import * as xlsx from "xlsx";

export function registerAiRoutes(app: Express) {

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) return res.status(400).json({ error: "Query is required" });

      const systemContext = `
You are an expert data analyst working with Node.js and Arquero.
The user is asking a question about a school's fee collection data.
We have these two datasets available as Arquero Tables:
1. "summary" - Table with columns: srNo, admissionNo, name, className, fatherName, dueAmount, conAmount, paidAmount, balanceAmount.
2. "collections" - Table with columns: year, receiptDate, receiptNo, admNo, studentName, fatherOccupation, locality, classSection, installment, totalStructuredAmount, concessionPercent, concessionType, totalPayableAmount, dueDate, receiptMode, admissionType, totalPaid, totalConcession, defaulterTotal, lateFee.

Write a JSON response with:
{
  "code": "A single valid JS statement that RETURNS the Arquero pipeline chained methods resulting in a standard array of objects using .objects(). ALWAYS use return. E.g. 'return summary.filter(aq.escape(d => d.balanceAmount > 0)).groupby(\\"className\\").rollup({ total: aq.op.sum(\\"balanceAmount\\") }).objects();'",
  "explanation": "A friendly summary answering the user's question.",
  "chartConfig": {
     "type": "bar|line|pie|null",
     "xAxis": "field_name",
     "yAxis": "field_name",
     "title": "A short chart title"
  }
}

Rules for "code":
- NO markdown formatting.
- The input variables are 'aq', 'summary', and 'collections'.
- You must call .objects() at the end to return a plain JS array, NOT an Arquero table.
- Do NOT use aq.escape on rollup operators, only on filter or derive functions.

IMPORTANT: ONLY RETURN THE JSON object, no explanation outside of it.`;

      const aiJSONResult = await generateAiResponse(query, systemContext);
      
      const cleaned = aiJSONResult.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      
      const summary = aq.from(dataLoader.summaryData);
      const collections = aq.from(dataLoader.getAllCollectionData());
      
      const analyzeFn = new Function('aq', 'summary', 'collections', parsed.code);
      const finalData = analyzeFn(aq, summary, collections);

      res.json({
        data: finalData,
        explanation: parsed.explanation,
        chartConfig: parsed.chartConfig
      });
      
    } catch (error: any) {
      console.error("[ai/chat] Error:", error);
      res.status(500).json({ error: error.message || "Failed to process AI query." });
    }
  });


  app.get("/api/ai/red-flags", async (req, res) => {
    try {
      if (!dataLoader.collection2024 || dataLoader.collection2024.length === 0) {
        return res.json({ redFlags: [] });
      }
      
      const dt = aq.from(dataLoader.collection2024);
      
      const redFlags: any[] = [];

      const overpayments = dt
        .filter(aq.escape((d: any) => d.totalPaid > d.totalPayableAmount && d.totalPayableAmount > 0))
        .select('admNo', 'studentName', 'installment', 'totalPayableAmount', 'totalPaid')
        .objects();
      
      overpayments.forEach((r: any) => {
         redFlags.push({
            type: "Overpayment",
            student: r.studentName,
            admNo: r.admNo,
            description: "Paid " + r.totalPaid + " which is more than expected " + r.totalPayableAmount + " for " + r.installment + ".",
            severity: "High",
            action: "Review receipt"
         });
      });

      const highLateFees = dt
        .filter(aq.escape((d: any) => d.lateFee > 1000))
        .select('admNo', 'studentName', 'installment', 'lateFee')
        .objects();

      highLateFees.forEach((r: any) => {
         redFlags.push({
            type: "Excessive Late Fee",
            student: r.studentName,
            admNo: r.admNo,
            description: "Unusual late fee of " + r.lateFee + " charged for " + r.installment + ".",
            severity: "Medium",
            action: "Verify penalty"
         });
      });
      
      const badConcessions = dt
        .filter(aq.escape((d: any) => d.totalConcession > d.totalStructuredAmount && d.totalStructuredAmount > 0))
        .select('admNo', 'studentName', 'installment', 'totalConcession', 'totalStructuredAmount')
        .objects();
        
      badConcessions.forEach((r: any) => {
         redFlags.push({
            type: "Invalid Concession",
            student: r.studentName,
            admNo: r.admNo,
            description: "Concession (" + r.totalConcession + ") exceeds total fees (" + r.totalStructuredAmount + ").",
            severity: "Critical",
            action: "Check concession settings"
         });
      });

      res.json({ redFlags });

    } catch (error: any) {
      console.error("[ai/red-flags] Error:", error);
      res.status(500).json({ error: error.message || "Failed to detect red flags" });
    }
  });


  app.post("/api/ai/report", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) return res.status(400).json({ error: "Query is required" });

      const systemContext = `
You are an expert data analyst preparing a report export layout.
We have these two datasets:
1. "summary" - Table with columns: srNo, admissionNo, name, className, fatherName, dueAmount, conAmount, paidAmount, balanceAmount.
2. "collections" - Table with columns: year, receiptDate, receiptNo, admNo, studentName, fatherOccupation, locality, classSection, installment, totalStructuredAmount, concessionPercent, concessionType, totalPayableAmount, dueDate, receiptMode, admissionType, totalPaid, totalConcession, defaulterTotal, lateFee.

User wants an excel export based on their prompt.
Return ONLY valid JSON:
{
  "code": "Arquero pipeline code returning the raw javascript objects array (using .objects()) that specifically answers their query."
}
No markdown, no explanation! Example:
{ "code": "return summary.filter(aq.escape(d => d.balanceAmount > 0)).select('admissionNo', 'name', 'balanceAmount').objects();" }
`;

      const aiJSONResult = await generateAiResponse(query, systemContext);
      
      const cleaned = aiJSONResult.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      
      const summary = aq.from(dataLoader.summaryData);
      const collections = aq.from(dataLoader.collection2024);
      
      const analyzeFn = new Function('aq', 'summary', 'collections', parsed.code);
      const finalData = analyzeFn(aq, summary, collections);

      // Create Excel Buffer using xlsx
      const worksheet = xlsx.utils.json_to_sheet(finalData);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, "SmartReport");
      
      const excelBuffer = xlsx.write(workbook, { bookType: "xlsx", type: "buffer" });
      
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=\"smart-report-" + Date.now() + ".xlsx\""
      );
      
      return res.send(excelBuffer);
    } catch (error: any) {
      console.error("[ai/report] Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate report." });
    }
  });

}