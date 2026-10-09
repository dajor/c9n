# Public roadmap

Updated: 9 October 2026. This is the current direction, not a delivery-date commitment.

## Initial scope: processes, agents and people

- Build processes from clear tasks and agent steps.
- Assign agents with a task, inputs and an expected result.
- Add human approval as a separate step with an assigned person.
- Define rework, another review, rejection and error paths.
- Keep tasks, results and decisions together in process history.

Projects, Knowledge and Design are not separate areas in the initial rebuild.

## Next verifiable stages

1. **Bring over the agent foundation:** Package and verify existing Hub agent features, model connections and local computing capacity in a shared installation.
2. **Build process execution:** Persist definitions, runs and step states. The existing agent workflow editor generates instructions; this does not establish enforced execution of every drawn step.
3. **Validate human approvals:** Prove that the process pauses, assigns the responsible person and continues only after approval. Test rework, rejection, errors and resuming after restart.
4. **Test one complete process:** Use real model calls with approved inputs and comparable baseline and pilot observations, including review effort and rework.
5. **Validate installation and access:** Check team roles, operation and recovery in the selected pilot environment.

## Later extensions

Further integrations, optional community GPU sharing and credits. Scope and priority follow concrete processes. Clear packaging and component-level licence review are required before any source release.

## Help shape the roadmap

Describe the task, intended agent step and decision a person must make. Use [Discussions](https://github.com/dajor/c9n/discussions) or a [feature request](https://github.com/dajor/c9n/issues/new?template=feature.yml).

[Evidence](EVIDENCE.md) · [Deutsch](ROADMAP.de.md)
