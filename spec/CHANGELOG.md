# Spec Changelog

Mengikuti semver. Tiap entri = delta yang harus diadopsi app turunan saat naik versi.

## v1.0.0 — 2026-06-19

Snapshot awal, dibekukan dari `tools/checkConventions.js` + `AGENTS.md`.

- **Enforced** (gate): 13 rule pola/prinsip (R1a–R7) + 8 rule kelengkapan kontekstual (C1–C8). Detail: `v1.0.0/conventions.md` §A+§B.
- **Prosa-only** (manual-review): security checklist, SQL vendor di migration, SoC, registrasi DI, isi validator stripUnknown, update README. Detail: `v1.0.0/conventions.md` §C + `v1.0.0/backlog-rules.md`.
- Kapabilitas wajib: rujuk `docs/PORTING_GUIDE.md` §Capability Checklist (keamanan, performa, arsitektur, DB portabel, testing, guardrail, dokumentasi).
- UI: rujuk `docs/UI_COMPONENTS.md` (termasuk pola Flash → Toast global).
