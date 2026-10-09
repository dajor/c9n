# Evidence before promises

Current product focus: 9 October 2026.

The rebuild focuses on processes, agent steps and human approvals. Existing Hub agent features provide the foundation; the new process engine with enforced approval pauses and its access rules still require acceptance testing. A drawn workflow does not prove that every step is enforced. The website explains this structure using fictional examples.

## Historical checks · 20 September 2026

The checks below document the earlier prototype. Projects, Knowledge and Design are not separate areas in the initial rebuild. These earlier checks do not validate a new process engine.

Screenshots in this repository show the actual local application with an example organisation. They are not customer case studies. The product source and internal tests currently remain private; readers cannot independently reproduce all application checks from this repository.

### Checked in the earlier local prototype

- Company map: select departments and roles, switch today/target, search, zoom, pan, keyboard list access and full-screen presentation.
- Persisted design: edit through the existing canvas, save, reload and return to the same organisation.
- Knowledge: notes and bounded text PDFs, human review, versioned storage and follow-up tasks.
- Dashboard: personalised widgets, project selection and accessible knowledge counts.
- Navigation: links to knowledge and to an associated native Advanced workflow.
- Layout: desktop and a 390 px mobile viewport, without horizontal page overflow.

Company-map checks completed with no JavaScript exceptions. The frontend production build passed. These are functional prototype checks, not a security certification or a capacity benchmark.

### Boundaries of the earlier prototype

- A designed AI role does not establish that an agent is running.
- Workflow editors can represent more than the current runtime supports. Execution must be verified for the selected cards, graph and provider.
- The earlier knowledge prototype supports notes, text PDFs and links with supplied excerpts. General web crawling, video transcription, OCR and semantic search are not included in that verified slice.
- A provider adapter is not proof that a customer's credentials or chosen model work. Real provider acceptance needs a configured connection and approved test data.
- Business measurements currently include manual observations with source and period. No independently verified customer savings, customer logos or success metrics are published here.
- No public hosted app, general self-hosting release or full open-source application release is available from this repository yet.

## How an impact claim becomes credible

Record the baseline and pilot on comparable work. Keep the quality rule, measurement source, period, sample size, active work and review effort alongside the result. Retain failures and rework. Obtain permission before publishing a customer example. Publish a case study only after the numbers and context have been reviewed.

[Measurement worksheet](../templates/measurement.csv) · [Roadmap](ROADMAP.md)
