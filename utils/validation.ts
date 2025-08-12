import { ValidationResult } from "@/components/ValidationPanel";

export function isValidationResult(data: any): data is ValidationResult {
    return (
        data && 
        typeof data.isValid === "boolean" &&
        Array.isArray(data.errors) &&
        data.summary &&
        typeof data.summary.totalRows === "number" &&
        typeof data.summary.errorCount === "number" &&
        typeof  data.summary.warningCount === "number"
    )
}