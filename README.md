# DisclosureLatch

DisclosureLatch is a GenLayer dApp for funding precise public-company disclosure questions and paying a bound evidence hunter only when an official SEC filing satisfies the locked requirement.

## Live deployment

- Application: <https://disclosure-latch.pages.dev>
- Studio Next contract v3: <https://explorer-studio-dev.genlayer.com/address/0x752eA1c5B3b7b192019781a6392f278a959077C9>
- Network: Studio Next, chain `61997`
- Full reproducible transaction matrix: [`E2E_EVIDENCE.md`](E2E_EVIDENCE.md)
- Detailed security and local verification record: [`docs/release-evidence.md`](docs/release-evidence.md)

It is intentionally narrow: one Sponsor per bounty, one claimant per active submission, one authoritative source family, deterministic source construction, exact-byte digest verification, bounded AI consensus, and real GEN custody. The deployment wallet has no lifecycle role unless it later participates like any ordinary user.

## Contract decision

The contract decides whether a particular SEC filing:

1. belongs to the locked company CIK and permitted form;
2. falls within the locked filing window;
3. substantively satisfies the Sponsor's precommitted disclosure requirement; and
4. was fetched from the canonical SEC archive with the exact submitted SHA-256 digest.

Only a consistent `MATCH` can progress to payout. A valid non-match reopens the bounty. Source, provenance, digest, model-schema, or validator-consensus uncertainty becomes `UNRESOLVED`, never a payout.

## Roles

- **Deployer:** the address is not stored and receives no privileged method.
- **Sponsor:** any wallet that creates and funds a bounty becomes Sponsor of that bounty and can recover only that bounty.
- **Claimant:** any wallet other than that bounty's Sponsor may submit a canonical filing identity and can finalize its approved payout.
- **Sponsor or claimant:** may trigger assessment and bounded retries; outsiders cannot consume retry budget. Anyone may read state.

The two project test wallets are documented in [`docs/release-evidence.md`](docs/release-evidence.md), but they are not privileged or hard-coded. Reviewers can run an independent lifecycle with their own two wallets.

## Source and fixture

The authoritative source is SEC EDGAR. See [`docs/test-resources.md`](docs/test-resources.md) and the pinned [`samples/sec-fixture-manifest.json`](samples/sec-fixture-manifest.json).

## Repository layout

```text
contracts/disclosure_latch.py   production custody contract
contracts/sec_source_probe.py   validator-side source preflight
tests/test_disclosure_latch.py  direct tests of production source
frontend/                       React/Vite dApp
docs/                           source and release evidence
samples/                        pinned fixture manifest
```

The custody threat model and accounting invariants are documented in [`docs/economic-security.md`](docs/economic-security.md).

## Local verification

```bash
python -m pytest -q -p no:cacheprovider
PYTHONIOENCODING=utf-8 python -m genvm_linter.cli check contracts/disclosure_latch.py
PYTHONIOENCODING=utf-8 python -m genvm_linter.cli check contracts/sec_source_probe.py
cd frontend
npm ci
npm run build
```

On Windows, the same checks can be run from the repository root with:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\verify_local.ps1
```

## Safe deployment order

1. Deploy `sec_source_probe.py` on Studionet and call `probe_fixture`.
2. Stop if the finalized result differs from the expected status, byte length, or digest in the fixture manifest.
3. From the main deployment wallet, deploy `disclosure_latch.py` without constructor arguments. The deployer receives no special authority.
4. Set `VITE_CONTRACT_ADDRESS` to that exact address, rebuild, and publish the frontend.
5. Run the project evidence matrix with the two test wallets and preserve explorer links. Reviewers may independently repeat it with any two distinct wallets.

## Security properties

- no arbitrary evidence URL or user-supplied prompt;
- exact CIK, accession, document, form, window, and revision binding;
- exact-byte SHA-256 check before semantic judgment;
- bounded source size and bounded retries;
- strict output schema and cross-field invariant;
- fail-closed unresolved state;
- accession replay protection and one-time settlement;
- permissionless per-bounty roles with Sponsor/claimant separation;
- checks-effects-interactions on transfers;
- attached value returned on rejected payable calls.

This software demonstrates evidence-conditioned authorization. It is not investment, legal, or accounting advice.
