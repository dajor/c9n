<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/c9n/logo-dark.svg">
  <img src="docs/assets/c9n/logo.svg" alt="c9n" width="240" height="92">
</picture>

### Build processes. Assign agent steps. People approve.

c9n connects tasks in a shared process. Define the sequence, assign steps to agents and decide which results a person must review and approve.

**[Explore the product](https://c9n.app/product.en.html) · [Request a pilot](docs/PILOT.md) · [Deutsch](README.de.md)**

## Current product structure

1. **Process:** Define the goal, trigger, steps and permitted next paths.
2. **Agent steps:** Assign an agent, task, inputs and expected result to each step. One agent can handle several steps; several agents can work together.
3. **Human approval:** The assigned person reviews the result. Only their explicit approval allows the next defined step. Returning a result leads to rework and another review; rejection follows the defined path.
4. **History:** Keep tasks, results, feedback and decisions in context.

Agents, watchers, scripts, tests and people have different jobs. [Meet the actors](https://c9n.app/en.html#actors).

## Development status and boundaries

The initial scope focuses on processes, agent steps and human approvals. Projects, Knowledge and Design are not separate product areas in the initial rebuild.

Existing Hub agent features provide the foundation. The current workflow editor generates agent instructions; this does not establish an engine that enforces every drawn step. The new process engine with enforced human pauses is being built and must be verified for each supported workflow. The website uses clearly marked illustrative examples.

[Evidence and limitations](docs/EVIDENCE.md) · [Roadmap](docs/ROADMAP.md)

## Start with one process

One accountable person, a clear assignment and a traceable baseline. In a guided pilot, evaluate the supported workflow, human approvals, failures and rework. Then decide from the results: continue, change or stop.

**[Request a pilot](docs/PILOT.md)** · [Prepare the conversation](templates/pilot-brief.md) · [Measurement worksheet](templates/measurement.csv)

[Download the installer](https://c9n.app/download.en.html). Pilot customers receive the application image separately; the public package alone does not contain a runnable application.

## Community and source code

This repository contains the public product website, documentation and community materials. Application source is currently private; this repository does not grant an open-source licence for the product. [Publication status](NOTICE.md).

[Discussions](https://github.com/dajor/c9n/discussions) · [Issues](https://github.com/dajor/c9n/issues/new/choose) · [Releases](https://github.com/dajor/c9n/releases). Keep customer data, credentials and confidential assignments in a private pilot enquiry.

## Brand assets

[c9n · Logos, icons, colors and typography](https://c9n.app/brand/) · [Download ZIP](https://c9n.app/brand/c9n-brand-kit.zip)
