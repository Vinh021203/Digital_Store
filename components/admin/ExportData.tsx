'use client';

import React from 'react';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';

type ExportFormat = 'csv' | 'json';

interface ExportButtonProps {
    data: any[];
    filename: string;
    format?: ExportFormat;
    columns?: { key: string; label: string }[];
    className?: string;
    variant?: 'button' | 'icon' | 'text';
    children?: React.ReactNode;
}

// Convert data to CSV string
function toCSV(data: any[], columns?: { key: string; label: string }[]): string {
    if (data.length === 0) return '';

    // Get headers
    const headers = columns
        ? columns.map(c => c.label)
        : Object.keys(data[0]);

    const keys = columns
        ? columns.map(c => c.key)
        : Object.keys(data[0]);

    // Build CSV
    const csvRows = [
        headers.join(','),
        ...data.map(row =>
            keys.map(key => {
                let value = row[key];

                // Handle null/undefined
                if (value === null || value === undefined) {
                    value = '';
                }

                // Handle objects
                if (typeof value === 'object') {
                    value = JSON.stringify(value);
                }

                // Escape quotes and wrap in quotes if contains comma
                value = String(value);
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    value = `"${value.replace(/"/g, '""')}"`;
                }

                return value;
            }).join(',')
        ),
    ];

    return csvRows.join('\n');
}

// Download file utility
function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function ExportButton({
    data,
    filename,
    format = 'csv',
    columns,
    className = '',
    variant = 'button',
    children,
}: ExportButtonProps) {
    const [isExporting, setIsExporting] = React.useState(false);

    const handleExport = async () => {
        setIsExporting(true);

        try {
            // Small delay for UX
            await new Promise(resolve => setTimeout(resolve, 300));

            if (format === 'csv') {
                const csv = toCSV(data, columns);
                downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8');
            } else {
                const json = JSON.stringify(data, null, 2);
                downloadFile(json, `${filename}.json`, 'application/json');
            }
        } finally {
            setIsExporting(false);
        }
    };

    if (variant === 'icon') {
        return (
            <button
                onClick={handleExport}
                disabled={isExporting || data.length === 0}
                className={`p-2 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 ${className}`}
                title={`Export ${format.toUpperCase()}`}
            >
                {isExporting ? (
                    <Loader2 size={18} className="animate-spin" />
                ) : format === 'csv' ? (
                    <FileSpreadsheet size={18} />
                ) : (
                    <FileText size={18} />
                )}
            </button>
        );
    }

    if (variant === 'text') {
        return (
            <button
                onClick={handleExport}
                disabled={isExporting || data.length === 0}
                className={`text-sm font-medium text-orange-600 hover:text-orange-700 disabled:opacity-50 flex items-center gap-1 ${className}`}
            >
                {isExporting ? (
                    <Loader2 size={14} className="animate-spin" />
                ) : (
                    <Download size={14} />
                )}
                {children || `Export ${format.toUpperCase()}`}
            </button>
        );
    }

    return (
        <button
            onClick={handleExport}
            disabled={isExporting || data.length === 0}
            className={`flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {isExporting ? (
                <Loader2 size={16} className="animate-spin" />
            ) : (
                <Download size={16} />
            )}
            {children || `Export ${format.toUpperCase()}`}
        </button>
    );
}

// Dropdown with multiple format options
interface ExportDropdownProps {
    data: any[];
    filename: string;
    columns?: { key: string; label: string }[];
    className?: string;
}

export function ExportDropdown({
    data,
    filename,
    columns,
    className = '',
}: ExportDropdownProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isExporting, setIsExporting] = React.useState<ExportFormat | null>(null);

    const handleExport = async (format: ExportFormat) => {
        setIsExporting(format);

        try {
            await new Promise(resolve => setTimeout(resolve, 300));

            if (format === 'csv') {
                const csv = toCSV(data, columns);
                downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8');
            } else {
                const json = JSON.stringify(data, null, 2);
                downloadFile(json, `${filename}.json`, 'application/json');
            }
        } finally {
            setIsExporting(null);
            setIsOpen(false);
        }
    };

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={data.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
                <Download size={16} />
                Export
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 min-w-[140px]">
                        <button
                            onClick={() => handleExport('csv')}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100 transition-colors text-slate-700"
                        >
                            {isExporting === 'csv' ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <FileSpreadsheet size={14} />
                            )}
                            CSV
                        </button>
                        <button
                            onClick={() => handleExport('json')}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100 transition-colors text-slate-700"
                        >
                            {isExporting === 'json' ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <FileText size={14} />
                            )}
                            JSON
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default ExportButton;
