import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { DownloadIcon, Loader2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import ValidationPanel, { ValidationResult } from "./ValidationPanel";
import SearchBar from "./SearchBar";
import { validateData } from "@/utils/validation";
import PriorityControl from "./PriorityControl";
import RuleBuilder from "./RuleBuilder";

type RowData = Record<string, string | number | null | undefined>

interface Rule {
    id: string;
    type: "co-run" | "load-limit" | "phase-window" | "skill-requirement";
    name: string;
    parameters: Record<string, RowData>;
}

interface DataProps {
    datasets: {
        clients: RowData[] | null;
        workers: RowData[] | null;
        tasks: RowData[] | null;
    };
    onExportExcel: (data: RowData[], type: string) => void;
    onExportCSV: (data: RowData[], type: string) => void;
}

const EditableTable = ({
    data,
    type,
    onExportExcel,
    onExportCSV,
}: {
    data: RowData[];
    type: "clients" | "workers" | "tasks";
    onExportExcel: (data: RowData[], type: string) => void;
    onExportCSV: (data: RowData[], type: string) => void;
}) => {
    const [tableData, setTableData] = useState(data)
    const [validationResult, setValidationResult] =
        useState<ValidationResult | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const result = validateData(tableData, type);
        setValidationResult(result);
    }, [tableData, type]);

    const handleChange = (rowIdx: number, key: string, value: string) => {
        const updated = [...tableData];
        updated[rowIdx][key] = value;
        setTableData(updated);
    };

    const handleValidation = () => {
        setLoading(true);
        setTimeout(() => {
            const result = validateData(tableData, type);
            setValidationResult(result);
            setLoading(false);
        }, 500);
    };

    const keys = Object.keys(tableData[0] || {});

    const getCellError = (rowIdx: number, field: string) => {
        return validationResult?.errors.find(
            (error) => error.rowIndex === rowIdx && error.field === field
        );
    };

    return (
        <div className="space-y-4">
            <SearchBar
                data={tableData}
                onSearchResults={(results) => setTableData(results)}
                placeholder={`Search in ${type}`}
            />

            <div className="overflow-auto max-h-[40vh] border rounded-md">
                <Table>
                    <TableHeader className="sticky top-0 z-10">
                        <TableRow>
                            {keys.map((key) => (
                                <TableHead key={key}>{key}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tableData.map((row, rowIdx) => (
                            <TableRow key={rowIdx}>
                                {keys.map((key) => {
                                    const cellError = getCellError(rowIdx, key);
                                    const hasError = !!cellError;

                                    return (
                                        <TableCell key={key}>
                                            <Input
                                                value={row[key] ?? ""}
                                                onChange={(e) =>
                                                    handleChange(
                                                        rowIdx,
                                                        key,
                                                        e.target.value
                                                    )
                                                }
                                                className={
                                                    hasError
                                                        ? cellError?.severity === "error"
                                                            ? "border-red-500 bg-red-50"
                                                            : "border-yellow-500 bg-yellow-50"
                                                        : ""
                                                }
                                            />
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {validationResult && <ValidationPanel result={validationResult} />}

            <div className="flex justify-end gap-x-4">
                <Button onClick={handleValidation} disabled={loading}>
                    {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {loading ? "Validating..." : "Re-validate Data"}
                </Button>
                <Button onClick={() => onExportExcel(tableData, type)}>
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    Export Excel
                </Button>
                <Button onClick={() => onExportCSV(tableData, type)}>
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>
        </div>
    );
};

export default function DataTable({
    datasets,
    onExportExcel,
    onExportCSV,
}: DataProps) {
    const [priorities, setPriorities] = useState({
        priorityLevel: 1,
        taskFulfillment: 1,
        fairness: 1,
        efficiency: 1,
    });
    const [rules, setRules] = useState<Rule[]>([]);

    const availableTabs = Object.entries(datasets)
        .filter(([_, data]) => data != null)
        .map(([key, _]) => key);

    const defaultTab = availableTabs[0] || "clients";

    return (
        <div className="w-full mt-4 space-y-4">
            <PriorityControl
                priorities={priorities}
                onPrioritiesChange={setPriorities}
                datasets={datasets}
                rules={rules}
            />

            <RuleBuilder
                datasets={datasets}
                rules={rules}
                onRulesChange={setRules}
            />

            <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList>
                    {datasets.clients && (
                        <TabsTrigger value="clients">
                            Clients({datasets.clients.length})
                        </TabsTrigger>
                    )}
                    {datasets.workers && (
                        <TabsTrigger value="workers">
                            Workers({datasets.workers.length})
                        </TabsTrigger>
                    )}
                    {datasets.tasks && (
                        <TabsTrigger value="tasks">
                            Tasks({datasets.tasks.length})
                        </TabsTrigger>
                    )}
                </TabsList>

                {datasets.clients && (
                    <TabsContent value="clients">
                        <EditableTable
                            data={datasets.clients}
                            type="clients"
                            onExportCSV={onExportCSV}
                            onExportExcel={onExportExcel}
                        />
                    </TabsContent>
                )}
                {datasets.workers && (
                    <TabsContent value="workers">
                        <EditableTable
                            data={datasets.workers}
                            type="workers"
                            onExportCSV={onExportCSV}
                            onExportExcel={onExportExcel}
                        />
                    </TabsContent>
                )}
                {datasets.tasks && (
                    <TabsContent value="tasks">
                        <EditableTable
                            data={datasets.tasks}
                            type="tasks"
                            onExportCSV={onExportCSV}
                            onExportExcel={onExportExcel}
                        />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
