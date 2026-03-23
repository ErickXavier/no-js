# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.10.x  | :white_check_mark: |
| 1.9.x   | :white_check_mark: |
| < 1.9   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in No.JS, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email **<contact@no-js.dev>** with:

- A description of the vulnerability
- Steps to reproduce the issue
- The affected version(s)
- Any potential impact assessment

### What to expect

- **Acknowledgment** within 48 hours of your report
- **Status update** within 7 days with an assessment and expected timeline
- **Fix and disclosure** coordinated with you before any public announcement

### Scope

The following are in scope:

- Expression evaluation injection or sandbox escapes (`src/evaluate.js`)
- Cross-site scripting (XSS) via directive processing or HTML sanitization (`src/dom.js`)
- Server-side request forgery (SSRF) via fetch directives (`src/fetch.js`)
- Router-based open redirects (`src/router.js`)
- Prototype pollution via reactive contexts (`src/context.js`)

### Out of scope

- Vulnerabilities in third-party dependencies (we have zero runtime dependencies)
- Issues requiring physical access to the user's machine
- Social engineering attacks

## Security Measures

No.JS implements the following security measures:

- **Zero `eval()` or `new Function()`** — custom recursive-descent parser for all expression evaluation
- **CSP-compliant by default** — no `unsafe-eval` CSP directive required
- **Deny-list** for dangerous globals (`eval`, `Function`, `process`, `require`, `importScripts`)
- **Forbidden property access** on `__proto__`, `constructor`, `prototype`
- **HTML sanitization** for user-rendered content
