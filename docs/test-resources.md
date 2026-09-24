# Test resources

DisclosureLatch uses the U.S. SEC EDGAR archive as its authoritative source. It does not accept user-selected evidence URLs. The contract derives both the filing index and primary-document URL from the locked CIK, accession number, and primary-document name.

## Why this source is suitable

- The SEC publishes company submissions and filing documents without an account or API key.
- An accession number uniquely identifies an EDGAR submission.
- Archive paths are derived deterministically from the CIK and accession.
- The contract verifies the exact primary-document bytes against a submitter-provided SHA-256 digest before semantic assessment.
- Missing, malformed, oversized, mismatched, or unavailable evidence fails closed as `UNRESOLVED`.

SEC resources:

- [EDGAR APIs](https://www.sec.gov/search-filings/edgar-application-programming-interfaces)
- [SEC internet security policy and automated access guidance](https://www.sec.gov/about/privacy-information)
- [Canonical positive fixture](https://www.sec.gov/Archives/edgar/data/320193/000114036125025275/ef20051741_8k.htm)
- [Canonical filing index](https://www.sec.gov/Archives/edgar/data/320193/000114036125025275/0001140361-25-025275-index.html)

The exact fixture identity, byte length, and digest are recorded in [`samples/sec-fixture-manifest.json`](../samples/sec-fixture-manifest.json). This pinned manifest is test data, not an instruction to validators.

## Mandatory source probe

Before deploying the custody contract, deploy `contracts/sec_source_probe.py` to the same GenLayer network and call `probe`. Continue only if the finalized result is exactly:

```text
200:38298:79d278b5c34a40ec5618d5286c983120346ebb58ccd8587339533b88e7f22e37
```

This proves that validators can fetch the source and agree on its exact bytes. A local browser fetch is not a substitute for the on-network probe.

## Test matrix

| Path | Evidence condition | Expected state |
| --- | --- | --- |
| Happy | Correct identity, provenance, digest, and semantic match | `MATCH_PENDING`, then `PAID` after the settlement delay |
| Negative | Valid filing that does not meet the requirement | `NOT_MATCH`; bounty reopens |
| Unavailable | HTTP failure, empty or oversized response | `UNRESOLVED` |
| Integrity | Incorrect SHA-256 | `UNRESOLVED / DIGEST_MISMATCH` |
| Provenance | CIK, accession, document, or form missing from index metadata | `UNRESOLVED / PROVENANCE_MISMATCH` |
| Conflict | Validators do not produce the same consequential result | `UNRESOLVED` |
| Replay | Same accession resubmitted to the same bounty | `ACCESSION_ALREADY_USED` |
| Authorization | Sponsor attempts self-claim, outsider recovery, or outsider finalization | Rejected by per-record authority |
| Settlement replay | Payout or refund attempted twice | `ALREADY_SETTLED` or closed-state rejection |
