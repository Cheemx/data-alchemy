import React, { useState } from "react";
import { Button } from "./ui/button";
import { DownloadIcon } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface DataProps {
    datasets:{
        clients: any[] | null
        workers: any[] | null
        tasks: any[] | null
    }
    onExportExcel: (data: any[]) => void
    onExportCSV: (data: any[]) => void
}

const EditableTable = ({
    data, 
    type,
    onExportExcel,
    onExportCSV
}: {
    data: any[]
    type: string
    onExportExcel: (data: any[], type: string) => void
    onExportCSV: (data:any[], type: string) => void
}) => {
    const [tableData, setTableData] = useState(data)

    const handleChange = (rowIdx: number, key: string, value: string) => {
        const updated = [...tableData]
        updated[rowIdx][key] = value
        setTableData(updated)
    }

    const keys = Object.keys(tableData[0] || {});

    return (
        <div className="space-y-2">
            <div className="overflow-auto max-h-[60vh] border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {keys.map((key) => (
                                <TableHead key={key}>{key}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tableData.map((row, rowIdx) => (
                            <TableRow key={rowIdx}>
                                {keys.map((key) => (
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
                                        />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex justify-end gap-x-4">
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
}

export default function DataTable({
    datasets,
    onExportExcel,
    onExportCSV,
}: DataProps) {
    return (
        <Tabs defaultValue="clients" className="w-full mt-4">
            <TabsList>
                {datasets.clients && <TabsTrigger value="clients">Clients</TabsTrigger>}
                {datasets.workers && <TabsTrigger value="workers">Workers</TabsTrigger>}
                {datasets.tasks && <TabsTrigger value="tasks">Tasks</TabsTrigger>}
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
    )
}
