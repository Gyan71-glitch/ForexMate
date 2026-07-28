# ADR-004: Event Bus

**Date:** 2026-06-25
**Status:** Accepted

## Context

As the platform grows, a single action (e.g., `OrderCreated`) triggers multiple side-effects: sending an email, sending an SMS, updating analytics, syncing to the ledger, and notifying staff. Tightly coupling these side-effects inside the core transaction controller leads to massive, unmaintainable classes and slow response times.

## Decision

We will adopt an Event-Driven Architecture (Event Bus) for internal state changes. Core actions will emit events (e.g., `OrderCreated`, `KYCApproved`). Secondary systems (Notifications, Analytics, Audit) will subscribe to these events asynchronously.

## Consequences

- **Positive:** Completely decouples business logic from side-effects. Faster HTTP response times. Easier to test and extend.
- **Negative:** Tracing business flows becomes slightly more complex since execution is non-linear. Requires robust error handling and dead-letter queues.
