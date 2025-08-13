import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { DownloadIcon, RotateCcw } from 'lucide-react';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';

type RowData = Record<string, string | number | null | undefined>;

interface PrioritySettings {
    priorityLevel: number,
    taskFulfillment: number,
    fairness: number,
    efficiency: number
}

interface Rule {
    id: string;
    type: 'co-run' | 'load-limit' | 'phase-window' | 'skill-requirement';
    name: string;
    parameters: Record<string, string | number | null | undefined>;
}

interface PriorityControlsProps {
    priorities: PrioritySettings
    onPrioritiesChange: (priorities: PrioritySettings) => void
    datasets: {
        clients: RowData[] | null
        workers: RowData[] | null
        tasks: RowData[] | null
    }
    rules?: Rule[]
}

const PRESET_PROFILES = {
    balanced: {
        name: "Balanced",
        description: "Equal weight to all factors",
        values: { priorityLevel: 1, taskFulfillment: 1, fairness: 1, efficiency: 1 }
    },
    efficiency: {
        name: "Maximize Efficiency",
        description: "Focus on completing tasks quickly",
        values: { priorityLevel: 0.5, taskFulfillment: 0.8, fairness: 0.3, efficiency: 2 }
    },
    fairness: {
        name: "Fair Distribution",
        description: "Ensure equal workload distribution",
        values: { priorityLevel: 0.8, taskFulfillment: 0.8, fairness: 2, efficiency: 0.5 }
    },
    priority: {
        name: "Priority First",
        description: "High-priority clients get preference",
        values: { priorityLevel: 2, taskFulfillment: 1.5, fairness: 0.5, efficiency: 0.8 }
    }
};

