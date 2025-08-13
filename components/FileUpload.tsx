"use client";
import React, { useState } from "react";
import {
    Dropzone,
    DropZoneArea,
    DropzoneDescription,
    DropzoneFileList,
    DropzoneFileListItem,
    DropzoneMessage,
    DropzoneRemoveFile,
    DropzoneTrigger,
    useDropzone,
} from "./ui/dropzone";
import {
    AlertCircle,
    CheckCircle2,
    CloudUploadIcon,
    Trash2Icon
} from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import DataTable from "./DataTable"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";

type RowData = Record<string, string | number | null | undefined>

interface Datasets {
    clients: RowData[] | null;
    workers: RowData[] | null;
    tasks: RowData[] | null;
}

export default function FileUpload() {
    const [datasets, setDatasets] = useState<Datasets>({
        clients: null,
        workers: null,
        tasks: null,
    });
    const [selectedFileType, setSelectedFileType] = useState<
        "clients" | "workers" | "tasks" | null
    >(null);

    const detectFileType = (
        fileName: string
    ): "clients" | "workers" | "tasks" | null => {
        const name = fileName.toLowerCase();
        if (name.includes("client")) return "clients";
        if (name.includes("worker")) return "workers";
        if (name.includes("task")) return "tasks";
        return null;
    };

    const parseFile = (file: File): Promise<RowData[]> => {
        return new Promise((resolve, reject) => {
            const ext = file.name.split(".").pop()?.toLowerCase();

            if (!ext) {
                return reject("Unable to determine file extension");
            }

            if (ext === "csv") {
                Papa.parse<RowData>(file, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        resolve(results.data);
                    },
                    error: (error) => {
                        reject(error.message);
                    },
                });
            } else if (ext === "xls" || ext === "xlsx") {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = new Uint8Array(
                            e.target?.result as ArrayBuffer
                        );
                        const workbook = XLSX.read(data, { type: "array" });
                        const sheetName = workbook.SheetNames[0];
                        const sheet = workbook.Sheets[sheetName];
                        const json: RowData[] = XLSX.utils.sheet_to_json(sheet, {
                            defval: null,
                        });
                        resolve(json);
                    } catch (error) {
                        reject(
                            "Error reading Excel file: " +
                                (error as Error).message
                        );
                    }
                };
                reader.onerror = () => reject("Error reading file");
                reader.readAsArrayBuffer(file);
            } else {
                reject("Unsupported file type!");
            }
        });
    };

    const dropzone = useDropzone({
        onDropFile: async (file: File) => {
            try {
                const data = await parseFile(file);
                console.log("Parsed Data: ", data);

                const detectedType = detectFileType(file.name);
                const fileType = detectedType || selectedFileType;

                if (!fileType) {
                    return {
                        status: "error",
                        error: "Please select a file type (clients, workers, or tasks) before uploading, or name your file appropriately (e.g., 'clients.csv')",
                    };
                }
                setDatasets((prev) => ({
                    ...prev,
                    [fileType]: data,
                }));

                if (!detectedType) {
                    setSelectedFileType(null);
                }

                return {
                    status: "success",
                    result: `Loaded as ${fileType} data (${data.length} rows)`,
                };
            } catch (error) {
                return {
                    status: "error",
                    error:
                        error instanceof Error ? error.message : String(error),
                };
            }
        },
        validation: {
            accept: {
                "text/csv": [".csv"],
                "application/vnd.ms-excel": [".xls"],
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                    [".xlsx"],
            },
            maxSize: 10 * 1024 * 1024,
            maxFiles: 3,
        },
    });

    const loadedCount = Object.values(datasets).filter(Boolean).length;
    const totalRows = Object.values(datasets).reduce(
        (acc, dataset) => acc + (dataset?.length || 0),
        0
    );

    return (
        <div className="not-prose flex flex-col gap-4">
            {/*Dataset Selector Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        Data Upload Status
                    </CardTitle>
                    <CardDescription>Upload CSV or Excel files</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-center flex-wrap">
                        <div className="text-sm">
                            <span className="font-medium">{loadedCount}/3</span>
                            Datasets loaded
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Total rows: {totalRows}
                        </div>
                        <div className="flex gap-2">
                            {Object.entries(datasets).map(([Key, data]) => (
                                <Badge
                                    key={Key}
                                    variant={data ? "default" : "secondary"}
                                    className="capitalize"
                                >
                                    {data ? (
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                    ) : (
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                    )}
                                    {Key} {data ? `(${data.length})` : ""}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-2">
                <Label htmlFor="file-type">
                    Select File Type(if not auto detected from filename)
                </Label>
                <Select
                    value={selectedFileType || ""}
                    onValueChange={(value: "clients" | "workers" | "tasks") =>
                        setSelectedFileType(value)
                    }
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose file type..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="clients">Clients</SelectItem>
                        <SelectItem value="workers">Workers</SelectItem>
                        <SelectItem value="tasks">Tasks</SelectItem>
                    </SelectContent>
                </Select>
                {selectedFileType && (
                    <p className="text-xs text-muted-foreground">
                        Next file will be uploaded as:{" "}
                        <strong>{selectedFileType}</strong>
                    </p>
                )}
            </div>

            <Dropzone {...dropzone}>
                <div>
                    <div className="flex justify-between">
                        <DropzoneDescription>
                            Drop Files here or click to upload
                        </DropzoneDescription>
                        <DropzoneMessage />
                    </div>
                    <DropZoneArea>
                        <DropzoneTrigger className="flex flex-col items-center gap-2 bg-transparent p-6 rounded-md border border-dashed text-center text-sm hover:bg-muted/50 transition-colors">
                            <CloudUploadIcon className="size-8" />
                            <div>
                                <p className="font-semibold">Upload File</p>
                                <p className="text-sm text-muted-foreground">
                                    Supports CSV, XLS, XLSX files
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Name files like &apos;clients.csv&apos; for
                                    auto-detection
                                </p>
                            </div>
                        </DropzoneTrigger>
                    </DropZoneArea>

                    <DropzoneFileList className="grid gap-3 p-0 md:grid-cols-2 lg:grid-cols-3">
                        {dropzone.fileStatuses.map((file) => (
                            <DropzoneFileListItem
                                className="rounded-md bg-muted p-2 shadow-sm border"
                                key={file.id}
                                file={file}
                            >
                                {file.status === "pending" && (
                                    <div className="h-12 animate-pulse bg-muted-foreground/20 rounded-md" />
                                )}
                                {file.status === "success" && (
                                    <div className="h-12 bg-green-100 flex items-center justify-center rounded-md text-xs text-green-700">
                                        Success
                                    </div>
                                )}
                                {file.status === "error" && (
                                    <div className="h-12 bg-red-100 flex items-center justify-center rounded-md text-xs text-red-700">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        Error
                                    </div>
                                )}
                                <div className="flex items-center justify-between p-2 pl-4">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm">
                                            {file.fileName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {(file.file.size / 1024).toFixed(2)}
                                            KB
                                        </p>
                                        {file.status === "success" && file.result && (
                                            <p className="text-xs text-green-600">
                                                {file.result}
                                            </p>
                                        )}
                                        {file.status==="error" && file.error && (
                                            <p className="text-xs text-red-600 truncate">
                                                {file.error}
                                            </p>
                                        )}
                                    </div>
                                    <DropzoneRemoveFile>
                                        <Trash2Icon className="size-4" />
                                    </DropzoneRemoveFile>
                                </div>
                            </DropzoneFileListItem>
                        ))}
                    </DropzoneFileList>
                </div>
            </Dropzone>


            {(datasets.clients || datasets.workers || datasets.tasks) && (
                <DataTable
                    datasets={datasets}
                    onExportExcel={(data: RowData[], type: string) => {
                        const ws = XLSX.utils.json_to_sheet(data);
                        const wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
                        XLSX.writeFile(wb, `${type}_exported.xlsx`);
                    }}
                    onExportCSV={(data: RowData[], type: string) => {
                        const csv = Papa.unparse(data);
                        const blob = new Blob([csv], {
                            type: "text/csv;charset=utf-8;",
                        });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.setAttribute("download", `${type}_exported.csv`);
                        document.body.appendChild(link);
                        link.click();
                        URL.revokeObjectURL(url)
                    }}
                />
            )}
        </div>
    );
}
