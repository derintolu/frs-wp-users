# Gotchas & Pitfalls

Things to watch out for in this codebase.

## [2026-01-08 02:28]
PHP and npm commands are blocked in this sandbox environment. Use manual code review for syntax verification instead of php -l or npm run lint:php commands.

_Context: Integration Verification phase - subtask 4-1_
