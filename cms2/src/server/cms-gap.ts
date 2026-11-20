/*
 * Gap analysis: Required (Target) PL versus the employee's Current PL.
 * The colour bands are a business rule and live only here.
 *
 *   gap = target level - current level
 *   gap <= 0  → met    (green)
 *   gap == 1  → minor  (orange)
 *   gap >= 2  → major  (red)
 *   no current level recorded → unknown (grey, "Not assessed")
 */

export type GapStatus = 'met' | 'minor' | 'major' | 'unknown'
export type Gap = { status: GapStatus; gap: number | null; label: string }

export const MINOR_GAP_MAX = 1 // a gap up to this many levels is "minor" (orange); above it is "major" (red)

export function gapFor(targetLevel: number | null, currentLevel: number | null): Gap {
    if (!targetLevel) return { status: 'unknown', gap: null, label: 'No target' }
    if (!currentLevel) return { status: 'unknown', gap: null, label: 'Not assessed' }
    const gap = targetLevel - currentLevel
    if (gap <= 0) return { status: 'met', gap: 0, label: 'Met' }
    if (gap <= MINOR_GAP_MAX) return { status: 'minor', gap, label: `Gap ${gap}` }
    return { status: 'major', gap, label: `Gap ${gap}` }
}

export type GapSummary = { met: number; minor: number; major: number; unknown: number; total: number }

export function summarise(gaps: Gap[]): GapSummary {
    const s: GapSummary = { met: 0, minor: 0, major: 0, unknown: 0, total: gaps.length }
    gaps.forEach((g) => s[g.status]++)
    return s
}