export default function PriorityControl({
    priorities,
    onPrioritiesChange,
    datasets,
    rules = []
}: PriorityControlsProps) {
    const updatePriority = (key: keyof PrioritySettings, value: number) => {
        onPrioritiesChange({
            ...priorities,
            [key]: value
        })
    }

    const applyPreset = (presetKey: keyof typeof PRESET_PROFILES) => {
        onPrioritiesChange(PRESET_PROFILES[presetKey].values)
    }

    const resetToDefaults = () => {
        onPrioritiesChange({
            priorityLevel: 1,
            taskFulfillment: 1,
            fairness: 1,
            efficiency: 1
        })
    }

    const exportConfiguration = () => {
        const config = {
            priorities,
            datasets: {
                clientsCount: datasets.clients?.length || 0,
                workersCount: datasets.workers?.length || 0,
                tasksCount: datasets.tasks?.length || 0
            },
            rules: rules.map(rule => ({
                id: rule.id,
                type: rule.type,
                name: rule.name,
                parameters: rule.parameters
            })),
            timeStamp: new Date().toISOString(),
        }
        const blob = new Blob([JSON.stringify(config, null, 2)], {
            type: 'application/json'
        })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'allocation_config.json'
        document.body.appendChild(link)
        link.click()
        URL.revokeObjectURL(url)
        document.body.removeChild(link)
    }

    const totalWeight = Object.values(priorities).reduce((sum, val) => sum + val, 0)

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                    Resource Allocation Priorities 
                    <div className='flex gap-2'>
                        <Button variant="outline" size="sm" onClick={resetToDefaults}>
                            <RotateCcw className='w-4 h-4 mr-1' />
                            Reset
                        </Button>
                        <Button size='sm' onClick={exportConfiguration}>
                            <DownloadIcon className='w-4 h-4 mr-1' />
                            Export Config
                        </Button>
                    </div>
                </CardTitle>
                <CardDescription>
                    Adjust the relative importance of different allocation criteria
                </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
                <div className='space-y-2'>
                    <Label>Quick Presets</Label>
                    <Select onValueChange={(value: keyof typeof PRESET_PROFILES) => applyPreset(value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Choose a preset..." />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(PRESET_PROFILES).map(([key, preset]) => (
                                <SelectItem key={key} value={key}>
                                    <div>
                                        <div className='font-medium'>{preset.name}</div>
                                        <div className='text-xs text-muted-foreground'>{preset.description}</div>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className='grid gap-6 md:grid-cols-2'>
                    <div className='space-y-2'>
                        <div className='flex justify-between items-center'>
                            <Label>Priority Level Weight</Label>
                            <Badge variant="secondary">{priorities.priorityLevel.toFixed(1)}</Badge>
                        </div>
                        <Slider
                            value={[priorities.priorityLevel]}
                            onValueChange={(value) => updatePriority('priorityLevel', value[0])}
                            max={3}
                            min={0}
                            step={0.1}
                            className='w-full'
                        />
                        <p className='text-xs text-muted-foreground'>
                            How much to favor high-priority clients
                        </p>
                    </div>

                    <div className='space-y-2'>
                        <div className='flex justify-between items-center'>
                            <Label>Task Fulfillement Weight</Label>
                            <Badge variant='secondary'>{priorities.taskFulfillment.toFixed(1)}</Badge>
                        </div>
                        <Slider
                            value={[priorities.taskFulfillment]}
                            onValueChange={(value) => updatePriority('taskFulfillment', value[0])}
                            max={3}
                            min={0}
                            step={0.1}
                            className='w-full'
                        />
                        <p className='text-xs text-muted-foreground'>
                            Importance of completing requested tasks
                        </p>
                    </div>

                    <div className='space-y-2'>
                        <div className='flex justify-between items-center'>
                            <Label>Fairness Weight</Label>
                            <Badge variant='secondary'>{priorities.fairness.toFixed(1)}</Badge>
                        </div>
                        <Slider
                            value={[priorities.fairness]}
                            onValueChange={(value) => updatePriority('fairness', value[0])}
                            max={3}
                            min={0}
                            step={0.1}
                            className='w-full'
                        />
                        <p className='text-xs text-muted-foreground'>
                            Equal distribution of workers across clients
                        </p>
                    </div>

                    <div className='space-y-2'>
                        <div className='flex justify-between items-center'>
                            <Label>Efficiency Weight</Label>
                            <Badge variant='secondary'>{priorities.efficiency.toFixed(1)}</Badge>
                        </div>
                        <Slider
                            value={[priorities.taskFulfillment]}
                            onValueChange={(value) => updatePriority('efficiency', value[0])}
                            max={3}
                            min={0}
                            step={0.1}
                            className='w-full'
                        />
                        <p className='text-xs text-muted-foreground'>
                            Minimize resource waste and maximize throughput
                        </p>
                    </div>
                </div>

                <div className='border-t pt-4'>
                    <Label className='text-sm font-medium'>Weight Distribution</Label>
                    <div>
                        {Object.entries(priorities).map(([Key, value]) => {
                            const percentage = ((value / totalWeight) * 100).toFixed(1)
                            return (
                                <div key={Key} className='text-center'>
                                    <div className='text-xs font-medium capitalize'>{Key.replace(/([A_Z])/g, '$1')}</div>
                                    <div className='text-lg font-bold'>{percentage}%</div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className='border-t pt-4'>
                    <Label className='text-sm font-medium'>Loaded Data Summary</Label>
                    <div className='grid grid-cols-3 gap-4 mt-2 text-sm'>
                        <div className='text-center'>
                            <div className='font-medium'>{datasets.clients?.length || 0}</div>
                            <div className='text-muted-foreground'>Clients</div>
                        </div>
                        <div className='text-center'>
                            <div className='font-medium'>{datasets.workers?.length || 0}</div>
                            <div className='text-muted-foreground'>Workers</div>
                        </div>
                        <div className='text-center'>
                            <div className='font-medium'>{datasets.tasks?.length || 0}</div>
                            <div className='text-muted-foreground'>Tasks</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
