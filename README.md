# ClauseWise ⚖️

**A calm, trustworthy legal-information assistant helping non-lawyers understand, compare, and question contracts before signing.**

ClauseWise is built specifically for everyday citizens, tenants, employees, and small business owners dealing with Indian legal documents (Leave & License rental agreements, employment offer letters, loan deeds, NDA agreements, and vendor contracts).

ClauseWise provides **legal information, not formal legal advice**. It empowers users to spot hidden one-sided terms, calculate true lock-in and deposit math, cross-check state-specific tenancy laws, compare revisions, and draft professional formal letters.

---

## 🎯 Traceability Matrix: User Problem Statement to Implementation

| User Problem / Need                                              | Feature in ClauseWise                                                      | Implementation Module                                                 |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Non-lawyers don't understand legal jargon                        | Plain 8th-grade language explanations & "What am I agreeing to?"           | `/lib/services/analyzeService.ts`, `SummaryTab.tsx`, `ClauseCard.tsx` |
| One-sided or predatory clauses slip by unnoticed                 | Risk Classification (Low / Medium / High) & Missing Protections check      | `analysisSchema.ts`, `ClausesTab.tsx`, `RiskSnapshot.tsx`             |
| Landlords deduct security deposits or impose unexpected lock-ins | Rent & Deposit Math Calculator with real financial commitment summary      | `/lib/rentMath.ts`, `RentMathCalculator.tsx`                          |
| Indian state tenancy differences (Maha vs Karnataka vs Delhi)    | Jurisdiction Knowledge Engine with Stamp Duty & Model Tenancy cross-checks | `/lib/india/knowledge.ts`, `/lib/india/states.ts`                     |
| Counterparties sneak changes into revised contract drafts        | Clause-by-Clause & Text Diff Version Comparison                            | `/lib/services/compareService.ts`, `CompareTab.tsx`                   |
| Unsure how to dispute unlawful deduction or breach               | Dispute Wizard & Legal Rights Roadmap                                      | `/lib/services/guideService.ts`, `GuideMeTab.tsx`                     |
| Need a formal letter to send the landlord or employer            | Formal Notice & Letter Drafter (Deposit refund, termination, negotiation)  | `/lib/services/draftLetterService.ts`, `DraftLetterTab.tsx`           |
| Need to verify AI claims aren't hallucinated                     | Quote Verification Engine checking exact substring matches & page offsets  | `/lib/verify.ts`, `DocumentViewer.tsx`, `QuoteBlock.tsx`              |
| Privacy concerns uploading sensitive agreements                  | Zero-storage architecture: 100% in-memory processing                       | `/lib/services/fileProcessingService.ts`, `/app/api/analyze/route.ts` |
| Accessibility barriers & non-native English speakers             | Audio Read-Aloud (Web Speech API) & Indic language support                 | `ListenButton.tsx`, `LanguageSelector.tsx`                            |

---

## 🏗️ Architecture & Google Services Usage

- **Google GenAI SDK (`@google/genai`)**: Centralized in `/lib/google/geminiClient.ts` with strict schema-constrained outputs, retry cascades, and error handling.
- **Model Isolation**: Zero hardcoded models; defaults to `gemini-2.5-flash` with graceful degradation.
- **Google Fonts (`next/font/google`)**: Inter and Noto Sans Devanagari self-hosted and optimized without external trackers.
- **Next.js 15 App Router**: Server-side processing for file ingestion, PDF parsing (`unpdf`), and API proxying.

---

## 🔒 Security & Privacy Guarantees

1. **Zero Storage**: Documents are ingested strictly into temporary memory buffers during the request lifecycle. No database, S3 bucket, or persistent disks store customer files.
2. **Environment Isolation**: All configuration is validated at runtime through `lib/env.ts` with Zod. Never directly accessed across arbitrary modules.
3. **Magic Bytes Validation**: Uploaded files are inspected for real MIME magic bytes (e.g., `%PDF`, `PK\x03\x04`), blocking malicious renamed payloads.
4. **Rate Limiting**: Sliding window in-memory rate limiter per IP/client protects API resources.
5. **Prompt Injection Defense**: Contract inputs are bounded, neutralized, and separated from system instructions.

---

## 🚀 Running the Project

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env.local
# Set your GEMINI_API_KEY in .env.local

# 3. Development server
npm run dev

# 4. Production build
npm run build
npm start
```
