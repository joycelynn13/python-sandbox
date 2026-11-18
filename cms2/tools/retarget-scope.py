#!/usr/bin/env python3
"""
Retarget the CMS 2.0 project to another instance's company code.

    python3 tools/retarget-scope.py <company_code>            # dry run: shows what would change
    python3 tools/retarget-scope.py <company_code> --apply    # rewrites the files

<company_code> is the value of the glide.appcreator.company.code system property on the
target instance. The scope becomes x_<company_code>_cms2 and every table, role, page id,
widget id, property and module path is renamed with it.

The script refuses to run if the new names break ServiceNow limits
(scope name <= 18 characters, table name <= 30 characters).

After --apply:
  1. Give now.config.json a fresh "scopeId" (a new 32-character hex GUID) so the target
     instance creates a new application record.
  2. Delete src/fluent/generated/keys.ts so the build mints new record ids for the new scope.
  3. Run python3 tools/generate-demo-data.py and python3 tools/generate-atf.py.
  4. npm run build, then npm run deploy against the target instance.
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OLD = 'x_2317791_cms2'
LONGEST_TABLE_SUFFIX = '_pl_descriptor'   # longest table name suffix in the app
INCLUDE_DIRS = ['src', 'tools']
INCLUDE_FILES = ['now.config.json', 'README.md']
EXTS = ('.ts', '.js', '.html', '.scss', '.css', '.json', '.py', '.md')
SKIP = {os.path.join('src', 'fluent', 'generated')}


def files():
    for name in INCLUDE_FILES:
        p = os.path.join(ROOT, name)
        if os.path.exists(p):
            yield p
    for d in INCLUDE_DIRS:
        for base, dirs, names in os.walk(os.path.join(ROOT, d)):
            rel = os.path.relpath(base, ROOT)
            if any(rel == s or rel.startswith(s + os.sep) for s in SKIP) or 'node_modules' in rel:
                continue
            for n in names:
                if n.endswith(EXTS) and n != os.path.basename(__file__):
                    yield os.path.join(base, n)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    code = sys.argv[1].strip().lower()
    apply = '--apply' in sys.argv
    if not re.fullmatch(r'[a-z0-9]+', code):
        sys.exit(f'Company code must be letters/digits only, got "{code}"')
    new = f'x_{code}_cms2'
    if len(new) > 18:
        sys.exit(f'Scope "{new}" is {len(new)} characters; ServiceNow allows 18.')
    if len(new + LONGEST_TABLE_SUFFIX) > 30:
        sys.exit(f'Table "{new + LONGEST_TABLE_SUFFIX}" would exceed 30 characters.')
    if new == OLD:
        sys.exit('Project already uses this scope.')

    # old scope only as a whole token (also matches x_2317791_cms2_domain, x_2317791_cms2.user, ...)
    pattern = re.compile(re.escape(OLD) + r'(?![a-z0-9])|' + re.escape(OLD) + r'(?=_)')
    total = 0
    for p in files():
        text = open(p, encoding='utf-8').read()
        n = len(pattern.findall(text))
        if not n:
            continue
        total += n
        print(f'{n:5}  {os.path.relpath(p, ROOT)}')
        if apply:
            open(p, 'w', encoding='utf-8').write(pattern.sub(new, text))
    print(f'\n{total} occurrences {"replaced" if apply else "found"}: {OLD} -> {new}')
    if not apply:
        print('Dry run only. Re-run with --apply to rewrite the files.')
    else:
        print('Next: new scopeId in now.config.json, delete src/fluent/generated/keys.ts, '
              're-run the generators, then build and deploy.')


if __name__ == '__main__':
    main()
