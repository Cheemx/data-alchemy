import { searchDataWithAI } from '@/utils/gemini'
import React, { useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Loader2, Search } from 'lucide-react'

interface SearchBarProps {
    data: any[]
    onSearchResults: (results: any[]) => void
    placeholder: string
}

interface FilterCondition {
    field: string
    operator: '>' | '<' | '=' | 'contains' | 'between'
    value: string | number | [number, number]
}

function parseQuery(query: string): FilterCondition[] {
    const conditions: FilterCondition[] = []

    const regexPatterns = [
        { regex: /(\w+)\s*>\s*(\d+)/i, operator: '>' },
        { regex: /(\w+)\s*<\s*(\d+)/i, operator: '<' },
        { regex: /(\w+)\s*=\s*(\w+)/i, operator: '=' },
        { regex: /(\w+)\s+contains\s+["']?(.+?)["']?/i, operator: 'contains' },
        { regex: /(\w+)\s+between\s+(\d+)\s+and\s+(\d+)/i, operator: 'between' },
    ]

    for(const pattern of regexPatterns) {
        const match = query.match(pattern.regex)
        if (match) {
            const[, field, ...rest] = match
            let value: any
            if(pattern.operator === 'between') {
                value = [parseInt(rest[0]), parseInt(rest[1])]
            } else if(pattern.operator === '>' || pattern.operator === '<') {
                value = parseFloat(rest[0])
            } else {
                value = rest[0]
            }

            conditions.push({
                field,
                operator: pattern.operator as any,
                value
            })
        }
    }

    return conditions
}

function applyFilters(data: any[], conditions: FilterCondition[]): any[] {
    return data.filter(row => {
        return conditions.every(condition => {
            const val = row[condition.field];

            if (val == null) return false;

            switch (condition.operator) {
                case '>':
                    return Number(val) > Number(condition.value);
                case '<':
                    return Number(val) < Number(condition.value);
                case '=':
                    return String(val).toLowerCase() === String(condition.value).toLowerCase();
                case 'contains':
                    return String(val).toLowerCase().includes(String(condition.value).toLowerCase());
                case 'between':
                    const [min, max] = condition.value as [number, number];
                    return Number(val) >= min && Number(val) <= max;
                default:
                    return false;
            }
        })
    })
}

export default function SearchBar({data, onSearchResults, placeholder} : SearchBarProps) {
    const [query, setQuery] = useState('')
    const[isSearching, setIsSearching] = useState(false)

    const handleSearch = () => {
        if (!query.trim()) {
            onSearchResults(data)
            return
        }

        setIsSearching(true)
        try {
            const conditions = parseQuery(query)
            const results = applyFilters(data, conditions)
            onSearchResults(results)
        } catch (error) {
            console.error('Search Failed:', error)
            const fallbackResults = data.filter(row =>
                Object.values(row).some(value => 
                    String(value).toLowerCase().includes(query.toLowerCase())
                )
            )
            onSearchResults(fallbackResults)
        } finally {
            setIsSearching(false)
        }
    }
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    }
    return (
        <div className='flex gap-2 mb-2'>
            <Input
                type='text'
                placeholder={placeholder || "Search with natural language..."}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                className='flex-1'
            />
            <Button>
                {isSearching ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                ): (
                    <Search className='h-4 w-4' />
                )}
                {isSearching ? 'Searching...' : 'Search'}
            </Button>
            <Button variant="outline" onClick={() => {
                setQuery('')
                onSearchResults(data)
            }}>
                Reset
            </Button>
        </div>
    )
}
