# ADR-003: JWT + Refresh Rotation

**Date:** 2026-06-25
**Status:** Accepted

## Context

A robust authentication engine is required to protect sensitive financial operations. Storing long-lived JWTs is insecure, and traditional session cookies can be difficult to scale across distributed mobile and web clients.

## Decision

We will implement short-lived JWT Access Tokens coupled with long-lived Refresh Tokens. Refresh tokens will be hashed in the database (SHA-256) and rotated upon every use. We will also implement replay attack detection (revoking families of tokens if a used refresh token is presented again).

## Consequences

- **Positive:** Enterprise-grade authentication security. Limits the blast radius of a stolen access token. Prevents token reuse.
- **Negative:** Increased backend state management and slightly higher database load for token validation and rotation.
