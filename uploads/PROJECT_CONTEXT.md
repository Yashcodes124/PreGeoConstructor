# BuildWise AI — Project Context

## Product
BuildWise AI is a geo-based intelligent construction pre-planning and site-analysis platform.

User flow:
Location → Building Requirements → Data Collection → Site Analysis → Suitability → Orientation → Cost → Risks/Data Confidence → PDF Report.

## MVP constraint
The MVP MUST NOT depend on any AI/ML/LLM model. No OpenAI, Claude, Gemini, Ollama, or other inference service.

The product name may remain BuildWise AI, but documentation must not falsely claim that an AI model is being used. Intelligence comes from geospatial analysis, deterministic rules, weighted scoring, and calculations.

## Core modules
1. Site selection
2. Geospatial/environmental data
3. Site suitability
4. Terrain analysis
5. Water/flood-risk indicator
6. Road accessibility
7. Nearby facilities
8. Environmental analysis
9. Building orientation
10. Preliminary cost estimation
11. Results dashboard
12. PDF report
13. Optional two-site comparison

## Suitability weights from the original proposal
- slope: 25%
- water/flood-risk indicator: 20%
- road accessibility: 20%
- environmental conditions: 15%
- essential facilities: 20%

Factors are normalized to 0–10 and combined into a 0–100 result.

## Inputs
- location
- building type
- plot area
- built-up area
- floors
- quality grade
- optional budget

## Scope limits
Do not claim legal approval, structural certification, exact soil bearing capacity, exact flood prediction, guaranteed construction cost, or professional engineering approval.

Unavailable data must be reported rather than fabricated.

## Reference project
Digital Raitha is UX/product inspiration only. Reuse ideas such as dashboard structure, cards, map workflows, loading/error states, and responsive design. Do not copy its ML/model stack or insecure/mock patterns.
