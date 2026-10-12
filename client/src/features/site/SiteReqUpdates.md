# Site Requirement Form Updates

This update introduces robust text-box state management, inline validation, and a cleaner UX for configuring site constraints in the analysis request form (`SiteRequirementForm.tsx`).

## What's New

1. **Robust Text-Box State Management**
   - Numeric fields (`plotAreaText`, `builtUpText`, `floorsText`, `budgetText`) now track raw text strings.
   - Empty input boxes remain blank instead of defaulting to `0`, preventing unintended validation errors and improving usability.

2. **Inline Validation & Error Messaging**
   - Added predefined `LIMITS` (plot area, built-in minimums, and floor ranges) and a safe `parseField` conversion helper.
   - Real-time inline validation errors appear in soft red text to prevent submission when constraints mismatch (e.g., footprint exceeding plot area).

3. **Optional Budget & Icons**
   - Replaced the dollar sign icon with `IndianRupee` to align with the regional currency context.
   - Made the construction budget optional, allowing users to leave the field blank if no initial target constraint is specified.

---

## Git Workflow: Clean & Descriptive Commits

If you are pushing these updates to GitHub, follow these steps for a clean, descriptive commit history:

### 1. Check your modified files

```bash
git status
```
