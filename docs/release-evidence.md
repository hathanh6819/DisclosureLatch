# Release evidence

This file separates completed verification from work that requires a deployed Studio Next address. Do not interpret a pending row as passed.

| Check | Status | Evidence |
| --- | --- | --- |
| Production contract syntax and GenVM validation | PASS | `genvm_linter check contracts/disclosure_latch.py` and contract validator |
| Source-probe syntax and GenVM validation | PASS | `genvm_linter check contracts/sec_source_probe.py` and contract validator |
| Direct production-contract unit/adversarial suite | PASS | Exact version 3 source: 12 passed, including model contradiction, malformed/conflicting consensus output, retry-budget griefing, self-claim, outsider recovery, conservation, and replay |
| Frontend typecheck and production build | PASS | `npm run build`; Vite 8 production bundle completed |
| Frontend visual smoke test | PASS | Production deployment at [`disclosure-latch.pages.dev`](https://disclosure-latch.pages.dev): logo, responsive hero, contract v3 link, live totals and lifecycle state verified |
| Source probe deployment | PASS | Contract [`0xd172...7bBa`](https://explorer-studio.genlayer.com/address/0xd172557c6Cfc249E2A9fBA5611112C21D9d67bBa), [deployment tx](https://explorer-studio.genlayer.com/tx/0x1050acd8861e83602292731e492a4d655b3190361f95387c0bb0dd700b9a63f3), `FINALIZED / MAJORITY_AGREE` |
| Validator-side SEC source probe | BLOCKED | [Attempt 1](https://explorer-studio.genlayer.com/tx/0x9756ae806f3199c70a95cfc1beee261705c43f735321715efbc7797233cabf2f), [attempt 2](https://explorer-studio.genlayer.com/tx/0x1ed2f68b10eb33558fd43f5c2c999356b0429f575032a4d11ea1d69f215a4f44), and [attempt 3](https://explorer-studio.genlayer.com/tx/0xfb6adbd8b67efb81625449a5b9a4881a3e66dbb5a0a6fd527ce3a2bdd2d635a1) finalized as `NO_MAJORITY` with no round validators; no SEC fetch result exists |
| Studio Next source probe deployment | PASS | Contract [`0x60d3...F638`](https://explorer-studio-dev.genlayer.com/address/0x60d3f54658b15b07F29f08103317324a876CF638), chain `61997`, exact `SecSourceProbe` source and schema verified |
| Studio Next validator-side SEC probe | PASS | [Probe tx](https://explorer-studio-dev.genlayer.com/tx/0xb5662a4d4571e5e35626eed95eead31a7949e14950cb78cdb9c07ab9b62874e3), `MAJORITY_AGREE`; exact result `200:38298:79d278b5c34a40ec5618d5286c983120346ebb58ccd8587339533b88e7f22e37` |
| Main contract v2 evidence deployment | SUPERSEDED | [`0xd9Ad...1a2C`](https://explorer-studio-dev.genlayer.com/address/0xd9Ad9589577eD83941ad8a24E504a44adA631a2C) produced the live matrix below, then audit found an outsider retry-budget griefing path. Version 3 fixes it; do not submit v2 as final. |
| Main contract v3 deployed from reviewed source | PASS | [`0x752e...77C9`](https://explorer-studio-dev.genlayer.com/address/0x752eA1c5B3b7b192019781a6392f278a959077C9), exact deployed/local source match, clean initial state, protocol v3 and participant-gated retry schema |
| Sponsor creates funded bounty | PASS | [Create tx](https://explorer-studio-dev.genlayer.com/tx/0xed2626a9f234671a6514e2129c1ff0ff04fd7792e097e4e7e81228d0c57f02c7), `MAJORITY_AGREE`, `0.01 GEN` locked |
| Claimant submits canonical SEC filing | PASS | [Submit tx](https://explorer-studio-dev.genlayer.com/tx/0x17d8e0521a61f99b785055c0c1bcd234ff4beb261e86d10baa5bd2fc2ebf24bc), immutable claimant and digest stored |
| Validator assessment | PASS | [Assessment tx](https://explorer-studio-dev.genlayer.com/tx/0x921dd2565ce7274d1db3a7516a3cbc6265739a9cccac8ac535dbf113beb12ede), `MATCH_PENDING / REQUIREMENT_SATISFIED`, exact evidence digest |
| Live authorization/replay checks | PASS | [Sponsor self-claim](https://explorer-studio-dev.genlayer.com/tx/0x898781d621e0c95ff2a60cb0d0a7783b35afe9757c9a3acbe3fdf44f7f596144), [outsider finalize](https://explorer-studio-dev.genlayer.com/tx/0x311201104fb8a5c56871999adea7201cf96d7bfa60081dec7d1a8f802d7a99ee), and [accession replay](https://explorer-studio-dev.genlayer.com/tx/0xc384e23ddba383e1b64744bda0b7f9ea2767c190fb62a02e6f1745e49dc43445) left the accepted submission unchanged |
| Custody payout and settlement replay | PASS | [Payout tx](https://explorer-studio-dev.genlayer.com/tx/0x57af80b48f1de136b40501f573f73259c878325d5def1f5d7f055cbfcd4664b3) moved exact `0.01 GEN` from locked to paid; [second finalize](https://explorer-studio-dev.genlayer.com/tx/0xd84ad94c836fec675c6d085519dbd9052ceb8cac25624bcb65e3f2621527612b) left totals unchanged |
| Live digest failure and bounded recovery (v2 evidence) | PASS | [Create](https://explorer-studio-dev.genlayer.com/tx/0xb64eca41af3869ca6bd27d5bf3257946a335c99d7cb2eca6ae5f1858ff24bef6), [submit bad digest](https://explorer-studio-dev.genlayer.com/tx/0xdc139470c44a48a921d1590d17a7c43985fce1587dac27ba4066648cd7af829f), [assessment 1](https://explorer-studio-dev.genlayer.com/tx/0x8e860c31320089afbac067d62e3d49f62dea37682850a6bd0b8db274cb618137), [retry](https://explorer-studio-dev.genlayer.com/tx/0x931520b2cd77f94d0e21aef87530764657594f94d8229797a32f0a447011e92a), [assessment 2](https://explorer-studio-dev.genlayer.com/tx/0x73bc6e0e48945e9d15f9da2d612183c857f511401268adf5aa4e6e390af5c484), and [refund](https://explorer-studio-dev.genlayer.com/tx/0x0dde3d483737b57f396df973979802f4b70a9a80484c4665c0b14772b2acc36d) ended `REFUNDED` with zero locked principal |
| Live semantic NOT_MATCH (v2 evidence) | PASS | [Create](https://explorer-studio-dev.genlayer.com/tx/0x5309a2ab09025f6cf634ee515cad27fea5a4fff73ff2052b14b6d2191da49cb1) and [submit](https://explorer-studio-dev.genlayer.com/tx/0x6dcba648bda368bc2a3c4f79c3cf8729543996ad1ea132deff39c6b2f74b64b8); finalized state is `NOT_MATCH / EVENT_MISMATCH`, bounty reopened with principal intact |
| Version 3 happy path | PASS | [Create](https://explorer-studio-dev.genlayer.com/tx/0xbf32eef90071dd680767516cd4769229892f0b250ef496e855ab0389a7127ef9), [submit](https://explorer-studio-dev.genlayer.com/tx/0xc7f63a0845bafae97b118f256402f144b4d9dfffc1f07acf3fbdd1f18c543d5d), [assess](https://explorer-studio-dev.genlayer.com/tx/0x794efa83040a9eef6a29d90f26e2adbc20503f16f79fc031dab1bde621c6521a), [payout](https://explorer-studio-dev.genlayer.com/tx/0x24c2cb82c26fd532b75e343bc790c5f09cff762eedfd157d8286336cfc451ff0), [double-finalize rejection](https://explorer-studio-dev.genlayer.com/tx/0xff29fac78baa9f76335445b2a9683d65d695058b737911b406d00e23c1ea62e9) |
| Version 3 digest failure and bounded recovery | PASS | [Create](https://explorer-studio-dev.genlayer.com/tx/0xd670f0ad1e37fb78e8313529904ff64ebae477e2cc7ff5b70a7348cbf846faa6), [bad-digest submit](https://explorer-studio-dev.genlayer.com/tx/0xa858a916374cce5c4580bc13eadc559f1bece04e34e1084cc5f25148e1a9a8a0), [assessment 1](https://explorer-studio-dev.genlayer.com/tx/0x503902425718462afa693013fb201999282d48881142276e8d345870edf3f5f4), [retry](https://explorer-studio-dev.genlayer.com/tx/0x392f2340f7d91a198a69161ece81cd4906a3c6053a5912116abb5354790efa70), [assessment 2](https://explorer-studio-dev.genlayer.com/tx/0x99d473ea2ce737d17daa67c7ffd2849eb0626f089d0174c2e82a9abf760ebeb2), [refund](https://explorer-studio-dev.genlayer.com/tx/0xfe9324a99951a347c1b37fb0979d7845aba76e52a3a2a972714bbd7966488e89) |
| Version 3 semantic negative | PASS | [Create](https://explorer-studio-dev.genlayer.com/tx/0x84e557565f2ae6fbdd4b48257eab19c4af59ab18f7ba054ca2055ab47b19ab32), [submit](https://explorer-studio-dev.genlayer.com/tx/0x25331ce82d649506237de9970cf5f19f25cdf6f743872f739d8fdcb835274caf), [assessment](https://explorer-studio-dev.genlayer.com/tx/0x3d11baee5bc2f6c0c8617d59a6f332bf561143b1f0d2c88d3dae67639b2ae81b), final `NOT_MATCH / EVENT_MISMATCH`, bounty reopened with principal intact |
| Economic/adversarial local suite | PASS | Exact version 3 production source: 12 tests; see [`economic-security.md`](economic-security.md) |
| Frontend configured to exact deployed address | PASS | [`disclosure-latch.pages.dev`](https://disclosure-latch.pages.dev) targets exact version 3 contract and displayed `3` bounties, `3` submissions, `0.01 GEN` locked, protocol v3, and the finalized happy-path state during production verification |

## Permissionless role separation

The constructor takes no arguments and stores no deployer. Roles are derived independently for each bounty:

- The wallet funding `create_bounty` becomes that bounty's Sponsor.
- Any different wallet may `submit_filing` and becomes that submission's claimant.
- A Sponsor cannot claim its own bounty.
- Only the bounty Sponsor can recover its locked funds.
- Only the submission claimant can finalize its approved payout.
- Only that bounty's Sponsor or submission claimant may trigger assessment/retry; outsiders cannot consume retry budget.

The deploying wallet is not stored and receives no automatic Sponsor, claimant, assessment, settlement, or recovery privilege. The planned evidence wallets remain:

- Test Sponsor: `0x1D283b45974B0be9630DFD1deC6A62a9B72B2760`
- Test claimant: `0xf96Cf822F9f4e76956AB9fAAa22B3BdCD7b10aD6`

## Evidence recording rule

Every live transaction must be recorded as a clickable explorer URL for its actual network together with the method, caller role, arguments or fixture identifier, finalized result, and post-transaction state. Never store private keys, seed phrases, RPC credentials, or deployment tokens.

## Current deployment gate

The stable Studionet probe remains blocked because three calls finalized with an empty validator set. Studio Next (`61997`) independently passed the source gate with `MAJORITY_AGREE` and the exact expected bytes and digest. The custody contract may now be deployed on Studio Next only; this evidence does not authorize treating the unverified Studionet deployment as passed.
