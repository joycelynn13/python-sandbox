import { GlideDateTime } from '@servicenow/glide'

/**
 * Date helpers. All comparisons use the platform's internal date format
 * (yyyy-MM-dd), which sorts lexically, so plain string comparison is safe.
 * An empty effective_to means open-ended.
 */

export function today(): string {
    // GlideDate.getValue() exists at runtime but is missing from the typings
    return (new GlideDateTime().getLocalDate() as any).getValue()
}

export function addDays(dateValue: string, days: number): string {
    const gdt = new GlideDateTime()
    gdt.setValue(dateValue + ' 12:00:00')
    gdt.addDaysUTC(days)
    return (gdt.getDate() as any).getValue()
}

export function isValidRange(from: string, to: string): boolean {
    return !from || !to || to >= from
}

/** True when [aFrom, aTo] and [bFrom, bTo] share at least one day. Empty from = open start. */
export function periodsOverlap(aFrom: string, aTo: string, bFrom: string, bTo: string): boolean {
    const aStart = aFrom || '0000-01-01'
    const bStart = bFrom || '0000-01-01'
    const aEnd = aTo || '9999-12-31'
    const bEnd = bTo || '9999-12-31'
    return aStart <= bEnd && bStart <= aEnd
}

export function isEffectiveOn(from: string, to: string, onDate: string): boolean {
    return !!from && from <= onDate && (!to || to >= onDate)
}

/**
 * Adds "currently effective Published" conditions to a GlideRecord(Secure).
 * Used by every employee-facing query so the rule lives in one place.
 */
export function addCurrentlyEffective(gr: any, prefix = ''): void {
    const d = today()
    gr.addQuery(prefix + 'status', 'published')
    gr.addQuery(prefix + 'active', true)
    gr.addQuery(prefix + 'effective_from', '<=', d)
    const q = gr.addNullQuery(prefix + 'effective_to')
    q.addOrCondition(prefix + 'effective_to', '>=', d)
}
