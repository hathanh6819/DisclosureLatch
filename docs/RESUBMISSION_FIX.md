# Resubmission fix — discoverable record navigation

## Steward request

The previous resubmission still required reviewers to know and type numeric bounty or submission IDs on the Search and Review Explorer pages.

## Resolution

- `Browse records` builds a bounded client-side index from finalized `get_totals`, `get_bounty`, and `get_submission` reads.
- Reviewers can search across titles, requirements, CIKs, forms, accessions, documents, wallet addresses, reason codes, and statuses.
- Status filtering, refresh, loading, empty, selected, and error states are present.
- Selecting a bounty automatically selects its related submission when one exists.
- Selecting a submission automatically resolves and displays its parent bounty.
- `Review explorer` lists finalized submissions and opens the full authorization/verdict audit without an ID field.
- The lifecycle Console now uses descriptive bounty and submission selectors instead of numeric ID inputs.
- IDs remain visible only as record metadata and internal contract keys; reviewers never need to know one before navigating.

## Verification

1. Open `/search` and confirm there is no numeric-ID input. Search by `COO`, `8-K`, an accession, wallet, or status.
2. Select a bounty or submission from the finalized catalog.
3. Open `/reviews`, choose a filing from the list, and verify the parent bounty, verdict, SEC link, contract link, and digests appear.
4. Open `/console` and confirm the target controls are descriptive dropdowns rather than ID text fields.

Automated regression coverage fails if `Search every record by ID`, `Numeric ID`, `Bounty ID`, or `Submission ID` input markup returns.
