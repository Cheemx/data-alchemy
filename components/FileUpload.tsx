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
import { CloudUploadIcon, Trash2Icon, TrashIcon } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import DataTable from "./DataTable";
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function FileUpload() {
    const [parsedData, setParsedData] = useState<any[] | null>(null);
    const [datasets, setDatasets] = useState<{
        clients: any[] | null;
        workers: any[] | null;
        tasks: any[] | null;
    }>({
        clients: null,
        workers: null,
        tasks: null,
    });

    const detectFileType = (
        fileName: string
    ): "clients" | "workers" | "tasks" | null => {
        const name = fileName.toLowerCase();
        if (name.includes("client")) return "clients";
        if (name.includes("worker")) return "workers";
        if (name.includes("task")) return "tasks";
        return null;
    };

    const parseFile = (file: File): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            const ext = file.name.split(".").pop()?.toLowerCase();

            if (!ext) {
                return reject("Unable to determine file extension");
            }

            if (ext === "csv") {
                Papa.parse<any>(file, {
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
                        const json: any[] = XLSX.utils.sheet_to_json(sheet, {
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

                const type = detectFileType(file.name);
                if (type) {
                    setDatasets((prev) => ({
                        ...prev,
                        [type]: data,
                    }));
                } else {
                    setParsedData(data);
                }

                return {
                    status: "success",
                    result: file.name,
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
            maxFiles: 5,
        },
    });

    return (
        <div className="not-prose flex flex-col gap-4">
            <Dropzone {...dropzone}>
                <div>
                    <div className="flex justify-between">
                        <DropdownMenu>
                            <DropdownMenuTrigger>Open</DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>
                                    Select dataset
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Clients</DropdownMenuItem>
                                <DropdownMenuItem>Workers</DropdownMenuItem>
                                <DropdownMenuItem>Tasks</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropzoneDescription>
                            Please Select file to upload
                        </DropzoneDescription>
                        <DropzoneMessage />
                    </div>
                    <DropZoneArea>
                        <DropzoneTrigger className="flex flex-col items-center gap-2 bg-transparent p-6 rounded-md border border-dashed text-center text-sm">
                            <CloudUploadIcon className="size-8" />
                            <div>
                                <p className="font-semibold">Upload File</p>
                                <p className="text-sm text-muted-foreground">
                                    Click here or drag and drop to upload
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
                                    <div className="h-12 bg-muted-foreground/10 flex items-center justify-center rounded-md text-xs text-muted-foreground">
                                        Uploaded
                                    </div>
                                )}
                                <div className="flex items-center justify-between p-2 pl-4">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm">
                                            {file.fileName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {(file.file.size / 1024).toFixed(2)}{" "}
                                            KB
                                        </p>
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
                    onExportExcel={(updatedData) => {
                        const ws = XLSX.utils.json_to_sheet(updatedData);
                        const wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
                        XLSX.writeFile(wb, `exported_data.xlsx`);
                    }}
                    onExportCSV={(updatedData) => {
                        const csv = Papa.unparse(updatedData);
                        const blob = new Blob([csv], {
                            type: "text/csv;charset=utf-8;",
                        });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.setAttribute("download", "exported_data.csv");
                        document.body.appendChild(link);
                        link.click();
                    }}
                />
            )}
        </div>
    );
}
