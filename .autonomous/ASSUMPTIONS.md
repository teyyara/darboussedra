# Assumptions

| ID | Assumption / uncertainty | Confidence | Resolution |
|---|---|---|---|
| ASM-001 | Room layout is a procedural blockout, not an approved surveyed family floor plan. | HIGH | Make minimal tested fixes; do not claim final plan approval. |
| ASM-002 | Architecture/traversal precede new decorative elements. | HIGH | New decor remains prohibited pending explicit approval. |
| ASM-003 | Vercel preview status can lag behind candidate HEAD. | HIGH | Verify exact deployment commit before treating preview as evidence. |
| ASM-004 | Screenshot timeout alone does not identify whether runtime or harness caused the stall. | MEDIUM | Separate renderer metrics from phase and screenshot synchronization. |
| ASM-005 | Merge-to-main is gated on actual validation and acceptance; manual deploy is forbidden. | HIGH | Keep candidate isolated and do not force push. |
