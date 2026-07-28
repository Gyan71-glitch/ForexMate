# ADR-001: Multi-Tenant Architecture

**Date:** 2026-06-25
**Status:** Accepted

## Context

As the enterprise forex platform scales, there may be requirements to support multiple independent forex companies, subsidiaries, or franchise brands on the same software instance. Without multi-tenancy, standing up a new brand would require duplicating the infrastructure and codebase.

## Decision

We will enforce a Multi-Tenant architecture at the database level. Every major entity (Branches, Users, Roles, Orders, Vaults, Rates) will ultimately associate with a `Company` (Tenant) record.

## Consequences

- **Positive:** Enables white-label support and multi-brand operations seamlessly from a single codebase.
- **Negative:** Increased query complexity, as every database read/write must scope to the `companyId` to ensure data isolation.
