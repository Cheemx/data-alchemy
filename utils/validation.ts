export interface ValidationError {
    rowIndex: number
    field: string
    errorType: string
    message: string
    severity: 'error' | 'warning'
}

export interface ValidationResult {
    isValid: boolean
    errors: ValidationError[]
    summary: {
        totalRows: number
        errorCount: number
        warningCount: number
    }
}

const SCHEMAS = {
    clients: {
        required: ['ClientID', 'ClientName', 'PriorityLevel'],
        optional: ['RequestedTaskIDs', 'GroupTag', 'AttributesJSON']
    },
    workers: {
        required: ['WorkerID', 'WorkerName', 'Skills', 'AvailableSlots'],
        optional: ['MaxLoadPerPhase', 'GroupTag', 'QualificationLevel']
    },
    tasks: {
        required: ['TaskID', 'TaskName', 'Duration', 'RequiredSkills'],
        optional: ['Category', 'PreferredPhases', 'MaxConcurrent']
    }
}

export function validateData(
    data: any[],
    entityType: 'clients' | 'workers' | 'tasks'
): ValidationResult {
    const errors: ValidationError[] = []

    if (!data || data.length === 0) {
        return {
            isValid: false,
            errors: [{
                rowIndex: 0,
                field: 'dataset',
                errorType: 'empty_dataset',
                message: 'Dataset is Empty',
                severity: 'error'
            }],
            summary: {
                totalRows: 0,
                errorCount: 1,
                warningCount: 0
            }
        }
    }

    const schema = SCHEMAS[entityType]
    const headers = Object.keys(data[0] || {})

    schema.required.forEach(requiredField => {
        if(!headers.includes(requiredField)) {
            errors.push({
                rowIndex: 0,
                field: requiredField,
                errorType: 'missing_column',
                message: `Required column ${requiredField} is missing`,
                severity: 'error'
            })
        }
    })

    data.forEach((row, index) => {
        schema.required.forEach(field => {
            if(!row[field] || row[field] === '' || row[field] === null) {
                errors.push({
                    rowIndex: index,
                    field,
                    errorType: 'missing_value',
                    message: `Missing required value for ${field}`,
                    severity: 'error'
                })
            }
        })

        if(entityType === 'clients') {
            validateClientRow(row, index, errors)
        } else if (entityType === 'workers') {
            validateWorkerRow(row, index, errors)
        } else if (entityType === 'tasks') {
            validatetaskRow(row, index, errors)
        }
    })

    validateDuplicateIDs(data, entityType, errors)

    const errorCount = errors.filter(e => e.severity === "error").length
    const warningCount = errors.filter(e => e.severity === 'warning').length

    return {
        isValid: errorCount === 0,
        errors,
        summary: {
            totalRows: data.length,
            errorCount,
            warningCount
        }
    }
}

function validateClientRow(row: any, index: number, errors: ValidationError[]) {
    const priority = parseInt(row.PriorityLevel)
    if (isNaN(priority) || priority < 1 || priority > 6) {
        errors.push({
            rowIndex: index,
            field: 'PriorityLevel',
            errorType: 'invalid_range',
            message: 'PriorityLevel must be between 1 & 5',
            severity: 'error'
        })
    }

    if(row.AttributesJSON && row.AttributesJSON.trim()){
        try{
            JSON.parse(row.AttributesJSON)
        } catch {
            errors.push({
                rowIndex: index,
                field: 'AttributesJSON',
                errorType: 'invalid_json',
                message: 'AttributesJSON contains invalid JSON',
                severity: 'error'
            })
        }
    }
}

function validateWorkerRow(row: any, index: number, errors: ValidationError[]) {
    if (row.MaxLoadPerPhase) {
        const maxLoad = parseInt(row.MaxLoadPerPhase)
        if (isNaN(maxLoad) || maxLoad < 1) {
            errors.push({
                rowIndex: index,
                field: 'MaxLoadPerPhase',
                errorType: 'invalid_range',
                message: 'MaxLoadPerPhase must be a positive integer',
                severity: 'error'
            })
        }
    }

    if(row.AvailableSlots) {
        try {
            if(typeof row.AvailableSlots === 'string'){
                if (row.AvailableSlots.startsWith('[')) {
                    JSON.parse(row.AvailableSlots)
                } else {
                    const slots = row.AvailableSlots.split(',').map((s: string) => parseInt(s.trim()))
                    if (slots.some((s: number) => isNaN(s) || s < 1)) {
                        throw new Error('Invalid slot numbers')
                    }
                }
            }
        } catch  {
            errors.push({
                rowIndex: index,
                field: 'AvailableSlots',
                errorType: 'invalid_format',
                message: 'AvailableSlots must be valid array or comma-separated numbers',
                severity: 'error'
            })
        }
    }
}

function validatetaskRow(row: any, index: number, errors: ValidationError[]) {
    const duration = parseInt(row.Duration)
    if(isNaN(duration) || duration < 1) {
        errors.push({
            rowIndex: index,
            field: 'Duration',
            errorType: 'invalid_range',
            message: 'Duration must be a positive integer',
            severity: 'error'
        })
    }

    if (row.MaxConcurrent){
        const maxConcurrent = parseInt(row.MaxConcurrent)
        if (isNaN(maxConcurrent) || maxConcurrent < 0) {
            errors.push({
                rowIndex: index,
                field: 'MaxConcurrent',
                errorType: 'invalid_range',
                message: 'MaxConcurrent must be a positive integer',
                severity: 'error'
            })
        }
    }
}

function validateDuplicateIDs(
    data: any[],
    entityType: 'clients' | 'workers' | 'tasks',
    errors: ValidationError[]
) {
    const idField = {
        clients: 'ClientID',
        workers: 'WorkerID',
        tasks: 'TaskID'
    }[entityType]

    const seenIDs = new Set()
    const duplicateIDs = new Set()

    data.forEach((row, index) => {
        const id = row[idField]
        if (id) {
            if (seenIDs.has(id)) {
                duplicateIDs.add(id)
                errors.push({
                    rowIndex: index,
                    field: idField,
                    errorType: 'duplicate_id',
                    message: `Duplicate ${idField}: ${id}`,
                    severity: 'error'
                })
            }else{
                seenIDs.add(id)
            }
        }
    })
}

export function isValidationResult(obj: any):obj is ValidationResult {
    return (
        obj && 
        typeof obj.isValid === 'boolean' &&
        Array.isArray(obj.errors) &&
        obj.summary &&
        typeof obj.summary.totalRows === 'number'
    )
}