# FieldGuard AI — Cloud Analyst Specification

> **Architect:** Humna (Team Lead & Cloud AI Architect)  
> **Model:** Gemini 3.5 Flash Lite (`gemini-3.5-flash-lite`) via `GoogleAIBackend`  
> **Inference Mode:** `InferenceMode.ONLY_IN_CLOUD`  
> **Schema Definition:** `shared/cloud-analyst-schema.json`

---

## 1. Overview & Purpose

While the on-device model (Gemini Nano) provides instantaneous field triage (`PREFER_ON_DEVICE`), the **Cloud Safety Analyst** acts as an expert industrial hygiene and safety engineering auditor (`ONLY_IN_CLOUD`). When connected to the cloud, or when a field inspection requires comprehensive causal breakdown, Gemini 3.5 Flash Lite is invoked to perform:

1. **Root-Cause Causal Analysis (`rationale`):** Explaining failure mechanics, exposure pathways, and why specific likelihood and severity scores are assessed.
2. **Prioritized Recommendations (`recommendations`):** 1 to 5 structured actionable mitigation steps categorized by priority (`immediate`, `short_term`, `long_term`) with suggested due dates.
3. **Immediate Work-Stop Trigger (`requiresImmediateAction`):** High-urgency flagging for immediate area isolation or work stoppage.
4. **Transparent Uncertainty Reporting (`uncertaintyNotes`):** Highlighting any missing environmental factors or obscured observations so human inspectors know what to verify.

---

## 2. Cloud Analyst System Prompt Structure

```markdown
You are a Senior Certified Safety Professional (CSP) and Industrial Hygiene Auditor.
Your responsibility is to analyze field hazard observations, identify potential root causes, and produce prioritized, standards-compliant corrective action plans.

STRICT SAFETY RULES:
1. NEVER declare a job site, machinery, or process unconditionally "Safe". AI only identifies hazards and recommends mitigations; human safety officers retain final verification authority.
2. Return strictly valid JSON adhering to cloud-analyst-schema.json v1.0.
3. Output between 1 and 5 recommendations with priority ('immediate', 'short_term', or 'long_term') and realistic suggestedDueDays (0 = same day).
4. Provide a clear, legally defensible rationale (under 500 chars) explaining the failure mechanics.
5. If the hazard poses imminent danger to life or health, set requiresImmediateAction to true.
```

---

## 3. Schema Contract (`shared/cloud-analyst-schema.json`)

The cloud inference responds in strict adherence to this schema:

```json
{
  "schemaVersion": "1.0",
  "hazardCategory": "electrical",
  "likelihood": 4,
  "severity": 5,
  "summary": "Exposed high-voltage conduit with frayed insulation near wet standing puddle.",
  "suggestedAction": "Immediately de-energize circuit at breaker panel and isolate area with safety barrier.",
  "rationale": "High water proximity drastically amplifies electrocution probability. 440V exposure carries severe or fatal injury risk.",
  "recommendations": [
    {
      "title": "Lockout/Tagout De-energization",
      "description": "Apply OSHA 1910.147 LOTO protocols to panel B4 breaker before inspection.",
      "priority": "immediate",
      "suggestedDueDays": 0
    },
    {
      "title": "Conduit Replacement",
      "description": "Licensed electrician to replace damaged NEMA enclosure and damaged wiring.",
      "priority": "short_term",
      "suggestedDueDays": 2
    }
  ],
  "requiresImmediateAction": true,
  "uncertaintyNotes": "Could not confirm whether circuit is live without direct multimeter testing."
}
```

---

## 4. Integration with Web Application

Inside `web/src/features/analysis/` (Humna's domain), the application calls the Firebase AI Logic SDK:

```typescript
import { getAI, GoogleAIBackend, InferenceMode } from 'firebase/ai';
import { app } from '@/lib/firebase';

const ai = getAI(app, { backend: new GoogleAIBackend() });

export async function runCloudAnalysis(hazardText: string) {
  const model = ai.getGenerativeModel({
    model: 'gemini-3.5-flash-lite',
    inferenceMode: InferenceMode.ONLY_IN_CLOUD,
  });

  const prompt = `${CLOUD_ANALYST_SYSTEM_PROMPT}\n\nHazard Report:\n${hazardText}`;
  const response = await model.generateContent(prompt);
  return JSON.parse(response.text);
}
```
