# Security Policy — FieldGuard AI

> **Security Baseline:** ISO 27001 / SOC 2 Type II Alignment  
> **Platform Infrastructure:** Google Cloud Platform & Firebase Managed Services

---

## 1. Secret-Free Source Control Policy

FieldGuard AI maintains an uncompromising zero-secret git policy:
- **No API Keys or Private Credentials in Repository:** Neither cloud API keys nor service account private keys are checked into source control.
- **Environment Variable Isolation:** Production and development credentials reside exclusively in local `.env.local` files, which are strictly blacklisted in `.gitignore`. A sanitized template is provided via `.env.example`.
- **Firebase AI Logic Authentication:** The client relies on Google-managed identity tokens and Firebase App Check rather than embedding long-lived raw API secret tokens in frontend JavaScript bundles.

---

## 2. Firebase App Check & Client Attestation

To safeguard against unauthorized abuse, API scraping, and replay attacks:
- Web and edge clients enforce **Firebase App Check** backed by reCAPTCHA Enterprise for web browsers and Play Integrity for Android devices.
- Requests originating from non-attested clients or modified APKs/bundles are rejected at the edge by Firebase before reaching cloud AI models or Firestore databases.

---

## 3. Database Security & Access Control (`firestore.rules`)

Cloud Firestore data access is secured by granular, role-based security rules:
- **Tenant Isolation:** All inspections, action plans, and audit events are scoped strictly within the verified organization identifier (`orgId`) of the authenticated user.
- **Write Validation:** Safety inspection records cannot be modified retroactively after sign-off by a certified inspector.
- **Deterministic Action Assignment:** Corrective action tasks can only be resolved by assigned field technicians and verified by certified safety supervisors.

---

## 4. Human-in-the-Loop Safety Invariant

**Safety Principle:** AI outputs are advisory. FieldGuard AI's codebase enforces the rule that no algorithmic score can automatically close a safety inspection without human verification.

---

## 5. Reporting a Vulnerability

If you discover a security vulnerability within FieldGuard AI, please disclose it responsibly by contacting the security team at:
- **Security Lead:** Humna (Cloud AI Architect & Security Lead)
- **Repository Security Advisory:** [Open a private Security Advisory on GitHub](https://github.com/Younushk123/FieldGuard_AI/security/advisories)
