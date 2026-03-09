# Security Policy

## Supported Versions

Currently, only the `main` branch (version 1.x) of InsuranceClarity India receives security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of our platform and our users' data very seriously.

If you discover a vulnerability in the InsuranceClarity India platform, please DO NOT open a public issue. Instead, please report it privately via email:

**Email:** <security@insuranceclarity.in>

Please include the following in your report:

- A detailed description of the vulnerability.
- Steps to reproduce the issue.
- Potential impact of the vulnerability.
- Any suggested remediations (if known).

We will acknowledge receipt of your vulnerability report within 48 hours and strive to provide a resolution or action plan within 5 business days.

## Security Practices

- **Content Security Policy (CSP)**: We enforce strict CSP headers to mitigate XSS attacks.
- **Rate Limiting**: All interactive tools and API endpoints are rate-limited.
- **Data Validation**: File uploads are strictly validated for type (PDF only) and size (max 10MB).
- **Sanitization**: All dynamic HTML rendering is sanitized.
- **Authentication**: Admin and Studio routes are strictly protected by NextAuth middlewares.
