# Implementation Plan: Authority-Specific Building Rules (RAJUK, CDA, KDA, RDA)

Refactor `feasibilityRules.js` and `FeasibilityForm.jsx` from a single generic Dhaka/RAJUK model into authentic, authority-specific rule sets grounded in Bangladesh Government building codes (BNBC 2020) and individual urban development authority bylaws.

## User Review Required

> [!IMPORTANT]
> Bangladesh building regulations divide into two layers:
> 1. **National Baseline (BNBC 2020 - Gazetted Feb 2021)**: Applies nationwide across all districts (e.g., lift mandatory > 6 storeys / 20m, dual fire staircases > 10 storeys / 33m, fire department NOC, structural/soil test signoffs).
> 2. **Authority-Specific Bylaws & Master Plans**:
>    - **RAJUK (Dhaka)**: *Dhaka Mohanagar Imarat Nirman Bidhimala 2008* & *Detailed Area Plan (DAP 2022–2035)*. Strict 18 ft plot entrance rule, zone-based FAR.
>    - **CDA (Chattogram)**: *Chattogram Imarat Nirman Bidhimala 2008* & *CDA Master Plan*. 3.75m (12.3 ft) public road threshold, strict **Hill Cutting Prohibition** (Environment Conservation Act), and coastal salinity considerations.
>    - **KDA (Khulna)**: *Khulna Development Authority Imarat Nirman Bidhimala* & *Khulna Master Plan*. 3.0m–3.65m (10–12 ft) residential access minimum, soft alluvial soil / salinity foundation clearance.
>    - **RDA (Rajshahi)**: *Rajshahi Development Authority Act 2018* & *RDA Master Plan*. Light-angle/road width ratio provisions, Padma river embankment buffer clearance.

## Proposed Changes

### Logic & Rule Sets

#### [MODIFY] [feasibilityRules.js](file:///c:/Users/Salman/Desktop/Civilhub/CivilHub/src/services/feasibilityRules.js)
- Define `AUTHORITY_CONFIGS` containing verified parameters for:
  - **`RAJUK`**: Dhaka Mohanagar Imarat Nirman Bidhimala & DAP 2022-2035.
    - Min Gate Width: 18 ft (plan approval gate frontage).
    - Road Width bands: Under 12 ft (max 3), 12–19 ft (max 5-6), 20–24 ft (max 7), 25–39 ft (max 10), 40+ ft (max 14–20).
    - Specific checks: DAP zone FAR variations, CAAB runway elevation clearances.
  - **`CDA`**: Chattogram Imarat Nirman Bidhimala & CDA Master Plan.
    - Min Road/Gate: 10 ft private / 12.3 ft (3.75m) public road.
    - Road Width bands: Under 10 ft (max 2–3), 10–15 ft (max 4–5), 16–23 ft (max 6–7), 24–35 ft (max 8–10), 36+ ft (max 12+).
    - Specific checks: Mandatory DOE Hill-Cutting Clearance if on or near sloped terrain (Pahartali, Khulshi, Foy's Lake, Nasirabad); coastal salinity protection.
  - **`KDA`**: Khulna Development Authority Imarat Nirman Bidhimala.
    - Min Road/Gate: 10 ft for residential plots (not 18 ft).
    - Road Width bands: Under 10 ft (max 2–3), 10–15 ft (max 4–5), 16–22 ft (max 6–7), 23–32 ft (max 8–9), 33+ ft (max 10+).
    - Specific checks: Soft coastal alluvial soil geotechnical investigation warning; KDA Master Plan drainage corridor setback.
  - **`RDA`**: Rajshahi Development Authority Act & Building Regulations.
    - Min Road/Gate: 10 ft residential.
    - Road Width bands: Under 10 ft (max 2–3), 10–14 ft (max 4), 15–21 ft (max 6–7), 22–30 ft (max 8), 31+ ft (max 10+).
    - Specific checks: Padma river embankment buffer zone check; Barind soil seismic considerations.
- Retain BNBC 2020 national compliance rules for all authorities:
  - Mandatory Lift above 6 storeys (>20m).
  - Mandatory 2nd exit / fire staircase above 10 storeys (>33m).
  - Fire Service & Civil Defence NOC requirement.
- In `evaluateFeasibility()`:
  - Dynamically match the authority (`RAJUK`, `CDA`, `KDA`, `RDA`).
  - Compute `maxAllowedStories`, status, messages, setbacks, and flags based on the chosen authority's exact parameters and official bylaw citations.
  - Return `governingBylaw`, `authorityName`, and localized legal reference text.

---

### UI Components

#### [MODIFY] [FeasibilityForm.jsx](file:///c:/Users/Salman/Desktop/Civilhub/CivilHub/src/components/FeasibilityForm.jsx)
- Update `ResultCard` to display:
  - **Governing Bylaw / Code Badge** (e.g. *"Khulna Development Authority (KDA) Imarat Nirman Bidhimala & BNBC 2020"*).
  - Authority-specific compliance notices and legal caveats.
  - Clear distinction between national BNBC life-safety rules vs local authority zoning rules.

## Verification Plan

### Automated Tests / Lint
- Test `feasibilityRules.js` evaluation with multiple authority inputs:
  - `RAJUK` with 20 ft road -> 7 storeys (Conditional, 18 ft gate rule).
  - `KDA` with 20 ft road -> 6-7 storeys (uses KDA bylaw, soft soil note, no 18 ft gate block).
  - `CDA` with 20 ft road -> 6-7 storeys (triggers CDA hill-cutting / coastal compliance notes).
  - `RDA` with 20 ft road -> 6-7 storeys (triggers RDA Padma buffer / Barind note).

### Manual Verification
- Verify in the running web application (`npm run web` at `http://localhost:8081`):
  - Switch between RAJUK, CDA, KDA, RDA with identical inputs (e.g. 5 katha, 20 ft road, 7 storeys).
  - Verify that KDA displays KDA-specific bylaws, CDA displays CDA bylaws and terrain warnings, etc.
