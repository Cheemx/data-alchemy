import React, { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Separator } from "./ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";

type RowData = Record<string, string | number | null | undefined>;

interface Rule {
    id: string;
    type: "co-run" | "load-limit" | "phase-window" | "skill-requirement";
    name: string;
    parameters: Record<string, string | number | null | undefined>;
}

interface RuleBuilderProps {
    datasets: {
        clients: RowData[] | null;
        workers: RowData[] | null;
        tasks: RowData[] | null;
    };
    rules: Rule[];
    onRulesChange: (rules: Rule[]) => void;
}

export default function RuleBuilder({
    datasets,
    rules,
    onRulesChange,
}: RuleBuilderProps) {
    const [selectedRuleType, setSelectedRuleType] = useState<Rule["type"] | "">(
        ""
    );
    const [newRule, setNewRule] = useState<{
        name?: string;
        parameters: Record<string, string | number | null | undefined>;
    }>({
        parameters: {},
    });

    const taskOptions =
        datasets.tasks?.map((task) => ({
            value: task.TaskID,
            label: `${task.TaskID} - ${task.TaskName}`,
        })) || [];

    const workerGroups = [
        ...new Set(
            datasets.workers?.map((w) => w.WorkerGroup).filter(Boolean) || []
        ),
    ];

    const ruleTemplates = {
        "co-run": {
            name: "Co-run Rule",
            description: "Tasks that must run together",
            fields: [
                {
                    key: "tasks",
                    label: "Select Tasks",
                    type: "multi-select",
                    options: taskOptions,
                },
                {
                    key: "description",
                    label: "Description",
                    type: "text",
                    placeholder: "These tasks must run together",
                },
            ],
        },
        "load-limit": {
            name: "Load Limit Rule",
            description: "Maximum tasks per worker group per phase",
            fields: [
                {
                    key: "workerGroup",
                    label: "Worker Group",
                    type: "select",
                    options: workerGroups.map((g) => ({ value: g, label: g })),
                },
                {
                    key: "maxTasks",
                    label: "Max Tasks Per Phase",
                    type: "number",
                    min: 1,
                },
                {
                    key: "description",
                    label: "Description",
                    type: "text",
                    placeholder: "Limit workload for this group",
                },
            ],
        },
        "phase-window": {
            name: "Phase Window Rule",
            description: "Restrict when a task can run",
            fields: [
                {
                    key: "taskId",
                    label: "Task",
                    type: "select",
                    options: taskOptions,
                },
                {
                    key: "allowedPhases",
                    label: "Allowed Phases",
                    type: "text",
                    placeholder: "1,2,3 or 1-5",
                },
                {
                    key: "description",
                    label: "Description",
                    type: "text",
                    placeholder: "Task phase restrictions",
                },
            ],
        },
        "skill-requirement": {
            name: "Skill Requirement Rule",
            description: "Additional skill requirements for tasks",
            fields: [
                {
                    key: "taskId",
                    label: "Task",
                    type: "select",
                    options: taskOptions,
                },
                {
                    key: "requiredSkills",
                    label: "Required Skills",
                    type: "text",
                    placeholder: "skill1,skill2,skill3",
                },
                {
                    key: "description",
                    label: "Description",
                    type: "text",
                    placeholder: "Additional skill requirements",
                },
            ],
        },
    };

    const addRule = () => {
        if (!selectedRuleType || !newRule.name) return;

        const rule: Rule = {
            id: `rule_${Date.now()}`,
            type: selectedRuleType,
            name: newRule.name,
            parameters: newRule.parameters ?? {},
        };
        onRulesChange([...rules, rule]);
        setSelectedRuleType("");
        setNewRule(rule);
    };

    const removeRule = (ruleId: string) => {
        onRulesChange(rules.filter((rule) => rule.id !== ruleId));
    };

    const updateRuleParameter = (key: keyof Rule['parameters'], value: string | number) => {
        setNewRule((prev) => ({
            ...prev,
            parameters: {
                ...prev.parameters,
                [key]: value,
            },
        }));
    };

    const currentTemplate = selectedRuleType
        ? ruleTemplates[selectedRuleType]
        : null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Business Rules</CardTitle>
                <CardDescription>
                    Define custom rules for resource allocation (Optional)
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {rules.length > 0 && (
                    <div className="space-y-2">
                        <Label>Current Rules({rules.length})</Label>
                        <div className="space-y-2">
                            {rules.map((rule) => (
                                <div
                                    key={rule.id}
                                    className="flex items-center justify-between p-3 border rounded-md bg-muted/30"
                                >
                                    <div className="flex-1">
                                        <div className="fex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className="capitalize"
                                            >
                                                {rule.type.replace("-", "")}
                                            </Badge>
                                            <span className="font-medium">
                                                {rule.name}
                                            </span>
                                        </div>
                                        {rule.parameters.description && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {rule.parameters.description}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeRule(rule.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Separator />
                    </div>
                )}

                <div className="space-y-4">
                    <Label>Add New Rule</Label>

                    <div>
                        <Label>Rule Type</Label>
                        <Select
                            value={selectedRuleType}
                            onValueChange={(value: Rule["type"]) =>
                                setSelectedRuleType(value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Choose rule type..." />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(ruleTemplates).map(
                                    ([key, template]) => (
                                        <SelectItem key={key} value={key}>
                                            <div>
                                                <div className="font-medium">
                                                    {template.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {template.description}
                                                </div>
                                            </div>
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {currentTemplate && (
                        <div className="space-y-4 p-4 border rounded-md bg-muted/20">
                            <div className="space-y-2">
                                <Label>Rule Name*</Label>
                                <Input
                                    value={newRule.name || ""}
                                    onChange={(e) =>
                                        setNewRule((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder={`${currentTemplate.name} #${
                                        rules.length + 1
                                    }`}
                                />
                            </div>

                            {currentTemplate.fields.map((field) => (
                                <div key={field.key} className="space-y-2">
                                    <Label>{field.label}</Label>
                                    {field.type === "text" && (
                                        <Input
                                            value={
                                                newRule.parameters?.[
                                                    field.key
                                                ] || ""
                                            }
                                            onChange={(e) =>
                                                updateRuleParameter(
                                                    field.key,
                                                    e.target.value
                                                )
                                            }
                                            placeholder={field.placeholder}
                                        />
                                    )}
                                    {field.type === "number" && (
                                        <Input
                                            type="number"
                                            value={
                                                newRule.parameters?.[
                                                    field.key
                                                ] || ""
                                            }
                                            onChange={(e) =>
                                                updateRuleParameter(
                                                    field.key,
                                                    parseInt(e.target.value)
                                                )
                                            }
                                        />
                                    )}
                                    {field.type === "select" && (
                                        <Select
                                            value={
                                                (newRule.parameters?.[
                                                    field.key
                                                ] as string) || ""
                                            }
                                            onValueChange={(value) =>
                                                updateRuleParameter(
                                                    field.key,
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(field.options ?? []).map(
                                                    (option) => (
                                                        <SelectItem
                                                            key={String(option.value)}
                                                            value={String(option.value)}
                                                        >
                                                            {option.label}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}

                                    {field.type === "multi-select" && (
                                        <Input
                                            value={
                                                newRule.parameters?.[
                                                    field.key
                                                ] || ""
                                            }
                                            onChange={(e) =>
                                                updateRuleParameter(
                                                    field.key,
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter comma-separated values: T1,T2,T3"
                                        />
                                    )}
                                </div>
                            ))}

                            <Button
                                onClick={addRule}
                                disabled={!newRule.name}
                                className="w-full"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Rule
                            </Button>
                        </div>
                    )}
                </div>

                {rules.length === 0 && (
                    <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                            <strong>Example rules you can create:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Co-run: &quot;Tasks T1 and T2 must run together&quot;</li>
                            <li>
                                Load-limit: &quot;Sales team max 3 tasks per phase&quot;
                            </li>
                            <li>
                                Phase-window: &quot;Task T5 can only run in phases
                                1-3&quot;
                            </li>
                            <li>
                                Skill-requirement: &quot;Task T10 needs Python and AI
                                skills&quot;
                            </li>
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
