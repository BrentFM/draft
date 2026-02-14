# Dependency stability

**Policy version:** 1.0.0

This project keeps a **stable, compatible stack**. Lockfiles are the source of truth.

## Lockfile

- `package-lock.json` is committed. Use `npm ci` for installs.
- Do not upgrade dependencies without following the upgrade steps below.

## Upgrade policy

- **Patch/minor:** Allowed on feature branches; tests and typecheck must pass.
- **Major:** Use the steps below.

### Major upgrade steps

1. Propose the upgrade (ticket/PR) with rationale and changelog review.
2. Perform the upgrade on a dedicated branch.
3. Run full test suite and typecheck.
4. Manually test affected flows.
5. Run `npm audit` and address issues.
6. Update this file and README if the stable stack table changes.
7. Require review before merge.

## Stack

Current stack is defined by the lockfile. Key areas:

- **Electron:** Main and preload; avoid breaking context isolation / security defaults.
- **React / Vite:** Align with electron-vite and Shadcn versions.
- **Tailwind / Shadcn:** Keep versions compatible with the UI library in use.

No experimental or RC versions in production without explicit approval.
