import { GoogleGenAI } from "@google/genai";
import { isValidationResult } from "./validation";

const genAI = new GoogleGenAI({
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY
})

const systemHeader = `You are a strict JSON-outputting data-alchemist agent. ALWAYS output valid JSON and nothing else, no markdown, no code fences, no explanation.`;

async function validateDataWithAI(data: Object[]) {
    const prompt = validationPrompt(data)
    const res = await genAI.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt
    })
    const text = res.text
    if(!text){
        return res
    }
    const clean = text.replace(/^```json/, "").replace(/^```/, "").replace(/```$/, "").trim()   
    const parsed =  JSON.parse(clean)
    if (isValidationResult(parsed)) {
        return parsed
    } else {
        console.warn("Validation result does not match expected structure.")
        return {
            isValid: false,
            errors: [],
            summary: {
                totalRows: 0,
                errorCount: 0,
                warningCount: 0,
            },
            raw: parsed
        }
    }
}


function validationPrompt(payload: Object[]):string {
    return [
        systemHeader,
        `Your task is to analyze a strucutred dataset from a CSV or XLSX file. You must identify the correct entity type (clients, workers or tasks), map the headers to the standardized schema, normalize all values, and validate the data.`,
        ``,
        `SCHEMAS (use exact field names):`,
        `clients: ["ClientID", "ClientName", "PriorityLevel", "RequestTaskIDs", "GroupTag", "AttributesJSON"]`,
        `workers: ["WorkerID", "WorkerName", "Skills", "AvailableSlots", "MaxLoadPerPhase", "WorkerGroup", "QualificationLevel"]`,
        `tasks:["TaskID", "TaskName", "Category", "Duration", "RequiredSkills", "PreferredPhases", "MaxConcurrent"]`,
        ``,
        `INPUT:`,
        `Filename: ${payload}`,
        `Headers: ${Object.keys(payload[0] || {}).join(", ")}`,
        ``,
        `INSTRUCTIONS:`,
        `1. Identify whether the data is about clients, workers or tasks. Return this as "chosenEntity".`,
        `2. Map each raw key of object i.e header to the closest field in the chosen entity schema. Return a mapping confidence score.`,
        `3. Normalize values:`,
        `   - Comma-separated strings -> arrays (e.g., "T1, T2" -> ["T1", "T2"])`,
        `   - AvailableSlots / PreferredPhases -> integer arrays (support list or range formats like "1-3" or [1, 2, 3])`,
        `   AttributesJSON -> must be valid JSON object or null`,
        `4. Validate the sample rows for errors like:`,
        `   - Missing required fields`,
        `   - Duplicate IDs`,
        `   - out-of-range values`,
        `   - Broken JSON`,
        `   - Unknown references(e.g., TaskIDs that don't exist)`,
        `OUTPUT FORMAT (strict JSON only):`,
        `{
            "isValid": boolean,
            "errors": [
                {
                    "rowIndex": number,
                    "field": string,
                    "errorType": "missing_field" | "duplicate_id" | "invalid_range" | "invalid_format",
                    "message": string,
                    "severity": "error" | "warning"
                }
            ],
            "summary": {
                "totalRows": number,
                "errorCount": number,
                "warningCount": number
            }
        }`,
        ``,
        `Now return the response as strict JSON only - no markdown, no explanation.`
    ].join("\n")
}

export {validateDataWithAI}