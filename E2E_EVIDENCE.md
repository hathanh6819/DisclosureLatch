# DisclosureLatch end-to-end evidence

This document is the reviewer-oriented evidence index for the final version 3 deployment. Version 2 is superseded and must not be treated as the submission contract.

## Final deployment

| Item | Value |
| --- | --- |
| Application | [https://disclosure-latch.pages.dev](https://disclosure-latch.pages.dev) |
| Network | Studio Next, chain `61997` |
| Contract | [`0x752eA1c5B3b7b192019781a6392f278a959077C9`](https://explorer-studio-dev.genlayer.com/address/0x752eA1c5B3b7b192019781a6392f278a959077C9) |
| Protocol | `DisclosureLatch`, version `3`, real custody enabled |
| Source probe | [`0x60d3f54658b15b07F29f08103317324a876CF638`](https://explorer-studio-dev.genlayer.com/address/0x60d3f54658b15b07F29f08103317324a876CF638) |
| Canonical source | SEC EDGAR archive, constructed by the contract from CIK, accession and primary document |

The deployment wallet is not stored and receives no special authority. The creator of each bounty becomes its Sponsor. A different wallet may become claimant by submitting a filing. Reviewers can reproduce the lifecycle with any two distinct Studio Next wallets.

## Source preflight

Before deploying the custody contract, validators fetched the pinned SEC fixture through `SecSourceProbe`.

- [Probe transaction](https://explorer-studio-dev.genlayer.com/tx/0xb5662a4d4571e5e35626eed95eead31a7949e14950cb78cdb9c07ab9b62874e3)
- Consensus: `MAJORITY_AGREE`
- Result: `200:38298:79d278b5c34a40ec5618d5286c983120346ebb58ccd8587339533b88e7f22e37`
- Meaning: HTTP 200, 38,298 exact bytes, SHA-256 equal to the pinned manifest.

## Live happy path

| Step | Caller | Evidence | Final state |
| --- | --- | --- | --- |
| Create a `0.01 GEN` bounty | Sponsor | [Create](https://explorer-studio-dev.genlayer.com/tx/0xbf32eef90071dd680767516cd4769229892f0b250ef496e855ab0389a7127ef9) | Bounty `OPEN`, principal locked |
| Submit canonical SEC identity and digest | Claimant | [Submit](https://explorer-studio-dev.genlayer.com/tx/0xc7f63a0845bafae97b118f256402f144b4d9dfffc1f07acf3fbdd1f18c543d5d) | Submission `CLAIMED`, immutable claimant and digest |
| Fetch, verify and semantically assess | Sponsor | [Assess](https://explorer-studio-dev.genlayer.com/tx/0x794efa83040a9eef6a29d90f26e2adbc20503f16f79fc031dab1bde621c6521a) | `MATCH_PENDING / REQUIREMENT_SATISFIED` |
| Settle after the challenge window | Claimant | [Payout](https://explorer-studio-dev.genlayer.com/tx/0x24c2cb82c26fd532b75e343bc790c5f09cff762eedfd157d8286336cfc451ff0) | Bounty and submission `PAID`, exact `0.01 GEN` transferred |
| Attempt settlement replay | Claimant | [Second finalize](https://explorer-studio-dev.genlayer.com/tx/0xff29fac78baa9f76335445b2a9683d65d695058b737911b406d00e23c1ea62e9) | Rejected; accounting unchanged |

Production UI lookup: set Bounty ID `1` and Submission ID `1`, then select **Sync state**. Expected state is `PAID / PAID / REQUIREMENT_SATISFIED`.

## Live digest failure and bounded recovery

This path proves that an exact-byte mismatch cannot authorize payment and that retry exhaustion permits only a Sponsor refund.

| Step | Evidence | Result |
| --- | --- | --- |
| Create funded bounty | [Create](https://explorer-studio-dev.genlayer.com/tx/0xd670f0ad1e37fb78e8313529904ff64ebae477e2cc7ff5b70a7348cbf846faa6) | Principal locked |
| Submit intentionally wrong digest | [Submit](https://explorer-studio-dev.genlayer.com/tx/0xa858a916374cce5c4580bc13eadc559f1bece04e34e1084cc5f25148e1a9a8a0) | Claim recorded without changing evidence |
| First validator assessment | [Assessment 1](https://explorer-studio-dev.genlayer.com/tx/0x503902425718462afa693013fb201999282d48881142276e8d345870edf3f5f4) | `UNRESOLVED / DIGEST_MISMATCH`, attempt 1 |
| Revision-bound retry | [Retry](https://explorer-studio-dev.genlayer.com/tx/0x392f2340f7d91a198a69161ece81cd4906a3c6053a5912116abb5354790efa70) | Returns to `CLAIMED` without changing identity |
| Second validator assessment | [Assessment 2](https://explorer-studio-dev.genlayer.com/tx/0x99d473ea2ce737d17daa67c7ffd2849eb0626f089d0174c2e82a9abf760ebeb2) | `UNRESOLVED / DIGEST_MISMATCH`, retry limit reached |
| Sponsor recovery | [Refund](https://explorer-studio-dev.genlayer.com/tx/0xfe9324a99951a347c1b37fb0979d7845aba76e52a3a2a972714bbd7966488e89) | Bounty `REFUNDED`, locked principal zero |

Production UI lookup: Bounty ID `2`, Submission ID `2`. Expected state is `REFUNDED / UNRESOLVED / DIGEST_MISMATCH`.

## Live semantic negative path

This path uses authentic SEC bytes but a deliberately unrelated locked requirement. It distinguishes a valid non-match from unavailable or malformed evidence.

| Step | Evidence | Result |
| --- | --- | --- |
| Create unrelated requirement | [Create](https://explorer-studio-dev.genlayer.com/tx/0x84e557565f2ae6fbdd4b48257eab19c4af59ab18f7ba054ca2055ab47b19ab32) | Bounty funded |
| Submit valid canonical filing | [Submit](https://explorer-studio-dev.genlayer.com/tx/0x25331ce82d649506237de9970cf5f19f25cdf6f743872f739d8fdcb835274caf) | Canonical identity and exact digest stored |
| Assess evidence | [Assessment](https://explorer-studio-dev.genlayer.com/tx/0x3d11baee5bc2f6c0c8617d59a6f332bf561143b1f0d2c88d3dae67639b2ae81b) | `NOT_MATCH / EVENT_MISMATCH`; bounty reopens, no payout |

Production UI lookup: Bounty ID `3`, Submission ID `3`. Expected state is `OPEN / NOT_MATCH / EVENT_MISMATCH`.

## Automated and adversarial verification

Run all local checks from the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\verify_local.ps1
```

The exact version 3 production source passes 12 direct tests:

1. successful custody, assessment and one-time payout;
2. digest mismatch, bounded retry and Sponsor recovery;
3. semantic `NOT_MATCH` reopening;
4. provenance mismatch fail-closed behavior;
5. contradictory model output rejection;
6. malformed or conflicting comparative consensus rejection;
7. Sponsor self-claim rejection;
8. unauthorized recovery rejection;
9. outsider assessment and retry-budget griefing rejection;
10. accounting conservation across bounties;
11. rejected payable input refund with no retained liability;
12. accession replay and double-settlement rejection.

Contract and source-probe GenVM lint and validation pass. The React frontend typecheck and production build also pass.

## Accounting observed after the matrix

- Bounties: `3`
- Submissions: `3`
- Paid: `0.01 GEN`
- Refunded: `0.01 GEN`
- Locked: `0.01 GEN`

The remaining locked amount belongs to the semantic-negative bounty, which correctly reopened after `NOT_MATCH`; it is recoverable by its Sponsor after the submission deadline. It is not an unauthorized or lost balance.

## Security boundaries

- No user-supplied evidence URL or arbitrary prompt.
- Exact CIK, form, filing window, accession, document, digest and revision binding.
- Strict model schema and cross-field invariants.
- Missing, oversized, malformed, contradictory or disagreeing evidence fails closed.
- Maximum two assessment attempts per submission.
- Only Sponsor or claimant can assess or retry; outsiders cannot consume retry budget.
- Only claimant can finalize a match; only Sponsor can recover its bounty.
- Effects are committed before external transfers.
- Rejected payable creation returns attached value.
- One-time settlement and per-bounty accession replay protection.

See [`docs/economic-security.md`](docs/economic-security.md) for the full custody threat model and [`docs/release-evidence.md`](docs/release-evidence.md) for the extended verification record.
