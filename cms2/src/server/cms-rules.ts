import { gs } from '@servicenow/glide'
import { STATUS, T } from './cms-config.ts'
import {
    abortWith,
    lifecycleErrors,
    requirementDeleteErrors,
    requirementErrors,
    countRequirements,
    limitWarnings,
    roleProfileIssues,
} from './cms-validation.ts'
import {
    applyLevelDisplayName,
    applyLifecycleDefaults,
    cascadePublishDescriptors,
    closePredecessors,
    createNewVersion,
    publish,
    retire,
} from './cms-versioning.ts'

/*
 * Thin entry points wired to Business Rules (src/fluent/business-rules) and
 * to the CmsAdminActions Script Include. No validation logic lives here.
 */

/** before insert/update on every versioned table */
export function versionedBefore(current: any, previous: any): void {
    applyLifecycleDefaults(current, previous)
    abortWith(current, lifecycleErrors(current, previous))
}

/** after insert/update on every versioned table */
export function versionedAfter(current: any, previous: any): void {
    const becamePublished =
        current.getValue('status') === STATUS.published &&
        (!previous || previous.getValue('status') !== STATUS.published)
    if (!becamePublished) return
    closePredecessors(current)
    if (current.getRecordClassName() === T.element) cascadePublishDescriptors(current)
}

export function levelBefore(current: any): void {
    applyLevelDisplayName(current)
}

export function requirementBefore(current: any): void {
    abortWith(current, requirementErrors(current))
}

export function requirementBeforeDelete(current: any): void {
    abortWith(current, requirementDeleteErrors(current))
}

/** after insert/update: advisory (non-blocking) recommended-limit warnings */
export function requirementAfter(current: any): void {
    limitWarnings(countRequirements(current.getValue('role_profile'))).forEach((w) =>
        gs.addInfoMessage('Recommendation: ' + w)
    )
}

// ------------------------------------------------------------------ UI action entry points

export const actions = {
    publish,
    retire,
    createNewVersion,
    /** Shows errors/warnings for a Role Profile without changing it. Returns true when publishable. */
    validateRoleProfile(current: any): boolean {
        const r = roleProfileIssues(current.getUniqueValue(), current.getValue('framework_version'))
        if (!current.getValue('effective_from')) r.errors.unshift('Effective From is required before publishing.')
        r.errors.forEach((e) => gs.addErrorMessage(e))
        r.warnings.forEach((w) => gs.addInfoMessage('Recommendation: ' + w))
        if (!r.errors.length) {
            gs.addInfoMessage(
                `Validation passed: ${r.counts.essential} Essential, ${r.counts.complementary} Complementary, ` +
                    `${r.counts.total} total. Ready to publish.`
            )
        }
        return !r.errors.length
    },
}
