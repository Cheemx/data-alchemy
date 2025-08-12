import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { TriangleAlert } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";

export interface ValidationResult {
    isValid: boolean;
    errors: Array<{
        rowIndex: number;
        field: string;
        errorType: string;
        message: string;
        severity: "error" | "warning";
    }>;
    summary: {
        totalRows: number;
        errorCount: number;
        warningCount: number;
    };
}

export default function ValidationPanel({
    result,
}: {
    result: ValidationResult;
}) {
    const { summary, errors } = result;
    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>Validation Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    <Alert variant="default">
                        <TriangleAlert className="h-4 w-4 text-red-500" />
                        <AlertTitle className="text-sm">
                            Validation Results
                        </AlertTitle>
                        <AlertDescription>
                            <span>
                                Total Rows: <strong>{summary?.totalRows ?? "?"}</strong>
                            </span>
                            <span className="text-red-600">
                                Errors: <strong>{summary?.errorCount ?? "?"}</strong>
                            </span>
                            <span className="text-yellow-600">
                                Warnings:{" "}
                                <strong>{summary?.warningCount ?? "?"}</strong>
                            </span>
                        </AlertDescription>
                    </Alert>

                    {errors.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Row</TableHead>
                                    <TableHead>Field</TableHead>
                                    <TableHead>Error Type</TableHead>
                                    <TableHead>Message</TableHead>
                                    <TableHead>Severity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {errors.map((err, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            {err.rowIndex + 1}
                                        </TableCell>
                                        <TableCell>{err.field}</TableCell>
                                        <TableCell>{err.errorType}</TableCell>
                                        <TableCell>{err.message}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    err.severity === "error"
                                                        ? "bg-red-100 text-red-700 border-red-300"
                                                        : "bg-yellow-100 text-yellow-700 border-yellow-300"
                                                }
                                            >
                                                {err.severity}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-sm text-muted-foreground text-center">
                            No issues found.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
