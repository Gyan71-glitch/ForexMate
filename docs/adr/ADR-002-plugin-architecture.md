# ADR-002: Plugin Architecture

**Date:** 2026-06-25
**Status:** Accepted

## Context

The forex platform relies on numerous third-party services: Payment Gateways (Razorpay, Stripe), KYC Providers (Signzy, HyperVerge), SMS/Email (Twilio, SES), and Currency Data Providers (FastForex, Bloomberg). Hardcoding these dependencies directly into business logic makes vendor migration extremely difficult and error-prone.

## Decision

We will implement an abstract Provider/Plugin Architecture. Business logic will depend on standardized interfaces (e.g., `PaymentProvider`, `KYCProvider`) rather than concrete implementations. Concrete integrations will be written as swappable plugins.

## Consequences

- **Positive:** Eliminates vendor lock-in. Switching from Razorpay to Cashfree becomes a configuration change rather than a system rewrite.
- **Negative:** Slight overhead in defining strict interfaces and mapping third-party payloads to internal generic DTOs.
