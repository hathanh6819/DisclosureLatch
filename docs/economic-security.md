# Economic security review

DisclosureLatch holds real GEN principal. The security target is not merely access control: every state transition must preserve custody liabilities and make theft, replay, or unauthorized redirection impossible.

## Accounting invariant

For all bounties, `total_locked` equals the sum of each bounty's nonzero `locked_wei`. Every accepted deposit increases both values by the same amount. Exactly one terminal path decreases them:

- `finalize_match` moves the exact principal from locked to paid and transfers it to the immutable submission claimant; or
- `recover_bounty` moves the exact principal from locked to refunded and transfers it to the immutable bounty Sponsor.

The same bounty cannot take both terminal paths. Checks-effects-interactions clears the liability and commits terminal state before the transfer is emitted.

## Attack review

| Attack | Control |
| --- | --- |
| Deployer drains funds | Deployer is not stored and has no privileged method |
| Sponsor claims own bounty through same wallet | `SPONSOR_CANNOT_CLAIM` |
| Outsider redirects payout | Destination is the claimant captured by `submit_filing`; no setter exists |
| Outsider refunds bounty | `recover_bounty` requires the per-bounty Sponsor |
| Double payout or refund | `locked_wei` is zeroed and state becomes terminal before transfer |
| Payout plus refund | `PAID` cannot satisfy recovery conditions; `REFUNDED` cannot satisfy finalization conditions |
| Reentrant withdrawal | Effects precede interaction and payout uses the EOA transfer interface with no mutable callback path |
| Accession replay | `used_accessions[bounty_id:accession]` is append-only |
| Stale assessment overwrites state | Every assessment is revision-bound |
| Invalid payable call traps principal | Every validation failure after receiving value transfers the exact attached value back; it creates no liability |
| Tiny-value spam | `MIN_BOUNTY` rejects deposits below the floor and returns attached principal |
| Evidence/source failure releases money | All acquisition, digest, schema, and consensus uncertainty becomes `UNRESOLVED`; no payout |
| Fee confused with escrow | Consensus v0.6 `feeValue` is quoted and supplied separately by the SDK; only `gl.message.value` is recorded as bounty principal |

## Residual economic risks

- **Sybil separation:** a Sponsor can use another wallet as claimant. This is acceptable because it only moves the Sponsor's voluntarily locked principal; it cannot take another bounty's funds.
- **Assessment griefing:** only the per-bounty Sponsor or immutable claimant can assess or request a retry. `assess_submission` accepts only `CLAIMED`; every retry must pass the revision-bound `retry_unresolved` gate and its hard limit. Outsiders cannot consume retry budget.
- **Preview fees:** Studio Next currently quoted roughly `0.1 GEN` per write during testing, while the demo bounty was `0.01 GEN`. Fees are network costs separate from custody. A production deployment should set `MIN_BOUNTY` according to measured network fees so participation remains economically rational.
- **Preview resets:** Studio Next state is temporary. Explorer evidence should not be treated as a durable production escrow deployment.

## Verification

The 12-test local production-source suite includes conservation across multiple independent bounties, exact refunds, rejected payable calls, wrong-role recovery, self-claim rejection, outsider retry-budget protection, contradictory/malformed consensus handling, single payout, and settlement replay prevention. Live Studio Next version 3 evidence records an exact `0.01 GEN` liability moving from `locked_wei` to `paid_wei`, followed by a rejected second finalization with unchanged totals.
