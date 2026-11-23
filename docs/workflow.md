# FieldGuard AI — Team Git & Collaboration Workflow

> **Team Members:** Humna (Lead / Cloud AI), Younus (On-Device AI), Maaz (Backend & Fullstack)  
> **Repository:** `https://github.com/Younushk123/FieldGuard_AI`

---

## 1. Core Branching Strategy

To maintain high code quality and zero conflicts across three parallel workstreams, our team follows strict Trunk-Based Feature Branching:

1. **`main` Branch is Protected:**
   - Nobody pushes directly to `main`.
   - Every change must pass automated testing before merging.
   - All merges into `main` are squash-merged by Team Lead (Humna).

2. **Short-Lived Feature Branches:**
   - Branches follow the explicit naming format: `<name>/<area>-<task>`
   - Examples:
     - `humna/web-scaffold`
     - `humna/docs`
     - `younus/classifier-validator`
     - `younus/web-capture`
     - `maaz/web-actions`
   - Branches are deleted immediately upon squash-merging to maintain a clean repository.

---

## 2. Team Code Ownership & Boundaries

To prevent stepping on each other's code, the codebase is partitioned cleanly:

| Domain / Directory | Primary Owner | Secondary Reviewer |
| :--- | :--- | :--- |
| `web/src/features/capture/`, `shared/classifier-*` | **Younus** | Humna |
| `web/src/features/analysis/`, `web/src/features/review/`, `docs/`, `README.md` | **Humna** | Younus / Maaz |
| `web/src/features/actions/`, `web/src/features/dashboard/`, `shared/firestore*` | **Maaz** | Humna |
| `web/src/lib/firebase.ts`, `shared/risk-engine.ts` | **Joint** (Humna / Younus / Maaz) | All |

---

## 3. Pull Request & Merging Protocol

1. **Local Verification:** Run test and build checks locally before pushing:
   - In `shared/`: `npm test`
   - In `web/`: `npm run build`
2. **Push Branch:** `git push -u origin <branch-name>`
3. **Open PR:** Submit PR against `main` with a clear summary of changes and validation proof.
4. **Squash and Merge:** Humna performs the squash-merge to keep git commit history clean and linear.
5. **Delete Remote Branch:** Click the trash icon in GitHub to delete the merged feature branch.
