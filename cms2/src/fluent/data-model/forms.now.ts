import '@servicenow/sdk/global'
import { Form, default_view } from '@servicenow/sdk/core'

// Default form views. Lifecycle fields are grouped in their own section on every
// versioned table so administrators always see status / version / dates together.

Form({
    table: 'x_2317791_cms2_fw_version',
    view: default_view,
    sections: [
        {
            caption: 'Framework Version',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'name', type: 'table_field' },
                        { field: 'version_number', type: 'table_field' },
                        { field: 'status', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'effective_from', type: 'table_field' },
                        { field: 'effective_to', type: 'table_field' },
                        { field: 'active', type: 'table_field' },
                    ],
                },
                { layout: 'one-column', elements: [{ field: 'description', type: 'table_field' }] },
            ],
        },
    ],
})

Form({
    table: 'x_2317791_cms2_comp_group',
    view: default_view,
    sections: [
        {
            caption: 'Competency Group',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'code', type: 'table_field' },
                        { field: 'name', type: 'table_field' },
                        { field: 'sequence', type: 'table_field' },
                        { field: 'layout', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'framework_version', type: 'table_field' },
                        { field: 'status', type: 'table_field' },
                        { field: 'active', type: 'table_field' },
                    ],
                },
                { layout: 'one-column', elements: [{ field: 'description', type: 'table_field' }] },
            ],
        },
        {
            caption: 'Versioning',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'effective_from', type: 'table_field' },
                        { field: 'effective_to', type: 'table_field' },
                    ],
                    rightElements: [{ field: 'supersedes', type: 'table_field' }],
                },
            ],
        },
        {
            caption: 'Domains',
            content: [
                {
                    layout: 'one-column',
                    elements: [{ type: 'list', listType: '12M', listRef: 'x_2317791_cms2_domain.competency_group' }],
                },
            ],
        },
    ],
})

Form({
    table: 'x_2317791_cms2_domain',
    view: default_view,
    sections: [
        {
            caption: 'Domain',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'code', type: 'table_field' },
                        { field: 'name', type: 'table_field' },
                        { field: 'competency_group', type: 'table_field' },
                        { field: 'sequence', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'owner', type: 'table_field' },
                        { field: 'sme', type: 'table_field' },
                        { field: 'status', type: 'table_field' },
                        { field: 'active', type: 'table_field' },
                    ],
                },
                { layout: 'one-column', elements: [{ field: 'description', type: 'table_field' }] },
            ],
        },
        {
            caption: 'Versioning',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'framework_version', type: 'table_field' },
                        { field: 'effective_from', type: 'table_field' },
                        { field: 'effective_to', type: 'table_field' },
                    ],
                    rightElements: [{ field: 'supersedes', type: 'table_field' }],
                },
            ],
        },
        {
            caption: 'Elements',
            content: [
                {
                    layout: 'one-column',
                    elements: [{ type: 'list', listType: '12M', listRef: 'x_2317791_cms2_element.domain' }],
                },
            ],
        },
    ],
})

Form({
    table: 'x_2317791_cms2_element',
    view: default_view,
    sections: [
        {
            caption: 'Element',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'code', type: 'table_field' },
                        { field: 'name', type: 'table_field' },
                        { field: 'domain', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'sequence', type: 'table_field' },
                        { field: 'status', type: 'table_field' },
                        { field: 'active', type: 'table_field' },
                    ],
                },
                { layout: 'one-column', elements: [{ field: 'descriptor', type: 'table_field' }] },
            ],
        },
        {
            caption: 'Versioning',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'framework_version', type: 'table_field' },
                        { field: 'effective_from', type: 'table_field' },
                        { field: 'effective_to', type: 'table_field' },
                    ],
                    rightElements: [{ field: 'supersedes', type: 'table_field' }],
                },
            ],
        },
        {
            caption: 'PL Descriptors',
            content: [
                {
                    layout: 'one-column',
                    elements: [{ type: 'list', listType: '12M', listRef: 'x_2317791_cms2_pl_descriptor.element' }],
                },
            ],
        },
        {
            caption: 'Affected Role Profiles',
            content: [
                {
                    layout: 'one-column',
                    elements: [{ type: 'list', listType: '12M', listRef: 'x_2317791_cms2_requirement.element' }],
                },
            ],
        },
    ],
})

Form({
    table: 'x_2317791_cms2_prof_level',
    view: default_view,
    sections: [
        {
            caption: 'Proficiency Level',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'level', type: 'table_field' },
                        { field: 'code', type: 'table_field' },
                        { field: 'label', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'display_name', type: 'table_field' },
                        { field: 'active', type: 'table_field' },
                    ],
                },
                { layout: 'one-column', elements: [{ field: 'description', type: 'table_field' }] },
            ],
        },
    ],
})

Form({
    table: 'x_2317791_cms2_pl_descriptor',
    view: default_view,
    sections: [
        {
            caption: 'Element PL Descriptor',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'element', type: 'table_field' },
                        { field: 'proficiency_level', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'status', type: 'table_field' },
                        { field: 'active', type: 'table_field' },
                    ],
                },
                { layout: 'one-column', elements: [{ field: 'descriptor', type: 'table_field' }] },
            ],
        },
        {
            caption: 'Versioning',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'framework_version', type: 'table_field' },
                        { field: 'effective_from', type: 'table_field' },
                        { field: 'effective_to', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'supersedes', type: 'table_field' },
                        { field: 'display_name', type: 'table_field' },
                    ],
                },
            ],
        },
    ],
})

Form({
    table: 'x_2317791_cms2_role_profile',
    view: default_view,
    sections: [
        {
            caption: 'Role Profile',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'code', type: 'table_field' },
                        { field: 'name', type: 'table_field' },
                        { field: 'job_title', type: 'table_field' },
                        { field: 'job_family', type: 'table_field' },
                        { field: 'business_function', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'owner', type: 'table_field' },
                        { field: 'status', type: 'table_field' },
                        { field: 'version', type: 'table_field' },
                        { field: 'active', type: 'table_field' },
                    ],
                },
                { layout: 'one-column', elements: [{ field: 'description', type: 'table_field' }] },
            ],
        },
        {
            caption: 'Versioning',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'framework_version', type: 'table_field' },
                        { field: 'effective_from', type: 'table_field' },
                        { field: 'effective_to', type: 'table_field' },
                    ],
                    rightElements: [{ field: 'supersedes', type: 'table_field' }],
                },
            ],
        },
        {
            caption: 'Element Requirements',
            content: [
                {
                    layout: 'one-column',
                    elements: [{ type: 'list', listType: '12M', listRef: 'x_2317791_cms2_requirement.role_profile' }],
                },
            ],
        },
    ],
})

Form({
    table: 'x_2317791_cms2_requirement',
    view: default_view,
    sections: [
        {
            caption: 'Element Requirement',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'role_profile', type: 'table_field' },
                        { field: 'element', type: 'table_field' },
                        { field: 'element.domain', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'requirement_type', type: 'table_field' },
                        { field: 'target_level', type: 'table_field' },
                        { field: 'sequence', type: 'table_field' },
                        { field: 'active', type: 'table_field' },
                    ],
                },
            ],
        },
    ],
})

Form({
    table: 'x_2317791_cms2_rp_assignment',
    view: default_view,
    sections: [
        {
            caption: 'Prototype Role Profile Assignment',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'user', type: 'table_field' },
                        { field: 'role_profile_code', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'source', type: 'table_field' },
                        { field: 'active', type: 'table_field' },
                    ],
                },
            ],
        },
    ],
})
