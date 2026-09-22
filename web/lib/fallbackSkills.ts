import type { EnrichedSkillRow, RepoSkillRow } from "@/lib/marketplaceBrowse";
import type { LandingMetrics } from "@/lib/platformMetrics";
import type { SkillDetailSnapshot } from "@/lib/skillDetailSnapshot";

export const FALLBACK_PLATFORM_METRICS: LandingMetrics = {
  agents: 19,
  authors: 9,
  skills: 20,
  revenue: 19250000,
  staked: 34500000,
  onChainDownloads: 68,
  downloads: 122,
};

export const REAL_FALLBACK_SKILLS: any[] = [
  {
    "id": "ff3f728a-313e-46ba-80cd-a1a331327967",
    "skill_id": "subagent-orchestration",
    "public_slug": "subagent-orchestration",
    "public_author_slug": "wallet-asuavudg",
    "author_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "author_kind": "wallet",
    "author_external_id": null,
    "author_handle": null,
    "author_display_name": null,
    "publisher_identity_key": "wallet:asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "publisher_tier": "registered",
    "mirror_source_key": null,
    "synced_repo_url": "https://github.com/dirtybits/agent-skills",
    "name": "Subagent Orchestration",
    "description": "Best practices for delegating work to sub-agents — when to spawn one vs. work inline, how to write self-contained prompts, orchestration patterns, and how to author reusable agent-type definitions.",
    "tags": [
      "agents",
      "orchestration",
      "workflow",
      "prompting"
    ],
    "current_version": 3,
    "summary": "Guides agents on delegating tasks to sub-agents for efficient parallel processing, large data handling, and specialized analysis.",
    "summary_model": "google/gemini-2.5-flash-lite",
    "summary_sha256": "31f1f4b591a465ac1ba5fffa9a33bee7a8736e6ec2dfb94eced198710ea2ed7e",
    "summary_capabilities": [
      "Sub-agent delegation",
      "Parallel task execution",
      "Data summarization",
      "Prompt engineering"
    ],
    "ipfs_cid": null,
    "on_chain_address": null,
    "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
    "evm_listing_id": null,
    "evm_contract_address": null,
    "evm_tx_hash": null,
    "total_installs": 17,
    "price_usdc_micros": null,
    "currency_mint": null,
    "on_chain_protocol_version": null,
    "on_chain_program_id": null,
    "contact": "https://github.com/dirtybits/agent-skills/tree/main/skills/subagent-orchestration",
    "created_at": "2026-06-15T22:33:37.568Z",
    "updated_at": "2026-09-06T06:32:23.115Z",
    "source": "repo",
    "payment_flow": "free",
    "content": "---\ntype: Skill\nname: subagent-orchestration\ntitle: \"Subagent Orchestration\"\ndescription: \"Best practices for delegating work to sub-agents — when to spawn one vs. work inline, how to write self-contained prompts, orchestration patterns, and how to author reusable agent-type definitions.\"\nresource: \"https://github.com/dirtybits/agent-skills/tree/main/skills/subagent-orchestration\"\ntags: [\"agents\", \"orchestration\", \"workflow\", \"prompting\"]\ntimestamp: \"2026-06-22T19:13:38Z\"\nokf_version: \"0.1\"\nlicense: MIT\n---\n\n# Sub-agent Orchestration\n\nA sub-agent is a fresh context window with its own tools that does one scoped\ntask and returns a **single final message**. The agent that spawned it (the\n*orchestrator*) sees only that final message — never the sub-agent's\nintermediate reads, greps, or reasoning. That one fact drives almost every\ndecision below, so hold onto it:\n\n> The orchestrator pays for the sub-agent's *conclusion*, not its *work*.\n\nHarnesses name this primitive differently — a `Task` tool, an `Agent` tool, a\n\"subagent\", a `Workflow` step — but the contract is the same everywhere. This\nskill is written to that contract, not to any one tool. Substitute your\nharness's spawn mechanism wherever you see \"spawn a sub-agent\".\n\nMost agents get the balance wrong in *both* directions: they under-delegate\nbroad searches and parallelizable work (doing serially, inline, what should\nfan out), and they over-delegate trivial lookups (spawning a whole agent to\nread one known file). The goal here is to get the balance right.\n\n---\n\n## The one-line test\n\n**Delegate when the work is large to do but small to report, or independent\nenough to run in parallel. Keep it inline when you need the details rather than\na summary, when the steps depend on each other turn-by-turn, or when it's\nfaster to just do it than to describe it.**\n\nEverything below is that test, expanded.\n\n---\n\n## When to spawn a sub-agent\n\n**1. Fan-out search / exploration.** The question can only be answered by\nsweeping many files, directories, or naming conventions, and you want the\n*conclusion*, not the raw material. \"Where is auth enforced across this\nmonorepo?\" → an explorer reads 40 files and returns a 15-line map. Your context\ngrows by 15 lines, not 40 files.\n\n**2. Independent work that can run in parallel.** N items with no\ncross-dependencies — review 8 changed files, research 5 topics, audit 12\nendpoints. Spawn them concurrently and wall-clock collapses to the slowest\nsingle item instead of the sum.\n\n**3. Large-but-disposable intermediate output.** Any task whose byproducts are\nhuge but whose payload is small: tailing logs to find the one stack trace,\nrunning a test suite to extract the failures, scanning a dataset for outliers.\nIsolation keeps the noise out of your context.\n\n**4. A fresh, unanchored perspective.** Review, security audit, adversarial\nverification. You may be anchored on the approach you just wrote; an agent that\nnever saw it isn't. Independence is the feature.\n\n**5. Scale beyond one context window.** Migrations, audits, and sweeps too large\nto hold at once. Decompose, fan out, and each piece fits in its own context.\n\n## When NOT to spawn a sub-agent\n\n**1. You already know where the answer is.** A single known file, symbol, or\nline — just read it. Spawning adds spawn latency, a prompt you have to write,\ntoken cost, and a return you have to parse, all to avoid one `Read`.\n\n**2. You need the details, not a summary.** If you'll keep working with the\n*specifics* the task surfaces, isolating them throws away exactly what you need\n— the returned summary is lossy by design. Delegation is for when the summary\n*is* the goal.\n\n**3. The steps depend on each other turn-by-turn.** Sub-agents can't coordinate\nmid-flight: they start blank, share no memory, and you can't watch their work\nas it unfolds. If step B needs nuanced output from A which needs B's result,\ndo it inline or model it as an explicit pipeline — don't try to choreograph\nchatty agents.\n\n**4. It's trivial.** If the whole task is two tool calls, orchestration overhead\nexceeds the work. Just do it.\n\n**5. Describing it costs more than doing it.** If writing a self-contained\nprompt would take longer than the task itself, that's the signal to stay inline.\n\n**6. It only makes sense with your conversation history.** The agent can't see\nthis conversation. Either inline it, or first ask whether the needed context can\neven be distilled into a prompt — often it can't.\n\n---\n\n## How orchestration actually works\n\n**The return is data, not chat.** The final message is consumed by you (or a\nscript), and is *not shown to the user*. Tell the sub-agent this, ask for a\nspecific shape (a list, structured fields, a verdict + evidence), and keep it\ndense. Then **relay what matters to the user yourself** — they never saw it.\n\n**Prompts must be self-contained.** The sub-agent has none of your context.\nEvery path, constraint, definition of done, and relevant fact has to be in the\nprompt. See `references/writing-subagent-prompts.md` and the ready-to-fill\n`assets/subagent-prompt-template.md`.\n\n**Parallel vs. sequential is a real choice:**\n- *Parallel barrier* — spawn all, wait for all, then proceed. Use only when you\n  genuinely need every result together (to dedup, merge, or make an\n  all-or-nothing call).\n- *Pipeline* — each item flows through stages independently; item A can be in\n  stage 3 while item B is still in stage 1. This is the **default** for\n  multi-stage work, because wall-clock becomes the slowest single chain rather\n  than the sum of each stage's slowest item.\n\n**Sub-agents aren't free, and they can fail.** Each one burns tokens and time;\nscale the fleet to the task (\"find any bug\" is a couple of finders, \"exhaustively\naudit this\" is a larger pool plus verification). Any sub-agent may return junk or\nnothing — filter empty results, and for unknown-size work, loop until rounds come\nback empty rather than assuming one pass was complete.\n\n**Never truncate silently.** If you cap coverage (top-N, sampling, no retries),\nsay so in your summary. A partial sweep that's reported as complete is worse than\nno sweep, because it stops anyone from looking further.\n\n**Don't double-do work.** Once you've delegated a search, don't also run it\nyourself — wait for the result. And keep nesting shallow: agents spawning agents\nspawning agents multiplies coordination cost and makes failures opaque. Prefer a\nflat fan-out with one orchestrator unless depth is truly warranted.\n\n---\n\n## Orchestration patterns\n\nPick by task; compose freely. Sketches and when-to-use notes for each are in\n**`references/orchestration-patterns.md`** — read it when you're designing a\nworkflow with more than one stage.\n\n| Pattern | Use it when |\n|---|---|\n| **Fan-out / map** | Independent tasks; you want all results collected. |\n| **Pipeline** | Multi-stage work; stages shouldn't block each other. |\n| **Adversarial verify** | A finding/plan must survive skeptics before you act. |\n| **Perspective-diverse verify** | A claim can fail multiple ways — give each verifier a distinct lens. |\n| **Judge panel** | Wide solution space; generate N approaches, score, synthesize. |\n| **Loop-until-dry** | Unknown-size discovery; stop after K empty rounds. |\n| **Multi-modal sweep** | One search angle won't find everything; search several ways at once. |\n| **Completeness critic** | Final pass asks \"what's missing?\" → seeds the next round. |\n| **Orchestrator-worker** | Planner decomposes, workers execute, planner synthesizes. |\n\nScale to the request: \"quick check\" → a few finders, single-vote verify.\n\"Be thorough / audit this\" → larger pool, 3–5 vote adversarial pass, a synthesis\nstage.\n\n---\n\n## Writing the sub-agent prompt\n\nA sub-agent's output is only as good as how completely you briefed it. A strong\nprompt has, in roughly this order: **task** (one line), **context** (everything\nit needs, since it has none), **inputs** (paths, scope, data), **constraints**\n(what *not* to touch or assume), **definition of done**, **return format**\n(explicit), and an **effort dial** (e.g. \"medium exploration\" vs. \"exhaustive\").\n\nFull guidance: `references/writing-subagent-prompts.md`.\nCopy-paste starting point: `assets/subagent-prompt-template.md`.\n\n---\n\n## Authoring reusable agent definitions\n\nWhen the same kind of sub-agent recurs — a code reviewer, a security auditor,\na docs explorer — promote it from an ad-hoc prompt to a **named agent\ndefinition** the harness can select automatically. The four things that make a\ngood definition:\n\n- **description** — this is the *trigger*. State precisely when this agent\n  should be chosen and when it shouldn't, since that's what the orchestrator\n  matches against.\n- **system prompt** — persona, methodology, and the output contract it always\n  honors.\n- **tool scoping** — least privilege. A read-only reviewer should not hold\n  `Write`/`Edit`; a search agent doesn't need shell access. Narrow tools make\n  the agent safer and more focused.\n- **model** — match capability to job. A cheap, fast model for mechanical\n  fan-out; a strong model for judgment, synthesis, or adversarial work.\n\nFull guidance: `references/authoring-agent-definitions.md`.\nTemplate: `assets/agent-definition-template.md`.\nOrchestration-script scaffold (for harnesses with a workflow runner):\n`assets/workflow-script-template.js`.\n\n---\n\n## Worked examples\n\n**Delegate — broad sweep, small payload.**\n> *\"Where do we read AWS credentials anywhere in this repo?\"*\nSpawn one exploration sub-agent: *\"Search the entire repo for where AWS\ncredentials are read (env vars, config files, SDK calls, hardcoded keys). Return\na list of `file:line → how it's accessed`. Medium-thorough. Your output is\nconsumed programmatically — just the list, no preamble.\"* You get a map; your\ncontext stays clean.\n\n**Don't delegate — known target.**\n> *\"Rename `getUser` to `fetchUser` in `src/api/user.ts`.\"*\nYou know the file. Read and edit it inline. Spawning an agent here is pure\noverhead.\n\n**Delegate in parallel, then verify — a review.**\n> *\"Review the 6 files in this diff for bugs.\"*\nPipeline: one reviewer per file (fan-out), and as each review lands, spawn a\nskeptic to adversarially verify its findings before you trust them. File 1's\nfindings get verified while file 5 is still under review — no wasted wall-clock.\nCollect confirmed findings, then relay them to the user.\n\n**Don't delegate — tight dependency.**\n> *\"Debug why this function returns undefined, then fix it.\"*\nThe fix depends on what you learn while debugging, which depends on what the fix\nreveals. Keep it inline; you need the details live, not a summary.\n\n---\n\n## Anti-patterns to avoid\n\n- **Spawn-and-also-do-it-yourself.** Delegating a search and then running it\n  inline anyway. Wait for the result.\n- **Under-briefed prompts.** Forcing the sub-agent to guess paths, scope, or\n  intent it has no way to know.\n- **Treating chatty prose as the answer.** Extract the data; don't paste the\n  sub-agent's conversational reply at the user.\n- **Over-decomposition.** Twenty agents for a three-file change.\n- **Deep nesting by default.** Agents spawning agents spawning agents when a\n  flat fan-out would do.\n- **Forgetting the user is blind to it.** The sub-agent's output went to you,\n  not them — summarize the outcome.\n- **Silent caps.** Reporting a sampled or top-N sweep as if it were exhaustive.\n\n## Token-efficient Codex mini delegation\n\nWhen a task can be split into independent review, research, or implementation lanes, prefer small focused subagents over one long monolithic reasoning thread. For Hermes-based delegation in this environment, use OpenAI Codex `gpt-5.4-mini` with extra-high reasoning for child agents when available, then merge only their final findings back into the parent context.\n\nUse mini-subagents for:\n\n- parallel repository review where each child owns a bounded file set;\n- independent source gathering before a synthesis step;\n- test/log triage where noisy command output would otherwise flood the parent context;\n- second-pass review of a diff before push.\n\nDo not spawn subagents for single command lookups, small edits, or tasks that require user interaction. Pass exact paths, constraints, output language, and verification requirements in the child prompt. Require children to return file paths, command outputs, URLs, or IDs that the parent can verify before reporting success.\n",
    "files": [
      {
        "path": "assets/agent-definition-template.md",
        "size": 1467,
        "sha256": "3c6591549816debc2ff7132483183d661a5f73f344b505a6ff8eb25f638caecb",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "assets/subagent-prompt-template.md",
        "size": 1273,
        "sha256": "d2b8043460f2bb0e242821bcc28ef3b57a776121ab4f43716daefcc8de8a0328",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "assets/workflow-script-template.js",
        "size": 3496,
        "sha256": "7b86a3226244ef84202081b74fdf2e22e75783f23142c023252efce5e11d32a5",
        "executable": true,
        "contentType": "text/plain; charset=utf-8"
      },
      {
        "path": "index.md",
        "size": 226,
        "sha256": "46cfb5f342a359ffbab651f531ed854aefed45adabc20506cd377ddd2121c514",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "LICENSE.txt",
        "size": 1066,
        "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
        "executable": false,
        "contentType": "text/plain; charset=utf-8"
      },
      {
        "path": "references/authoring-agent-definitions.md",
        "size": 5530,
        "sha256": "3b77f9e3a23d1a767e5ab6e28c04239b1aa32f63565f492c6513f2d1ddaabd5b",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/orchestration-patterns.md",
        "size": 7772,
        "sha256": "9939b453d9492944ce764f1e79ccbb2326f5bdfda2beb1379928c65a6770221a",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/writing-subagent-prompts.md",
        "size": 4843,
        "sha256": "000ffb537237f57c2c5ab945d3c71a8a3751f4daa524246593fc52f4f3f25b22",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "SKILL.md",
        "size": 12439,
        "sha256": "31f1f4b591a465ac1ba5fffa9a33bee7a8736e6ec2dfb94eced198710ea2ed7e",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      }
    ],
    "tree_hash": "e22992cce8edbf1f04abc520b4d829ac91283932963d3de92d7776a3b3afe514",
    "storage_backend": "blob",
    "has_executable": true,
    "security_scan": {
      "verdict": "review",
      "risk": "low",
      "findings": [],
      "truncated": false,
      "scanned_at": "2026-06-25T07:12:35.815Z",
      "model": "google/gemini-2.5-flash-lite",
      "rubric_version": "v1",
      "scan_source": "model",
      "generated_by_model": true,
      "advisory": true
    },
    "signals": [
      {
        "id": "ai_scan",
        "label": "AI security scan",
        "scope": "skill",
        "status": "pass",
        "detail": "Advisory scan completed with no concrete findings."
      },
      {
        "id": "registered",
        "label": "On-chain identity",
        "scope": "author",
        "status": "pass",
        "detail": "Author is registered on-chain."
      },
      {
        "id": "vouched",
        "label": "Vouched by others",
        "scope": "author",
        "status": "pass",
        "detail": "Other accounts have staked USDC vouching for this author."
      },
      {
        "id": "author_bonded",
        "label": "Author bond",
        "scope": "author",
        "status": "pass",
        "detail": "Author posted a USDC self-bond (skin in the game)."
      },
      {
        "id": "dispute_free",
        "label": "Dispute history",
        "scope": "author",
        "status": "pass",
        "detail": "No disputes against this author."
      }
    ],
    "versions": [
      {
        "id": "90b7f9ed-7738-406d-8e31-451ad3858ade",
        "files": [
          {
            "path": "assets/agent-definition-template.md",
            "size": 1467,
            "sha256": "3c6591549816debc2ff7132483183d661a5f73f344b505a6ff8eb25f638caecb",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "assets/subagent-prompt-template.md",
            "size": 1273,
            "sha256": "d2b8043460f2bb0e242821bcc28ef3b57a776121ab4f43716daefcc8de8a0328",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "assets/workflow-script-template.js",
            "size": 3496,
            "sha256": "7b86a3226244ef84202081b74fdf2e22e75783f23142c023252efce5e11d32a5",
            "executable": true,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "index.md",
            "size": 226,
            "sha256": "46cfb5f342a359ffbab651f531ed854aefed45adabc20506cd377ddd2121c514",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "LICENSE.txt",
            "size": 1066,
            "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
            "executable": false,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "references/authoring-agent-definitions.md",
            "size": 5530,
            "sha256": "3b77f9e3a23d1a767e5ab6e28c04239b1aa32f63565f492c6513f2d1ddaabd5b",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/orchestration-patterns.md",
            "size": 7772,
            "sha256": "9939b453d9492944ce764f1e79ccbb2326f5bdfda2beb1379928c65a6770221a",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/writing-subagent-prompts.md",
            "size": 4843,
            "sha256": "000ffb537237f57c2c5ab945d3c71a8a3751f4daa524246593fc52f4f3f25b22",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 12439,
            "sha256": "31f1f4b591a465ac1ba5fffa9a33bee7a8736e6ec2dfb94eced198710ea2ed7e",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 3,
        "ipfs_cid": null,
        "changelog": "Synced from dirtybits/agent-skills",
        "tree_hash": "e22992cce8edbf1f04abc520b4d829ac91283932963d3de92d7776a3b3afe514",
        "created_at": "2026-06-25T07:12:34.500952+00:00",
        "has_executable": true,
        "storage_backend": "blob"
      },
      {
        "id": "c4d2567d-164b-498d-abd6-5f6a2bfbeb13",
        "files": [
          {
            "path": "assets/agent-definition-template.md",
            "size": 1467,
            "sha256": "3c6591549816debc2ff7132483183d661a5f73f344b505a6ff8eb25f638caecb",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "assets/subagent-prompt-template.md",
            "size": 1273,
            "sha256": "d2b8043460f2bb0e242821bcc28ef3b57a776121ab4f43716daefcc8de8a0328",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "assets/workflow-script-template.js",
            "size": 3496,
            "sha256": "7b86a3226244ef84202081b74fdf2e22e75783f23142c023252efce5e11d32a5",
            "executable": true,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "index.md",
            "size": 169,
            "sha256": "bce0ac86fe96bd63301bff7a9436fefe984d7cacc456fcfeee6b35357c5c9e9f",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/authoring-agent-definitions.md",
            "size": 5530,
            "sha256": "3b77f9e3a23d1a767e5ab6e28c04239b1aa32f63565f492c6513f2d1ddaabd5b",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/orchestration-patterns.md",
            "size": 7772,
            "sha256": "9939b453d9492944ce764f1e79ccbb2326f5bdfda2beb1379928c65a6770221a",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/writing-subagent-prompts.md",
            "size": 4843,
            "sha256": "000ffb537237f57c2c5ab945d3c71a8a3751f4daa524246593fc52f4f3f25b22",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 11437,
            "sha256": "077b8ab430f523df543055dc76067f836207cb87c353afc41c956a8bcda41d8a",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 2,
        "ipfs_cid": null,
        "changelog": "Synced from dirtybits/agent-skills",
        "tree_hash": "f6c04eb25f8dfa40a556929b89efa756af674df47d658d304cbfb3e517fabfc0",
        "created_at": "2026-06-23T07:04:09.470214+00:00",
        "has_executable": true,
        "storage_backend": "blob"
      },
      {
        "id": "97b347c6-1b14-4128-9890-80c02fbefd98",
        "files": [
          {
            "path": "assets/agent-definition-template.md",
            "size": 1467,
            "sha256": "3c6591549816debc2ff7132483183d661a5f73f344b505a6ff8eb25f638caecb",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "assets/subagent-prompt-template.md",
            "size": 1273,
            "sha256": "d2b8043460f2bb0e242821bcc28ef3b57a776121ab4f43716daefcc8de8a0328",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "assets/workflow-script-template.js",
            "size": 3496,
            "sha256": "7b86a3226244ef84202081b74fdf2e22e75783f23142c023252efce5e11d32a5",
            "executable": true,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "references/authoring-agent-definitions.md",
            "size": 5113,
            "sha256": "092e28e8bf02ee83c7e8bcde811c3d5f41340b995f9606f7508fae1a68747b88",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/orchestration-patterns.md",
            "size": 7365,
            "sha256": "9508e6a100cb5d120829d5f402696bb8670087c86b7ae6f0b99d4af7ba16063c",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/writing-subagent-prompts.md",
            "size": 4432,
            "sha256": "edb68a3705f6b6e29059854420456e85d19a053ae66ad1b14ad666ec59276a3c",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 11795,
            "sha256": "a8c9efa3bbbbfb94821adb3b18329b457a7c386d0219c6e806115142f2e69d54",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 1,
        "ipfs_cid": null,
        "changelog": "Initial release",
        "tree_hash": "7d51c362584a3603c2f1bc331db7740f079d91dffcf1feb303a28f52917b362d",
        "created_at": "2026-06-15T22:33:37.78202+00:00",
        "has_executable": true,
        "storage_backend": "blob"
      }
    ],
    "author_trust": {
      "isRegistered": true,
      "registeredAt": 1779082335,
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "totalStakeAtRisk": 24250000,
      "authorBondUsdcMicros": 7250000,
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_trust_summary": {
      "username": "wallet-z7wzgw",
      "github_url": "https://github.com/dirtybits",
      "display_name": null,
      "github_login": "dirtybits",
      "isRegistered": true,
      "registeredAt": 1779082335,
      "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "wallet_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "schema_version": "2026-04-03",
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "trust_updated_at": "2026-09-22T04:52:30.978Z",
      "canonical_agent_id": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "recommended_action": "allow",
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_identity": {
      "id": "1f84a1fd-7c81-4925-9ea7-7b0ba6609697",
      "canonicalAgentId": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "identitySource": "local",
      "homeChainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "status": "active",
      "displayName": null,
      "username": "wallet-z7wzgw",
      "usernameSource": "fallback",
      "githubProfile": {
        "id": "28834908",
        "login": "dirtybits",
        "name": "andy",
        "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4",
        "url": "https://github.com/dirtybits"
      },
      "bindings": [
        {
          "id": "c11bf186-49aa-46d1-82a0-732d84071113",
          "metadata": null,
          "isPrimary": true,
          "bindingRef": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
          "bindingType": "wallet_owner",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "7ac9de7b-3020-4261-be2c-d7cbefa1d257",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "094fbb11-545b-41d7-b7e7-38d66a8c5fde",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "A4dgMn4WYSmFdisAkpKzFwUcLsPr4fBJU5nbKQHWHgeA",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "147b59b5-fb6f-4901-ad99-8fa8f742f4af",
          "metadata": {
            "id": "28834908",
            "url": "https://github.com/dirtybits",
            "name": "andy",
            "login": "dirtybits",
            "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4"
          },
          "isPrimary": false,
          "bindingRef": "github:28834908",
          "bindingType": "github_profile",
          "chainContext": "github",
          "externalAgentId": "28834908",
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        }
      ],
      "ownerWallet": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "operationalWallet": null,
      "agentProfilePda": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
      "registryAsset": null
    },
    "buyerHasPurchased": false,
    "buyerPurchaseSummary": null,
    "content_verification": {
      "has_ipfs": false,
      "all_versions_pinned": false,
      "current_cid_consistent": true,
      "status": "unverified"
    },
    "priceDisclosure": null,
    "purchaseRiskWarning": null
  },
  {
    "id": "928e765a-56f5-4f60-80c0-f5ae55207a14",
    "skill_id": "skills-organization",
    "public_slug": "skills-organization",
    "public_author_slug": "wallet-asuavudg",
    "author_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "author_kind": "wallet",
    "author_external_id": null,
    "author_handle": null,
    "author_display_name": null,
    "publisher_identity_key": "wallet:asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "publisher_tier": "registered",
    "mirror_source_key": null,
    "synced_repo_url": "https://github.com/dirtybits/agent-skills",
    "name": "Skills Organization",
    "description": "Organize and synchronize local agent skill directories across Codex, Claude, Cursor, Hermes, OpenClaw, and other agent tools. Use when the user asks to audit, mirror, link, migrate, or reconcile skill folders such as ~/.agents/skills, ~/.codex/skills, ~/.c",
    "tags": [
      "skills",
      "organization",
      "workflow"
    ],
    "current_version": 6,
    "summary": "Organize and synchronize local agent skill directories across multiple tools.",
    "summary_model": "google/gemini-2.5-flash-lite",
    "summary_sha256": "89ee939a65e04d6522043bcabe57e73f5d99640713b347247c8f7138528063c1",
    "summary_capabilities": [
      "Synchronize skill directories",
      "Audit skill folders",
      "Mirror skills",
      "Reconcile directories"
    ],
    "ipfs_cid": null,
    "on_chain_address": null,
    "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
    "evm_listing_id": null,
    "evm_contract_address": null,
    "evm_tx_hash": null,
    "total_installs": 15,
    "price_usdc_micros": null,
    "currency_mint": null,
    "on_chain_protocol_version": null,
    "on_chain_program_id": null,
    "contact": "https://github.com/dirtybits/agent-skills/tree/main/skills/skills-organization",
    "created_at": "2026-06-10T23:31:14.623Z",
    "updated_at": "2026-09-06T03:03:11.038Z",
    "source": "repo",
    "payment_flow": "free",
    "content": "---\ntype: Skill\nname: skills-organization\ntitle: \"Skills Organization\"\ndescription: Organize and synchronize local agent skill directories across Codex, Claude, Cursor, Hermes, OpenClaw, and other agent tools. Use when the user asks to audit, mirror, link, migrate, or reconcile skill folders such as ~/.agents/skills, ~/.codex/skills, ~/.claude/skills, ~/.cursor/skills, ~/.hermes/skills, ~/.openclaw/skills, or tool-specific skill directories.\nresource: \"https://github.com/dirtybits/agent-skills/tree/main/skills/skills-organization\"\ntags: [\"skills\", \"organization\", \"workflow\"]\ntimestamp: \"2026-06-22T19:13:38Z\"\nokf_version: \"0.1\"\nlicense: MIT\n---\n\n# Skills Organization\n\nUse this skill when keeping local agent skill folders aligned across tools. Treat it as a power-user local workflow: audit first, explain the isolation tradeoffs, then make writes only after the user approves the exact paths.\n\n## Core Stance\n\n- Treat `~/.agents/skills` as the canonical source of truth for personal/shared skills.\n- Mirror an agent tool's normal `skills` path to the canonical root with a directory symlink only when the user intentionally wants shared cross-agent skills.\n- Prefer a hub-and-spoke layout over cross-linking every directory to every other directory.\n- Do not blindly import product-managed, vendor-managed, plugin-cache, backup, or bundled skill directories.\n- Shared storage does not guarantee shared compatibility. Codex, Claude, Cursor, Hermes, OpenClaw, and other tools may expect different skill schemas, frontmatter, file layouts, or install metadata.\n- Preserve anything you replace. Move real directories to timestamped backups before creating symlinks.\n\n## Hermes Profile Warning\n\nHermes can use both the active-profile skills path and named profile skill directories:\n\n- Active profile: `~/.hermes/skills`\n- Named profiles: `~/.hermes/profiles/<profile>/skills`\n\nOnly link `~/.hermes/skills` if the user explicitly wants the active Hermes profile to share the common skill set. Do not symlink `~/.hermes/profiles/*/skills` automatically. Profile directories can represent intentionally isolated contexts, and flattening them into `~/.agents/skills` can make skills from one context bleed into another.\n\nIf the user wants Hermes integration but not shared storage, prefer normal Hermes skill install or management commands and leave profile-specific directories alone.\n\n## Why Not Cross-Link Everything?\n\nIf `~/.codex/skills`, `~/.claude/skills`, and `~/.cursor/skills` are symlinks to `~/.agents/skills`, then adding a skill through any of those paths already lands in the shared directory. A mesh of symlinks between tool directories is harder to reason about, easier to loop, and offers no practical benefit over one canonical target.\n\nUse this model instead:\n\n```text\n~/.agents/skills\n  ^-- ~/.codex/skills\n  ^-- ~/.claude/skills\n  ^-- ~/.cursor/skills\n  ^-- ~/.hermes/skills\n  ^-- ~/.openclaw/skills\n  ^-- any other personal agent skills path\n```\n\n## Audit Workflow\n\nThis phase is inventory only. Do not write, move, copy, or link anything yet.\n\n1. Inventory the expected paths:\n\n```bash\nfor d in \"$HOME/.agents/skills\" \"$HOME/.codex/skills\" \"$HOME/.claude/skills\" \"$HOME/.cursor/skills\" \"$HOME/.hermes/skills\" \"$HOME/.openclaw/skills\"; do\n  ls -ld \"$d\" 2>/dev/null || true\n  readlink \"$d\" 2>/dev/null || true\ndone\n```\n\n2. Confirm the canonical root exists and contains the expected personal skills:\n\n```bash\nfind \"$HOME/.agents/skills\" -maxdepth 2 -name SKILL.md -print | sort\n```\n\n3. Check for non-canonical directories that might contain personal skills:\n\n```bash\nfor root in \"$HOME/.codex\" \"$HOME/.claude\" \"$HOME/.cursor\" \"$HOME/.hermes\" \"$HOME/.openclaw\"; do\n  [ -d \"$root\" ] && find \"$root\" -maxdepth 2 -type d -name skills -print\ndone\n```\n\n4. Check for Hermes profile-specific skill folders without modifying them:\n\n```bash\nfind \"$HOME/.hermes/profiles\" -maxdepth 3 -type d -name skills -print 2>/dev/null || true\n```\n\n5. Check for obvious symlink loop hazards before proposing links:\n\n```bash\ncanonical=\"$(cd \"$HOME/.agents/skills\" 2>/dev/null && pwd -P)\" || canonical=\"\"\nfor d in \"$HOME/.codex/skills\" \"$HOME/.claude/skills\" \"$HOME/.cursor/skills\" \"$HOME/.hermes/skills\" \"$HOME/.openclaw/skills\"; do\n  consumer_parent=\"$(cd \"$(dirname \"$d\")\" 2>/dev/null && pwd -P)\" || consumer_parent=\"\"\n  printf '%s\\n  canonical=%s\\n  consumer_parent=%s\\n' \"$d\" \"$canonical\" \"$consumer_parent\"\ndone\n```\n\nDo not link a consumer path if the canonical root is inside that consumer path, if the consumer path is inside the canonical root, or if either path resolves through the other.\n\n6. Classify each path:\n\n- Symlink to `~/.agents/skills`: already aligned.\n- Missing path: create a symlink if the tool expects that path.\n- Real directory with personal skills: reconcile into `~/.agents/skills`, back up the directory, then replace it with a symlink.\n- Symlink elsewhere: inspect before changing.\n- Vendor/product/cache directory: leave alone unless the user explicitly asks to import from it.\n\n7. Present the intended write plan and ask the user to approve it before continuing.\n\n## Reconcile Workflow\n\nWhen a consumer path is a real directory instead of a symlink:\n\n1. List its skills with `find <path> -maxdepth 2 -name SKILL.md -print`.\n2. For each skill folder, compare against `~/.agents/skills/<skill-name>`.\n3. If the skill is missing from the canonical root, preview the copy first, preserving file metadata.\n4. If the skill exists in both places, run `diff -ru` and show conflicts to the user. Do not choose silently.\n5. Move the original directory to `skills.pre-mirror-backup-YYYYMMDD-HHMMSS`.\n6. Create the symlink to `~/.agents/skills`.\n\nDry-run examples:\n\n```bash\nrsync -a --dry-run \"$HOME/.openclaw/skills/example-skill/\" \"$HOME/.agents/skills/example-skill/\"\ndiff -ru \"$HOME/.openclaw/skills/example-skill\" \"$HOME/.agents/skills/example-skill\"\n```\n\nWrite-phase example after user approval, for a target confirmed to be missing:\n\n```bash\nset -e\nsource_skill=\"$HOME/.openclaw/skills/example-skill\"\ntarget_skill=\"$HOME/.agents/skills/example-skill\"\ntest ! -e \"$target_skill\" || {\n  printf 'Target exists; stop and run diff -ru before writing: %s\\n' \"$target_skill\" >&2\n  exit 1\n}\ncp -a \"$source_skill\" \"$target_skill\"\nbackup=\"$HOME/.openclaw/skills.pre-mirror-backup-$(date +%Y%m%d-%H%M%S)\"\nmv \"$HOME/.openclaw/skills\" \"$backup\"\nln -s \"$HOME/.agents/skills\" \"$HOME/.openclaw/skills\"\n```\n\nOnly run write commands after confirming the source, target, and backup paths are correct.\n\n## Collision Policy\n\n- The canonical root wins by default, but never overwrite a conflicting skill without user approval.\n- Identical duplicates can be treated as already reconciled.\n- If two folders share a name but have different content, preserve both by copying the non-canonical copy to a temporary comparison or backup location and ask the user which version should become canonical.\n- Do not delete backups as part of the sync task unless explicitly requested.\n\n## Verification\n\nAfter making changes:\n\n```bash\nreadlink \"$HOME/.codex/skills\" \"$HOME/.claude/skills\" \"$HOME/.cursor/skills\" \"$HOME/.hermes/skills\" \"$HOME/.openclaw/skills\" 2>/dev/null || true\nfind \"$HOME/.agents/skills\" -maxdepth 2 -name SKILL.md -print | sort\n```\n\nThe expected result is that every personal agent `skills` path resolves to `~/.agents/skills`, and the canonical root contains the skills the user expects.\n\nFor a stronger check, create a temporary test folder only if the user agrees, then verify it appears through every symlinked path and remove the temporary folder afterward.\n\n## Safety Rules\n\n- Do not use `rm -rf` for reconciliation. Move to backups instead.\n- Do not merge `skills.pre-mirror-backup-*` folders back into source automatically.\n- Do not sync plugin caches, bundled runtime skills, marketplace/vendor checkouts, or Cursor's `skills-cursor` directory unless the user specifically asks.\n- Do not symlink Hermes named profile skill directories automatically.\n- Prefer each tool's native install or management flow when the user wants tool-specific skills instead of shared cross-agent skills.\n- Keep commands readable and inspectable; this task is about preserving local workflow state, not being clever.\n\n## Example Observed State\n\nThe following is an example from one machine on 2026-06-11, not a source of truth. Verify the current machine before acting and do not over-weight stale observations.\n\n- `~/.codex/skills -> ~/.agents/skills`\n- `~/.claude/skills -> ~/.agents/skills`\n- `~/.cursor/skills -> ~/.agents/skills`\n- `~/.hermes/skills` was not present on that machine; if Hermes is installed, audit it before linking it to `~/.agents/skills`.\n- `~/.openclaw/skills` was present as a real directory on that machine; audit and reconcile it before replacing it with a symlink.\n- `~/.cursor/skills-cursor` is a separate Cursor-managed skill directory; do not merge it automatically.\n- `~/.codex/vendor_imports/skills` is a vendor import checkout; do not merge it automatically.\n- `~/.agent/skills` was not present on that machine; if it exists elsewhere, audit it before using it.\n\n## License hygiene\n\nEvery skill package should carry an explicit reusable license. Prefer a repository-level `LICENSE` plus a per-skill `LICENSE.txt` when skills may be copied independently. Keep registry `license` fields and `SKILL.md` frontmatter aligned so publishing, installing, and marketplace indexing do not disagree. If a skill is mirrored from a third party, preserve its original license and attribution instead of rewriting it as authored work.\n",
    "files": [
      {
        "path": "index.md",
        "size": 156,
        "sha256": "5ae23c200493f6485a37f3cc7c7cb9eb867efeeace9e6812a5deb2c805759de3",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "LICENSE.txt",
        "size": 1066,
        "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
        "executable": false,
        "contentType": "text/plain; charset=utf-8"
      },
      {
        "path": "SKILL.md",
        "size": 9555,
        "sha256": "89ee939a65e04d6522043bcabe57e73f5d99640713b347247c8f7138528063c1",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      }
    ],
    "tree_hash": "4b687d7734c5f0dc072a110c34182c233e1d7a53d4ac48222f151d4c658a217b",
    "storage_backend": "blob",
    "has_executable": false,
    "security_scan": {
      "verdict": "review",
      "risk": "low",
      "findings": [],
      "truncated": false,
      "scanned_at": "2026-06-25T07:12:31.736Z",
      "model": "google/gemini-2.5-flash-lite",
      "rubric_version": "v1",
      "scan_source": "model",
      "generated_by_model": true,
      "advisory": true
    },
    "signals": [
      {
        "id": "ai_scan",
        "label": "AI security scan",
        "scope": "skill",
        "status": "pass",
        "detail": "Advisory scan completed with no concrete findings."
      },
      {
        "id": "registered",
        "label": "On-chain identity",
        "scope": "author",
        "status": "pass",
        "detail": "Author is registered on-chain."
      },
      {
        "id": "vouched",
        "label": "Vouched by others",
        "scope": "author",
        "status": "pass",
        "detail": "Other accounts have staked USDC vouching for this author."
      },
      {
        "id": "author_bonded",
        "label": "Author bond",
        "scope": "author",
        "status": "pass",
        "detail": "Author posted a USDC self-bond (skin in the game)."
      },
      {
        "id": "dispute_free",
        "label": "Dispute history",
        "scope": "author",
        "status": "pass",
        "detail": "No disputes against this author."
      }
    ],
    "versions": [
      {
        "id": "bc202175-dcd9-4eec-8322-964d23f02f81",
        "files": [
          {
            "path": "index.md",
            "size": 156,
            "sha256": "5ae23c200493f6485a37f3cc7c7cb9eb867efeeace9e6812a5deb2c805759de3",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "LICENSE.txt",
            "size": 1066,
            "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
            "executable": false,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 9555,
            "sha256": "89ee939a65e04d6522043bcabe57e73f5d99640713b347247c8f7138528063c1",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 6,
        "ipfs_cid": null,
        "changelog": "Synced from dirtybits/agent-skills",
        "tree_hash": "4b687d7734c5f0dc072a110c34182c233e1d7a53d4ac48222f151d4c658a217b",
        "created_at": "2026-06-25T07:12:30.875283+00:00",
        "has_executable": false,
        "storage_backend": "blob"
      },
      {
        "id": "00457849-298f-4357-b224-d4b3f54b4155",
        "files": [
          {
            "path": "index.md",
            "size": 99,
            "sha256": "fb1eb5b8e29ce91dbfa53f4489838596f8ce41663b532a5d698603be1cb1ecbc",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 9114,
            "sha256": "dc84c8054ef85e8d47ef3d09160328ed88bf334bb471eb4de1542a84f36569e5",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 5,
        "ipfs_cid": null,
        "changelog": "Synced from dirtybits/agent-skills",
        "tree_hash": "2c03ba9530fd2e8c96e82e7f7d5f431e8938066704c2131308e28371f35a7210",
        "created_at": "2026-06-23T07:04:08.025116+00:00",
        "has_executable": false,
        "storage_backend": "blob"
      },
      {
        "id": "4e32f4a5-6c5d-4a28-afa8-cb87491be49a",
        "files": [
          {
            "path": "SKILL.md",
            "size": 8854,
            "sha256": "b5e215433e008deb3a747cda6a40787d8034138b87006fc0beb483f2d7c70c37",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 4,
        "ipfs_cid": null,
        "changelog": "Make write-phase copy example fail closed on existing targets.",
        "tree_hash": "91e6e3d1fa89b4ed4f522a8cb94ee15a8bc2628c3da559bbcb2871bebb93ee04",
        "created_at": "2026-06-11T21:14:41.531729+00:00",
        "has_executable": false,
        "storage_backend": "blob"
      },
      {
        "id": "826e70ee-b4ad-494b-8bc3-36ca65d4e311",
        "files": [
          {
            "path": "SKILL.md",
            "size": 8607,
            "sha256": "d5ef298fb31b95bf7a0893a9300db5ac58548aef36f799c14ceea3fc9c3457e3",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 3,
        "ipfs_cid": null,
        "changelog": "Add Hermes profile isolation warning and safer reconciliation workflow.",
        "tree_hash": "e7fbe636971f068b3f291d0a30ccdbc0918d64388cf4a9900aee6d2845309231",
        "created_at": "2026-06-11T21:10:35.958328+00:00",
        "has_executable": false,
        "storage_backend": "blob"
      },
      {
        "id": "cecefbac-746f-41be-b19c-8d6593c7ae32",
        "files": [
          {
            "path": "SKILL.md",
            "size": 5794,
            "sha256": "715434489a18f5c61c5ca124b35b3ce806d467bd8e9f838a31254aba805cfeaa",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 2,
        "ipfs_cid": null,
        "changelog": "Add OpenClaw ~/.openclaw/skills harness path.",
        "tree_hash": "69199c3777b0452019600a2004a05f2fc55e6ccd78b23a83a68a880966c92fd5",
        "created_at": "2026-06-11T20:52:47.138988+00:00",
        "has_executable": false,
        "storage_backend": "blob"
      },
      {
        "id": "158c581f-6766-49f8-aa09-f578b2d5867e",
        "files": [
          {
            "path": "SKILL.md",
            "size": 5218,
            "sha256": "9622315364cf325074d417915a8794a39f0e6d7f0fb822c4d1071601f31dcd22",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 1,
        "ipfs_cid": null,
        "changelog": "Initial release",
        "tree_hash": "c2d131d289df3b2b8736aa4362d8a7170d258cefeb4bef5b1b746466533fc665",
        "created_at": "2026-06-10T23:31:14.752938+00:00",
        "has_executable": false,
        "storage_backend": "blob"
      }
    ],
    "author_trust": {
      "isRegistered": true,
      "registeredAt": 1779082335,
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "totalStakeAtRisk": 24250000,
      "authorBondUsdcMicros": 7250000,
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_trust_summary": {
      "username": "wallet-z7wzgw",
      "github_url": "https://github.com/dirtybits",
      "display_name": null,
      "github_login": "dirtybits",
      "isRegistered": true,
      "registeredAt": 1779082335,
      "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "wallet_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "schema_version": "2026-04-03",
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "trust_updated_at": "2026-09-22T04:52:30.978Z",
      "canonical_agent_id": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "recommended_action": "allow",
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_identity": {
      "id": "1f84a1fd-7c81-4925-9ea7-7b0ba6609697",
      "canonicalAgentId": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "identitySource": "local",
      "homeChainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "status": "active",
      "displayName": null,
      "username": "wallet-z7wzgw",
      "usernameSource": "fallback",
      "githubProfile": {
        "id": "28834908",
        "login": "dirtybits",
        "name": "andy",
        "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4",
        "url": "https://github.com/dirtybits"
      },
      "bindings": [
        {
          "id": "c11bf186-49aa-46d1-82a0-732d84071113",
          "metadata": null,
          "isPrimary": true,
          "bindingRef": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
          "bindingType": "wallet_owner",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "7ac9de7b-3020-4261-be2c-d7cbefa1d257",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "094fbb11-545b-41d7-b7e7-38d66a8c5fde",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "A4dgMn4WYSmFdisAkpKzFwUcLsPr4fBJU5nbKQHWHgeA",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "147b59b5-fb6f-4901-ad99-8fa8f742f4af",
          "metadata": {
            "id": "28834908",
            "url": "https://github.com/dirtybits",
            "name": "andy",
            "login": "dirtybits",
            "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4"
          },
          "isPrimary": false,
          "bindingRef": "github:28834908",
          "bindingType": "github_profile",
          "chainContext": "github",
          "externalAgentId": "28834908",
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        }
      ],
      "ownerWallet": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "operationalWallet": null,
      "agentProfilePda": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
      "registryAsset": null
    },
    "buyerHasPurchased": false,
    "buyerPurchaseSummary": null,
    "content_verification": {
      "has_ipfs": false,
      "all_versions_pinned": false,
      "current_cid_consistent": true,
      "status": "unverified"
    },
    "priceDisclosure": null,
    "purchaseRiskWarning": null
  },
  {
    "id": "b8924a01-b2b5-44e6-81ef-57c5268e8b6b",
    "skill_id": "agent-skills-tree-smoke-20260531-6748",
    "public_slug": "agent-skills-tree-smoke-20260531-6748",
    "public_author_slug": "wallet-asuavudg",
    "author_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "author_kind": "wallet",
    "author_external_id": null,
    "author_handle": null,
    "author_display_name": null,
    "publisher_identity_key": "wallet:asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "publisher_tier": "registered",
    "mirror_source_key": null,
    "synced_repo_url": null,
    "name": "Agent Skills Tree Smoke",
    "description": "End-to-end smoke fixture for publishing a full Agent Skills directory with scripts, references, assets, and a nested helper skill.",
    "tags": [
      "smoke",
      "agent-skills",
      "multi-file"
    ],
    "current_version": 1,
    "summary": "Tests AgentVouch directory operations using a benign smoke fixture.",
    "summary_model": "google/gemini-2.5-flash-lite",
    "summary_sha256": "218ba4484904ea13f50654cf9f0c3cae57414323aa9c7b9bc58216d5c8a1e5b6",
    "summary_capabilities": [
      "publish skills",
      "browse skills",
      "scan skills",
      "archive skills"
    ],
    "ipfs_cid": null,
    "on_chain_address": null,
    "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
    "evm_listing_id": null,
    "evm_contract_address": null,
    "evm_tx_hash": null,
    "total_installs": 10,
    "price_usdc_micros": null,
    "currency_mint": null,
    "on_chain_protocol_version": null,
    "on_chain_program_id": null,
    "contact": "AgentVouch smoke fixture",
    "created_at": "2026-05-31T07:46:28.107Z",
    "updated_at": "2026-05-31T07:46:28.107Z",
    "source": "repo",
    "payment_flow": "free",
    "content": "# Agent Skills Tree Smoke\n\nUse this smoke fixture to verify AgentVouch can publish, browse, scan, and archive a full Agent Skills directory.\n\n## Workflow\n\n1. Read references/agent-skills-overview.md for the source format note.\n2. Inspect scripts/run.sh before executing it.\n3. Treat skills/nested-helper/SKILL.md as a bundled helper skill example.\n\n## Safety\n\nThis fixture is intentionally benign. The script only prints a local message.",
    "files": [
      {
        "path": "assets/config.json",
        "size": 48,
        "sha256": "b53727570b41856ad0b29008682730b9a3db1782db0e355c3178301649936ed4",
        "executable": false,
        "contentType": "application/json; charset=utf-8"
      },
      {
        "path": "references/agent-skills-overview.md",
        "size": 186,
        "sha256": "246f39057230c8aa6781f8187e1a71acbe99c6efdb48e4296dfaa0650839b1cc",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "scripts/run.sh",
        "size": 56,
        "sha256": "038ae57900c04ee84a1abed98a42376c700e8912b25417e53c47746cb3502de8",
        "executable": true,
        "contentType": "text/plain; charset=utf-8"
      },
      {
        "path": "SKILL.md",
        "size": 437,
        "sha256": "218ba4484904ea13f50654cf9f0c3cae57414323aa9c7b9bc58216d5c8a1e5b6",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "skills/nested-helper/SKILL.md",
        "size": 132,
        "sha256": "ec65476841e95f95c0b6296a75452de32d1e9b95c83b8cfbc56cf6fc4d4cd4c1",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      }
    ],
    "tree_hash": "871593c3f92a883af7949293626256d433ba4f2787fe1831ca1296c7548e47ce",
    "storage_backend": "blob",
    "has_executable": true,
    "security_scan": {
      "verdict": "review",
      "risk": "low",
      "findings": [
        {
          "severity": "low",
          "category": "code-exec",
          "detail": "The script file is marked as executable. While this script is currently benign, it could be modified to execute arbitrary code.",
          "evidence": "#!/bin/sh\nset -eu",
          "file": "scripts/run.sh"
        }
      ],
      "truncated": false,
      "scanned_at": "2026-06-04T15:43:26.946Z",
      "model": "google/gemini-2.5-flash-lite",
      "rubric_version": "v1",
      "scan_source": "model",
      "generated_by_model": true,
      "advisory": true
    },
    "signals": [
      {
        "id": "ai_scan",
        "label": "AI security scan",
        "scope": "skill",
        "status": "warn",
        "detail": "Advisory scan completed with 1 finding(s) to review."
      },
      {
        "id": "registered",
        "label": "On-chain identity",
        "scope": "author",
        "status": "pass",
        "detail": "Author is registered on-chain."
      },
      {
        "id": "vouched",
        "label": "Vouched by others",
        "scope": "author",
        "status": "pass",
        "detail": "Other accounts have staked USDC vouching for this author."
      },
      {
        "id": "author_bonded",
        "label": "Author bond",
        "scope": "author",
        "status": "pass",
        "detail": "Author posted a USDC self-bond (skin in the game)."
      },
      {
        "id": "dispute_free",
        "label": "Dispute history",
        "scope": "author",
        "status": "pass",
        "detail": "No disputes against this author."
      }
    ],
    "versions": [
      {
        "id": "851c21ba-27b1-4467-b8f9-2f1cbbf3b4a3",
        "files": [
          {
            "path": "assets/config.json",
            "size": 48,
            "sha256": "b53727570b41856ad0b29008682730b9a3db1782db0e355c3178301649936ed4",
            "executable": false,
            "contentType": "application/json; charset=utf-8"
          },
          {
            "path": "references/agent-skills-overview.md",
            "size": 186,
            "sha256": "246f39057230c8aa6781f8187e1a71acbe99c6efdb48e4296dfaa0650839b1cc",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "scripts/run.sh",
            "size": 56,
            "sha256": "038ae57900c04ee84a1abed98a42376c700e8912b25417e53c47746cb3502de8",
            "executable": true,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 437,
            "sha256": "218ba4484904ea13f50654cf9f0c3cae57414323aa9c7b9bc58216d5c8a1e5b6",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "skills/nested-helper/SKILL.md",
            "size": 132,
            "sha256": "ec65476841e95f95c0b6296a75452de32d1e9b95c83b8cfbc56cf6fc4d4cd4c1",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 1,
        "ipfs_cid": null,
        "changelog": "Initial release",
        "tree_hash": "871593c3f92a883af7949293626256d433ba4f2787fe1831ca1296c7548e47ce",
        "created_at": "2026-05-31T07:46:28.178721+00:00",
        "has_executable": true,
        "storage_backend": "blob"
      }
    ],
    "author_trust": {
      "isRegistered": true,
      "registeredAt": 1779082335,
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "totalStakeAtRisk": 24250000,
      "authorBondUsdcMicros": 7250000,
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_trust_summary": {
      "username": "wallet-z7wzgw",
      "github_url": "https://github.com/dirtybits",
      "display_name": null,
      "github_login": "dirtybits",
      "isRegistered": true,
      "registeredAt": 1779082335,
      "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "wallet_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "schema_version": "2026-04-03",
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "trust_updated_at": "2026-09-22T04:52:30.978Z",
      "canonical_agent_id": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "recommended_action": "allow",
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_identity": {
      "id": "1f84a1fd-7c81-4925-9ea7-7b0ba6609697",
      "canonicalAgentId": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "identitySource": "local",
      "homeChainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "status": "active",
      "displayName": null,
      "username": "wallet-z7wzgw",
      "usernameSource": "fallback",
      "githubProfile": {
        "id": "28834908",
        "login": "dirtybits",
        "name": "andy",
        "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4",
        "url": "https://github.com/dirtybits"
      },
      "bindings": [
        {
          "id": "c11bf186-49aa-46d1-82a0-732d84071113",
          "metadata": null,
          "isPrimary": true,
          "bindingRef": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
          "bindingType": "wallet_owner",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "7ac9de7b-3020-4261-be2c-d7cbefa1d257",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "094fbb11-545b-41d7-b7e7-38d66a8c5fde",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "A4dgMn4WYSmFdisAkpKzFwUcLsPr4fBJU5nbKQHWHgeA",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "147b59b5-fb6f-4901-ad99-8fa8f742f4af",
          "metadata": {
            "id": "28834908",
            "url": "https://github.com/dirtybits",
            "name": "andy",
            "login": "dirtybits",
            "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4"
          },
          "isPrimary": false,
          "bindingRef": "github:28834908",
          "bindingType": "github_profile",
          "chainContext": "github",
          "externalAgentId": "28834908",
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        }
      ],
      "ownerWallet": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "operationalWallet": null,
      "agentProfilePda": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
      "registryAsset": null
    },
    "buyerHasPurchased": false,
    "buyerPurchaseSummary": null,
    "content_verification": {
      "has_ipfs": false,
      "all_versions_pinned": false,
      "current_cid_consistent": true,
      "status": "unverified"
    },
    "priceDisclosure": null,
    "purchaseRiskWarning": null
  },
  {
    "id": "b9d3f773-a8ca-409b-a91b-bc2c7e7c0b50",
    "skill_id": "ethereum-development",
    "public_slug": "ethereum-development",
    "public_author_slug": "wallet-asuavudg",
    "author_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "author_kind": "wallet",
    "author_external_id": null,
    "author_handle": null,
    "author_display_name": null,
    "publisher_identity_key": "wallet:asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "publisher_tier": "registered",
    "mirror_source_key": null,
    "synced_repo_url": "https://github.com/dirtybits/agent-skills",
    "name": "Ethereum Development",
    "description": "Production-grade Ethereum/EVM development workflow for smart contracts, dApps, transactions, clients, gas optimization, testing, security review, deployment, verification, monitoring, and incident response across Foundry, Hardhat, Solidity, TypeScript, vie",
    "tags": [
      "mit"
    ],
    "current_version": 7,
    "summary": "Develop, test, deploy, and operate Ethereum/EVM systems including smart contracts and dApps.",
    "summary_model": "google/gemini-2.5-flash-lite",
    "summary_sha256": "b87c6d3a861e89decc01a82d733cd9584f81c7415e8a7636d42cc2bf2ce5700c",
    "summary_capabilities": [
      "Smart contract development",
      "dApp integration",
      "Testing and deployment",
      "Security and monitoring"
    ],
    "ipfs_cid": null,
    "on_chain_address": null,
    "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
    "evm_listing_id": null,
    "evm_contract_address": null,
    "evm_tx_hash": null,
    "total_installs": 6,
    "price_usdc_micros": null,
    "currency_mint": null,
    "on_chain_protocol_version": null,
    "on_chain_program_id": null,
    "contact": "https://github.com/dirtybits/agent-skills/tree/main/skills/ethereum-development",
    "created_at": "2026-06-22T18:43:51.250Z",
    "updated_at": "2026-07-20T03:04:54.366Z",
    "source": "repo",
    "payment_flow": "free",
    "content": "---\ntype: Skill\nname: ethereum-development\ntitle: \"Ethereum Development\"\ndescription: Production-grade Ethereum/EVM development workflow for smart contracts, dApps, transactions, clients, gas optimization, testing, security review, deployment, verification, monitoring, and incident response across Foundry, Hardhat, Solidity, TypeScript, viem, ethers, wagmi, and common EVM networks.\nresource: \"https://github.com/dirtybits/agent-skills/tree/main/skills/ethereum-development\"\ntags: [\"ethereum\", \"solidity\", \"evm\", \"smart-contracts\", \"foundry\", \"hardhat\", \"security\", \"dapp\", \"viem\", \"ethers\", \"wagmi\", \"gas\", \"deployment\"]\ntimestamp: \"2026-06-22T19:13:38Z\"\nokf_version: \"0.1\"\nversion: \"2.4.0\"\nlicense: MIT\nupdated: \"2026-07\"\n---\n\n# Ethereum Development\n\n## Purpose\n\nUse this skill to build, review, debug, test, deploy, and operate Ethereum and EVM systems. It covers the full path from protocol design to Solidity implementation, frontend/client integration, transaction mechanics, gas optimization, security hardening, deployment verification, and post-deploy monitoring.\n\nThe operating standard is: **no contract or integration is production-ready merely because it compiles or a happy-path test passes.** Production readiness requires invariants, adversarial tests, deployment rehearsal, verification, monitoring, and explicit risk acceptance.\n\n## When To Use\n\nUse this skill when the task involves:\n\n- Solidity smart contract design, implementation, refactoring, or review\n- Foundry or Hardhat project setup, tests, scripts, fork testing, fuzzing, invariant testing, gas snapshots, or deployments\n- dApp integration with viem, ethers, wagmi, RainbowKit, ConnectKit, WalletConnect, or EIP-1193 providers\n- Ethereum RPC, traces, storage slots, logs, receipts, fee estimation, nonce management, mempool behavior, or transaction debugging\n- Token standards: ERC-20, ERC-721, ERC-1155, ERC-4626, ERC-2612, ERC-2981, ERC-4337/account abstraction\n- Protocol features: staking, vesting, vaults, swaps, auctions, governance, payments, allowlists, claims, cross-chain messaging, oracle-dependent flows\n- Indexers, bots, keepers, relayers, Defender automation, subgraphs, Ponder, or backend services consuming contract events\n- Security review, gas optimization, upgrade safety, deployment runbooks, mainnet readiness, and incident response\n\nDo not use this skill as a substitute for protocol design. If incentives, custody, governance, or tokenomics are still unclear, pair it with `web3-protocol-design` first.\n\n## Core Principles\n\n1. **Start with state, actors, and invariants.** Define who can do what, which assets move, and what must always hold before editing contracts.\n2. **Prefer boring audited dependencies.** Use OpenZeppelin and proven libraries when they fit; avoid custom crypto, proxy, token, permit, and math code without a reason.\n3. **Minimize authority and blast radius.** Every privileged function needs a scoped role, bounds, event emission, production owner, delay or multisig path, and monitoring.\n4. **Treat all external calls as adversarial.** ETH receivers, token contracts, oracle adapters, AMMs, bridges, hooks, callbacks, and proxies can revert, reenter, grief, or behave non-standardly.\n5. **Keep value math in base units.** Never use floating point for token amounts. Be explicit about decimals and rounding direction.\n6. **Test behavior and invariants, not implementation trivia.** Cover normal flows, edge cases, reverts, authorization, events, accounting, fuzz properties, invariants, and fork integrations.\n7. **Assume public mempools are hostile.** Consider MEV, frontrunning, backrunning, sandwiching, nonce replacement, replay, reorgs, stale state, and gas griefing.\n8. **Never broadcast from guesses.** Confirm chain ID, RPC, signer, nonce, gas, constructor args, initializer data, salts, proxy admin, verification inputs, and expected addresses before deploying.\n\n## Discovery Workflow\n\nBefore making changes:\n\n1. Check git status and read project instructions.\n2. Identify the stack:\n   - Foundry: `foundry.toml`, `src/`, `test/`, `script/`, `forge`, `cast`, `anvil`\n   - Hardhat: `hardhat.config.*`, `contracts/`, `test/`, `scripts/`, TypeChain\n   - Frontend: `package.json`, wagmi, viem, ethers, RainbowKit, ConnectKit\n   - Indexer/backend: `subgraph.yaml`, `ponder.config.*`, event consumers, relayers, keeper scripts\n3. Inspect compiler settings: Solidity version, optimizer runs, EVM version, viaIR, remappings, libraries, and dependency versions.\n4. Locate address books, deployment artifacts, ABIs, generated clients, verification data, and prior audit notes.\n5. Determine the target network and environment: local, fork, testnet, staging, mainnet, or multi-chain.\n6. Identify all externally owned accounts, multisigs, timelocks, keepers, relayers, oracle feeds, bridges, and protocol dependencies.\n7. Record each growing contract's deployed-runtime baseline, target-chain hard limit, and project soft limit under the exact production compiler profile.\n\n## Design And Implementation Workflow\n\n1. Write or infer a one-sentence goal and explicit non-goals.\n2. List actors, assets, contract state, off-chain services, and external dependencies.\n3. Define lifecycle flows: initialize, deposit, withdraw, transfer, claim, settle, upgrade, pause, recover, shutdown.\n4. Write invariants first. Examples:\n   - total shares never exceed claimable assets beyond intentional debt\n   - only authorized roles can change parameters\n   - a signature/nonce can be used at most once\n   - user funds cannot be trapped by another user's revert\n   - supply caps and per-user limits are always enforced\n5. Implement the smallest change consistent with existing project conventions.\n6. Add or update tests before declaring success.\n7. Run formatters, compile, targeted tests, and broader tests appropriate to risk.\n8. For public network actions, prepare a runbook and get explicit approval before broadcasting.\n\n## Release State And Feature Gates\n\nTrack these as separate claims: implemented and tested, merged on the current base, deployable under the production compiler profile, deployed and bytecode-verified, configured, activated, and live-smoked or operationally approved. Evidence for one state does not imply the next.\n\n- For gated features, record the default state, enabling authority, contract and client dependencies, activation transaction or configuration change, monitoring, and rollback path. A feature may be implementation-complete while deployment and activation remain blocked.\n- For stacked or interacting changes, define the merge and deployment dependency order. After each prerequisite merge, update the remaining candidates onto the new base and rerun affected size, ABI, storage-layout, deployment-script, and integration gates; green checks from an earlier head or base do not certify the merge result.\n\n## Runtime Size And Architecture\n\nTreat deployed runtime bytecode as a deployability invariant, not a gas optimization. Read [Contract Size And Architecture](references/CONTRACT_SIZE.md) when a contract is expected to grow materially or approaches its target-chain limit.\n\n- Measure deployed runtime before substantial work and after each representative vertical slice; record baseline, delta, hard limit, and remaining headroom under the exact production compiler profile.\n- Set a project soft limit below the chain's hard limit when review fixes or future growth are expected. A green test suite never overrides an undeployable artifact.\n- Attribute actual byte growth before optimizing. Prefer mechanism simplification, measured deduplication, and compact ABI surfaces before adding cross-contract or upgrade complexity.\n- Treat linked libraries, compiler-pipeline changes, modules, facets, and proxies as architecture or deployment changes. Compare storage, ABI, verification, security, upgradeability, and regression impact explicitly.\n\n## Solidity Guidance\n\n### State And Storage\n\n- Pack storage deliberately when it does not obscure correctness.\n- Avoid unbounded iteration over user-controlled arrays in state-changing functions.\n- Be explicit about upgradeable storage layout. Append storage only unless namespaced storage is intentionally used.\n- Use `constant` and `immutable` where safe, but do not trade away upgrade requirements.\n- Know storage slot mechanics for mappings and dynamic arrays when debugging:\n  - mapping value slot: `keccak256(abi.encode(key, mappingSlot))`\n  - dynamic array data starts at `keccak256(arraySlot)`\n- Transient storage (EIP-1153 `tstore`/`tload`) clears at the end of the transaction. It fits reentrancy locks and intra-transaction context, never persistent state; confirm target-chain support before relying on it.\n\n### Function Design\n\n- Validate inputs early; order cheap checks before expensive reads/calls.\n- Use custom errors in new Solidity code unless project conventions differ.\n- Emit events for externally meaningful state changes; index fields used by indexers.\n- Follow checks-effects-interactions and consider pull-payment patterns.\n- Treat ERC-20/721/1155 calls as external calls with arbitrary behavior.\n- Do not rely on `transfer`/`send` gas assumptions for ETH.\n- Avoid hidden dependencies on `block.timestamp` or `block.number` precision.\n- Budget view functions and getters: large tuples, nested structs, dynamic values, and compatibility wrappers can generate substantial runtime ABI-encoder code.\n\n### Tokens\n\nHandle non-standard token behavior:\n\n- no return value, false return value, revert-on-zero, revert-on-nonzero-to-nonzero allowance\n- fee-on-transfer, rebasing, blacklists, pausable transfers, ERC-777 hooks\n- unusual decimals, changing decimals, proxy tokens, permit variants\n- ERC-4626 share/asset rounding and inflation attacks\n\n### Signatures\n\n- Prefer EIP-712 typed data for structured signatures.\n- Domain-separate by name, version, chain ID, and verifying contract.\n- Bind each signature to one explicit action or purpose and every security-relevant object or payload field: method or selector, resource ID, recipient, amount, and request hash as applicable. Never reuse a generic proof-of-wallet signature across mutations.\n- Include a nonce and deadline. A timestamp or deadline only narrows the replay window; it does not prevent same-action replay. Consume the nonce atomically and exactly once, or use an equivalent replay ledger.\n- Test cross-purpose, cross-object, modified-payload, duplicate, expired, cross-chain, and cross-contract attempts.\n- Consider EIP-1271 smart contract signatures when supporting smart wallets.\n\n### Upgradeable Contracts\n\n- Use OpenZeppelin upgradeable patterns when possible.\n- Never initialize upgradeable state in constructors.\n- Disable initializers on implementation contracts where appropriate.\n- Test initializer and reinitializer paths cannot be called twice.\n- Verify proxy admin, implementation, upgrade authority, storage layout, and initializer calldata.\n- Run storage layout tooling before upgrades.\n\n## EVM And Transaction Mechanics\n\n### EVM Basics To Remember\n\n- Stack machine with 256-bit words and max stack depth of 1024.\n- Memory is transient, byte-addressed, and has expansion costs.\n- Storage is persistent 32-byte slots and usually dominates gas costs.\n- `CALL`, `DELEGATECALL`, `STATICCALL`, `CREATE`, `CREATE2`, logs, and SSTORE have security and gas implications.\n- `delegatecall` executes callee code in caller storage context. Treat it as highly privileged.\n\n### Transaction Types\n\n- Type 0 legacy: `gasPrice`\n- Type 1 access list: EIP-2930\n- Type 2 EIP-1559: `maxFeePerGas`, `maxPriorityFeePerGas`\n- Type 3 blob transactions on applicable networks: EIP-4844 semantics for blob gas\n- Type 4 set-code: EIP-7702 delegates an EOA to contract code via a signed authorization list. Check chain support, delegation revocation, and that contracts no longer assume `msg.sender == tx.origin` implies a plain EOA.\n\nOperational checks:\n\n- Confirm nonce with pending state when replacing or submitting multiple txs.\n- Prefer an explicit keystore file, verify its address, and pass its secret through a real permission-restricted password file rather than a clipboard, command-line password, or `/dev/fd` path.\n- Set `maxFeePerGas` high enough to survive base fee movement; tip should reflect urgency.\n- For replacement, increase fee enough for the client/network replacement rule.\n- Inspect receipts for `status`, logs, gas used, effective gas price, and contract address.\n\n### Common Transaction Errors\n\n- `nonce too low`: local nonce behind or tx already mined/replaced. Check pending nonce.\n- `replacement transaction underpriced`: replacement fee bump too small.\n- `intrinsic gas too low`: calldata/access list/value transfer base cost issue.\n- `execution reverted`: simulate/trace and decode custom error.\n- `out of gas`: estimate plus trace; distinguish actual gas shortage from infinite/reverting path.\n- `insufficient funds`: include value + gas limit * max fee, not only transfer amount.\n\n## Operational Key, RPC, And Cross-Chain Discipline\n\nRead [EVM Operations And Custody](references/OPERATIONS.md) before preparing a public-network deployment, Safe transaction, deterministic multi-chain deployment, finalized event reader, or off-chain service that feeds an indexer, relayer, or executor.\n\n- A Safe is a contract, not a private key. Keep deployer, owner, service signer, relayer, and executor roles distinct; possession of a keystore is not approval to grant authority, and exportable test keys are not production custody.\n- Authenticated RPCs are reliability tools, not secrecy boundaries. Verify required RPC capabilities, nonces and deterministic addresses, directional cross-chain configuration, finalized block identity, and producer/indexer/executor stages independently.\n\n## Tooling Recipes\n\nFull command recipes live in [references/GUIDE.md](references/GUIDE.md): Foundry build/test/trace/storage commands, fork testing, deployment rehearsal, Hardhat equivalents, and viem client examples (storage slot reads, EIP-1559 sends). Operational signing, RPC, finality, deterministic deployment, and cross-chain checkpoints live in [references/OPERATIONS.md](references/OPERATIONS.md). Follow the repo's package manager and lockfile: npm, pnpm, yarn, or bun.\n\n## Gas Optimization Checklist\n\nOptimize only after correctness is established and measured.\n\n| Technique | Typical Benefit | Caution |\n|---|---:|---|\n| Storage packing | high | Can reduce readability; verify layout for upgrades |\n| Cache storage reads | medium/high | Do not cache stale values across external calls |\n| Use calldata for read-only external params | low/medium | Not for values that must be mutated |\n| Custom errors | low/medium | Keep errors descriptive enough for debugging |\n| Unchecked increments | low | Only where overflow is impossible by construction |\n| Short-circuit cheap checks first | variable | Preserve intended revert precedence if tested |\n| Avoid repeated hashing/encoding | variable | Do not precompute with wrong domain/context |\n| Batch operations | variable | Beware block gas limit and DoS loops |\n\nGas test template:\n\n```solidity\nfunction test_GasBudget() public {\n    uint256 beforeGas = gasleft();\n    target.optimizedFunction();\n    uint256 used = beforeGas - gasleft();\n    assertLt(used, 50_000, \"gas budget exceeded\");\n}\n```\n\n## Testing Strategy\n\nMinimum expected verification for contract changes:\n\n- Build/compile passes.\n- Unit tests for every touched public/external behavior.\n- Revert tests for invalid inputs, unauthorized callers, and unsafe states.\n- Event tests for indexer-facing behavior.\n- Edge cases: zero amounts, max amounts, duplicate calls, expired deadlines, changed price, depleted balances, dust, paused state.\n- Fuzz tests for arithmetic and user-controlled inputs.\n- Invariant tests for value/accounting/authorization state machines.\n- Fork tests for live integrations pinned to a block number.\n- Gas snapshot/report if gas matters.\n- Deployed-runtime measurement and soft/hard size-budget enforcement if a contract changed.\n\nFoundry invariant example:\n\n```solidity\nfunction invariant_TotalAssetsCoverShares() public view {\n    assertGe(asset.balanceOf(address(vault)), vault.totalAssetsRequired());\n}\n```\n\nHardhat examples:\n\n```ts\nawait expect(contract.connect(attacker).adminOnlyAction()).to.be.reverted;\nawait expect(contract.doThing(amount))\n  .to.emit(contract, \"ThingDone\")\n  .withArgs(user.address, amount);\n```\n\n## Security Review Checklist\n\n### Review Provenance\n\n- Record the reviewed commit SHA and compiler or deployment artifact. Before accepting or dismissing an automated or human finding, reproduce the claimed behavior on the current head; an old line location or old-head behavior is not evidence about the current artifact.\n- After a fix, add regression coverage and rerun the relevant review against the new head. Resolve stale findings with current-code and test evidence rather than silently ignoring them.\n\n### Authorization\n\n- Can unauthorized users reach privileged behavior through direct calls, callbacks, delegatecalls, multicalls, proxies, or initialization paths?\n- Are roles initialized correctly and transferred to production owners?\n- Can admins rug, freeze, alter claims, sweep assets, or bypass delays? If yes, is it intended, bounded, documented, and monitored?\n\n### Accounting\n\n- Are deposits, withdrawals, shares, rewards, fees, debt, and dust conserved?\n- Is rounding direction intentional and tested?\n- Do fee-on-transfer, rebasing, and non-standard decimals break accounting?\n- Are ERC-4626 inflation/donation attacks considered where relevant?\n\n### External Calls And Reentrancy\n\n- Can reentrancy occur through token hooks, receiver callbacks, fallback ETH receivers, protocol callbacks, or multicall?\n- Are external return values checked?\n- Can a malicious token or external protocol block everyone by reverting?\n\n### Oracles And Prices\n\n- Reject stale, zero, negative, paused, incomplete, or incorrectly-decimaled prices.\n- Confirm heartbeat, deviation threshold, base/quote direction, sequencer uptime feeds on L2s, and fallback behavior.\n- Consider manipulation cost for TWAPs and low-liquidity pools.\n\n### MEV And Ordering\n\n- Are slippage limits, deadlines, nonces, and recipient checks present?\n- Can auctions, liquidations, claims, or swaps be sandwiched, frontrun, griefed, or backrun?\n- Is commit-reveal or private orderflow needed?\n\n### Upgrades\n\n- Storage layout compatible?\n- Initializers protected?\n- Implementation cannot be initialized or abused?\n- Upgrade authority held by expected timelock/multisig?\n- Rollback or pause plan exists?\n\n### Denial Of Service\n\n- Are loops bounded?\n- Can one user's revert block batch processing?\n- Can queues, withdrawals, disputes, claims, or settlements handle partial failure?\n\n## Frontend And Client Integration\n\n- Keep address maps chain-specific and explicit; never silently fall back to mainnet/testnet.\n- Where reads can originate from multiple deployments, namespace cache keys, query keys, indexed state, and deduplication keys by chain ID and deployed contract address before entity-specific fields. Do not key deployment-specific state by user or entity alone.\n- Invalidate or refetch on contract-address, proxy-implementation, ABI/version, or network changes. Test that identical entity identifiers queried through two contracts on the same chain remain independent.\n- Use typed ABIs or generated clients when available.\n- Keep internal token math in `bigint`/BigNumber base units; format only at UI boundaries.\n- Handle wallet disconnect, wrong chain, unsupported chain, pending tx, replaced tx, revert, RPC outage, and indexer lag.\n- Simulate or estimate before sending where possible, but treat simulation as advisory, not finality.\n- Surface tx hash, explorer link, pending/confirmed/failed state, and retry guidance.\n- For reads, consider block tags and stale cache behavior.\n\n## Indexing, Bots, And Backends\n\n- Treat events as an API: stable names, indexed fields, enough data for consumers.\n- Handle reorgs by waiting confirmations and supporting rollback/replay.\n- Store cursor/checkpoint state transactionally.\n- Make relayers and keepers idempotent. A duplicate execution attempt should not corrupt state.\n- Rate-limit RPC calls and use backoff for 429/5xx responses.\n- Monitor missed events, stuck nonces, reverted keeper txs, and divergence between indexer state and on-chain state.\n\n## Deployment Runbook\n\nBefore public broadcast:\n\n1. Confirm clean git status, branch, commit, release tag, and artifacts.\n2. Confirm network name, chain ID, RPC URL, explorer URL, deployer address, deployer balance, latest and pending nonce, expected deterministic addresses, and gas settings.\n3. Separate true deployment inputs from design-locked protocol constants. Do not expose approved economics or safety bounds as accidental environment knobs; enforce them in the deployment path and initializer or constructor.\n4. Run full test suite and required fork/fuzz/invariant tests.\n5. Confirm deployed runtime is within the recorded hard and soft limits under the exact verification compiler profile.\n6. Run deployment script in dry-run/simulation mode.\n7. Record expected addresses, linked-library map and code hashes when applicable, constructor args, initializer calldata, CREATE2 salts, proxy admin, implementation, owner, and roles.\n8. Confirm secrets path or hardware wallet flow without exposing keys.\n9. Confirm multisig/timelock addresses and role transfer order.\n10. Prepare verification command and explorer API key.\n11. Prepare pause/rollback/communication plan.\n12. Get explicit user approval before broadcasting.\n\nAfter broadcast:\n\n1. Save tx hashes, deployed addresses, block numbers, verification links, and independent receipt/code-hash checks before continuing the nonce sequence.\n2. Verify contracts on explorer.\n3. Check roles, ownership, proxy implementation, initialized state, parameters, and balances.\n4. Run read-only smoke tests against deployed contracts.\n5. Update address books, ABIs, generated clients, docs, frontend config, bots, and monitoring.\n6. Report residual risk and required follow-ups.\n\n## Debugging Playbooks\n\n### Revert Without Clear Error\n\n1. Re-run with verbose traces: `forge test -vvvv` or `cast run <tx_hash>` (traces print by default; there is no `--trace` flag on `cast run`).\n2. Decode custom error selectors against compiled ABIs.\n3. Check caller, msg.value, approvals, balances, block timestamp, chain ID, and fork block.\n4. Confirm proxy address vs implementation address.\n\n### ABI Or Deployment Drift\n\nWhen a client error says a function \"returned no data\", \"address is not a contract\", or only\n`execution reverted`, do not trust the wording until you prove what is deployed.\n\n1. Confirm bytecode exists at the configured address:\n   `cast code \"$CONTRACT\" --rpc-url \"$RPC_URL\"`.\n2. Compute the expected selector:\n   `cast sig \"openReport(address,string)\"`.\n3. Check whether the selector appears in deployed bytecode. Absence usually means the ABI/local\n   source is ahead of the configured deployment, the app points at an old contract, or a proxy\n   target is wrong.\n4. Probe nearby known-good reads such as version/config/profile getters. If reads work but the new\n   selector is absent, treat it as deployment drift, not a wallet, approval, or token-balance bug.\n5. Compare local artifact/deployment records against the live address and update the address book,\n   proxy implementation, or deployment before retrying the write.\n\nUseful quick check:\n\n```bash\nselector=$(cast sig \"openReport(address,string)\" | sed 's/^0x//')\ncode=$(cast code \"$CONTRACT\" --rpc-url \"$RPC_URL\")\ncase \"$code\" in\n  *\"$selector\"*) echo \"selector present\" ;;\n  *) echo \"selector absent: ABI/source likely ahead of deployment\" ;;\nesac\n```\n\nFor ETH-less smart-account or account-abstraction senders, a fork trace can fail transaction\nvalidation before contract execution because the sender has no ETH. Override only the simulated\nsender balance:\n\n```bash\ncast call \\\n  --rpc-url \"$RPC_URL\" \\\n  --from \"$SMART_ACCOUNT\" \\\n  --override-balance \"$SMART_ACCOUNT:1000000000000000000\" \\\n  --trace \\\n  \"$CONTRACT\" \\\n  \"openReport(address,string)(uint64)\" \\\n  \"$AUTHOR\" \\\n  \"$EVIDENCE_URI\"\n```\n\nIf the trace reverts immediately with no internal calls and the selector is absent from bytecode,\nthe configured deployment does not implement that function. Fail closed in the app before asking for\ntoken approvals or wallet signatures.\n\n### Account-Abstraction Write Debugging\n\n- Treat bundler/smart-account simulation and return decoding as transport-specific. A batched call\n  may surface an account-level empty return even when the contract ABI has a return value.\n- For writes where events are the authoritative success proof, consider sending raw calldata for the\n  final contract call and validating the receipt/event afterward.\n- Always separate capability preflights from money movement: verify chain ID, deployed code,\n  selector/proxy target, balance, and allowance before prompting for approvals.\n- Do not use a successful ERC-20 `approve` or `transferFrom` simulation as proof the target protocol\n  write exists. Token movement can be valid while the configured protocol contract is stale.\n\n### Nonce Or Pending Tx Problems\n\n1. Compare latest and pending nonce.\n2. Check mempool/pending transactions from the deployer.\n3. Replace with higher fee if safe, or wait for inclusion.\n4. Do not submit a new deployment sequence until nonce state is understood.\n\n### Explorer Verification Fails\n\n1. Confirm exact compiler version, optimizer, runs, EVM version, viaIR, libraries, constructor args.\n2. Verify implementation and proxy separately where applicable.\n3. Compare deployed bytecode and locally compiled bytecode.\n4. Check flattened vs standard JSON verification expectations.\n\n## Output Format\n\nFor implementation tasks:\n\n```markdown\n## Summary\n- What changed\n\n## Files Changed\n- path: purpose\n\n## Security-Sensitive Assumptions\n- assumption / risk\n\n## Verification\n- command -> result\n\n## Deployment Impact\n- none / local only / testnet / mainnet-affecting\n\n## Remaining Risks\n- risk or follow-up\n```\n\nFor review tasks, use severity buckets:\n\n```markdown\n## Critical\n- issue, impact, exploit path, affected code, recommended fix\n\n## High\n...\n\n## Medium\n...\n\n## Low / Informational\n...\n\n## Positive Notes\n- what looks sound\n\n## Verification\n- files reviewed and commands run\n```\n\n## Pitfalls\n\n- Do not print private keys, mnemonics, RPC credentials, explorer API keys, bearer tokens, or signed raw transactions.\n- Do not broadcast public-network transactions, change production configs, verify production contracts, or transfer ownership without explicit approval.\n- Do not assume ERC-20s are standard.\n- Do not assume fork simulation guarantees public-chain success.\n- Do not ignore warnings from Solidity, Slither, Foundry, Hardhat, TypeChain, or explorer verification.\n- Do not commit generated artifacts unless the repo convention requires them.\n- Do not hide admin trust assumptions; call them out plainly.\n\n## Verification Checklist\n\n- [ ] Stack, package manager, compiler settings, and network target identified.\n- [ ] Contracts, tests, deployment scripts, generated artifacts, and address books inspected before editing.\n- [ ] Actors, assets, authorities, and invariants stated for non-trivial changes.\n- [ ] Build/compile passes.\n- [ ] Targeted tests pass.\n- [ ] Broader tests, fuzz/invariant/fork tests, gas checks, or explicit blockers reported.\n- [ ] Deployment steps remain dry-run unless public broadcast was explicitly approved.\n- [ ] Final response includes concrete command output, changed files, deployment impact, and residual risks.\n",
    "files": [
      {
        "path": "assets/config.yaml",
        "size": 703,
        "sha256": "249c8e762328807a928c16dd0fe65407ce468400e380806b45345a6a9c875a0f",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "assets/schema.json",
        "size": 1051,
        "sha256": "e3db4e96b1a34e6e3ac5439c40b2ffe6f7a2bc0ac03d397f6e7652535998b706",
        "executable": false,
        "contentType": "application/json; charset=utf-8"
      },
      {
        "path": "index.md",
        "size": 222,
        "sha256": "8fb731cc115aad2aa29723deebe11d69c632bdb277400706daedad9baff8c732",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "LICENSE.txt",
        "size": 1066,
        "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
        "executable": false,
        "contentType": "text/plain; charset=utf-8"
      },
      {
        "path": "log.md",
        "size": 1598,
        "sha256": "11acb40f0a8a6327abc5cf810ce97f29a428088f287cadf37808de532222d7dc",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/CONTRACT_SIZE.md",
        "size": 11587,
        "sha256": "2ab97ca02e32e76bafe49f273d23539069f7a8c3b864eded61f346cbcb8fe922",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/GUIDE.md",
        "size": 5208,
        "sha256": "edf70d1b7c5d65bc35952654df6f03d6b8fb0b44ed03c6871a772d47b35eee34",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/OPERATIONS.md",
        "size": 10884,
        "sha256": "65cbcf6b31d0deadda135359b3623b38172ef28dde2a029fc22989b1ef89fbc2",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/PATTERNS.md",
        "size": 3810,
        "sha256": "d60845bd015d6665fe6e4946b24c6c640f3f96359a705c056d46a7cdbd6563f7",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "scripts/check_runtime_size.py",
        "size": 6234,
        "sha256": "d5f214358fdce084e2436f6be4244ebef2bc8a2bfab237a681bc96e99d0300e9",
        "executable": true,
        "contentType": "text/plain; charset=utf-8"
      },
      {
        "path": "scripts/validate.py",
        "size": 1760,
        "sha256": "1c20596483a180896c4c0dd33beaa6543d4f64014127bcf7cdba4db96eeba0ad",
        "executable": true,
        "contentType": "text/plain; charset=utf-8"
      },
      {
        "path": "SKILL.md",
        "size": 27713,
        "sha256": "b87c6d3a861e89decc01a82d733cd9584f81c7415e8a7636d42cc2bf2ce5700c",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      }
    ],
    "tree_hash": "923eb679fb73e18a7193f8d32e0d54d55b5e6a0358b03c05efd25e208022a7bb",
    "storage_backend": "blob",
    "has_executable": true,
    "security_scan": {
      "verdict": "review",
      "risk": "low",
      "findings": [],
      "truncated": false,
      "scanned_at": "2026-07-20T03:04:55.510Z",
      "model": "google/gemini-2.5-flash-lite",
      "rubric_version": "v1",
      "scan_source": "model",
      "generated_by_model": true,
      "advisory": true
    },
    "signals": [
      {
        "id": "ai_scan",
        "label": "AI security scan",
        "scope": "skill",
        "status": "pass",
        "detail": "Advisory scan completed with no concrete findings."
      },
      {
        "id": "registered",
        "label": "On-chain identity",
        "scope": "author",
        "status": "pass",
        "detail": "Author is registered on-chain."
      },
      {
        "id": "vouched",
        "label": "Vouched by others",
        "scope": "author",
        "status": "pass",
        "detail": "Other accounts have staked USDC vouching for this author."
      },
      {
        "id": "author_bonded",
        "label": "Author bond",
        "scope": "author",
        "status": "pass",
        "detail": "Author posted a USDC self-bond (skin in the game)."
      },
      {
        "id": "dispute_free",
        "label": "Dispute history",
        "scope": "author",
        "status": "pass",
        "detail": "No disputes against this author."
      }
    ],
    "versions": [
      {
        "id": "1f692868-2f1e-4526-89e5-e5f53728cc2d",
        "files": [
          {
            "path": "assets/config.yaml",
            "size": 703,
            "sha256": "249c8e762328807a928c16dd0fe65407ce468400e380806b45345a6a9c875a0f",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "assets/schema.json",
            "size": 1051,
            "sha256": "e3db4e96b1a34e6e3ac5439c40b2ffe6f7a2bc0ac03d397f6e7652535998b706",
            "executable": false,
            "contentType": "application/json; charset=utf-8"
          },
          {
            "path": "index.md",
            "size": 222,
            "sha256": "8fb731cc115aad2aa29723deebe11d69c632bdb277400706daedad9baff8c732",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "LICENSE.txt",
            "size": 1066,
            "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
            "executable": false,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "log.md",
            "size": 1598,
            "sha256": "11acb40f0a8a6327abc5cf810ce97f29a428088f287cadf37808de532222d7dc",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/CONTRACT_SIZE.md",
            "size": 11587,
            "sha256": "2ab97ca02e32e76bafe49f273d23539069f7a8c3b864eded61f346cbcb8fe922",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/GUIDE.md",
            "size": 5208,
            "sha256": "edf70d1b7c5d65bc35952654df6f03d6b8fb0b44ed03c6871a772d47b35eee34",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/OPERATIONS.md",
            "size": 10884,
            "sha256": "65cbcf6b31d0deadda135359b3623b38172ef28dde2a029fc22989b1ef89fbc2",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/PATTERNS.md",
            "size": 3810,
            "sha256": "d60845bd015d6665fe6e4946b24c6c640f3f96359a705c056d46a7cdbd6563f7",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "scripts/check_runtime_size.py",
            "size": 6234,
            "sha256": "d5f214358fdce084e2436f6be4244ebef2bc8a2bfab237a681bc96e99d0300e9",
            "executable": true,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "scripts/validate.py",
            "size": 1760,
            "sha256": "1c20596483a180896c4c0dd33beaa6543d4f64014127bcf7cdba4db96eeba0ad",
            "executable": true,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 27713,
            "sha256": "b87c6d3a861e89decc01a82d733cd9584f81c7415e8a7636d42cc2bf2ce5700c",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 7,
        "ipfs_cid": null,
        "changelog": "Synced from dirtybits/agent-skills",
        "tree_hash": "923eb679fb73e18a7193f8d32e0d54d55b5e6a0358b03c05efd25e208022a7bb",
        "created_at": "2026-07-20T03:04:54.366109+00:00",
        "has_executable": true,
        "storage_backend": "blob"
      },
      {
        "id": "6f3a9554-869b-498c-9163-ffdb6c208015",
        "files": [
          {
            "path": "assets/config.yaml",
            "size": 703,
            "sha256": "93e92fb009df6dbe4dfca7a5165a410413cad3bd42297062690163d525f9981a",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "assets/schema.json",
            "size": 1051,
            "sha256": "e3db4e96b1a34e6e3ac5439c40b2ffe6f7a2bc0ac03d397f6e7652535998b706",
            "executable": false,
            "contentType": "application/json; charset=utf-8"
          },
          {
            "path": "index.md",
            "size": 222,
            "sha256": "8fb731cc115aad2aa29723deebe11d69c632bdb277400706daedad9baff8c732",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "LICENSE.txt",
            "size": 1066,
            "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
            "executable": false,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "log.md",
            "size": 1210,
            "sha256": "b02cd7724f97cc66f5070ba232288b515384a346b40f648ed1bec9651e65ba4c",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/CONTRACT_SIZE.md",
            "size": 11587,
            "sha256": "2ab97ca02e32e76bafe49f273d23539069f7a8c3b864eded61f346cbcb8fe922",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/GUIDE.md",
            "size": 5046,
            "sha256": "53d162a744d7521175bab3f11c485f0484ca66764dda3e9c2f7a3c45bb48dd3e",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/PATTERNS.md",
            "size": 3810,
            "sha256": "d60845bd015d6665fe6e4946b24c6c640f3f96359a705c056d46a7cdbd6563f7",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "scripts/check_runtime_size.py",
            "size": 6234,
            "sha256": "d5f214358fdce084e2436f6be4244ebef2bc8a2bfab237a681bc96e99d0300e9",
            "executable": true,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "scripts/validate.py",
            "size": 1728,
            "sha256": "fb724e654604802636dd3801ec3ed6061b73913284c7f70ea40741a5d10c8ca6",
            "executable": true,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 26444,
            "sha256": "43530f733dccfc18792029bd394d2a9b7c7ddc3bd7a098e2ac7ef3353139ab66",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 6,
        "ipfs_cid": null,
        "changelog": "Synced from dirtybits/agent-skills",
        "tree_hash": "021c6a18083fadd22f8a844d37b3305bca8eb403766dca9152eab583fa18309a",
        "created_at": "2026-07-14T07:17:25.001604+00:00",
        "has_executable": true,
        "storage_backend": "blob"
      },
      {
        "id": "7fc18abd-8aa6-4269-b240-6d3f9b5c3985",
        "files": [
          {
            "path": "assets/config.yaml",
            "size": 703,
            "sha256": "5dea87c6b469d1114b5784146685520032715ff27a079651fda25bf9c4d280eb",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "assets/schema.json",
            "size": 1051,
            "sha256": "e3db4e96b1a34e6e3ac5439c40b2ffe6f7a2bc0ac03d397f6e7652535998b706",
            "executable": false,
            "contentType": "application/json; charset=utf-8"
          },
          {
            "path": "index.md",
            "size": 222,
            "sha256": "8fb731cc115aad2aa29723deebe11d69c632bdb277400706daedad9baff8c732",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "LICENSE.txt",
            "size": 1066,
            "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
            "executable": false,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "log.md",
            "size": 961,
            "sha256": "5dac3391b45522196a9ed04c53492fd8124efc3c18b98f47446c2c4543d8fd43",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/CONTRACT_SIZE.md",
            "size": 11137,
            "sha256": "d746c2820261ed8492684138b835a86cb41a1f0c595ede01ce5f754d274ac100",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/GUIDE.md",
            "size": 5046,
            "sha256": "53d162a744d7521175bab3f11c485f0484ca66764dda3e9c2f7a3c45bb48dd3e",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/PATTERNS.md",
            "size": 3810,
            "sha256": "d60845bd015d6665fe6e4946b24c6c640f3f96359a705c056d46a7cdbd6563f7",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "scripts/check_runtime_size.py",
            "size": 6234,
            "sha256": "d5f214358fdce084e2436f6be4244ebef2bc8a2bfab237a681bc96e99d0300e9",
            "executable": true,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "scripts/validate.py",
            "size": 1728,
            "sha256": "fb724e654604802636dd3801ec3ed6061b73913284c7f70ea40741a5d10c8ca6",
            "executable": true,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 23856,
            "sha256": "0ad9cce59eb652dcaeef3a366bfc4274930c26814a6be46e9d1551d9941a4265",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 5,
        "ipfs_cid": null,
        "changelog": "Synced from dirtybits/agent-skills",
        "tree_hash": "cc4dc9babaab41e2f867c06074d3b15092f88c0e2975c2805156ccbe87156bad",
        "created_at": "2026-07-12T07:39:26.918988+00:00",
        "has_executable": true,
        "storage_backend": "blob"
      },
      {
        "id": "1d8f1e68-9321-4fdc-a741-2fc30f3a6512",
        "files": [
          {
            "path": "assets/config.yaml",
            "size": 646,
            "sha256": "74e4f7a84187cd79e2fda76bfc8e6e64e4cba29d340b4de6956fe399e4ab928e",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "assets/schema.json",
            "size": 1051,
            "sha256": "e3db4e96b1a34e6e3ac5439c40b2ffe6f7a2bc0ac03d397f6e7652535998b706",
            "executable": false,
            "contentType": "application/json; charset=utf-8"
          },
          {
            "path": "index.md",
            "size": 222,
            "sha256": "8fb731cc115aad2aa29723deebe11d69c632bdb277400706daedad9baff8c732",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "LICENSE.txt",
            "size": 1066,
            "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
            "executable": false,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "log.md",
            "size": 312,
            "sha256": "bce260a5cf1fe196ce3320704f2ed7c7dd79c996ee9e99d6695c70ea783641be",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/GUIDE.md",
            "size": 2923,
            "sha256": "2b56f9b740bbda1d68314ab1c03831b831569b56e320f5ccc175d1e72965ead0",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/PATTERNS.md",
            "size": 2660,
            "sha256": "e64198c40f4e05d8e9b6c2cc078465cef3f8958d16921ee1421bc0f1c3f89e5a",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "scripts/validate.py",
            "size": 1619,
            "sha256": "50225ee034819aedfd64f61be705c718b19aece6145edba5a90e8a85a59f7723",
            "executable": true,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 24538,
            "sha256": "1fad963f8ecfb663d90d2807091115baa6495906cdc7476d3813898a6cbb00d1",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 4,
        "ipfs_cid": null,
        "changelog": "Synced from dirtybits/agent-skills",
        "tree_hash": "13f60d84357ab1a0b2d917a5a26b02191ece577c96fd647e299a179653d2f2e3",
        "created_at": "2026-07-08T07:08:20.644493+00:00",
        "has_executable": true,
        "storage_backend": "blob"
      },
      {
        "id": "2e2cdf38-9ce0-4fad-8049-24dcbb5306a0",
        "files": [
          {
            "path": "assets/config.yaml",
            "size": 646,
            "sha256": "74e4f7a84187cd79e2fda76bfc8e6e64e4cba29d340b4de6956fe399e4ab928e",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "assets/schema.json",
            "size": 1051,
            "sha256": "e3db4e96b1a34e6e3ac5439c40b2ffe6f7a2bc0ac03d397f6e7652535998b706",
            "executable": false,
            "contentType": "application/json; charset=utf-8"
          },
          {
            "path": "index.md",
            "size": 222,
            "sha256": "8fb731cc115aad2aa29723deebe11d69c632bdb277400706daedad9baff8c732",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "LICENSE.txt",
            "size": 1066,
            "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
            "executable": false,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "log.md",
            "size": 312,
            "sha256": "bce260a5cf1fe196ce3320704f2ed7c7dd79c996ee9e99d6695c70ea783641be",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/GUIDE.md",
            "size": 2923,
            "sha256": "2b56f9b740bbda1d68314ab1c03831b831569b56e320f5ccc175d1e72965ead0",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/PATTERNS.md",
            "size": 2660,
            "sha256": "e64198c40f4e05d8e9b6c2cc078465cef3f8958d16921ee1421bc0f1c3f89e5a",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "scripts/validate.py",
            "size": 1619,
            "sha256": "50225ee034819aedfd64f61be705c718b19aece6145edba5a90e8a85a59f7723",
            "executable": true,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 21771,
            "sha256": "adb6ea0508423bfbefb78c4c9614bd641f9bb3f9f96915952354ae919812250d",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 3,
        "ipfs_cid": null,
        "changelog": "Synced from dirtybits/agent-skills",
        "tree_hash": "db439eaaac9764f97a975c599426cccde8fbe1666c951fe1f5eb4a3e34ae7859",
        "created_at": "2026-06-25T07:12:09.381729+00:00",
        "has_executable": true,
        "storage_backend": "blob"
      },
      {
        "id": "774a7d6e-73d7-49bf-a28b-0e88c2aa8d8e",
        "files": [
          {
            "path": "assets/config.yaml",
            "size": 646,
            "sha256": "74e4f7a84187cd79e2fda76bfc8e6e64e4cba29d340b4de6956fe399e4ab928e",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "assets/schema.json",
            "size": 1051,
            "sha256": "e3db4e96b1a34e6e3ac5439c40b2ffe6f7a2bc0ac03d397f6e7652535998b706",
            "executable": false,
            "contentType": "application/json; charset=utf-8"
          },
          {
            "path": "index.md",
            "size": 222,
            "sha256": "8fb731cc115aad2aa29723deebe11d69c632bdb277400706daedad9baff8c732",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "LICENSE.txt",
            "size": 1066,
            "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
            "executable": false,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "log.md",
            "size": 312,
            "sha256": "bce260a5cf1fe196ce3320704f2ed7c7dd79c996ee9e99d6695c70ea783641be",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/GUIDE.md",
            "size": 2923,
            "sha256": "2b56f9b740bbda1d68314ab1c03831b831569b56e320f5ccc175d1e72965ead0",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/PATTERNS.md",
            "size": 2660,
            "sha256": "e64198c40f4e05d8e9b6c2cc078465cef3f8958d16921ee1421bc0f1c3f89e5a",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "scripts/validate.py",
            "size": 1619,
            "sha256": "50225ee034819aedfd64f61be705c718b19aece6145edba5a90e8a85a59f7723",
            "executable": true,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 21636,
            "sha256": "6b750bc22f4107e2b62d2040035e9048d10ea4083215e544d5e4451b06efc343",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 2,
        "ipfs_cid": null,
        "changelog": "Synced from dirtybits/agent-skills",
        "tree_hash": "b1f2047d933601f06c8ad6dbcb6edf812fe97cf7d97e3d342fab5c2772b54544",
        "created_at": "2026-06-23T07:03:57.701406+00:00",
        "has_executable": true,
        "storage_backend": "blob"
      },
      {
        "id": "6177542a-57cc-46b5-8aa5-e129b655d1d6",
        "files": [
          {
            "path": "assets/config.yaml",
            "size": 646,
            "sha256": "74e4f7a84187cd79e2fda76bfc8e6e64e4cba29d340b4de6956fe399e4ab928e",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "assets/schema.json",
            "size": 1051,
            "sha256": "e3db4e96b1a34e6e3ac5439c40b2ffe6f7a2bc0ac03d397f6e7652535998b706",
            "executable": false,
            "contentType": "application/json; charset=utf-8"
          },
          {
            "path": "LICENSE.txt",
            "size": 1066,
            "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
            "executable": false,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "references/GUIDE.md",
            "size": 2516,
            "sha256": "cd28e8d04afc7f203a1a5d1de18811a31e18df176e7e9a7203465f1d0e8c3e4a",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/PATTERNS.md",
            "size": 2247,
            "sha256": "c50f057dc64feb037e6463f01520a46f8f823c423ca917bb7b33dd32ec3743c6",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "scripts/validate.py",
            "size": 1619,
            "sha256": "50225ee034819aedfd64f61be705c718b19aece6145edba5a90e8a85a59f7723",
            "executable": true,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 21303,
            "sha256": "4a75d2a379df602c61e9ccb9afac5a2396e91ac3aac49daa96069dade8d69ec4",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 1,
        "ipfs_cid": null,
        "changelog": "Synced from dirtybits/agent-skills",
        "tree_hash": "fabba513131cb96bf9260b587fb6cda6468f6573a9987e15ed7a4df281d2d9a2",
        "created_at": "2026-06-22T18:43:51.250186+00:00",
        "has_executable": true,
        "storage_backend": "blob"
      }
    ],
    "author_trust": {
      "isRegistered": true,
      "registeredAt": 1779082335,
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "totalStakeAtRisk": 24250000,
      "authorBondUsdcMicros": 7250000,
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_trust_summary": {
      "username": "wallet-z7wzgw",
      "github_url": "https://github.com/dirtybits",
      "display_name": null,
      "github_login": "dirtybits",
      "isRegistered": true,
      "registeredAt": 1779082335,
      "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "wallet_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "schema_version": "2026-04-03",
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "trust_updated_at": "2026-09-22T04:52:30.978Z",
      "canonical_agent_id": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "recommended_action": "allow",
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_identity": {
      "id": "1f84a1fd-7c81-4925-9ea7-7b0ba6609697",
      "canonicalAgentId": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "identitySource": "local",
      "homeChainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "status": "active",
      "displayName": null,
      "username": "wallet-z7wzgw",
      "usernameSource": "fallback",
      "githubProfile": {
        "id": "28834908",
        "login": "dirtybits",
        "name": "andy",
        "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4",
        "url": "https://github.com/dirtybits"
      },
      "bindings": [
        {
          "id": "c11bf186-49aa-46d1-82a0-732d84071113",
          "metadata": null,
          "isPrimary": true,
          "bindingRef": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
          "bindingType": "wallet_owner",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "7ac9de7b-3020-4261-be2c-d7cbefa1d257",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "094fbb11-545b-41d7-b7e7-38d66a8c5fde",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "A4dgMn4WYSmFdisAkpKzFwUcLsPr4fBJU5nbKQHWHgeA",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "147b59b5-fb6f-4901-ad99-8fa8f742f4af",
          "metadata": {
            "id": "28834908",
            "url": "https://github.com/dirtybits",
            "name": "andy",
            "login": "dirtybits",
            "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4"
          },
          "isPrimary": false,
          "bindingRef": "github:28834908",
          "bindingType": "github_profile",
          "chainContext": "github",
          "externalAgentId": "28834908",
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        }
      ],
      "ownerWallet": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "operationalWallet": null,
      "agentProfilePda": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
      "registryAsset": null
    },
    "buyerHasPurchased": false,
    "buyerPurchaseSummary": null,
    "content_verification": {
      "has_ipfs": false,
      "all_versions_pinned": false,
      "current_cid_consistent": true,
      "status": "unverified"
    },
    "priceDisclosure": null,
    "purchaseRiskWarning": null
  },
  {
    "id": "c02c5021-98d6-4379-9ce0-f5e4216a6b8a",
    "skill_id": "turn-closeout",
    "public_slug": "turn-closeout",
    "public_author_slug": "wallet-asuavudg",
    "author_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "author_kind": "wallet",
    "author_external_id": null,
    "author_handle": null,
    "author_display_name": null,
    "publisher_identity_key": "wallet:asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "publisher_tier": "registered",
    "mirror_source_key": null,
    "synced_repo_url": "https://github.com/dirtybits/agent-skills",
    "name": "Turn Closeout",
    "description": "End substantial Codex turns with a concise outcome, concrete verification status, numbered recommended next steps, and an explicit prompt asking whether to proceed with one of those options. Use when wrapping up implementation work, debugging, research, pl",
    "tags": [
      "codex",
      "workflow",
      "communication"
    ],
    "current_version": 3,
    "summary": "Concludes substantial AI agent tasks with a summary, verification status, and recommended next steps.",
    "summary_model": "google/gemini-2.5-flash-lite",
    "summary_sha256": "501374a880d037a6b86ef8071c7e1a2ae037963ce8b350e294a0a618b1610c90",
    "summary_capabilities": [
      "Summarize task outcomes",
      "Provide verification status",
      "Suggest next steps",
      "Prompt for continuation"
    ],
    "ipfs_cid": null,
    "on_chain_address": null,
    "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
    "evm_listing_id": null,
    "evm_contract_address": null,
    "evm_tx_hash": null,
    "total_installs": 6,
    "price_usdc_micros": null,
    "currency_mint": null,
    "on_chain_protocol_version": null,
    "on_chain_program_id": null,
    "contact": "https://github.com/dirtybits/agent-skills/tree/main/skills/turn-closeout",
    "created_at": "2026-06-16T20:12:48.992Z",
    "updated_at": "2026-06-30T03:45:24.138Z",
    "source": "repo",
    "payment_flow": "free",
    "content": "---\ntype: Skill\nname: turn-closeout\ntitle: \"Turn Closeout\"\ndescription: End substantial Codex turns with a concise outcome, concrete verification status, numbered recommended next steps, and an explicit prompt asking whether to proceed with one of those options. Use when wrapping up implementation work, debugging, research, planning, reviews, publishing flows, or other non-trivial tasks where the user may want Codex to continue with recommended follow-up actions.\nresource: \"https://github.com/dirtybits/agent-skills/tree/main/skills/turn-closeout\"\ntags: [\"codex\", \"workflow\", \"communication\"]\ntimestamp: \"2026-06-22T19:13:38Z\"\nokf_version: \"0.1\"\nlicense: MIT\n---\n\n# Turn Closeout\n\nUse this skill to make final responses feel complete but still alive with momentum. The closeout should tell the user what happened, how it was verified, and what Codex recommends doing next.\n\n## Closeout Workflow\n\n1. Lead with the actual outcome in plain language.\n2. Include concrete proof when available: tests run, commands passed, links, IDs, artifacts, logs, or behavioral checks.\n3. Mention skipped or failed verification directly when it matters.\n4. Recommend only useful next steps that naturally follow from the work. Prefer 1-3 options; use more only when the user has a real branching decision.\n5. End with an explicit offer to continue: \"Would you like me to proceed with 1, 2, or 3?\"\n\n## Numbered Options\n\nMake options short and action-shaped:\n\n```text\nRecommended next steps:\n1. Run the production build.\n2. Open a quick browser verification pass.\n3. Commit and publish the branch.\n\nWould you like me to proceed with 1, 2, or 3?\n```\n\nFor one clear follow-up, use a single option:\n\n```text\nRecommended next step:\n1. Run the targeted regression test now.\n\nWould you like me to proceed with 1?\n```\n\n## Skip Conditions\n\nSkip the numbered closeout when:\n\n- The user asked a tiny factual question.\n- The final answer is already a direct command output or short status update.\n- The user explicitly asked not to continue or not to suggest follow-ups.\n- There is no meaningful next action.\n\n## Style\n\nKeep the closeout concise. Do not bury the result under process notes. Do not invent verification. Do not recommend generic chores unless they are genuinely relevant to the user's goal.\n",
    "files": [
      {
        "path": "agents/openai.yaml",
        "size": 231,
        "sha256": "c4524817a13082a8316bb57fe857c2377c2eb24d6d1c86815a6cacea8ecb8a4c",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "index.md",
        "size": 144,
        "sha256": "112baa86a76f77f392ebe4be8a041326a1bf9853068f680eff15ae7923dd1892",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "LICENSE.txt",
        "size": 1066,
        "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
        "executable": false,
        "contentType": "text/plain; charset=utf-8"
      },
      {
        "path": "SKILL.md",
        "size": 2280,
        "sha256": "501374a880d037a6b86ef8071c7e1a2ae037963ce8b350e294a0a618b1610c90",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      }
    ],
    "tree_hash": "7587ed728efc72b196181c92c6625ce5edc6b37d30ab29193ce64a8b4a1dc5bd",
    "storage_backend": "blob",
    "has_executable": false,
    "security_scan": {
      "verdict": "review",
      "risk": "low",
      "findings": [],
      "truncated": false,
      "scanned_at": "2026-06-25T07:12:37.118Z",
      "model": "google/gemini-2.5-flash-lite",
      "rubric_version": "v1",
      "scan_source": "model",
      "generated_by_model": true,
      "advisory": true
    },
    "signals": [
      {
        "id": "ai_scan",
        "label": "AI security scan",
        "scope": "skill",
        "status": "pass",
        "detail": "Advisory scan completed with no concrete findings."
      },
      {
        "id": "registered",
        "label": "On-chain identity",
        "scope": "author",
        "status": "pass",
        "detail": "Author is registered on-chain."
      },
      {
        "id": "vouched",
        "label": "Vouched by others",
        "scope": "author",
        "status": "pass",
        "detail": "Other accounts have staked USDC vouching for this author."
      },
      {
        "id": "author_bonded",
        "label": "Author bond",
        "scope": "author",
        "status": "pass",
        "detail": "Author posted a USDC self-bond (skin in the game)."
      },
      {
        "id": "dispute_free",
        "label": "Dispute history",
        "scope": "author",
        "status": "pass",
        "detail": "No disputes against this author."
      }
    ],
    "versions": [
      {
        "id": "4a0a5427-aaff-402a-911d-7564f9cf5632",
        "files": [
          {
            "path": "agents/openai.yaml",
            "size": 231,
            "sha256": "c4524817a13082a8316bb57fe857c2377c2eb24d6d1c86815a6cacea8ecb8a4c",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "index.md",
            "size": 144,
            "sha256": "112baa86a76f77f392ebe4be8a041326a1bf9853068f680eff15ae7923dd1892",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "LICENSE.txt",
            "size": 1066,
            "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
            "executable": false,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 2280,
            "sha256": "501374a880d037a6b86ef8071c7e1a2ae037963ce8b350e294a0a618b1610c90",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 3,
        "ipfs_cid": null,
        "changelog": "Synced from dirtybits/agent-skills",
        "tree_hash": "7587ed728efc72b196181c92c6625ce5edc6b37d30ab29193ce64a8b4a1dc5bd",
        "created_at": "2026-06-25T07:12:36.316292+00:00",
        "has_executable": false,
        "storage_backend": "blob"
      },
      {
        "id": "1d705d99-75a8-4878-a0cf-9e4f4cc4ec22",
        "files": [
          {
            "path": "agents/openai.yaml",
            "size": 231,
            "sha256": "c4524817a13082a8316bb57fe857c2377c2eb24d6d1c86815a6cacea8ecb8a4c",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "index.md",
            "size": 87,
            "sha256": "c688a3df552c4df0c9ca53e9f487413ed2a99ebbfb46c541d338a0d33581a2c2",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 2297,
            "sha256": "51665dc1701a78e31a90cba2b352bfcf4224749cd9e09696d0c100653b433a69",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 2,
        "ipfs_cid": null,
        "changelog": "Synced from dirtybits/agent-skills",
        "tree_hash": "96d5793eb6296031c689ecb062f26b0d913d868f0c93d988da1b6c2865d9a8fa",
        "created_at": "2026-06-23T07:04:11.064261+00:00",
        "has_executable": false,
        "storage_backend": "blob"
      },
      {
        "id": "f97b817a-6d43-47b5-b491-042e82d765b3",
        "files": [
          {
            "path": "agents/openai.yaml",
            "size": 231,
            "sha256": "c4524817a13082a8316bb57fe857c2377c2eb24d6d1c86815a6cacea8ecb8a4c",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "SKILL.md",
            "size": 2049,
            "sha256": "fc1dbf476d428bce092f7d02ca8145c9a6b23a1a6835aaa899f45ddfb4350891",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 1,
        "ipfs_cid": null,
        "changelog": "Initial release",
        "tree_hash": "deb4039b4937a36fb181c76688f8cc28d91004dc4b35348633ddfea584f52c9d",
        "created_at": "2026-06-16T20:12:49.148068+00:00",
        "has_executable": false,
        "storage_backend": "blob"
      }
    ],
    "author_trust": {
      "isRegistered": true,
      "registeredAt": 1779082335,
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "totalStakeAtRisk": 24250000,
      "authorBondUsdcMicros": 7250000,
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_trust_summary": {
      "username": "wallet-z7wzgw",
      "github_url": "https://github.com/dirtybits",
      "display_name": null,
      "github_login": "dirtybits",
      "isRegistered": true,
      "registeredAt": 1779082335,
      "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "wallet_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "schema_version": "2026-04-03",
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "trust_updated_at": "2026-09-22T04:52:30.978Z",
      "canonical_agent_id": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "recommended_action": "allow",
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_identity": {
      "id": "1f84a1fd-7c81-4925-9ea7-7b0ba6609697",
      "canonicalAgentId": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "identitySource": "local",
      "homeChainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "status": "active",
      "displayName": null,
      "username": "wallet-z7wzgw",
      "usernameSource": "fallback",
      "githubProfile": {
        "id": "28834908",
        "login": "dirtybits",
        "name": "andy",
        "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4",
        "url": "https://github.com/dirtybits"
      },
      "bindings": [
        {
          "id": "c11bf186-49aa-46d1-82a0-732d84071113",
          "metadata": null,
          "isPrimary": true,
          "bindingRef": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
          "bindingType": "wallet_owner",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "7ac9de7b-3020-4261-be2c-d7cbefa1d257",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "094fbb11-545b-41d7-b7e7-38d66a8c5fde",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "A4dgMn4WYSmFdisAkpKzFwUcLsPr4fBJU5nbKQHWHgeA",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "147b59b5-fb6f-4901-ad99-8fa8f742f4af",
          "metadata": {
            "id": "28834908",
            "url": "https://github.com/dirtybits",
            "name": "andy",
            "login": "dirtybits",
            "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4"
          },
          "isPrimary": false,
          "bindingRef": "github:28834908",
          "bindingType": "github_profile",
          "chainContext": "github",
          "externalAgentId": "28834908",
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        }
      ],
      "ownerWallet": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "operationalWallet": null,
      "agentProfilePda": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
      "registryAsset": null
    },
    "buyerHasPurchased": false,
    "buyerPurchaseSummary": null,
    "content_verification": {
      "has_ipfs": false,
      "all_versions_pinned": false,
      "current_cid_consistent": true,
      "status": "unverified"
    },
    "priceDisclosure": null,
    "purchaseRiskWarning": null
  },
  {
    "id": "81977f9c-c6e4-40fc-bf8e-5b7f77468487",
    "skill_id": "kora-paid-alpha-20260624",
    "public_slug": "kora-paid-alpha-20260624",
    "public_author_slug": "wallet-asuavudg",
    "author_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "author_kind": "wallet",
    "author_external_id": null,
    "author_handle": null,
    "author_display_name": null,
    "publisher_identity_key": "wallet:asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "publisher_tier": "registered",
    "mirror_source_key": null,
    "synced_repo_url": null,
    "name": "Kora Paid Test Alpha",
    "description": "Paid 1 USDC fixture for Kora sponsored checkout testing.",
    "tags": [
      "test",
      "kora",
      "paid"
    ],
    "current_version": 1,
    "summary": "Confirms Kora devnet checkout without performing external actions.",
    "summary_model": "google/gemini-2.5-flash-lite",
    "summary_sha256": "8402afabc36eaf6618590c724c8b41cc3c19504017701de0c7f2584becc91b0d",
    "summary_capabilities": [
      "Confirm checkout",
      "Devnet testing",
      "Return success message"
    ],
    "ipfs_cid": null,
    "on_chain_address": "Ba7E2UuEVRWXdX2y8nrRjYiAHRH1s3yehwBZfj4bUVtJ",
    "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
    "evm_listing_id": null,
    "evm_contract_address": null,
    "evm_tx_hash": null,
    "total_installs": 2,
    "price_usdc_micros": "1000000",
    "currency_mint": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    "on_chain_protocol_version": "v0.2.0",
    "on_chain_program_id": "AGNtBjLEHFnssPzQjZJnnqiaUgtkaxj4fFaWoKD6yVdg",
    "contact": null,
    "created_at": "2026-06-24T21:45:15.784Z",
    "updated_at": "2026-07-07T22:49:42.043Z",
    "source": "repo",
    "payment_flow": "direct-purchase-skill",
    "content": null,
    "files": [
      {
        "path": "SKILL.md",
        "size": 298,
        "sha256": "8402afabc36eaf6618590c724c8b41cc3c19504017701de0c7f2584becc91b0d",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      }
    ],
    "tree_hash": "61c27f7d8df6239e9cd9322ed16fb6310a595339a659275f1286e5f7b20f52e3",
    "storage_backend": "blob",
    "has_executable": false,
    "security_scan": {
      "verdict": "review",
      "risk": "low",
      "findings": [],
      "truncated": false,
      "scanned_at": "2026-06-24T21:45:17.345Z",
      "model": "google/gemini-2.5-flash-lite",
      "rubric_version": "v1",
      "scan_source": "model",
      "generated_by_model": true,
      "advisory": true
    },
    "signals": [
      {
        "id": "ai_scan",
        "label": "AI security scan",
        "scope": "skill",
        "status": "pass",
        "detail": "Advisory scan completed with no concrete findings."
      },
      {
        "id": "registered",
        "label": "On-chain identity",
        "scope": "author",
        "status": "pass",
        "detail": "Author is registered on-chain."
      },
      {
        "id": "vouched",
        "label": "Vouched by others",
        "scope": "author",
        "status": "pass",
        "detail": "Other accounts have staked USDC vouching for this author."
      },
      {
        "id": "author_bonded",
        "label": "Author bond",
        "scope": "author",
        "status": "pass",
        "detail": "Author posted a USDC self-bond (skin in the game)."
      },
      {
        "id": "dispute_free",
        "label": "Dispute history",
        "scope": "author",
        "status": "pass",
        "detail": "No disputes against this author."
      }
    ],
    "versions": [
      {
        "id": "a6781188-6219-45fe-a92e-8ada69bc38e1",
        "files": [
          {
            "path": "SKILL.md",
            "size": 298,
            "sha256": "8402afabc36eaf6618590c724c8b41cc3c19504017701de0c7f2584becc91b0d",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 1,
        "ipfs_cid": null,
        "changelog": "Initial release",
        "tree_hash": "61c27f7d8df6239e9cd9322ed16fb6310a595339a659275f1286e5f7b20f52e3",
        "created_at": "2026-06-24T21:45:15.882144+00:00",
        "has_executable": false,
        "storage_backend": "blob"
      }
    ],
    "author_trust": {
      "isRegistered": true,
      "registeredAt": 1779082335,
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "totalStakeAtRisk": 24250000,
      "authorBondUsdcMicros": 7250000,
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_trust_summary": {
      "username": "wallet-z7wzgw",
      "github_url": "https://github.com/dirtybits",
      "display_name": null,
      "github_login": "dirtybits",
      "isRegistered": true,
      "registeredAt": 1779082335,
      "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "wallet_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "schema_version": "2026-04-03",
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "trust_updated_at": "2026-09-22T04:52:30.978Z",
      "canonical_agent_id": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "recommended_action": "allow",
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_identity": {
      "id": "1f84a1fd-7c81-4925-9ea7-7b0ba6609697",
      "canonicalAgentId": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "identitySource": "local",
      "homeChainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "status": "active",
      "displayName": null,
      "username": "wallet-z7wzgw",
      "usernameSource": "fallback",
      "githubProfile": {
        "id": "28834908",
        "login": "dirtybits",
        "name": "andy",
        "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4",
        "url": "https://github.com/dirtybits"
      },
      "bindings": [
        {
          "id": "c11bf186-49aa-46d1-82a0-732d84071113",
          "metadata": null,
          "isPrimary": true,
          "bindingRef": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
          "bindingType": "wallet_owner",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "7ac9de7b-3020-4261-be2c-d7cbefa1d257",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "094fbb11-545b-41d7-b7e7-38d66a8c5fde",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "A4dgMn4WYSmFdisAkpKzFwUcLsPr4fBJU5nbKQHWHgeA",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "147b59b5-fb6f-4901-ad99-8fa8f742f4af",
          "metadata": {
            "id": "28834908",
            "url": "https://github.com/dirtybits",
            "name": "andy",
            "login": "dirtybits",
            "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4"
          },
          "isPrimary": false,
          "bindingRef": "github:28834908",
          "bindingType": "github_profile",
          "chainContext": "github",
          "externalAgentId": "28834908",
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        }
      ],
      "ownerWallet": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "operationalWallet": null,
      "agentProfilePda": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
      "registryAsset": null
    },
    "buyerHasPurchased": false,
    "buyerPurchaseSummary": null,
    "content_verification": {
      "has_ipfs": false,
      "all_versions_pinned": false,
      "current_cid_consistent": true,
      "status": "unverified"
    },
    "priceDisclosure": "Buying this skill transfers USDC and creates an on-chain purchase receipt, so your wallet still needs a small amount of SOL for rent and network fees.",
    "purchaseRiskWarning": null
  },
  {
    "id": "c23a0890-59fa-42aa-bda7-6af02cde73d9",
    "skill_id": "phase-pr-review-loop",
    "public_slug": "phase-pr-review-loop",
    "public_author_slug": "wallet-asuavudg",
    "author_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "author_kind": "wallet",
    "author_external_id": null,
    "author_handle": null,
    "author_display_name": null,
    "publisher_identity_key": "wallet:asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "publisher_tier": "registered",
    "mirror_source_key": null,
    "synced_repo_url": "https://github.com/dirtybits/agent-skills",
    "name": "Phase Pr Review Loop",
    "description": "Ship multi-phase engineering work as one-PR-per-phase with plan-first review, adversarial cross-agent code review, per-thread fix verification, and an honest phase status ledger. Use when executing a phased plan across sessions or agents, when asked to rev",
    "tags": [
      "mit"
    ],
    "current_version": 1,
    "summary": "Manages phased engineering work via PRs, ensuring plan alignment and verified fixes through iterative review.",
    "summary_model": "google/gemini-2.5-flash-lite",
    "summary_sha256": "421f2cde40ecbdfaa738c566facc5e9494dbe10ce0bef579d7cd12c0f34a825e",
    "summary_capabilities": [
      "Plan review",
      "Phased PRs",
      "Per-thread verification",
      "Ledger tracking"
    ],
    "ipfs_cid": null,
    "on_chain_address": null,
    "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
    "evm_listing_id": null,
    "evm_contract_address": null,
    "evm_tx_hash": null,
    "total_installs": 2,
    "price_usdc_micros": null,
    "currency_mint": null,
    "on_chain_protocol_version": null,
    "on_chain_program_id": null,
    "contact": "https://github.com/dirtybits/agent-skills/tree/main/skills/phase-pr-review-loop",
    "created_at": "2026-07-07T07:52:30.171Z",
    "updated_at": "2026-07-13T22:46:25.920Z",
    "source": "repo",
    "payment_flow": "free",
    "content": "---\ntype: Skill\nname: phase-pr-review-loop\ntitle: \"Phase PR Review Loop\"\ndescription: Ship multi-phase engineering work as one-PR-per-phase with plan-first review, adversarial cross-agent code review, per-thread fix verification, and an honest phase status ledger. Use when executing a phased plan across sessions or agents, when asked to review or babysit a PR produced by another agent, when responding to review findings, or when deciding whether a phase is actually done. Pairs with the plan-writing skill.\nresource: \"https://github.com/dirtybits/agent-skills/tree/main/skills/phase-pr-review-loop\"\ntags: [\"code-review\", \"pull-requests\", \"workflow\", \"multi-agent\", \"verification\"]\ntimestamp: \"2026-07-06T20:00:00Z\"\nokf_version: \"0.1\"\nlicense: MIT\n---\n\n# Phase PR Review Loop\n\n## Why this skill exists\n\nLarge changes shipped by agents fail in two characteristic ways: the plan drifts from what was built, and review findings get \"fixed\" in bulk without anyone verifying each fix. This loop prevents both. It has shipped multi-month, multi-agent migration work reliably because every unit is independently reviewable, every finding is closed with evidence, and a fresh session can take over by reading the ledger alone.\n\n## 1. The loop\n\n```\nplan PR  →  plan review  →  implement (one phase = one branch)  →  phase PR\n   →  reviewer briefing  →  findings as review threads\n   →  fix each thread + reply with evidence  →  re-review  →  merge\n   →  update the phase ledger  →  next phase\n```\n\n### Plan first, and review the plan as a PR\n\n1. Non-trivial phases start as a `.plan.md` (see the plan-writing skill): goal, in/out scope, exact files, verification commands, done-when, rollback.\n2. Open the plan itself as a PR **before implementation** and have a different agent (or the human) review it. Plan review is where scope creep, missing gates, and wrong sequencing get caught cheaply — a finding here costs minutes; the same finding post-implementation costs a rework cycle.\n3. Dated notes in the plan override its original ordering. When implementation diverges, append a dated note at the point of divergence — never let the plan lie.\n\n### One phase = one PR\n\n4. Each phase lands as one PR off current `main`, on its own branch (`feat/<work>-phase-<N>`). Never stack multiple phases on a branch; the handoff boundary must be clean enough that a different session can take over between phases.\n5. The PR description states: what the phase did, the verification that ran (commands + results), and **what was explicitly NOT verified** (e.g. \"browser wallet smoke not run — tracked in the plan\"). An honest \"not verified\" beats a false \"done\".\n\n### Reviewer briefing\n\n6. When handing a PR to a reviewing agent, write a briefing rather than \"please review\": the phase's goal, the invariants that must hold (link the plan section), the riskiest diff areas, what was already verified, and what the reviewer should try to break. Ask for adversarial review — findings the author would dispute are the valuable ones.\n7. The reviewer posts findings as **inline review threads** (one finding per thread), each with: file/line, the defect stated as a failure scenario (\"with input X, Y happens\"), and severity. Vague findings (\"could be cleaner\") are comments, not threads.\n\n### Per-thread fix verification (the load-bearing step)\n\n8. Fix findings **one thread at a time**. For each thread: make the fix, run the narrowest check that proves it (a specific test, a repro command, a grep), and reply **on that thread** with the evidence (commit SHA + what was run + result) before resolving it.\n9. Never batch-resolve threads with \"all fixed\". A thread without fix evidence is not closed. If a finding is rejected, reply with the reasoning and let the reviewer (or human) resolve it — the author does not unilaterally dismiss findings.\n10. After all threads close, the reviewer does one more pass over the full diff (fixes introduce bugs too).\n\n## 2. GitHub mechanics that trip agents up\n\n- You **cannot APPROVE your own PR** (or a PR your account authored). When acting as reviewer on a same-account PR, leave a review comment with an explicit verdict line (e.g. \"LGTM — all threads verified\") instead of an Approve event.\n- Submit structured reviews with `gh api repos/{owner}/{repo}/pulls/{n}/reviews -f event=COMMENT --input body.json` when you need inline comments; `gh pr review` alone cannot attach line comments.\n- Read unresolved threads with GraphQL (`gh api graphql` on `reviewThreads` with `isResolved`), not just `gh pr view --comments` — top-level comments and review threads are different objects, and fix verification happens on threads.\n- Reply on a thread via the review-comment reply endpoint (`gh api repos/{owner}/{repo}/pulls/{n}/comments -f body=... -F in_reply_to=<comment-id>`).\n- `gh pr view <n> --json state,reviews,statusCheckRollup` is the truth for phase status — trust it and the plan ledger over prose in handoff messages.\n\n## 3. The phase status ledger\n\nKeep one authoritative record of phase status — the plan file's frontmatter todos plus dated body notes:\n\n- `pending` / `in_progress` / `completed`, updated **as work happens**, not batched at session end.\n- `completed` requires the phase's **done-when** to have passed: verification evidence, not compilation. If part of the done-when was deferred (e.g. a live smoke), the todo stays honest: either `in_progress`, or `completed` with the deferral named in the note and tracked in a later phase.\n- Each completed phase's entry names its PR number and date, so `git log`, `gh pr view`, and the ledger cross-check each other.\n\n## 4. Verification evidence standards\n\nA phase PR's \"verified\" claim must be reproducible from the description alone:\n\n- Exact commands run (lint/typecheck/tests/build) and their result counts.\n- For live-flow phases: transaction hashes / request IDs / screenshots / balance deltas / DB rows — concrete artifacts, not \"it works\".\n- Negative checks where they matter (the unauthorized path still rejects; the duplicate submit is idempotent).\n- Anything not run is listed under \"Not verified\" with where it is tracked.\n\n## 5. Done-when for this skill\n\nThe loop was followed when: the plan was reviewed before implementation; the phase landed as one PR with an honest verified/not-verified split; every review thread closed with per-thread fix evidence; the ledger's statuses match `gh pr view` reality; and a fresh session could pick up the next phase from the ledger without asking anyone.\n",
    "files": [
      {
        "path": "index.md",
        "size": 158,
        "sha256": "193ffe21690b31e620a7aaa0cad88a838a0ce022979922b3129a662a02f5c795",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "LICENSE.txt",
        "size": 1066,
        "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
        "executable": false,
        "contentType": "text/plain; charset=utf-8"
      },
      {
        "path": "SKILL.md",
        "size": 6532,
        "sha256": "421f2cde40ecbdfaa738c566facc5e9494dbe10ce0bef579d7cd12c0f34a825e",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      }
    ],
    "tree_hash": "376967d551224d5a7625612c630b41cbe8eaa2794a268895311f8f879757b92d",
    "storage_backend": "blob",
    "has_executable": false,
    "security_scan": {
      "verdict": "review",
      "risk": "low",
      "findings": [],
      "truncated": false,
      "scanned_at": "2026-07-07T07:52:31.185Z",
      "model": "google/gemini-2.5-flash-lite",
      "rubric_version": "v1",
      "scan_source": "model",
      "generated_by_model": true,
      "advisory": true
    },
    "signals": [
      {
        "id": "ai_scan",
        "label": "AI security scan",
        "scope": "skill",
        "status": "pass",
        "detail": "Advisory scan completed with no concrete findings."
      },
      {
        "id": "registered",
        "label": "On-chain identity",
        "scope": "author",
        "status": "pass",
        "detail": "Author is registered on-chain."
      },
      {
        "id": "vouched",
        "label": "Vouched by others",
        "scope": "author",
        "status": "pass",
        "detail": "Other accounts have staked USDC vouching for this author."
      },
      {
        "id": "author_bonded",
        "label": "Author bond",
        "scope": "author",
        "status": "pass",
        "detail": "Author posted a USDC self-bond (skin in the game)."
      },
      {
        "id": "dispute_free",
        "label": "Dispute history",
        "scope": "author",
        "status": "pass",
        "detail": "No disputes against this author."
      }
    ],
    "versions": [
      {
        "id": "20ea91bb-254d-4a79-b945-d00223c6a018",
        "files": [
          {
            "path": "index.md",
            "size": 158,
            "sha256": "193ffe21690b31e620a7aaa0cad88a838a0ce022979922b3129a662a02f5c795",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "LICENSE.txt",
            "size": 1066,
            "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
            "executable": false,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 6532,
            "sha256": "421f2cde40ecbdfaa738c566facc5e9494dbe10ce0bef579d7cd12c0f34a825e",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 1,
        "ipfs_cid": null,
        "changelog": "Synced from dirtybits/agent-skills",
        "tree_hash": "376967d551224d5a7625612c630b41cbe8eaa2794a268895311f8f879757b92d",
        "created_at": "2026-07-07T07:52:30.171559+00:00",
        "has_executable": false,
        "storage_backend": "blob"
      }
    ],
    "author_trust": {
      "isRegistered": true,
      "registeredAt": 1779082335,
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "totalStakeAtRisk": 24250000,
      "authorBondUsdcMicros": 7250000,
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_trust_summary": {
      "username": "wallet-z7wzgw",
      "github_url": "https://github.com/dirtybits",
      "display_name": null,
      "github_login": "dirtybits",
      "isRegistered": true,
      "registeredAt": 1779082335,
      "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "wallet_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "schema_version": "2026-04-03",
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "trust_updated_at": "2026-09-22T04:52:30.978Z",
      "canonical_agent_id": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "recommended_action": "allow",
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_identity": {
      "id": "1f84a1fd-7c81-4925-9ea7-7b0ba6609697",
      "canonicalAgentId": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "identitySource": "local",
      "homeChainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "status": "active",
      "displayName": null,
      "username": "wallet-z7wzgw",
      "usernameSource": "fallback",
      "githubProfile": {
        "id": "28834908",
        "login": "dirtybits",
        "name": "andy",
        "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4",
        "url": "https://github.com/dirtybits"
      },
      "bindings": [
        {
          "id": "c11bf186-49aa-46d1-82a0-732d84071113",
          "metadata": null,
          "isPrimary": true,
          "bindingRef": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
          "bindingType": "wallet_owner",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "7ac9de7b-3020-4261-be2c-d7cbefa1d257",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "094fbb11-545b-41d7-b7e7-38d66a8c5fde",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "A4dgMn4WYSmFdisAkpKzFwUcLsPr4fBJU5nbKQHWHgeA",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "147b59b5-fb6f-4901-ad99-8fa8f742f4af",
          "metadata": {
            "id": "28834908",
            "url": "https://github.com/dirtybits",
            "name": "andy",
            "login": "dirtybits",
            "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4"
          },
          "isPrimary": false,
          "bindingRef": "github:28834908",
          "bindingType": "github_profile",
          "chainContext": "github",
          "externalAgentId": "28834908",
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        }
      ],
      "ownerWallet": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "operationalWallet": null,
      "agentProfilePda": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
      "registryAsset": null
    },
    "buyerHasPurchased": false,
    "buyerPurchaseSummary": null,
    "content_verification": {
      "has_ipfs": false,
      "all_versions_pinned": false,
      "current_cid_consistent": true,
      "status": "unverified"
    },
    "priceDisclosure": null,
    "purchaseRiskWarning": null
  },
  {
    "id": "15025e15-24e2-4edb-a247-f90fc9bd0d3a",
    "skill_id": "another-skill-to-delete",
    "public_slug": "another-skill-to-delete",
    "public_author_slug": "wallet-asuavudg",
    "author_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "author_kind": "wallet",
    "author_external_id": null,
    "author_handle": null,
    "author_display_name": null,
    "publisher_identity_key": "wallet:asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "publisher_tier": "registered",
    "mirror_source_key": null,
    "synced_repo_url": null,
    "name": "Another Skill to delete",
    "description": null,
    "tags": [
      "test",
      "delete"
    ],
    "current_version": 1,
    "summary": "Removes another skill for deletion.",
    "summary_model": "google/gemini-2.5-flash-lite",
    "summary_sha256": "c97370cac507dbabeb6ae7c5e6e9c63eaaa7ea3cf17ab9ecff353320ccf5c9e6",
    "summary_capabilities": [
      "Remove skill",
      "Skill deletion"
    ],
    "ipfs_cid": null,
    "on_chain_address": "32FDhZqBqWQAEYyQBjZeWFYYNvS131cKZgzfUwruM51t",
    "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
    "evm_listing_id": null,
    "evm_contract_address": null,
    "evm_tx_hash": null,
    "total_installs": 1,
    "price_usdc_micros": "1250000",
    "currency_mint": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    "on_chain_protocol_version": "v0.2.0",
    "on_chain_program_id": "AGNtBjLEHFnssPzQjZJnnqiaUgtkaxj4fFaWoKD6yVdg",
    "contact": null,
    "created_at": "2026-06-30T22:48:44.029Z",
    "updated_at": "2026-06-30T22:57:41.575Z",
    "source": "repo",
    "payment_flow": "direct-purchase-skill",
    "content": null,
    "files": [
      {
        "path": "SKILL.md",
        "size": 25,
        "sha256": "c97370cac507dbabeb6ae7c5e6e9c63eaaa7ea3cf17ab9ecff353320ccf5c9e6",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      }
    ],
    "tree_hash": "d5ec912d42c96b3b98e4052adb9efd0a177872608d82576eb40e584ce1d73936",
    "storage_backend": "blob",
    "has_executable": false,
    "security_scan": {
      "verdict": "review",
      "risk": "low",
      "findings": [],
      "truncated": false,
      "scanned_at": "2026-06-30T22:48:45.164Z",
      "model": "google/gemini-2.5-flash-lite",
      "rubric_version": "v1",
      "scan_source": "model",
      "generated_by_model": true,
      "advisory": true
    },
    "signals": [
      {
        "id": "ai_scan",
        "label": "AI security scan",
        "scope": "skill",
        "status": "pass",
        "detail": "Advisory scan completed with no concrete findings."
      },
      {
        "id": "registered",
        "label": "On-chain identity",
        "scope": "author",
        "status": "pass",
        "detail": "Author is registered on-chain."
      },
      {
        "id": "vouched",
        "label": "Vouched by others",
        "scope": "author",
        "status": "pass",
        "detail": "Other accounts have staked USDC vouching for this author."
      },
      {
        "id": "author_bonded",
        "label": "Author bond",
        "scope": "author",
        "status": "pass",
        "detail": "Author posted a USDC self-bond (skin in the game)."
      },
      {
        "id": "dispute_free",
        "label": "Dispute history",
        "scope": "author",
        "status": "pass",
        "detail": "No disputes against this author."
      }
    ],
    "versions": [
      {
        "id": "ec57140d-69b3-4353-8567-5938cab458ed",
        "files": [
          {
            "path": "SKILL.md",
            "size": 25,
            "sha256": "c97370cac507dbabeb6ae7c5e6e9c63eaaa7ea3cf17ab9ecff353320ccf5c9e6",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 1,
        "ipfs_cid": null,
        "changelog": "Initial release",
        "tree_hash": "d5ec912d42c96b3b98e4052adb9efd0a177872608d82576eb40e584ce1d73936",
        "created_at": "2026-06-30T22:48:44.128576+00:00",
        "has_executable": false,
        "storage_backend": "blob"
      }
    ],
    "author_trust": {
      "isRegistered": true,
      "registeredAt": 1779082335,
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "totalStakeAtRisk": 24250000,
      "authorBondUsdcMicros": 7250000,
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_trust_summary": {
      "username": "wallet-z7wzgw",
      "github_url": "https://github.com/dirtybits",
      "display_name": null,
      "github_login": "dirtybits",
      "isRegistered": true,
      "registeredAt": 1779082335,
      "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "wallet_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "schema_version": "2026-04-03",
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "trust_updated_at": "2026-09-22T04:52:30.978Z",
      "canonical_agent_id": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "recommended_action": "allow",
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_identity": {
      "id": "1f84a1fd-7c81-4925-9ea7-7b0ba6609697",
      "canonicalAgentId": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "identitySource": "local",
      "homeChainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "status": "active",
      "displayName": null,
      "username": "wallet-z7wzgw",
      "usernameSource": "fallback",
      "githubProfile": {
        "id": "28834908",
        "login": "dirtybits",
        "name": "andy",
        "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4",
        "url": "https://github.com/dirtybits"
      },
      "bindings": [
        {
          "id": "c11bf186-49aa-46d1-82a0-732d84071113",
          "metadata": null,
          "isPrimary": true,
          "bindingRef": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
          "bindingType": "wallet_owner",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "7ac9de7b-3020-4261-be2c-d7cbefa1d257",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "094fbb11-545b-41d7-b7e7-38d66a8c5fde",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "A4dgMn4WYSmFdisAkpKzFwUcLsPr4fBJU5nbKQHWHgeA",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "147b59b5-fb6f-4901-ad99-8fa8f742f4af",
          "metadata": {
            "id": "28834908",
            "url": "https://github.com/dirtybits",
            "name": "andy",
            "login": "dirtybits",
            "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4"
          },
          "isPrimary": false,
          "bindingRef": "github:28834908",
          "bindingType": "github_profile",
          "chainContext": "github",
          "externalAgentId": "28834908",
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        }
      ],
      "ownerWallet": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "operationalWallet": null,
      "agentProfilePda": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
      "registryAsset": null
    },
    "buyerHasPurchased": false,
    "buyerPurchaseSummary": null,
    "content_verification": {
      "has_ipfs": false,
      "all_versions_pinned": false,
      "current_cid_consistent": true,
      "status": "unverified"
    },
    "priceDisclosure": "Buying this skill transfers USDC and creates an on-chain purchase receipt, so your wallet still needs a small amount of SOL for rent and network fees.",
    "purchaseRiskWarning": null
  },
  {
    "id": "aaf64c25-eb74-41af-be4e-d4658361bf3a",
    "skill_id": "kora-paid-gamma-20260624",
    "public_slug": "kora-paid-gamma-20260624",
    "public_author_slug": "wallet-asuavudg",
    "author_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "author_kind": "wallet",
    "author_external_id": null,
    "author_handle": null,
    "author_display_name": null,
    "publisher_identity_key": "wallet:asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "publisher_tier": "registered",
    "mirror_source_key": null,
    "synced_repo_url": null,
    "name": "Kora Paid Test Gamma",
    "description": "Third paid 1 USDC fixture for Kora sponsored checkout testing.",
    "tags": [
      "test",
      "kora",
      "paid"
    ],
    "current_version": 1,
    "summary": "Confirms AgentVouch devnet checkout and returns a success message.",
    "summary_model": "google/gemini-2.5-flash-lite",
    "summary_sha256": "cbf4adc705af052875eab7919a8a2113e0fa288cce2bbc9a726806054ee35951",
    "summary_capabilities": [
      "Confirm checkout",
      "Return success message",
      "Devnet testing"
    ],
    "ipfs_cid": null,
    "on_chain_address": "B35yqKie5htT2SMcCUDic2nMeAZhgGN1AzvufgHW27Et",
    "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
    "evm_listing_id": null,
    "evm_contract_address": null,
    "evm_tx_hash": null,
    "total_installs": 1,
    "price_usdc_micros": "1000000",
    "currency_mint": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    "on_chain_protocol_version": "v0.2.0",
    "on_chain_program_id": "AGNtBjLEHFnssPzQjZJnnqiaUgtkaxj4fFaWoKD6yVdg",
    "contact": null,
    "created_at": "2026-06-24T21:46:00.192Z",
    "updated_at": "2026-06-24T22:15:37.558Z",
    "source": "repo",
    "payment_flow": "direct-purchase-skill",
    "content": null,
    "files": [
      {
        "path": "SKILL.md",
        "size": 302,
        "sha256": "cbf4adc705af052875eab7919a8a2113e0fa288cce2bbc9a726806054ee35951",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      }
    ],
    "tree_hash": "5009e13462d3c27efde7e6e24b62d101894d5eb7da27daf343b9a045100bb198",
    "storage_backend": "blob",
    "has_executable": false,
    "security_scan": {
      "verdict": "review",
      "risk": "low",
      "findings": [],
      "truncated": false,
      "scanned_at": "2026-06-24T21:46:01.339Z",
      "model": "google/gemini-2.5-flash-lite",
      "rubric_version": "v1",
      "scan_source": "model",
      "generated_by_model": true,
      "advisory": true
    },
    "signals": [
      {
        "id": "ai_scan",
        "label": "AI security scan",
        "scope": "skill",
        "status": "pass",
        "detail": "Advisory scan completed with no concrete findings."
      },
      {
        "id": "registered",
        "label": "On-chain identity",
        "scope": "author",
        "status": "pass",
        "detail": "Author is registered on-chain."
      },
      {
        "id": "vouched",
        "label": "Vouched by others",
        "scope": "author",
        "status": "pass",
        "detail": "Other accounts have staked USDC vouching for this author."
      },
      {
        "id": "author_bonded",
        "label": "Author bond",
        "scope": "author",
        "status": "pass",
        "detail": "Author posted a USDC self-bond (skin in the game)."
      },
      {
        "id": "dispute_free",
        "label": "Dispute history",
        "scope": "author",
        "status": "pass",
        "detail": "No disputes against this author."
      }
    ],
    "versions": [
      {
        "id": "e5a1800f-c8bc-4f0d-9b03-03ce3f227811",
        "files": [
          {
            "path": "SKILL.md",
            "size": 302,
            "sha256": "cbf4adc705af052875eab7919a8a2113e0fa288cce2bbc9a726806054ee35951",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 1,
        "ipfs_cid": null,
        "changelog": "Initial release",
        "tree_hash": "5009e13462d3c27efde7e6e24b62d101894d5eb7da27daf343b9a045100bb198",
        "created_at": "2026-06-24T21:46:00.244957+00:00",
        "has_executable": false,
        "storage_backend": "blob"
      }
    ],
    "author_trust": {
      "isRegistered": true,
      "registeredAt": 1779082335,
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "totalStakeAtRisk": 24250000,
      "authorBondUsdcMicros": 7250000,
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_trust_summary": {
      "username": "wallet-z7wzgw",
      "github_url": "https://github.com/dirtybits",
      "display_name": null,
      "github_login": "dirtybits",
      "isRegistered": true,
      "registeredAt": 1779082335,
      "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "wallet_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "schema_version": "2026-04-03",
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "trust_updated_at": "2026-09-22T04:52:30.978Z",
      "canonical_agent_id": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "recommended_action": "allow",
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_identity": {
      "id": "1f84a1fd-7c81-4925-9ea7-7b0ba6609697",
      "canonicalAgentId": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "identitySource": "local",
      "homeChainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "status": "active",
      "displayName": null,
      "username": "wallet-z7wzgw",
      "usernameSource": "fallback",
      "githubProfile": {
        "id": "28834908",
        "login": "dirtybits",
        "name": "andy",
        "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4",
        "url": "https://github.com/dirtybits"
      },
      "bindings": [
        {
          "id": "c11bf186-49aa-46d1-82a0-732d84071113",
          "metadata": null,
          "isPrimary": true,
          "bindingRef": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
          "bindingType": "wallet_owner",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "7ac9de7b-3020-4261-be2c-d7cbefa1d257",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "094fbb11-545b-41d7-b7e7-38d66a8c5fde",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "A4dgMn4WYSmFdisAkpKzFwUcLsPr4fBJU5nbKQHWHgeA",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "147b59b5-fb6f-4901-ad99-8fa8f742f4af",
          "metadata": {
            "id": "28834908",
            "url": "https://github.com/dirtybits",
            "name": "andy",
            "login": "dirtybits",
            "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4"
          },
          "isPrimary": false,
          "bindingRef": "github:28834908",
          "bindingType": "github_profile",
          "chainContext": "github",
          "externalAgentId": "28834908",
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        }
      ],
      "ownerWallet": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "operationalWallet": null,
      "agentProfilePda": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
      "registryAsset": null
    },
    "buyerHasPurchased": false,
    "buyerPurchaseSummary": null,
    "content_verification": {
      "has_ipfs": false,
      "all_versions_pinned": false,
      "current_cid_consistent": true,
      "status": "unverified"
    },
    "priceDisclosure": "Buying this skill transfers USDC and creates an on-chain purchase receipt, so your wallet still needs a small amount of SOL for rent and network fees.",
    "purchaseRiskWarning": null
  },
  {
    "id": "437c9a25-009b-450b-8445-d6aa53a64428",
    "skill_id": "kora-paid-beta-20260624",
    "public_slug": "kora-paid-beta-20260624",
    "public_author_slug": "wallet-asuavudg",
    "author_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "author_kind": "wallet",
    "author_external_id": null,
    "author_handle": null,
    "author_display_name": null,
    "publisher_identity_key": "wallet:asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "publisher_tier": "registered",
    "mirror_source_key": null,
    "synced_repo_url": null,
    "name": "Kora Paid Test Beta",
    "description": "Second paid 1 USDC fixture for Kora sponsored checkout testing.",
    "tags": [
      "test",
      "kora",
      "paid"
    ],
    "current_version": 1,
    "summary": "Tests AgentVouch devnet checkout and wallet switching.",
    "summary_model": "google/gemini-2.5-flash-lite",
    "summary_sha256": "1f05e202ae169b755c01de1b76b03afbe23dfc0315c7ac7c7045d10e92c29d57",
    "summary_capabilities": [
      "Confirm checkout",
      "Return success message",
      "No external actions"
    ],
    "ipfs_cid": null,
    "on_chain_address": "FvgUsjV1crGFFgN1qZkUNorL1yQ7zjWMfC7fTkXhMfEH",
    "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
    "evm_listing_id": null,
    "evm_contract_address": null,
    "evm_tx_hash": null,
    "total_installs": 1,
    "price_usdc_micros": "1000000",
    "currency_mint": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    "on_chain_protocol_version": "v0.2.0",
    "on_chain_program_id": "AGNtBjLEHFnssPzQjZJnnqiaUgtkaxj4fFaWoKD6yVdg",
    "contact": null,
    "created_at": "2026-06-24T21:45:38.511Z",
    "updated_at": "2026-06-24T22:17:10.765Z",
    "source": "repo",
    "payment_flow": "direct-purchase-skill",
    "content": null,
    "files": [
      {
        "path": "SKILL.md",
        "size": 304,
        "sha256": "1f05e202ae169b755c01de1b76b03afbe23dfc0315c7ac7c7045d10e92c29d57",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      }
    ],
    "tree_hash": "f77bc9ceaff7cac37ab4ff57141497ece7b80440847a0f599b28d0833f14fad0",
    "storage_backend": "blob",
    "has_executable": false,
    "security_scan": {
      "verdict": "review",
      "risk": "low",
      "findings": [],
      "truncated": false,
      "scanned_at": "2026-06-24T21:45:39.469Z",
      "model": "google/gemini-2.5-flash-lite",
      "rubric_version": "v1",
      "scan_source": "model",
      "generated_by_model": true,
      "advisory": true
    },
    "signals": [
      {
        "id": "ai_scan",
        "label": "AI security scan",
        "scope": "skill",
        "status": "pass",
        "detail": "Advisory scan completed with no concrete findings."
      },
      {
        "id": "registered",
        "label": "On-chain identity",
        "scope": "author",
        "status": "pass",
        "detail": "Author is registered on-chain."
      },
      {
        "id": "vouched",
        "label": "Vouched by others",
        "scope": "author",
        "status": "pass",
        "detail": "Other accounts have staked USDC vouching for this author."
      },
      {
        "id": "author_bonded",
        "label": "Author bond",
        "scope": "author",
        "status": "pass",
        "detail": "Author posted a USDC self-bond (skin in the game)."
      },
      {
        "id": "dispute_free",
        "label": "Dispute history",
        "scope": "author",
        "status": "pass",
        "detail": "No disputes against this author."
      }
    ],
    "versions": [
      {
        "id": "e4691218-ea41-43b1-9b28-81f67531bbdd",
        "files": [
          {
            "path": "SKILL.md",
            "size": 304,
            "sha256": "1f05e202ae169b755c01de1b76b03afbe23dfc0315c7ac7c7045d10e92c29d57",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 1,
        "ipfs_cid": null,
        "changelog": "Initial release",
        "tree_hash": "f77bc9ceaff7cac37ab4ff57141497ece7b80440847a0f599b28d0833f14fad0",
        "created_at": "2026-06-24T21:45:38.562559+00:00",
        "has_executable": false,
        "storage_backend": "blob"
      }
    ],
    "author_trust": {
      "isRegistered": true,
      "registeredAt": 1779082335,
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "totalStakeAtRisk": 24250000,
      "authorBondUsdcMicros": 7250000,
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_trust_summary": {
      "username": "wallet-z7wzgw",
      "github_url": "https://github.com/dirtybits",
      "display_name": null,
      "github_login": "dirtybits",
      "isRegistered": true,
      "registeredAt": 1779082335,
      "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "wallet_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "schema_version": "2026-04-03",
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "trust_updated_at": "2026-09-22T04:52:30.978Z",
      "canonical_agent_id": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "recommended_action": "allow",
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_identity": {
      "id": "1f84a1fd-7c81-4925-9ea7-7b0ba6609697",
      "canonicalAgentId": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "identitySource": "local",
      "homeChainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "status": "active",
      "displayName": null,
      "username": "wallet-z7wzgw",
      "usernameSource": "fallback",
      "githubProfile": {
        "id": "28834908",
        "login": "dirtybits",
        "name": "andy",
        "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4",
        "url": "https://github.com/dirtybits"
      },
      "bindings": [
        {
          "id": "c11bf186-49aa-46d1-82a0-732d84071113",
          "metadata": null,
          "isPrimary": true,
          "bindingRef": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
          "bindingType": "wallet_owner",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "7ac9de7b-3020-4261-be2c-d7cbefa1d257",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "094fbb11-545b-41d7-b7e7-38d66a8c5fde",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "A4dgMn4WYSmFdisAkpKzFwUcLsPr4fBJU5nbKQHWHgeA",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "147b59b5-fb6f-4901-ad99-8fa8f742f4af",
          "metadata": {
            "id": "28834908",
            "url": "https://github.com/dirtybits",
            "name": "andy",
            "login": "dirtybits",
            "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4"
          },
          "isPrimary": false,
          "bindingRef": "github:28834908",
          "bindingType": "github_profile",
          "chainContext": "github",
          "externalAgentId": "28834908",
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        }
      ],
      "ownerWallet": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "operationalWallet": null,
      "agentProfilePda": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
      "registryAsset": null
    },
    "buyerHasPurchased": false,
    "buyerPurchaseSummary": null,
    "content_verification": {
      "has_ipfs": false,
      "all_versions_pinned": false,
      "current_cid_consistent": true,
      "status": "unverified"
    },
    "priceDisclosure": "Buying this skill transfers USDC and creates an on-chain purchase receipt, so your wallet still needs a small amount of SOL for rent and network fees.",
    "purchaseRiskWarning": null
  },
  {
    "id": "fa62519c-c2a6-48ac-97ed-9371495d9f23",
    "skill_id": "simplified-technical-english",
    "public_slug": "simplified-technical-english",
    "public_author_slug": "wallet-asuavudg",
    "author_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "author_kind": "wallet",
    "author_external_id": null,
    "author_handle": null,
    "author_display_name": null,
    "publisher_identity_key": "wallet:asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "publisher_tier": "registered",
    "mirror_source_key": null,
    "synced_repo_url": "https://github.com/dirtybits/agent-skills",
    "name": "Simplified Technical English",
    "description": "Write and revise technical content so labels, headings, instructions, plans, status names, error messages, identifiers, and Git branches are clear without hidden context. Use when creating or reviewing technical documentation, operational procedures, UI la",
    "tags": [],
    "current_version": 1,
    "summary": "Writes and revises technical content for clarity without hidden context.",
    "summary_model": "google/gemini-2.5-flash-lite",
    "summary_sha256": "e4200e99b43126167eb311b1c60ea5ff80f212c44e54e1e9adabf1156c016697",
    "summary_capabilities": [
      "Clarify labels",
      "Revise instructions",
      "Standardize terms",
      "Format Git branches"
    ],
    "ipfs_cid": null,
    "on_chain_address": null,
    "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
    "evm_listing_id": null,
    "evm_contract_address": null,
    "evm_tx_hash": null,
    "total_installs": 1,
    "price_usdc_micros": null,
    "currency_mint": null,
    "on_chain_protocol_version": null,
    "on_chain_program_id": null,
    "contact": "https://github.com/dirtybits/agent-skills/tree/main/skills/simplified-technical-english",
    "created_at": "2026-08-02T07:18:51.268Z",
    "updated_at": "2026-08-17T01:35:05.008Z",
    "source": "repo",
    "payment_flow": "free",
    "content": "---\ntype: Skill\nname: simplified-technical-english\ntitle: \"Simplified Technical English\"\ndescription: \"Write and revise technical content so labels, headings, instructions, plans, status names, error messages, identifiers, and Git branches are clear without hidden context. Use when creating or reviewing technical documentation, operational procedures, UI labels, project phases or gates, issue and PR titles, and branch names; especially when text contains unexplained shorthand, vague labels, long instructions, inconsistent terms, or branches such as work/updates that do not identify the change type and topic.\"\nresource: \"https://en.wikipedia.org/wiki/Simplified_Technical_English\"\ntags: [documentation, technical-writing, naming, git, workflow]\ntimestamp: \"2026-08-01T11:35:55Z\"\nokf_version: \"0.1\"\nlicense: MIT\n---\n\n# Simplified Technical English\n\nUse clear, controlled technical English. Make each label and instruction understandable without\nprivate context. Preserve technical accuracy while reducing ambiguity.\n\n## Core Rules\n\n1. **Name the topic in every label.** Make a heading, gate, phase, mode, or status understandable in\n   isolation.\n   - Use: `Base Sepolia Gate A — Pre-deployment verification`.\n   - Do not use: `Gate A`.\n   - Use: `Stripe Checkout Phase 2 — Webhook reconciliation`.\n   - Do not use: `Phase 2`.\n2. **Use one term for one meaning.** Select a canonical term and use it consistently. Do not switch\n   between synonyms such as `report`, `claim`, and `dispute` unless they identify different objects.\n3. **Use one topic per paragraph.** Split mixed requirements, explanations, and exceptions into\n   separate paragraphs or lists.\n4. **Write one action per instruction.** Use active voice and name the actor when ownership matters.\n5. **Put the condition before the action.** Use: `If verification fails, keep the deployment paused.`\n6. **Use short wording.** Prefer short sentences and familiar words. Remove filler that does not\n   change the requirement.\n7. **Use vertical lists for complex information.** Put each condition, action, or result on its own\n   line.\n8. **Explain shorthand at first use.** Pair required codes with their topic:\n   `Base Mainnet Requirement A1 — Voucher slashing`. Do not invent a new acronym for a term used only\n   a few times.\n9. **Preserve exact technical identifiers.** Keep code symbols, commands, environment variables,\n   protocol versions, and external identifiers unchanged inside code formatting. Add a plain-language\n   explanation next to them.\n10. **State limits explicitly.** Say what an approval, test, flag, or status permits and what it does\n    not permit.\n\n## Label Pattern\n\nUse this pattern when a sequence identifier is necessary:\n\n```text\n<scope> <kind> <identifier> — <topic>\n```\n\nExamples:\n\n- `Base Sepolia Deployment Gate B — Paused deployment`\n- `Base Mainnet Requirement A3 — Emergency pause and role custody`\n- `Wallet Connection Test 4 — Reconnect after session expiry`\n- `Database Migration Mode 2 — Apply guarded schema changes`\n\nOmit the identifier when it provides no operational value. Use `Wallet reconnect test` instead of\nadding an arbitrary number.\n\n## Instruction Pattern\n\nWrite procedures in this order:\n\n1. State the condition or prerequisite.\n2. Give one action.\n3. State the expected result.\n4. State the stop condition or rollback action when risk exists.\n\nUse direct commands:\n\n- Use: `Verify the contract address. Then enable the preview flag.`\n- Do not use: `Once everything looks good, proceed with activation as appropriate.`\n\n## Git Branch Names\n\nInspect the repository instructions before creating a branch. Follow a required namespace or branch\nformat when one exists.\n\nWhen the repository does not specify a format, use:\n\n```text\n<change-type>/<specific-topic>\n```\n\nSelect the change type from the work:\n\n- `fix/` for a defect or incorrect behavior.\n- `feat/` for a new user or system capability.\n- `docs/` for documentation-only work.\n- `refactor/` for a behavior-preserving code restructure.\n- `test/` for test-only work.\n- `ci/` for build or automation changes.\n- `chore/` for maintenance that does not fit another type.\n\nUse a short kebab-case topic that names the affected behavior:\n\n- Use: `fix/wallet-connect-button-handling`.\n- Use: `docs/base-sepolia-gate-labels`.\n- Use: `feat/stripe-walletless-purchases`.\n- Do not use: `fixes`, `updates`, `misc-work`, `gate-a`, or `issue-123`.\n\nIf the environment requires an agent namespace, keep the same type and topic after it. Example:\n`codex/fix/wallet-connect-button-handling`.\n\nDo not use an agent name, ticket number, phase number, or acronym as the only topic.\n\n## Revision Workflow\n\n1. Identify the audience and the action they must take.\n2. List labels and shorthand that require hidden context.\n3. Define one canonical term for each concept.\n4. Rewrite labels before rewriting their supporting text.\n5. Split long instructions and mixed-topic paragraphs.\n6. Preserve technical identifiers and factual meaning.\n7. Check each label without its surrounding paragraph.\n8. Check branch names against the repository rules and the actual change type.\n\n## Completion Check\n\n- Confirm that each label names its scope and topic.\n- Confirm that each instruction contains one primary action.\n- Confirm that each acronym or sequence code has an explanation.\n- Confirm that the same term has the same meaning throughout the artifact.\n- Confirm that safety boundaries and approval limits are explicit.\n- Confirm that the branch name identifies both the change type and the specific topic.\n- Confirm that the revision did not rename code identifiers or change behavior without authorization.\n\n## Source and Scope\n\nUse the clarity principles described in\n[Simplified Technical English](https://en.wikipedia.org/wiki/Simplified_Technical_English): clear and\nspecific instructions, short sentences, active voice, vertical lists, and one topic per paragraph.\nTreat this skill as STE-inspired writing guidance. Do not claim formal ASD-STE100 conformance or\napply its controlled dictionary unless the user supplies the official standard and requests strict\ncompliance.\n",
    "files": [
      {
        "path": "agents/openai.yaml",
        "size": 281,
        "sha256": "ff4948cac3f381b8ee9eb41d936e2f5509d64b63a583925d8191b3c63ef06238",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "index.md",
        "size": 117,
        "sha256": "622acab713b35d03b2e9e2f00adaf8261aee4e4a2c25df44a76b637d23aa757d",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "SKILL.md",
        "size": 6140,
        "sha256": "e4200e99b43126167eb311b1c60ea5ff80f212c44e54e1e9adabf1156c016697",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      }
    ],
    "tree_hash": "7d6ed35718c166170cc4f077167f77d908a3a34ea58b0a59fbcfffa3b3d3fc8c",
    "storage_backend": "blob",
    "has_executable": false,
    "security_scan": {
      "verdict": "review",
      "risk": "low",
      "findings": [],
      "truncated": false,
      "scanned_at": "2026-08-02T07:18:52.783Z",
      "model": "google/gemini-2.5-flash-lite",
      "rubric_version": "v1",
      "scan_source": "model",
      "generated_by_model": true,
      "advisory": true
    },
    "signals": [
      {
        "id": "ai_scan",
        "label": "AI security scan",
        "scope": "skill",
        "status": "pass",
        "detail": "Advisory scan completed with no concrete findings."
      },
      {
        "id": "registered",
        "label": "On-chain identity",
        "scope": "author",
        "status": "pass",
        "detail": "Author is registered on-chain."
      },
      {
        "id": "vouched",
        "label": "Vouched by others",
        "scope": "author",
        "status": "pass",
        "detail": "Other accounts have staked USDC vouching for this author."
      },
      {
        "id": "author_bonded",
        "label": "Author bond",
        "scope": "author",
        "status": "pass",
        "detail": "Author posted a USDC self-bond (skin in the game)."
      },
      {
        "id": "dispute_free",
        "label": "Dispute history",
        "scope": "author",
        "status": "pass",
        "detail": "No disputes against this author."
      }
    ],
    "versions": [
      {
        "id": "03163828-c205-4701-bb25-4897eb89daa7",
        "files": [
          {
            "path": "agents/openai.yaml",
            "size": 281,
            "sha256": "ff4948cac3f381b8ee9eb41d936e2f5509d64b63a583925d8191b3c63ef06238",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "index.md",
            "size": 117,
            "sha256": "622acab713b35d03b2e9e2f00adaf8261aee4e4a2c25df44a76b637d23aa757d",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 6140,
            "sha256": "e4200e99b43126167eb311b1c60ea5ff80f212c44e54e1e9adabf1156c016697",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 1,
        "ipfs_cid": null,
        "changelog": "Synced from dirtybits/agent-skills",
        "tree_hash": "7d6ed35718c166170cc4f077167f77d908a3a34ea58b0a59fbcfffa3b3d3fc8c",
        "created_at": "2026-08-02T07:18:51.268355+00:00",
        "has_executable": false,
        "storage_backend": "blob"
      }
    ],
    "author_trust": {
      "isRegistered": true,
      "registeredAt": 1779082335,
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "totalStakeAtRisk": 24250000,
      "authorBondUsdcMicros": 7250000,
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_trust_summary": {
      "username": "wallet-z7wzgw",
      "github_url": "https://github.com/dirtybits",
      "display_name": null,
      "github_login": "dirtybits",
      "isRegistered": true,
      "registeredAt": 1779082335,
      "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "wallet_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "schema_version": "2026-04-03",
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "trust_updated_at": "2026-09-22T04:52:30.978Z",
      "canonical_agent_id": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "recommended_action": "allow",
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_identity": {
      "id": "1f84a1fd-7c81-4925-9ea7-7b0ba6609697",
      "canonicalAgentId": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "identitySource": "local",
      "homeChainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "status": "active",
      "displayName": null,
      "username": "wallet-z7wzgw",
      "usernameSource": "fallback",
      "githubProfile": {
        "id": "28834908",
        "login": "dirtybits",
        "name": "andy",
        "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4",
        "url": "https://github.com/dirtybits"
      },
      "bindings": [
        {
          "id": "c11bf186-49aa-46d1-82a0-732d84071113",
          "metadata": null,
          "isPrimary": true,
          "bindingRef": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
          "bindingType": "wallet_owner",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "7ac9de7b-3020-4261-be2c-d7cbefa1d257",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "094fbb11-545b-41d7-b7e7-38d66a8c5fde",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "A4dgMn4WYSmFdisAkpKzFwUcLsPr4fBJU5nbKQHWHgeA",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "147b59b5-fb6f-4901-ad99-8fa8f742f4af",
          "metadata": {
            "id": "28834908",
            "url": "https://github.com/dirtybits",
            "name": "andy",
            "login": "dirtybits",
            "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4"
          },
          "isPrimary": false,
          "bindingRef": "github:28834908",
          "bindingType": "github_profile",
          "chainContext": "github",
          "externalAgentId": "28834908",
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        }
      ],
      "ownerWallet": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "operationalWallet": null,
      "agentProfilePda": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
      "registryAsset": null
    },
    "buyerHasPurchased": false,
    "buyerPurchaseSummary": null,
    "content_verification": {
      "has_ipfs": false,
      "all_versions_pinned": false,
      "current_cid_consistent": true,
      "status": "unverified"
    },
    "priceDisclosure": null,
    "purchaseRiskWarning": null
  },
  {
    "id": "35f13db4-7c43-42d0-b23a-c63acbab1f64",
    "skill_id": "npm-publish",
    "public_slug": "npm-publish",
    "public_author_slug": "wallet-asuavudg",
    "author_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "author_kind": "wallet",
    "author_external_id": null,
    "author_handle": null,
    "author_display_name": null,
    "publisher_identity_key": "wallet:asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "publisher_tier": "registered",
    "mirror_source_key": null,
    "synced_repo_url": "https://github.com/dirtybits/agent-skills",
    "name": "Npm Publish",
    "description": "Use when publishing Node/npm packages from a repository or monorepo, especially scoped public packages, beta/latest dist-tags, workspace publishing, npm 2FA, publish verification, local tarball smoke tests, and debugging npm publish/install errors such as ",
    "tags": [
      "mit"
    ],
    "current_version": 1,
    "summary": "Publish npm packages, including scoped, 2FA, and monorepo deployments, with verification.",
    "summary_model": "google/gemini-2.5-flash-lite",
    "summary_sha256": "37d7e9c95f30d7334f30198dccfd358ce0caae343f59753b580cfffaf366c0c7",
    "summary_capabilities": [
      "Publish npm packages",
      "Handle monorepos",
      "Manage dist-tags",
      "Verify packages"
    ],
    "ipfs_cid": null,
    "on_chain_address": null,
    "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
    "evm_listing_id": null,
    "evm_contract_address": null,
    "evm_tx_hash": null,
    "total_installs": 1,
    "price_usdc_micros": null,
    "currency_mint": null,
    "on_chain_protocol_version": null,
    "on_chain_program_id": null,
    "contact": "https://github.com/dirtybits/agent-skills/tree/main/skills/npm-publish",
    "created_at": "2026-07-01T07:22:13.712Z",
    "updated_at": "2026-07-01T22:57:07.601Z",
    "source": "repo",
    "payment_flow": "free",
    "content": "---\ntype: Skill\ntitle: \"Npm Publish\"\nresource: \"https://github.com/dirtybits/agent-skills/tree/main/skills/npm-publish\"\ntags: [\"npm\", \"node\", \"release\", \"publishing\", \"workflow\"]\ntimestamp: \"2026-06-30T23:59:00Z\"\nokf_version: \"0.1\"\nname: npm-publish\ndescription: \"Use when publishing Node/npm packages from a repository or monorepo, especially scoped public packages, beta/latest dist-tags, workspace publishing, npm 2FA, publish verification, local tarball smoke tests, and debugging npm publish/install errors such as E403, E404, ENOVERSIONS, ELOOP, or pack destination failures.\"\nversion: 1.0.0\nauthor: dirtybits\nlicense: MIT\nplatforms: [linux, macos, windows]\nmetadata:\n  hermes:\n    tags: [npm, node, package-release, dist-tags, two-factor-auth, monorepo]\n    related_skills: [github-workflows, software-development-workflows]\n---\n# Npm Publish\n\n## Operating Pattern\n\nUse this workflow when preparing, publishing, or verifying an npm package. Treat publishing as a release operation: package versions are immutable, registry state can lag or be filtered by local config, and npm auth errors can look unrelated to the tarball.\n\n1. **Confirm package scope and working directory.**\n   - In a monorepo, publish from the repo root with `npm publish --workspace <workspace-name> ...`.\n   - From the package directory, omit `--workspace`.\n   - Confirm `package.json` has the intended `name`, `version`, `license`, `bin`, `files`, `engines`, `publishConfig`, and dependencies.\n2. **Confirm the version is new.**\n   - npm versions are immutable. Any republish requires a version bump.\n   - Check existing versions: `npm view <package> versions dist-tags --json`.\n3. **Run release checks before publishing.**\n   - Use the repo's normal quality gates, usually format, tests, and build.\n   - If a repo-wide build fails for local env state, diagnose before assuming package failure.\n4. **Pack and smoke-test the exact artifact.**\n   - Create the pack destination first; npm does not create it.\n   - Install the generated tarball globally or in a temp project and run the package's CLI/help/version smoke tests.\n5. **Publish with intentional dist-tags.**\n   - Use `--tag beta` for beta/devnet/prerelease packages.\n   - Use `latest` only when the package should be the default install.\n6. **Verify registry state and installability.**\n   - A successful publish prints `+ <package>@<version>`.\n   - Verify package document, dist-tags, access, tarball metadata, and install from a clean npm config or a deliberate security-guard override.\n\n## Recommended Command Skeleton\n\nFor a workspace package from the repository root:\n\n```bash\ngit switch main\ngit pull\n\nnpm run format:check\nnpm run test --workspace <workspace-name>\nnpm run build\n\nmkdir -p /private/tmp/npm-release\nnpm pack --workspace <workspace-name> --pack-destination /private/tmp/npm-release\n\nnpm uninstall -g <package-name>\nnpm install -g /private/tmp/npm-release/<tarball-name>.tgz\n<binary-name> --version\n<binary-name> --help\n\nnpm whoami\nnpm publish --workspace <workspace-name> --tag beta --access public\n```\n\nFor `@agentvouch/cli`, the publish command is:\n\n```bash\nnpm publish --workspace @agentvouch/cli --tag beta --access public\n```\n\n## Dist-Tag Policy\n\n- Publish beta/devnet releases with `--tag beta`.\n- After publish, inspect tags:\n\n```bash\nnpm view <package> dist-tags versions --json\n```\n\n- If users should install the package by default without a tag, intentionally move `latest`:\n\n```bash\nnpm dist-tag add <package>@<version> latest\n```\n\nDo not move `latest` automatically. Report the current tag state and ask whether the package should become the default install when that is a product decision.\n\n## Verification Commands\n\nUse several independent checks:\n\n```bash\nnpm view <package> dist-tags versions engines bin --json\nnpm access get status <package>\nnpm owner ls <package>\nnpm access list collaborators <package>\nmkdir -p /private/tmp/npm-verify\nnpm pack <package>@<tag-or-version> --pack-destination /private/tmp/npm-verify\n```\n\nThen install and smoke-test from the registry in an environment that can see fresh packages:\n\n```bash\nnpm install -g <package>@<tag-or-version>\n<binary-name> --help\n```\n\nIf the user's npm config intentionally sets a `before` date as a supply-chain safety guard, keep it. Do not tell them to delete it as the default fix. For fresh-release verification, use one of:\n\n- a separate clean environment or user config;\n- direct registry reads such as `npm view <package> ...`;\n- an explicit `--before=<future ISO date after the publish time>` override for the one verification command.\n\nIf `npm install` reports `ENOVERSIONS` while `npm view` shows versions, check:\n\n```bash\nnpm config get before\n```\n\nA `before` date earlier than the publish timestamp hides the new version from install resolution.\n\n## Error Triage\n\n### `ELOOP` loading env during repo build\n\nIf a pre-publish build fails with a message like:\n\n```text\nELOOP: too many symbolic links encountered, stat '<repo>/web/.env.local'\n```\n\nCheck whether the env file is a self-referential symlink:\n\n```bash\nls -l web/.env.local\n```\n\nMove the broken symlink out of the app directory and recreate `.env.local` as a real file if needed. Do not treat this as an npm packaging failure.\n\n### `npm pack --pack-destination` returns `ENOENT`\n\n`npm pack --pack-destination <dir>` does not create `<dir>`. Create it first:\n\n```bash\nmkdir -p /private/tmp/npm-release\nnpm pack --workspace <workspace-name> --pack-destination /private/tmp/npm-release\n```\n\n### `E403` requiring 2FA or bypass token\n\nThe tarball may be fine; npm is rejecting registry write auth. Refresh auth and retry:\n\n```bash\nnpm logout\nnpm login --auth-type=web\nnpm whoami\nnpm publish --workspace <workspace-name> --tag beta --access public\n```\n\nIf npm prompts for an OTP, use a fresh 2FA code immediately:\n\n```bash\nnpm publish --workspace <workspace-name> --tag beta --access public --otp <code>\n```\n\nRecovery codes can satisfy npm's OTP prompt, but they are one-time backup factors. If a recovery code is used or exposed in logs/chat, treat it as spent and regenerate recovery codes after publishing.\n\n### `PUT ... 404 Not found` during publish\n\nIf publish reaches `Publishing to https://registry.npmjs.org/` and then fails with `PUT ... 404`, the tarball built but npm did not accept the registry write. Check:\n\n```bash\nnpm config get registry\nnpm whoami\nnpm owner ls <package>\nnpm access get status <package>\n```\n\nFor scoped public packages, keep `--access public`. Re-login with `npm login --auth-type=web` if the current session or token lacks publish rights.\n\n### `ENOVERSIONS` after publish\n\nIf the registry document shows the version but install says no versions are available, suspect a local `before` security guard:\n\n```bash\nnpm config get before\nnpm view <package> time dist-tags versions --json\n```\n\nCompare the package publish time to the configured `before` date. Preserve the guard unless the user explicitly wants it removed.\n\n## Completion Criteria\n\nReport:\n\n- the package name, version, and dist-tags;\n- whether `latest` changed;\n- package access status;\n- tarball file count/size when available;\n- CLI smoke-test output or exact failure;\n- any local npm guardrail such as `before` that affected verification.\n",
    "files": [
      {
        "path": "index.md",
        "size": 140,
        "sha256": "02c740706a3cf82d92562b50330dd90f53a3b3efd93f621eb0556e354bcd407a",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "LICENSE.txt",
        "size": 1066,
        "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
        "executable": false,
        "contentType": "text/plain; charset=utf-8"
      },
      {
        "path": "SKILL.md",
        "size": 7235,
        "sha256": "37d7e9c95f30d7334f30198dccfd358ce0caae343f59753b580cfffaf366c0c7",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      }
    ],
    "tree_hash": "a044cc9044ec95445b48bd25481fc940a19950904fbfb5315f16d90c61492953",
    "storage_backend": "blob",
    "has_executable": false,
    "security_scan": {
      "verdict": "review",
      "risk": "low",
      "findings": [],
      "truncated": false,
      "scanned_at": "2026-07-01T07:22:15.393Z",
      "model": "google/gemini-2.5-flash-lite",
      "rubric_version": "v1",
      "scan_source": "model",
      "generated_by_model": true,
      "advisory": true
    },
    "signals": [
      {
        "id": "ai_scan",
        "label": "AI security scan",
        "scope": "skill",
        "status": "pass",
        "detail": "Advisory scan completed with no concrete findings."
      },
      {
        "id": "registered",
        "label": "On-chain identity",
        "scope": "author",
        "status": "pass",
        "detail": "Author is registered on-chain."
      },
      {
        "id": "vouched",
        "label": "Vouched by others",
        "scope": "author",
        "status": "pass",
        "detail": "Other accounts have staked USDC vouching for this author."
      },
      {
        "id": "author_bonded",
        "label": "Author bond",
        "scope": "author",
        "status": "pass",
        "detail": "Author posted a USDC self-bond (skin in the game)."
      },
      {
        "id": "dispute_free",
        "label": "Dispute history",
        "scope": "author",
        "status": "pass",
        "detail": "No disputes against this author."
      }
    ],
    "versions": [
      {
        "id": "a802f0bc-b7d9-4125-8cce-802efaaff736",
        "files": [
          {
            "path": "index.md",
            "size": 140,
            "sha256": "02c740706a3cf82d92562b50330dd90f53a3b3efd93f621eb0556e354bcd407a",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "LICENSE.txt",
            "size": 1066,
            "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
            "executable": false,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 7235,
            "sha256": "37d7e9c95f30d7334f30198dccfd358ce0caae343f59753b580cfffaf366c0c7",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 1,
        "ipfs_cid": null,
        "changelog": "Synced from dirtybits/agent-skills",
        "tree_hash": "a044cc9044ec95445b48bd25481fc940a19950904fbfb5315f16d90c61492953",
        "created_at": "2026-07-01T07:22:13.712684+00:00",
        "has_executable": false,
        "storage_backend": "blob"
      }
    ],
    "author_trust": {
      "isRegistered": true,
      "registeredAt": 1779082335,
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "totalStakeAtRisk": 24250000,
      "authorBondUsdcMicros": 7250000,
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_trust_summary": {
      "username": "wallet-z7wzgw",
      "github_url": "https://github.com/dirtybits",
      "display_name": null,
      "github_login": "dirtybits",
      "isRegistered": true,
      "registeredAt": 1779082335,
      "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "wallet_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "schema_version": "2026-04-03",
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "trust_updated_at": "2026-09-22T04:52:30.978Z",
      "canonical_agent_id": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "recommended_action": "allow",
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_identity": {
      "id": "1f84a1fd-7c81-4925-9ea7-7b0ba6609697",
      "canonicalAgentId": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "identitySource": "local",
      "homeChainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "status": "active",
      "displayName": null,
      "username": "wallet-z7wzgw",
      "usernameSource": "fallback",
      "githubProfile": {
        "id": "28834908",
        "login": "dirtybits",
        "name": "andy",
        "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4",
        "url": "https://github.com/dirtybits"
      },
      "bindings": [
        {
          "id": "c11bf186-49aa-46d1-82a0-732d84071113",
          "metadata": null,
          "isPrimary": true,
          "bindingRef": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
          "bindingType": "wallet_owner",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "7ac9de7b-3020-4261-be2c-d7cbefa1d257",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "094fbb11-545b-41d7-b7e7-38d66a8c5fde",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "A4dgMn4WYSmFdisAkpKzFwUcLsPr4fBJU5nbKQHWHgeA",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "147b59b5-fb6f-4901-ad99-8fa8f742f4af",
          "metadata": {
            "id": "28834908",
            "url": "https://github.com/dirtybits",
            "name": "andy",
            "login": "dirtybits",
            "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4"
          },
          "isPrimary": false,
          "bindingRef": "github:28834908",
          "bindingType": "github_profile",
          "chainContext": "github",
          "externalAgentId": "28834908",
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        }
      ],
      "ownerWallet": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "operationalWallet": null,
      "agentProfilePda": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
      "registryAsset": null
    },
    "buyerHasPurchased": false,
    "buyerPurchaseSummary": null,
    "content_verification": {
      "has_ipfs": false,
      "all_versions_pinned": false,
      "current_cid_consistent": true,
      "status": "unverified"
    },
    "priceDisclosure": null,
    "purchaseRiskWarning": null
  },
  {
    "id": "4915b468-8d5e-4f9f-97d4-b4a80f421ccc",
    "skill_id": "financial-analysis",
    "public_slug": "financial-analysis",
    "public_author_slug": "wallet-asuavudg",
    "author_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "author_kind": "wallet",
    "author_external_id": null,
    "author_handle": null,
    "author_display_name": null,
    "publisher_identity_key": "wallet:asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "publisher_tier": "registered",
    "mirror_source_key": null,
    "synced_repo_url": "https://github.com/dirtybits/agent-skills",
    "name": "Financial Analysis",
    "description": "Guides and best practices for working with financial documents, building financial models, wrangling CSV data, and structuring Jupyter notebooks. Use when the user is building DCF models, LBO models, comparable analysis, analyzing financial data in CSVs, c",
    "tags": [
      "finance",
      "analysis",
      "spreadsheets"
    ],
    "current_version": 3,
    "summary": "Performs financial analysis, including data wrangling, DCF/LBO modeling, and visualizations.",
    "summary_model": "google/gemini-2.5-flash-lite",
    "summary_sha256": "4d020dba70607d6cc134657a40d00672d1cde2b6a50ff0e82ebeae0c5fa08dee",
    "summary_capabilities": [
      "Data wrangling",
      "Financial modeling",
      "Chart generation",
      "Notebook structuring"
    ],
    "ipfs_cid": null,
    "on_chain_address": null,
    "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
    "evm_listing_id": null,
    "evm_contract_address": null,
    "evm_tx_hash": null,
    "total_installs": 1,
    "price_usdc_micros": null,
    "currency_mint": null,
    "on_chain_protocol_version": null,
    "on_chain_program_id": null,
    "contact": "https://github.com/dirtybits/agent-skills/tree/main/skills/financial-analysis",
    "created_at": "2026-06-16T22:35:48.559Z",
    "updated_at": "2026-06-25T07:12:12.123Z",
    "source": "repo",
    "payment_flow": "free",
    "content": "---\ntype: Skill\nname: financial-analysis\ntitle: \"Financial Analysis\"\ndescription: Guides and best practices for working with financial documents, building financial models, wrangling CSV data, and structuring Jupyter notebooks. Use when the user is building DCF models, LBO models, comparable analysis, analyzing financial data in CSVs, creating charts/visualizations of financial data, or structuring Jupyter notebooks for financial analysis.\nresource: \"https://github.com/dirtybits/agent-skills/tree/main/skills/financial-analysis\"\ntags: [\"finance\", \"analysis\", \"spreadsheets\"]\ntimestamp: \"2026-06-22T19:13:38Z\"\nokf_version: \"0.1\"\nlicense: MIT\n---\n\n# Financial Analysis\n\n## Core Stack\n\n```python\nimport pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nimport matplotlib.ticker as mticker\nimport openpyxl\n```\n\n---\n\n## CSV / Data Wrangling\n\n### Loading financial CSVs\n```python\ndf = pd.read_csv(\"data.csv\", thousands=\",\", parse_dates=[\"Date\"])\ndf.columns = df.columns.str.strip().str.lower().str.replace(\" \", \"_\")\n```\n\n### Common cleaning steps\n```python\ndf[\"revenue\"] = pd.to_numeric(df[\"revenue\"], errors=\"coerce\")\ndf = df.dropna(subset=[\"revenue\"])\ndf = df.sort_values(\"date\").reset_index(drop=True)\n```\n\n### Period aggregations\n```python\ndf[\"year\"] = df[\"date\"].dt.year\nannual = df.groupby(\"year\").agg({\"revenue\": \"sum\", \"ebitda\": \"sum\"})\nannual[\"margin\"] = annual[\"ebitda\"] / annual[\"revenue\"]\n```\n\n---\n\n## Financial Modeling Patterns\n\n### DCF skeleton\n```python\n# Inputs\nrevenue_base = 100_000_000\ngrowth_rates = [0.15, 0.12, 0.10, 0.08, 0.06]\nebitda_margin = 0.25\nda_pct = 0.04\ncapex_pct = 0.05\nnwc_pct = 0.03  # projected NWC as % of revenue; FCF uses the CHANGE in NWC\ntax_rate = 0.25\nwacc = 0.10\nterminal_growth = 0.025\nnet_debt = 20_000_000\nshares_out = 10_000_000\n\n# Projections\nrevenues = [revenue_base * np.prod([1 + g for g in growth_rates[: i + 1]]) for i in range(5)]\nebitda = [r * ebitda_margin for r in revenues]\nda = [r * da_pct for r in revenues]\nebit = [e - d for e, d in zip(ebitda, da)]\nnopat = [x * (1 - tax_rate) for x in ebit]\ncapex = [r * capex_pct for r in revenues]\nnwc = [r * nwc_pct for r in revenues]\nchange_nwc = [nwc[0] - revenue_base * nwc_pct] + [nwc[i] - nwc[i - 1] for i in range(1, len(nwc))]\nfcf = [n + d - c - dnwc for n, d, c, dnwc in zip(nopat, da, capex, change_nwc)]\n\n# Terminal value sanity: terminal_growth must be below WACC.\nassert terminal_growth < wacc, \"terminal growth must be below WACC\"\nterminal_value = fcf[-1] * (1 + terminal_growth) / (wacc - terminal_growth)\ndiscount_factors = [(1 / (1 + wacc)) ** (i + 1) for i in range(5)]\nenterprise_value = sum(f * d for f, d in zip(fcf, discount_factors)) + terminal_value * discount_factors[-1]\nequity_value = enterprise_value - net_debt\nimplied_share_price = equity_value / shares_out\n```\n\n### Sensitivity table (2-variable)\n```python\nwaccs = np.arange(0.08, 0.13, 0.01)\ntgrs = np.arange(0.015, 0.04, 0.005)\nsensitivity = pd.DataFrame(\n    index=[f\"{w:.0%}\" for w in waccs],\n    columns=[f\"{g:.1%}\" for g in tgrs],\n    data=[[fcf[-1] * (1 + g) / (w - g) * (1/(1+w))**5 for g in tgrs] for w in waccs]\n)\n```\n\n### LBO returns\n```python\ndef moic(entry_ev, exit_ev, entry_debt, exit_debt, equity_check):\n    # equity_check is the sponsor cash invested at entry, after fees/rollover if applicable.\n    if equity_check <= 0:\n        raise ValueError(\"equity_check must be positive\")\n    exit_equity = exit_ev - exit_debt\n    return exit_equity / equity_check\n\ndef irr_approx(moic_val, years):\n    return moic_val ** (1 / years) - 1\n```\n\n### Comps table\n```python\ncomps = pd.DataFrame({\n    \"company\": [\"A\", \"B\", \"C\"],\n    \"ev\": [500, 800, 1200],\n    \"ebitda\": [50, 75, 110],\n    \"revenue\": [200, 350, 500],\n})\ncomps[\"ev_ebitda\"] = comps[\"ev\"] / comps[\"ebitda\"]\ncomps[\"ev_revenue\"] = comps[\"ev\"] / comps[\"revenue\"]\nprint(comps[[\"company\",\"ev_ebitda\",\"ev_revenue\"]].describe().loc[[\"mean\",\"median\"]])\n```\n\n## Production Modeling Guardrails\n\nBefore trusting outputs, check units/currency, fiscal periods, restatements, negative values shown in accounting parentheses, source timestamps, and whether line items are point-in-time balance sheet values or period flow values. For ratios and growth rates, guard against zero or negative denominators and explain when a metric is not meaningful. Validate every DCF/LBO with at least one sensitivity table and a bridge from enterprise value to equity value.\n\n---\n\n## Visualizations\n\n### Consistent financial chart style\n```python\ndef set_fin_style(ax, title, ylabel=\"$M\"):\n    ax.set_title(title, fontweight=\"bold\", pad=10)\n    ax.set_ylabel(ylabel)\n    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f\"${x/1e6:.0f}M\"))\n    ax.spines[[\"top\", \"right\"]].set_visible(False)\n    ax.grid(axis=\"y\", linestyle=\"--\", alpha=0.5)\n```\n\n### Waterfall chart (bridge)\n```python\ndef waterfall(labels, values, title=\"Bridge\"):\n    running = 0\n    bottoms, colors = [], []\n    for v in values:\n        bottoms.append(running if v >= 0 else running + v)\n        colors.append(\"#2ecc71\" if v >= 0 else \"#e74c3c\")\n        running += v\n    fig, ax = plt.subplots(figsize=(10, 5))\n    ax.bar(labels, [abs(v) for v in values], bottom=bottoms, color=colors, width=0.6)\n    set_fin_style(ax, title)\n    return fig, ax\n```\n\n### Multi-metric time series\n```python\nfig, axes = plt.subplots(2, 2, figsize=(12, 8))\nfig.suptitle(\"Financial Summary\", fontweight=\"bold\")\nmetrics = [(\"revenue\", \"Revenue\"), (\"ebitda\", \"EBITDA\"),\n           (\"margin\", \"Margin\", \"%\"), (\"fcf\", \"FCF\")]\nfor ax, (col, label, *fmt) in zip(axes.flat, metrics):\n    annual[col].plot(ax=ax)\n    set_fin_style(ax, label, ylabel=fmt[0] if fmt else \"$M\")\nplt.tight_layout()\n```\n\n---\n\n## Jupyter Notebook Structure\n\n### Standard notebook layout for financial analysis\n```\n1. Setup & Imports\n2. Data Loading & Validation\n3. Cleaning & Normalization\n4. Model / Analysis\n5. Outputs & Visualizations\n6. Sensitivity / Scenarios\n7. Export\n```\n\n### Cell discipline\n- One logical operation per cell\n- Use `# ---` headers as section dividers\n- Store intermediate results in clearly named variables (`revenue_df`, `dcf_inputs`, `sensitivity_table`)\n- Use `display(df.head())` not `print()` for DataFrames\n\n### Reproducibility\n```python\n# Top of every notebook\nimport warnings; warnings.filterwarnings(\"ignore\")\npd.set_option(\"display.float_format\", \"{:,.2f}\".format)\nnp.random.seed(42)\nVINTAGE = \"2026-02-20\"  # update per run\n```\n\n### Exporting outputs\n```python\n# Excel with multiple sheets\nwith pd.ExcelWriter(\"output/model_output.xlsx\", engine=\"openpyxl\") as writer:\n    revenue_df.to_excel(writer, sheet_name=\"Revenue\", index=False)\n    dcf_df.to_excel(writer, sheet_name=\"DCF\")\n    sensitivity.to_excel(writer, sheet_name=\"Sensitivity\")\n\n# Save all figures\nfor name, fig in figures.items():\n    fig.savefig(f\"output/{name}.png\", dpi=150, bbox_inches=\"tight\")\n```\n\n---\n\n## Conventions\n\n- Dollar amounts: store in raw dollars, display in $M or $B via formatters\n- Percentages: store as decimals (0.25 = 25%), format with `:.1%`\n- Negative values: use sign convention consistently (costs negative or costs positive with explicit label)\n- Column names: `snake_case`, no spaces or special chars\n- File naming: `YYYY-MM-DD_model-name.xlsx`\n\n## Additional Resources\n\n- For extended modeling patterns and formula reference, see [reference.md](reference.md)\n\n## Scope ladder for expensive analysis\n\nStart financial analysis with the smallest artifact that can answer the decision: summary page, latest quarter, key assumptions tab, or one exported table. Only expand to full workbooks or multi-year models after identifying the exact metric or driver that matters. Report assumptions and confidence before producing large outputs; this keeps agent runs cheaper and makes errors easier to audit.\n",
    "files": [
      {
        "path": "index.md",
        "size": 154,
        "sha256": "4acac48f37e1bea67dacd38fec9c98cbe800821099d3c1d1bf2a3ec920e88055",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "LICENSE.txt",
        "size": 1066,
        "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
        "executable": false,
        "contentType": "text/plain; charset=utf-8"
      },
      {
        "path": "reference.md",
        "size": 3845,
        "sha256": "860a92acf48065eeb602978dff38195b4fdfce0b7022d4984fc03cfb40339967",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "SKILL.md",
        "size": 7785,
        "sha256": "4d020dba70607d6cc134657a40d00672d1cde2b6a50ff0e82ebeae0c5fa08dee",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      }
    ],
    "tree_hash": "78997353cb752c9ac4a7c934aabd3a8fc0669c2988aee9a79ff822aa515fdf23",
    "storage_backend": "blob",
    "has_executable": false,
    "security_scan": {
      "verdict": "review",
      "risk": "low",
      "findings": [
        {
          "severity": "low",
          "category": "prompt-injection",
          "detail": "The skill file contains markdown and code examples that are not directly executable and seem to be intended as guidance or examples rather than direct instructions for the AI. However, the structure could potentially be interpreted or misused by an LLM to generate unintended behaviors if not carefully constrained.",
          "evidence": "The content is largely descriptive markdown with embedded Python code snippets demonstrating financial analysis techniques.",
          "file": "SKILL.md"
        }
      ],
      "truncated": false,
      "scanned_at": "2026-06-25T07:12:13.643Z",
      "model": "google/gemini-2.5-flash-lite",
      "rubric_version": "v1",
      "scan_source": "model",
      "generated_by_model": true,
      "advisory": true
    },
    "signals": [
      {
        "id": "ai_scan",
        "label": "AI security scan",
        "scope": "skill",
        "status": "warn",
        "detail": "Advisory scan completed with 1 finding(s) to review."
      },
      {
        "id": "registered",
        "label": "On-chain identity",
        "scope": "author",
        "status": "pass",
        "detail": "Author is registered on-chain."
      },
      {
        "id": "vouched",
        "label": "Vouched by others",
        "scope": "author",
        "status": "pass",
        "detail": "Other accounts have staked USDC vouching for this author."
      },
      {
        "id": "author_bonded",
        "label": "Author bond",
        "scope": "author",
        "status": "pass",
        "detail": "Author posted a USDC self-bond (skin in the game)."
      },
      {
        "id": "dispute_free",
        "label": "Dispute history",
        "scope": "author",
        "status": "pass",
        "detail": "No disputes against this author."
      }
    ],
    "versions": [
      {
        "id": "5e22b37e-d3bd-423e-aac5-c8a75aa5dc38",
        "files": [
          {
            "path": "index.md",
            "size": 154,
            "sha256": "4acac48f37e1bea67dacd38fec9c98cbe800821099d3c1d1bf2a3ec920e88055",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "LICENSE.txt",
            "size": 1066,
            "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
            "executable": false,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "reference.md",
            "size": 3845,
            "sha256": "860a92acf48065eeb602978dff38195b4fdfce0b7022d4984fc03cfb40339967",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 7785,
            "sha256": "4d020dba70607d6cc134657a40d00672d1cde2b6a50ff0e82ebeae0c5fa08dee",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 3,
        "ipfs_cid": null,
        "changelog": "Synced from dirtybits/agent-skills",
        "tree_hash": "78997353cb752c9ac4a7c934aabd3a8fc0669c2988aee9a79ff822aa515fdf23",
        "created_at": "2026-06-25T07:12:12.123983+00:00",
        "has_executable": false,
        "storage_backend": "blob"
      },
      {
        "id": "ef2d969e-7945-4909-87a9-435eb690291a",
        "files": [
          {
            "path": "index.md",
            "size": 97,
            "sha256": "ff50e24958e27d7a99d209cbb20f741f45afc1ea06dca735866aebd76d8f0dcc",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "reference.md",
            "size": 3845,
            "sha256": "860a92acf48065eeb602978dff38195b4fdfce0b7022d4984fc03cfb40339967",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 6164,
            "sha256": "b661e9f76f5da541427d3b8e599cb5c72c2cff02ca392a3bc6648fed23bfd97e",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 2,
        "ipfs_cid": null,
        "changelog": "Synced from dirtybits/agent-skills",
        "tree_hash": "65360ee3ca961ea3a237a52a1e124d0af46ec3ac4f3e5554deb03fbc329c883d",
        "created_at": "2026-06-23T07:04:00.562905+00:00",
        "has_executable": false,
        "storage_backend": "blob"
      },
      {
        "id": "acffd359-28ae-476a-a5b3-9923b99b14f6",
        "files": [
          {
            "path": "reference.md",
            "size": 3500,
            "sha256": "68ddf16b110a31681ca74bdf2f5f1eeb0f0098317b1cf9f63bb5882d8230bfd5",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 5905,
            "sha256": "26684292b0684b71f9e41226a4b9265f7674466a24c427e5643bbb2f2c5db8da",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 1,
        "ipfs_cid": null,
        "changelog": "Initial release",
        "tree_hash": "ba6c0efe8508926cec340c23401c68be03593604e6aa010e4566ad63fe0c047d",
        "created_at": "2026-06-16T22:35:48.718004+00:00",
        "has_executable": false,
        "storage_backend": "blob"
      }
    ],
    "author_trust": {
      "isRegistered": true,
      "registeredAt": 1779082335,
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "totalStakeAtRisk": 24250000,
      "authorBondUsdcMicros": 7250000,
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_trust_summary": {
      "username": "wallet-z7wzgw",
      "github_url": "https://github.com/dirtybits",
      "display_name": null,
      "github_login": "dirtybits",
      "isRegistered": true,
      "registeredAt": 1779082335,
      "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "wallet_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "schema_version": "2026-04-03",
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "trust_updated_at": "2026-09-22T04:52:30.978Z",
      "canonical_agent_id": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "recommended_action": "allow",
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_identity": {
      "id": "1f84a1fd-7c81-4925-9ea7-7b0ba6609697",
      "canonicalAgentId": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "identitySource": "local",
      "homeChainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "status": "active",
      "displayName": null,
      "username": "wallet-z7wzgw",
      "usernameSource": "fallback",
      "githubProfile": {
        "id": "28834908",
        "login": "dirtybits",
        "name": "andy",
        "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4",
        "url": "https://github.com/dirtybits"
      },
      "bindings": [
        {
          "id": "c11bf186-49aa-46d1-82a0-732d84071113",
          "metadata": null,
          "isPrimary": true,
          "bindingRef": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
          "bindingType": "wallet_owner",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "7ac9de7b-3020-4261-be2c-d7cbefa1d257",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "094fbb11-545b-41d7-b7e7-38d66a8c5fde",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "A4dgMn4WYSmFdisAkpKzFwUcLsPr4fBJU5nbKQHWHgeA",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "147b59b5-fb6f-4901-ad99-8fa8f742f4af",
          "metadata": {
            "id": "28834908",
            "url": "https://github.com/dirtybits",
            "name": "andy",
            "login": "dirtybits",
            "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4"
          },
          "isPrimary": false,
          "bindingRef": "github:28834908",
          "bindingType": "github_profile",
          "chainContext": "github",
          "externalAgentId": "28834908",
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        }
      ],
      "ownerWallet": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "operationalWallet": null,
      "agentProfilePda": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
      "registryAsset": null
    },
    "buyerHasPurchased": false,
    "buyerPurchaseSummary": null,
    "content_verification": {
      "has_ipfs": false,
      "all_versions_pinned": false,
      "current_cid_consistent": true,
      "status": "unverified"
    },
    "priceDisclosure": null,
    "purchaseRiskWarning": null
  },
  {
    "id": "56ec4087-a03c-4d92-b851-b9e57526325a",
    "skill_id": "plan-writing",
    "public_slug": "plan-writing",
    "public_author_slug": "wallet-asuavudg",
    "author_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "author_kind": "wallet",
    "author_external_id": null,
    "author_handle": null,
    "author_display_name": null,
    "publisher_identity_key": "wallet:asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "publisher_tier": "registered",
    "mirror_source_key": null,
    "synced_repo_url": "https://github.com/dirtybits/agent-skills",
    "name": "Plan Writing",
    "description": "Write, review, and maintain implementation-ready .plan.md files with YAML frontmatter, actionable TODO lists, concrete execution details, verification gates, and rollback notes. Use when creating, splitting, reviewing, or updating plan files, especially fi",
    "tags": [
      "planning",
      "documentation",
      "project-management"
    ],
    "current_version": 3,
    "summary": "Writes, reviews, and maintains implementation-ready .plan.md files with YAML frontmatter, actionable TODOs, verification, and rollback.",
    "summary_model": "google/gemini-2.5-flash-lite",
    "summary_sha256": "9502892836758244cb673fd9940712b7211f00ae08d4112c1b10ff8905a7838a",
    "summary_capabilities": [
      "Write plan files",
      "Review plan files",
      "Update plan files",
      "Execute plan steps"
    ],
    "ipfs_cid": null,
    "on_chain_address": null,
    "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
    "evm_listing_id": null,
    "evm_contract_address": null,
    "evm_tx_hash": null,
    "total_installs": 1,
    "price_usdc_micros": null,
    "currency_mint": null,
    "on_chain_protocol_version": null,
    "on_chain_program_id": null,
    "contact": "https://github.com/dirtybits/agent-skills/tree/main/skills/plan-writing",
    "created_at": "2026-06-10T23:20:05.684Z",
    "updated_at": "2026-06-25T07:12:25.978Z",
    "source": "repo",
    "payment_flow": "free",
    "content": "---\ntype: Skill\nname: plan-writing\ntitle: \"Plan Writing\"\ndescription: Write, review, and maintain implementation-ready .plan.md files with YAML frontmatter, actionable TODO lists, concrete execution details, verification gates, and rollback notes. Use when creating, splitting, reviewing, or updating plan files, especially files under .agents/plans or .cursor/plans — and also whenever implementing or executing work from an existing .plan.md, so todo statuses and the plan body stay current as steps complete.\nresource: \"https://github.com/dirtybits/agent-skills/tree/main/skills/plan-writing\"\ntags: [\"planning\", \"documentation\", \"project-management\"]\ntimestamp: \"2026-06-22T19:13:38Z\"\nokf_version: \"0.1\"\nlicense: MIT\n---\n\n# Plan Writing\n\n## Instructions\n\nWhen writing or reviewing a plan file:\n\n1. Use the `.plan.md` extension.\n2. When the user does not specify a location, default to `<repo>/.agents/plans/`; if the repo already has an established plans directory such as `.cursor/plans/`, follow that local convention.\n3. Start with YAML frontmatter containing `name`, `overview`, `todos`, and `isProject`.\n4. Make `todos` a short execution checklist with stable lowercase hyphenated `id` values, concrete `content`, and `status: pending`.\n5. After frontmatter, write the plan body in Markdown.\n6. Include enough repo-specific detail that another agent can implement without guessing.\n7. Separate implementation steps from validation, rollout, and rollback when the work has operational risk.\n8. Prefer exact files, commands, config keys, target hosts, acceptance criteria, and blockers over broad intent.\n9. Do not hide open questions. Add an assumptions or blockers section when requirements are uncertain.\n10. Date design decisions and verified claims (e.g. \"verified 2026-06-09\"), so a later session knows how stale they might be.\n\n## Executing a Plan\n\nA plan file is shared state across sessions and agents: a resumed or parallel session decides what to do next by reading the todo statuses. Stale statuses cause redone or skipped work, so maintain them as part of the implementation itself, not as cleanup afterward.\n\n- Statuses are `pending`, `in_progress`, and `completed`.\n- Set a todo to `in_progress` when starting it, and to `completed` as soon as its work is done and verified — not in a batch at the end of the session. If the session dies mid-plan, the file should still show exactly where things stood.\n- Only mark `completed` when the step truly finished, including its verification. A step that ended in failing tests or partial work stays `in_progress`.\n- If a step turns out to be unnecessary or is superseded, do not leave it `pending` forever and do not silently delete it — mark it `completed` with a brief note appended to its `content` (e.g. \"— superseded by X\"), so the record stays honest.\n- When implementation diverges from the plan body (a design changes, an edge case forces a different approach), update the body with a short dated note at the point of divergence. The plan should describe what was actually built; a plan that lies is worse than no plan.\n- When the last todo completes, give the body a final pass: blockers that materialized, follow-ups discovered during implementation, and anything the next reader needs.\n\n## Frontmatter Template\n\n```yaml\n---\nname: short-plan-name\noverview: \"One sentence describing the outcome, scope, and implementation context.\"\ntodos:\n  - id: first-step\n    content: Concrete task written as an implementation action\n    status: pending\n  - id: verify-result\n    content: Run the checks that prove the plan worked\n    status: pending\nisProject: false\n---\n```\n\n## Body Template\n\n```markdown\n# Plan Title\n\n## Goal\nState the desired end state in one short paragraph.\n\n## Scope\n- In scope: concrete systems, files, and behaviors.\n- Out of scope: tempting but intentionally deferred work.\n\n## Files To Change\n- `path/to/file`: exact change expected.\n\n## Implementation Steps\n- Step-by-step changes in execution order.\n\n## Verification\n- Commands, checks, logs, and acceptance criteria.\n\n## Rollout\n- Canary or batch sequence when applicable.\n\n## Rollback\n- How to safely undo or disable the change.\n\n## Blockers\n- Conditions that should stop implementation or rollout.\n```\n\n## Quality Bar\n\n- The TODO list should match the plan body.\n- The plan should name the repo's existing patterns instead of inventing new ones.\n- Verification should prove behavior, not just formatting.\n- Rollback should avoid unrelated destructive changes.\n- Keep the plan concise, but remove ambiguity before removing detail.\n- After execution, statuses and body reflect what actually happened, not what was originally intended.\n\n## Keep plans implementation-sized\n\nA useful plan should be small enough for an agent to execute without re-planning. Break broad initiatives into phases with concrete files, commands, and acceptance checks. Avoid vague tasks like \"improve UX\"; write observable outcomes such as \"add empty-state component in `src/...` and cover it with a screenshot or unit test.\"\n",
    "files": [
      {
        "path": "index.md",
        "size": 142,
        "sha256": "6c5ed020a3a021e4b46ff4344c061f4f0b34b16c7d804571fef9004217460b8b",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "LICENSE.txt",
        "size": 1066,
        "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
        "executable": false,
        "contentType": "text/plain; charset=utf-8"
      },
      {
        "path": "SKILL.md",
        "size": 5050,
        "sha256": "9502892836758244cb673fd9940712b7211f00ae08d4112c1b10ff8905a7838a",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      }
    ],
    "tree_hash": "8b40406162fdc8cd7cfda045501e400c81567441541d10d936a4bdbe35f75a92",
    "storage_backend": "blob",
    "has_executable": false,
    "security_scan": {
      "verdict": "review",
      "risk": "low",
      "findings": [],
      "truncated": false,
      "scanned_at": "2026-06-25T07:12:26.801Z",
      "model": "google/gemini-2.5-flash-lite",
      "rubric_version": "v1",
      "scan_source": "model",
      "generated_by_model": true,
      "advisory": true
    },
    "signals": [
      {
        "id": "ai_scan",
        "label": "AI security scan",
        "scope": "skill",
        "status": "pass",
        "detail": "Advisory scan completed with no concrete findings."
      },
      {
        "id": "registered",
        "label": "On-chain identity",
        "scope": "author",
        "status": "pass",
        "detail": "Author is registered on-chain."
      },
      {
        "id": "vouched",
        "label": "Vouched by others",
        "scope": "author",
        "status": "pass",
        "detail": "Other accounts have staked USDC vouching for this author."
      },
      {
        "id": "author_bonded",
        "label": "Author bond",
        "scope": "author",
        "status": "pass",
        "detail": "Author posted a USDC self-bond (skin in the game)."
      },
      {
        "id": "dispute_free",
        "label": "Dispute history",
        "scope": "author",
        "status": "pass",
        "detail": "No disputes against this author."
      }
    ],
    "versions": [
      {
        "id": "c53159b6-c2ed-492c-828b-84b1ef9f6b12",
        "files": [
          {
            "path": "index.md",
            "size": 142,
            "sha256": "6c5ed020a3a021e4b46ff4344c061f4f0b34b16c7d804571fef9004217460b8b",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "LICENSE.txt",
            "size": 1066,
            "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
            "executable": false,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 5050,
            "sha256": "9502892836758244cb673fd9940712b7211f00ae08d4112c1b10ff8905a7838a",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 3,
        "ipfs_cid": null,
        "changelog": "Synced from dirtybits/agent-skills",
        "tree_hash": "8b40406162fdc8cd7cfda045501e400c81567441541d10d936a4bdbe35f75a92",
        "created_at": "2026-06-25T07:12:25.978868+00:00",
        "has_executable": false,
        "storage_backend": "blob"
      },
      {
        "id": "cc749d5c-40a0-49a9-9c65-610b6f55501e",
        "files": [
          {
            "path": "index.md",
            "size": 85,
            "sha256": "0a1ea56ec0e0c7dbfe72ab70848f3f303daf2630ef9996529a0db78f6028ab0b",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 4701,
            "sha256": "b53a0279f996a7b20febfb7f01c315f3f598ccbdb4b1a40db3bdc908961f5af5",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 2,
        "ipfs_cid": null,
        "changelog": "Synced from dirtybits/agent-skills",
        "tree_hash": "71067c84f45d2cf4bcc51e67c914d5e195f1dd9ddd9ce27dfc276ba3babe8829",
        "created_at": "2026-06-23T07:04:06.687382+00:00",
        "has_executable": false,
        "storage_backend": "blob"
      },
      {
        "id": "14b64a6b-ce47-4dc5-b3ed-710a36750a4e",
        "files": [
          {
            "path": "SKILL.md",
            "size": 4442,
            "sha256": "3d7d5ec7ccd9d8165e36276358cdb3ec6357cffa8a341e7a132e30e8a552b36c",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 1,
        "ipfs_cid": null,
        "changelog": "Initial release",
        "tree_hash": "77cf1301276b452c90689f997e5ff162df5b06ec59e164f1a98833c4c80482f0",
        "created_at": "2026-06-10T23:20:05.820719+00:00",
        "has_executable": false,
        "storage_backend": "blob"
      }
    ],
    "author_trust": {
      "isRegistered": true,
      "registeredAt": 1779082335,
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "totalStakeAtRisk": 24250000,
      "authorBondUsdcMicros": 7250000,
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_trust_summary": {
      "username": "wallet-z7wzgw",
      "github_url": "https://github.com/dirtybits",
      "display_name": null,
      "github_login": "dirtybits",
      "isRegistered": true,
      "registeredAt": 1779082335,
      "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "wallet_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "schema_version": "2026-04-03",
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "trust_updated_at": "2026-09-22T04:52:30.978Z",
      "canonical_agent_id": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "recommended_action": "allow",
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_identity": {
      "id": "1f84a1fd-7c81-4925-9ea7-7b0ba6609697",
      "canonicalAgentId": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "identitySource": "local",
      "homeChainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "status": "active",
      "displayName": null,
      "username": "wallet-z7wzgw",
      "usernameSource": "fallback",
      "githubProfile": {
        "id": "28834908",
        "login": "dirtybits",
        "name": "andy",
        "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4",
        "url": "https://github.com/dirtybits"
      },
      "bindings": [
        {
          "id": "c11bf186-49aa-46d1-82a0-732d84071113",
          "metadata": null,
          "isPrimary": true,
          "bindingRef": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
          "bindingType": "wallet_owner",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "7ac9de7b-3020-4261-be2c-d7cbefa1d257",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "094fbb11-545b-41d7-b7e7-38d66a8c5fde",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "A4dgMn4WYSmFdisAkpKzFwUcLsPr4fBJU5nbKQHWHgeA",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "147b59b5-fb6f-4901-ad99-8fa8f742f4af",
          "metadata": {
            "id": "28834908",
            "url": "https://github.com/dirtybits",
            "name": "andy",
            "login": "dirtybits",
            "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4"
          },
          "isPrimary": false,
          "bindingRef": "github:28834908",
          "bindingType": "github_profile",
          "chainContext": "github",
          "externalAgentId": "28834908",
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        }
      ],
      "ownerWallet": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "operationalWallet": null,
      "agentProfilePda": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
      "registryAsset": null
    },
    "buyerHasPurchased": false,
    "buyerPurchaseSummary": null,
    "content_verification": {
      "has_ipfs": false,
      "all_versions_pinned": false,
      "current_cid_consistent": true,
      "status": "unverified"
    },
    "priceDisclosure": null,
    "purchaseRiskWarning": null
  },
  {
    "id": "c2c97f3b-a136-49e7-a199-6acb41e29ffe",
    "skill_id": "author-cta-mpary18x",
    "public_slug": "author-cta-mpary18x",
    "public_author_slug": "wallet-asuavudg",
    "author_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "author_kind": "wallet",
    "author_external_id": null,
    "author_handle": null,
    "author_display_name": null,
    "publisher_identity_key": "wallet:asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "publisher_tier": "registered",
    "mirror_source_key": null,
    "synced_repo_url": null,
    "name": "Author CTA Smoke",
    "description": "Temporary paid listing for author CTA smoke",
    "tags": [],
    "current_version": 1,
    "summary": "Verifies that a listing author does not see buyer purchase or unlock CTAs on their own skill detail page.",
    "summary_model": "google/gemini-2.5-flash-lite",
    "summary_sha256": "e6fae71f406007c36dd88500853da2040807850af253998909c8f00ca42ebd91",
    "summary_capabilities": [
      "Verify author visibility",
      "Manage listing context",
      "Phantom wallet connection"
    ],
    "ipfs_cid": null,
    "on_chain_address": "H2sFUFGZDB35TDssrbbkE7ucr9GLZJxBFrf26yPYXeHx",
    "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
    "evm_listing_id": null,
    "evm_contract_address": null,
    "evm_tx_hash": null,
    "total_installs": 1,
    "price_usdc_micros": "10000",
    "currency_mint": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    "on_chain_protocol_version": "v0.2.0",
    "on_chain_program_id": "AGNtBjLEHFnssPzQjZJnnqiaUgtkaxj4fFaWoKD6yVdg",
    "contact": null,
    "created_at": "2026-05-18T05:39:29.945Z",
    "updated_at": "2026-05-18T05:39:32.850Z",
    "source": "repo",
    "payment_flow": "direct-purchase-skill",
    "content": null,
    "files": [
      {
        "path": "SKILL.md",
        "size": 379,
        "sha256": "e6fae71f406007c36dd88500853da2040807850af253998909c8f00ca42ebd91",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      }
    ],
    "tree_hash": "37df75757a0bc92177c05875237694b7a10d032f580333f843db74caeef493f5",
    "storage_backend": "inline",
    "has_executable": false,
    "security_scan": {
      "verdict": "review",
      "risk": "low",
      "findings": [
        {
          "severity": "low",
          "category": "scope-mismatch",
          "detail": "The skill's declared purpose seems to be for testing UI elements for listing authors, but the inputs mention a 'connected Phantom wallet matching the author.' This could imply that the skill might attempt to interact with or verify wallet ownership, which might go beyond a simple UI test.",
          "evidence": "Inputs:\n- A connected Phantom wallet matching the author.",
          "file": "SKILL.md"
        }
      ],
      "truncated": false,
      "scanned_at": "2026-06-04T15:49:32.740Z",
      "model": "google/gemini-2.5-flash-lite",
      "rubric_version": "v1",
      "scan_source": "model",
      "generated_by_model": true,
      "advisory": true
    },
    "signals": [
      {
        "id": "ai_scan",
        "label": "AI security scan",
        "scope": "skill",
        "status": "warn",
        "detail": "Advisory scan completed with 1 finding(s) to review."
      },
      {
        "id": "registered",
        "label": "On-chain identity",
        "scope": "author",
        "status": "pass",
        "detail": "Author is registered on-chain."
      },
      {
        "id": "vouched",
        "label": "Vouched by others",
        "scope": "author",
        "status": "pass",
        "detail": "Other accounts have staked USDC vouching for this author."
      },
      {
        "id": "author_bonded",
        "label": "Author bond",
        "scope": "author",
        "status": "pass",
        "detail": "Author posted a USDC self-bond (skin in the game)."
      },
      {
        "id": "dispute_free",
        "label": "Dispute history",
        "scope": "author",
        "status": "pass",
        "detail": "No disputes against this author."
      }
    ],
    "versions": [
      {
        "id": "9c2779a3-ae45-4ce9-a3f6-950927a2345d",
        "files": [
          {
            "path": "SKILL.md",
            "size": 379,
            "sha256": "e6fae71f406007c36dd88500853da2040807850af253998909c8f00ca42ebd91",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 1,
        "ipfs_cid": null,
        "changelog": "Initial release",
        "tree_hash": "37df75757a0bc92177c05875237694b7a10d032f580333f843db74caeef493f5",
        "created_at": "2026-05-18T05:39:30.024705+00:00",
        "has_executable": false,
        "storage_backend": "inline"
      }
    ],
    "author_trust": {
      "isRegistered": true,
      "registeredAt": 1779082335,
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "totalStakeAtRisk": 24250000,
      "authorBondUsdcMicros": 7250000,
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_trust_summary": {
      "username": "wallet-z7wzgw",
      "github_url": "https://github.com/dirtybits",
      "display_name": null,
      "github_login": "dirtybits",
      "isRegistered": true,
      "registeredAt": 1779082335,
      "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "wallet_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "schema_version": "2026-04-03",
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "trust_updated_at": "2026-09-22T04:52:30.978Z",
      "canonical_agent_id": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "recommended_action": "allow",
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_identity": {
      "id": "1f84a1fd-7c81-4925-9ea7-7b0ba6609697",
      "canonicalAgentId": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "identitySource": "local",
      "homeChainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "status": "active",
      "displayName": null,
      "username": "wallet-z7wzgw",
      "usernameSource": "fallback",
      "githubProfile": {
        "id": "28834908",
        "login": "dirtybits",
        "name": "andy",
        "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4",
        "url": "https://github.com/dirtybits"
      },
      "bindings": [
        {
          "id": "c11bf186-49aa-46d1-82a0-732d84071113",
          "metadata": null,
          "isPrimary": true,
          "bindingRef": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
          "bindingType": "wallet_owner",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "7ac9de7b-3020-4261-be2c-d7cbefa1d257",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "094fbb11-545b-41d7-b7e7-38d66a8c5fde",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "A4dgMn4WYSmFdisAkpKzFwUcLsPr4fBJU5nbKQHWHgeA",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "147b59b5-fb6f-4901-ad99-8fa8f742f4af",
          "metadata": {
            "id": "28834908",
            "url": "https://github.com/dirtybits",
            "name": "andy",
            "login": "dirtybits",
            "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4"
          },
          "isPrimary": false,
          "bindingRef": "github:28834908",
          "bindingType": "github_profile",
          "chainContext": "github",
          "externalAgentId": "28834908",
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        }
      ],
      "ownerWallet": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "operationalWallet": null,
      "agentProfilePda": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
      "registryAsset": null
    },
    "buyerHasPurchased": false,
    "buyerPurchaseSummary": null,
    "content_verification": {
      "has_ipfs": false,
      "all_versions_pinned": false,
      "current_cid_consistent": true,
      "status": "unverified"
    },
    "priceDisclosure": "Buying this skill transfers USDC and creates an on-chain purchase receipt, so your wallet still needs a small amount of SOL for rent and network fees.",
    "purchaseRiskWarning": null
  },
  {
    "id": "710a7213-9654-4fe2-8bfd-424c64b868c9",
    "skill_id": "multi-agent-worktree-discipline",
    "public_slug": "multi-agent-worktree-discipline",
    "public_author_slug": "wallet-asuavudg",
    "author_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "author_kind": "wallet",
    "author_external_id": null,
    "author_handle": null,
    "author_display_name": null,
    "publisher_identity_key": "wallet:asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "publisher_tier": "registered",
    "mirror_source_key": null,
    "synced_repo_url": "https://github.com/dirtybits/agent-skills",
    "name": "Multi Agent Worktree Discipline",
    "description": "Operate safely in repositories where multiple coding agents (Claude, Codex, Cursor, humans) work in parallel git worktrees. Covers session bootstrap in a fresh worktree, toolchain/version pinning, lockfile-safe dependency installs, branch topology and reco",
    "tags": [
      "mit"
    ],
    "current_version": 1,
    "summary": "Manage multi-agent Git worktree safety, session bootstrap, dependency installs, and identity checks.",
    "summary_model": "google/gemini-2.5-flash-lite",
    "summary_sha256": "720be7e4b74913afbdc15437117203470affc487e6098667cf42f38f70896e24",
    "summary_capabilities": [
      "Worktree session bootstrap",
      "Lockfile dependency installs",
      "Branch reconciliation",
      "Identity verification"
    ],
    "ipfs_cid": null,
    "on_chain_address": null,
    "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
    "evm_listing_id": null,
    "evm_contract_address": null,
    "evm_tx_hash": null,
    "total_installs": 0,
    "price_usdc_micros": null,
    "currency_mint": null,
    "on_chain_protocol_version": null,
    "on_chain_program_id": null,
    "contact": "https://github.com/dirtybits/agent-skills/tree/main/skills/multi-agent-worktree-discipline",
    "created_at": "2026-07-07T07:52:27.223Z",
    "updated_at": "2026-07-07T07:52:27.223Z",
    "source": "repo",
    "payment_flow": "free",
    "content": "---\ntype: Skill\nname: multi-agent-worktree-discipline\ntitle: \"Multi-Agent Worktree Discipline\"\ndescription: Operate safely in repositories where multiple coding agents (Claude, Codex, Cursor, humans) work in parallel git worktrees. Covers session bootstrap in a fresh worktree, toolchain/version pinning, lockfile-safe dependency installs, branch topology and reconciliation, recovering \"lost\" work without redoing it, commit signing in headless shells, and account-identity checks before pushing or opening PRs. Use at the start of any session in a worktree, whenever work seems missing, before switching branches, and before any commit/push/PR.\nresource: \"https://github.com/dirtybits/agent-skills/tree/main/skills/multi-agent-worktree-discipline\"\ntags: [\"git\", \"worktrees\", \"multi-agent\", \"workflow\", \"session-bootstrap\"]\ntimestamp: \"2026-07-06T20:00:00Z\"\nokf_version: \"0.1\"\nlicense: MIT\n---\n\n# Multi-Agent Worktree Discipline\n\n## Why this skill exists\n\nWhen several agents share one repository through git worktrees, the expensive failures are not merge conflicts — they are silent ones: an agent redoes work that exists uncommitted in another worktree, a lockfile reinstall wipes an uncommitted dependency, a branch switch strands edits, a resumed session pushes with the wrong GitHub account, or a \"fixed\" build was actually run against the wrong Node version. Each of these costs an hour or more and looks like a mystery until you know the pattern. This skill is the checklist and the recovery protocols.\n\n## 1. Session bootstrap (run before doing anything else)\n\n1. **Identify where you are.** Run `git worktree list` and `git rev-parse --show-toplevel`. Confirm which worktree you are in and which branch it has checked out. Never infer location from the path string — on case-insensitive filesystems (macOS default) `~/repos/x` and `~/Repos/x` are the same directory, and per-agent worktrees often live under hidden dirs (`.codex/`, `.cursor/`, `.claude/worktrees/`, `~/.agents/worktrees/`).\n2. **Pin the toolchain per command, not per session.** Agent shells frequently resolve a different runtime than the repo expects (`.nvmrc`, `rust-toolchain`, etc.) because the sandbox PATH is built before version managers run. If the repo pins a version, export the pinned toolchain's bin dir onto PATH **inside every shell invocation** (shell state may not persist between calls). Symptom of getting this wrong: test runners dying with module-format errors (`ERR_REQUIRE_ESM`), not a clear version message.\n3. **Install dependencies from the lockfile.** Fresh worktrees lack gitignored artifacts: `node_modules`, `.env.local`, build caches. If the repo has a worktree-setup script, run it. Otherwise install with the lockfile-respecting command (`npm ci`, `pnpm install --frozen-lockfile`) — plain `npm install` can rebuild optional native bindings incorrectly and mutate the lockfile.\n4. **Beware symlinked/shared node_modules.** Some worktrees symlink `node_modules` to the primary checkout to save disk. That means: (a) installing in one place affects all of them, and (b) a build failure like `Cannot find module 'x'` usually means broken worktree resolution or a stale build cache (`.next`, `dist`) — fix the link and clear the cache; do **not** add duplicate dependencies or edit app code to route around it.\n5. **Verify your push identity.** Run `gh auth status` (and `git config user.email`). Session resume and multi-account setups can silently switch the active account to one that cannot create PRs (e.g. an enterprise-managed account). Switch back explicitly (`gh auth switch --user <name>`) before any push or PR.\n\n## 2. Branch topology: shared feature branch + per-agent scratch\n\n- Treat **one shared feature branch** (`feat/<topic>`) as the integration point for a piece of work, and per-agent branches (`claude/…`, `codex/…`, `cursor/…`) as **scratch** that rebases or resets onto it.\n- A branch can be checked out in **only one worktree at a time**. If checkout fails with \"already checked out\", find the other worktree with `git worktree list` instead of force-detaching.\n- One reviewable unit (phase/feature) = one PR off current `main`. Do not accumulate multiple phases on one branch.\n\n## 3. The \"lost work\" protocol (run BEFORE redoing anything)\n\nWork that seems missing is almost never lost — it is on a branch or in a worktree you are not looking at. Redoing it creates divergent duplicate commits that must then be reconciled by hand.\n\n1. `git log --all --oneline --graph | head -50` — look for the commits you expected.\n2. `git branch -a --contains <sha>` — find which branch actually holds a commit.\n3. Check other worktrees: uncommitted changes in worktree A are invisible from worktree B's branch. That is not loss.\n4. Check for auto-commit tooling (e.g. `gcai` or IDE auto-commits) that may have captured the work on a different branch.\n5. Only after all four come up empty, treat the work as lost.\n\n## 4. Branch-switch and commit hygiene\n\n- **Switching a worktree's branch reverts tracked-file edits** to the target branch and strands your work on the old branch. Untracked files survive the switch but belong to no branch until added. Rule: commit early, even WIP, before any branch operation.\n- **Commit dependency changes immediately and atomically** (`package.json` + the root lockfile in the same commit). Repos with session-start `npm ci` hooks will silently wipe an uncommitted `npm install` on the next session — the classic symptom is a dependency that \"keeps disappearing\".\n- Keep per-repo git author identity correct even when global config differs (work vs personal): set `git config user.name/user.email` locally in the repo when needed.\n\n## 5. Signed commits in headless shells\n\nIf the repo expects signed commits (1Password/SSH/GPG signing):\n\n1. Attempt the normal signed commit first — signing often works headlessly when the agent socket is available.\n2. If signing fails, **do not fall back to unsigned silently.** Report the exact error to the human and hand them the recovery command: `git commit --amend -S --no-edit`, then `git push --force-with-lease` if already pushed.\n3. Verify after committing: `git log -1 --show-signature`.\n\n## 6. Failure-mode quick reference\n\n| Symptom | Likely cause | First move |\n| --- | --- | --- |\n| Test runner dies with `ERR_REQUIRE_ESM` / weird module errors | Wrong runtime version ahead of the version manager | Export pinned toolchain PATH in the same command |\n| `Cannot find module 'x'` in a worktree that \"should\" work | Broken node_modules link or stale build cache | Re-link/reinstall from lockfile; clear `.next`/`dist` |\n| Work from a previous session \"gone\" | It's on another branch/worktree, uncommitted, or auto-committed | §3 protocol before redoing anything |\n| A dependency you added keeps vanishing | Session-start lockfile reinstall wiping uncommitted install | Commit `package.json` + lockfile together |\n| `gh pr create` fails with permissions/SSO error | Active gh account flipped to a managed account | `gh auth status`; switch account |\n| \"Branch already checked out\" | Another worktree holds it | `git worktree list`; work there or use a new branch |\n| Port-in-use from a test validator/dev server | Stale process — or a sandbox false positive | `lsof -nP -i :<port>` first; only kill what you can see |\n\n## 7. Done-when for this skill\n\nA session followed this skill when: the worktree/branch was identified before edits; installs used the lockfile; no duplicate commits were created for \"lost\" work; dependency changes are committed with the lockfile; the commit is signed (or the failure reported verbatim with the amend command); and the push/PR went out under the intended account.\n",
    "files": [
      {
        "path": "index.md",
        "size": 180,
        "sha256": "e271ea342196ed3ce5e437ab7f2e412ffea88c1bb54e44242e4fa7ed13e58c14",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "LICENSE.txt",
        "size": 1066,
        "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
        "executable": false,
        "contentType": "text/plain; charset=utf-8"
      },
      {
        "path": "SKILL.md",
        "size": 7726,
        "sha256": "720be7e4b74913afbdc15437117203470affc487e6098667cf42f38f70896e24",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      }
    ],
    "tree_hash": "56961c8ae01e3f27257f0870a4577dee133fb9df6a3b54fc9eecf6b04f583778",
    "storage_backend": "blob",
    "has_executable": false,
    "security_scan": {
      "verdict": "review",
      "risk": "low",
      "findings": [
        {
          "severity": "low",
          "category": "supply-chain",
          "detail": "The skill describes installing dependencies using npm ci, pnpm install --frozen-lockfile, and mentions potential issues with npm install mutating lockfiles. While these are standard practices for lockfile management, they imply interactions with the package manager which could be a vector if the package manager itself or its sources were compromised. However, the skill promotes using lockfiles, which is a security best practice.",
          "evidence": "install with the lockfile-respecting command (`npm ci`, `pnpm install --frozen-lockfile`) — plain `npm install` can rebuild optional native bindings incorrectly and mutate the lockfile.",
          "file": "SKILL.md"
        },
        {
          "severity": "low",
          "category": "prompt-injection",
          "detail": "The skill provides detailed instructions on how to operate safely in repositories with multiple coding agents and git worktrees. It emphasizes identifying locations, pinning toolchains, installing dependencies from lockfiles, managing branch topology, recovering lost work, and verifying push identity. While the instructions are technical and defensive, they are presented as a checklist/protocol for the user and do not appear to contain any instructions that could be directly exploited for prompt injection into the agent's decision-making process. The content is purely advisory and instructional.",
          "evidence": "Identify where you are. Run `git worktree list` and `git rev-parse --show-toplevel`. Confirm which worktree you are in and which branch it has checked out.",
          "file": "SKILL.md"
        }
      ],
      "truncated": false,
      "scanned_at": "2026-07-07T07:52:29.380Z",
      "model": "google/gemini-2.5-flash-lite",
      "rubric_version": "v1",
      "scan_source": "model",
      "generated_by_model": true,
      "advisory": true
    },
    "signals": [
      {
        "id": "ai_scan",
        "label": "AI security scan",
        "scope": "skill",
        "status": "warn",
        "detail": "Advisory scan completed with 2 finding(s) to review."
      },
      {
        "id": "registered",
        "label": "On-chain identity",
        "scope": "author",
        "status": "pass",
        "detail": "Author is registered on-chain."
      },
      {
        "id": "vouched",
        "label": "Vouched by others",
        "scope": "author",
        "status": "pass",
        "detail": "Other accounts have staked USDC vouching for this author."
      },
      {
        "id": "author_bonded",
        "label": "Author bond",
        "scope": "author",
        "status": "pass",
        "detail": "Author posted a USDC self-bond (skin in the game)."
      },
      {
        "id": "dispute_free",
        "label": "Dispute history",
        "scope": "author",
        "status": "pass",
        "detail": "No disputes against this author."
      }
    ],
    "versions": [
      {
        "id": "9adf4e8e-cba2-47dd-99b0-b6849ee685d6",
        "files": [
          {
            "path": "index.md",
            "size": 180,
            "sha256": "e271ea342196ed3ce5e437ab7f2e412ffea88c1bb54e44242e4fa7ed13e58c14",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "LICENSE.txt",
            "size": 1066,
            "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
            "executable": false,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 7726,
            "sha256": "720be7e4b74913afbdc15437117203470affc487e6098667cf42f38f70896e24",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 1,
        "ipfs_cid": null,
        "changelog": "Synced from dirtybits/agent-skills",
        "tree_hash": "56961c8ae01e3f27257f0870a4577dee133fb9df6a3b54fc9eecf6b04f583778",
        "created_at": "2026-07-07T07:52:27.223454+00:00",
        "has_executable": false,
        "storage_backend": "blob"
      }
    ],
    "author_trust": {
      "isRegistered": true,
      "registeredAt": 1779082335,
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "totalStakeAtRisk": 24250000,
      "authorBondUsdcMicros": 7250000,
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_trust_summary": {
      "username": "wallet-z7wzgw",
      "github_url": "https://github.com/dirtybits",
      "display_name": null,
      "github_login": "dirtybits",
      "isRegistered": true,
      "registeredAt": 1779082335,
      "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "wallet_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "schema_version": "2026-04-03",
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "trust_updated_at": "2026-09-22T04:52:30.978Z",
      "canonical_agent_id": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "recommended_action": "allow",
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_identity": {
      "id": "1f84a1fd-7c81-4925-9ea7-7b0ba6609697",
      "canonicalAgentId": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "identitySource": "local",
      "homeChainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "status": "active",
      "displayName": null,
      "username": "wallet-z7wzgw",
      "usernameSource": "fallback",
      "githubProfile": {
        "id": "28834908",
        "login": "dirtybits",
        "name": "andy",
        "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4",
        "url": "https://github.com/dirtybits"
      },
      "bindings": [
        {
          "id": "c11bf186-49aa-46d1-82a0-732d84071113",
          "metadata": null,
          "isPrimary": true,
          "bindingRef": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
          "bindingType": "wallet_owner",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "7ac9de7b-3020-4261-be2c-d7cbefa1d257",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "094fbb11-545b-41d7-b7e7-38d66a8c5fde",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "A4dgMn4WYSmFdisAkpKzFwUcLsPr4fBJU5nbKQHWHgeA",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "147b59b5-fb6f-4901-ad99-8fa8f742f4af",
          "metadata": {
            "id": "28834908",
            "url": "https://github.com/dirtybits",
            "name": "andy",
            "login": "dirtybits",
            "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4"
          },
          "isPrimary": false,
          "bindingRef": "github:28834908",
          "bindingType": "github_profile",
          "chainContext": "github",
          "externalAgentId": "28834908",
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        }
      ],
      "ownerWallet": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "operationalWallet": null,
      "agentProfilePda": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
      "registryAsset": null
    },
    "buyerHasPurchased": false,
    "buyerPurchaseSummary": null,
    "content_verification": {
      "has_ipfs": false,
      "all_versions_pinned": false,
      "current_cid_consistent": true,
      "status": "unverified"
    },
    "priceDisclosure": null,
    "purchaseRiskWarning": null
  },
  {
    "id": "1d55086f-4740-4bcf-9bf3-397529f21e58",
    "skill_id": "guarded-db-migration",
    "public_slug": "guarded-db-migration",
    "public_author_slug": "wallet-asuavudg",
    "author_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "author_kind": "wallet",
    "author_external_id": null,
    "author_handle": null,
    "author_display_name": null,
    "publisher_identity_key": "wallet:asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "publisher_tier": "registered",
    "mirror_source_key": null,
    "synced_repo_url": "https://github.com/dirtybits/agent-skills",
    "name": "Guarded Db Migration",
    "description": "Run production database schema changes without incidents, split additive runtime DDL from risky one-shot migrations, guard migration scripts with an expected-host check and a read-only preflight, rehearse the exact command on a disposable branch copied fro",
    "tags": [
      "mit"
    ],
    "current_version": 1,
    "summary": "Safely performs production database schema migrations with preflight checks, host guards, and rehearsals.",
    "summary_model": "google/gemini-2.5-flash-lite",
    "summary_sha256": "298197ca10a4eac1bf8bd17b47fc81eaf4b0cedf875016e488fe184fabcaa6ea",
    "summary_capabilities": [
      "database migrations",
      "schema changes",
      "production safety",
      "data integrity"
    ],
    "ipfs_cid": null,
    "on_chain_address": null,
    "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
    "evm_listing_id": null,
    "evm_contract_address": null,
    "evm_tx_hash": null,
    "total_installs": 0,
    "price_usdc_micros": null,
    "currency_mint": null,
    "on_chain_protocol_version": null,
    "on_chain_program_id": null,
    "contact": "https://github.com/dirtybits/agent-skills/tree/main/skills/guarded-db-migration",
    "created_at": "2026-07-07T07:52:25.358Z",
    "updated_at": "2026-07-07T07:52:25.358Z",
    "source": "repo",
    "payment_flow": "free",
    "content": "---\ntype: Skill\nname: guarded-db-migration\ntitle: \"Guarded DB Migration\"\ndescription: Run production database schema changes without incidents, split additive runtime DDL from risky one-shot migrations, guard migration scripts with an expected-host check and a read-only preflight, rehearse the exact command on a disposable branch copied from production (Neon or similar branching Postgres), and verify with post-run catalog queries plus an API smoke. Use whenever adding indexes or constraints, changing primary keys, backfilling, dropping anything, or running any script against a production database URL.\nresource: \"https://github.com/dirtybits/agent-skills/tree/main/skills/guarded-db-migration\"\ntags: [\"database\", \"postgres\", \"migrations\", \"neon\", \"operations\", \"safety\"]\ntimestamp: \"2026-07-06T20:00:00Z\"\nokf_version: \"0.1\"\nlicense: MIT\n---\n\n# Guarded DB Migration\n\n## Why this skill exists\n\nThe two classic agent-caused database incidents are: (1) risky DDL placed in a request-time schema initializer, so the first failure takes down every route that touches the table; and (2) a migration script pointed at the wrong database — a legacy project, a teammate's branch, production instead of staging — because the connection string was ambient. Both are fully preventable with three habits: the additive/guarded split, the expected-host guard, and a rehearsal on a disposable copy of production.\n\n## 1. The additive/guarded split (decide where the DDL lives)\n\n**Runtime schema initializers** (code that runs `CREATE TABLE IF NOT EXISTS` on boot or first request) may contain **only** additive, race-tolerant, cannot-fail-on-live-data statements:\n\n- `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS` (non-unique), `ADD COLUMN IF NOT EXISTS`\n- Idempotent backfills that tolerate concurrent execution\n\n**Everything that can fail on live data goes in a guarded one-shot script** — never in the initializer:\n\n- `CREATE UNIQUE INDEX` (fails on existing duplicates)\n- `DROP` anything, `ALTER ... DROP CONSTRAINT`, primary-key swaps\n- Backfills that assume exclusive access or specific data shape\n- Anything requiring a duplicate scan or data repair first\n\nRule of thumb: if the statement could throw because of the *data* (not just the schema), it is one-shot-script material.\n\n## 2. The guarded one-shot script pattern\n\nWrite the migration as a standalone script (e.g. `scripts/<name>-migration.ts`) with two subcommands:\n\n```\n<script> preflight   # read-only: reports duplicates/violations/row counts; exit nonzero if migrate would fail\n<script> migrate     # performs the DDL, in order, inside the smallest safe transaction scope\n```\n\nNon-negotiable guards in `migrate`:\n\n1. **Expected-host guard.** The script takes `EXPECTED_DATABASE_HOST` (or equivalent) and refuses to run unless it matches the host parsed from `DATABASE_URL`. This converts \"wrong ambient connection string\" from an incident into an error message. Never default it; never allow a bypass flag.\n2. **Preflight-first.** `migrate` re-runs the preflight checks internally before DDL — the world may have changed since you ran `preflight` manually.\n3. **Idempotence or a clear refusal.** Running `migrate` twice must either be a no-op or fail loudly before touching anything.\n4. **Print everything.** Target host, database, each statement as it runs, and a post-run verification summary. The transcript is the evidence.\n\n## 3. Rehearse on a disposable copy of production\n\nBefore running `migrate` against production, rehearse the **exact command** on a disposable branch/copy of the production database (Neon branches, RDS clone, `pg_dump`+restore — whatever the platform gives you):\n\n1. Create the branch **from the intended production project**, not from staging — and double-check which project you are in first. Multi-project setups (a live project plus a legacy one, or platform-managed vs hand-created) are where wrong-target incidents come from; verify with the platform CLI (`neonctl projects list`, connection-string host) before branching.\n2. Run `preflight` then `migrate` against the branch with the same env-guard values you will use in production (pointed at the branch host).\n3. Capture: target host/database, guard output, preflight report, each DDL success, and the post-run checks.\n4. Delete the branch after. The rehearsal's purpose is proving the *script and SQL order execute end-to-end on production-shaped data* — not just finding duplicates (preflight already does that read-only against live).\n\n## 4. The live run and verification\n\n1. Run `preflight` against production (read-only) and read the report.\n2. Fix any data issues it surfaces (as their own reviewed step — data repair is not a side effect of a migration).\n3. Run `migrate` with the production `EXPECTED_DATABASE_HOST`.\n4. **Verify with catalog queries**, not vibes: `pg_indexes` for new indexes, `information_schema.table_constraints` for constraints, targeted `SELECT`s for backfills.\n5. **Smoke the application**: hit the production API endpoints that read/write the touched tables and confirm 200s and sane payloads.\n6. Record the whole thing (host, outputs, verification) in the plan/PR that shipped the migration.\n\n## 5. Design rules that keep migrations boring\n\n- **Additive first, destructive later (or never).** Ship the new column/index/unique-check alongside the old shape; move reads/writes over; only drop the legacy shape when a real conflict forces it. A legacy PK plus an additive chain/tenant-qualified unique index is a fine steady state for a long time.\n- **Never let application code depend on a migration having run.** Deploy order: migration first, then code that requires it — or code that tolerates both shapes.\n- **Local and production may point at different branches.** Before treating a data mismatch as a code regression, compare the local env's database host with production's.\n- **One migration = one reviewable script + one PR**, with the rehearsal evidence in the description.\n\n## 6. Checklist (copy into the migration PR)\n\n- [ ] Risky DDL is in a guarded one-shot script, not a runtime initializer\n- [ ] Script has `preflight` (read-only) and `migrate` (host-guarded, idempotent, verbose)\n- [ ] Confirmed the target project/host is the live one (not a legacy/stale project)\n- [ ] Rehearsed the exact `migrate` command on a disposable branch copied from production; evidence captured\n- [ ] Production `preflight` clean (or data repaired in a reviewed step)\n- [ ] Production `migrate` run with the expected-host guard; transcript captured\n- [ ] Post-run catalog verification (`pg_indexes` / constraints / backfill counts) recorded\n- [ ] Production API smoke on affected endpoints recorded\n- [ ] Rollback story written down (even if it is \"additive change; rollback = ignore the new column\")\n",
    "files": [
      {
        "path": "index.md",
        "size": 158,
        "sha256": "d5417283d489773d6b92d7ce9691ea220d17f88feca1c807ef1a194919ed17dd",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "LICENSE.txt",
        "size": 1066,
        "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
        "executable": false,
        "contentType": "text/plain; charset=utf-8"
      },
      {
        "path": "SKILL.md",
        "size": 6804,
        "sha256": "298197ca10a4eac1bf8bd17b47fc81eaf4b0cedf875016e488fe184fabcaa6ea",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      }
    ],
    "tree_hash": "ec27b74da7735043b9a890fbb32aeebd0949e61dab1ebd22ac651199aefa77a1",
    "storage_backend": "blob",
    "has_executable": false,
    "security_scan": {
      "verdict": "review",
      "risk": "low",
      "findings": [],
      "truncated": false,
      "scanned_at": "2026-07-07T07:52:26.768Z",
      "model": "google/gemini-2.5-flash-lite",
      "rubric_version": "v1",
      "scan_source": "model",
      "generated_by_model": true,
      "advisory": true
    },
    "signals": [
      {
        "id": "ai_scan",
        "label": "AI security scan",
        "scope": "skill",
        "status": "pass",
        "detail": "Advisory scan completed with no concrete findings."
      },
      {
        "id": "registered",
        "label": "On-chain identity",
        "scope": "author",
        "status": "pass",
        "detail": "Author is registered on-chain."
      },
      {
        "id": "vouched",
        "label": "Vouched by others",
        "scope": "author",
        "status": "pass",
        "detail": "Other accounts have staked USDC vouching for this author."
      },
      {
        "id": "author_bonded",
        "label": "Author bond",
        "scope": "author",
        "status": "pass",
        "detail": "Author posted a USDC self-bond (skin in the game)."
      },
      {
        "id": "dispute_free",
        "label": "Dispute history",
        "scope": "author",
        "status": "pass",
        "detail": "No disputes against this author."
      }
    ],
    "versions": [
      {
        "id": "9f74a103-fe29-4777-99ae-5595a5f6239d",
        "files": [
          {
            "path": "index.md",
            "size": 158,
            "sha256": "d5417283d489773d6b92d7ce9691ea220d17f88feca1c807ef1a194919ed17dd",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "LICENSE.txt",
            "size": 1066,
            "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
            "executable": false,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 6804,
            "sha256": "298197ca10a4eac1bf8bd17b47fc81eaf4b0cedf875016e488fe184fabcaa6ea",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 1,
        "ipfs_cid": null,
        "changelog": "Synced from dirtybits/agent-skills",
        "tree_hash": "ec27b74da7735043b9a890fbb32aeebd0949e61dab1ebd22ac651199aefa77a1",
        "created_at": "2026-07-07T07:52:25.358826+00:00",
        "has_executable": false,
        "storage_backend": "blob"
      }
    ],
    "author_trust": {
      "isRegistered": true,
      "registeredAt": 1779082335,
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "totalStakeAtRisk": 24250000,
      "authorBondUsdcMicros": 7250000,
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_trust_summary": {
      "username": "wallet-z7wzgw",
      "github_url": "https://github.com/dirtybits",
      "display_name": null,
      "github_login": "dirtybits",
      "isRegistered": true,
      "registeredAt": 1779082335,
      "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "wallet_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "schema_version": "2026-04-03",
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "trust_updated_at": "2026-09-22T04:52:30.978Z",
      "canonical_agent_id": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "recommended_action": "allow",
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_identity": {
      "id": "1f84a1fd-7c81-4925-9ea7-7b0ba6609697",
      "canonicalAgentId": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "identitySource": "local",
      "homeChainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "status": "active",
      "displayName": null,
      "username": "wallet-z7wzgw",
      "usernameSource": "fallback",
      "githubProfile": {
        "id": "28834908",
        "login": "dirtybits",
        "name": "andy",
        "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4",
        "url": "https://github.com/dirtybits"
      },
      "bindings": [
        {
          "id": "c11bf186-49aa-46d1-82a0-732d84071113",
          "metadata": null,
          "isPrimary": true,
          "bindingRef": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
          "bindingType": "wallet_owner",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "7ac9de7b-3020-4261-be2c-d7cbefa1d257",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "094fbb11-545b-41d7-b7e7-38d66a8c5fde",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "A4dgMn4WYSmFdisAkpKzFwUcLsPr4fBJU5nbKQHWHgeA",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "147b59b5-fb6f-4901-ad99-8fa8f742f4af",
          "metadata": {
            "id": "28834908",
            "url": "https://github.com/dirtybits",
            "name": "andy",
            "login": "dirtybits",
            "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4"
          },
          "isPrimary": false,
          "bindingRef": "github:28834908",
          "bindingType": "github_profile",
          "chainContext": "github",
          "externalAgentId": "28834908",
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        }
      ],
      "ownerWallet": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "operationalWallet": null,
      "agentProfilePda": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
      "registryAsset": null
    },
    "buyerHasPurchased": false,
    "buyerPurchaseSummary": null,
    "content_verification": {
      "has_ipfs": false,
      "all_versions_pinned": false,
      "current_cid_consistent": true,
      "status": "unverified"
    },
    "priceDisclosure": null,
    "purchaseRiskWarning": null
  },
  {
    "id": "0f1c2da8-88b6-4a9d-a68e-c7c7749a2940",
    "skill_id": "software-development-workflows",
    "public_slug": "software-development-workflows",
    "public_author_slug": "wallet-asuavudg",
    "author_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "author_kind": "wallet",
    "author_external_id": null,
    "author_handle": null,
    "author_display_name": null,
    "publisher_identity_key": "wallet:asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "publisher_tier": "registered",
    "mirror_source_key": null,
    "synced_repo_url": "https://github.com/dirtybits/agent-skills",
    "name": "Software Development Workflows",
    "description": "Use when planning, debugging, testing, reviewing, simplifying, or spiking code changes across languages: systematic debugging, TDD, debugpy/Node inspectors, code cleanup, and implementation strategy.",
    "tags": [
      "mit"
    ],
    "current_version": 2,
    "summary": "Systematically debug, test, review, and simplify code across multiple languages.",
    "summary_model": "google/gemini-2.5-flash-lite",
    "summary_sha256": "723bff33c00df27c7630e6866251779e0585f5f22119e104c252759b920cbce2",
    "summary_capabilities": [
      "Systematic debugging",
      "Test-driven development",
      "Code simplification",
      "Spike experiments"
    ],
    "ipfs_cid": null,
    "on_chain_address": null,
    "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
    "evm_listing_id": null,
    "evm_contract_address": null,
    "evm_tx_hash": null,
    "total_installs": 0,
    "price_usdc_micros": null,
    "currency_mint": null,
    "on_chain_protocol_version": null,
    "on_chain_program_id": null,
    "contact": "https://github.com/dirtybits/agent-skills/tree/main/skills/software-development-workflows",
    "created_at": "2026-06-25T07:12:32.769Z",
    "updated_at": "2026-06-26T07:12:09.208Z",
    "source": "repo",
    "payment_flow": "free",
    "content": "---\ntype: Skill\ntitle: \"Software Development Workflows\"\nresource: \"https://github.com/dirtybits/agent-skills/tree/main/skills/software-development-workflows\"\ntags: [\"software-development\", \"debugging\", \"testing\", \"code-review\", \"workflow\"]\ntimestamp: \"2026-06-25T06:43:10Z\"\nokf_version: \"0.1\"\nname: software-development-workflows\ndescription: \"Use when planning, debugging, testing, reviewing, simplifying, or spiking code changes across languages: systematic debugging, TDD, debugpy/Node inspectors, code cleanup, and implementation strategy.\"\nversion: 1.0.0\nauthor: Hermes Agent + dirtybits\nlicense: MIT\nplatforms: [linux, macos, windows]\nmetadata:\n  hermes:\n    tags: [software-development, debugging, testing, tdd, code-review, refactoring, spike, node, python]\n    related_skills: []\n---\n# Software Development Workflows\n\n## Overview\n\nThis umbrella covers the class-level software engineering practices that guide code work: planning, root-cause debugging, test-driven development, interactive debuggers, pre-commit review, simplification, and throwaway spikes.\n\nIt does not replace project-specific instructions. Always inspect the repository, its tests, and its conventions before applying generic recipes.\n\n## When to Use\n\n- Debug failing tests, runtime bugs, build failures, or integration issues.\n- Write tests before fixes or features.\n- Use Python `pdb`/`debugpy` or Node `--inspect` for interactive diagnosis.\n- Run a pre-commit review or simplify a change set.\n- Validate an uncertain technical approach with a spike.\n- Author or adjust Hermes skill files.\n\nDo not touch protected slash-command skills such as `plan`; when planning only, use the protected planning entry point if available.\n\n## Core Workflow\n\n1. **Inspect before editing.** Read relevant files, errors, configs, and tests.\n2. **Reproduce.** Run the smallest failing command and capture real output.\n3. **Choose practice.** Debugging, TDD, debugger attachment, review, simplification, or spike.\n4. **Make minimal changes.** Avoid broad refactors while fixing root causes.\n5. **Verify.** Run targeted tests first, then broader checks appropriate to the repo.\n6. **Summarize with evidence.** Report commands run, outputs, files changed, and residual risk.\n\n## Labeled Subsections from Former Narrow Skills\n\n### Systematic debugging\n\n- No fixes before root cause. Read errors completely, reproduce, inspect recent changes, trace data flow, then form one hypothesis.\n- If three attempted fixes fail, stop and question architecture instead of stacking a fourth patch.\n\n### Test-driven development\n\n- RED: write or expose a failing test for the behavior.\n- GREEN: implement the smallest root-cause fix.\n- REFACTOR: clean only after tests prove behavior.\n\n### Python and Node debuggers\n\n- Python: prefer targeted `pdb`/`debugpy` breakpoints after reproducing the failure; avoid sprinkling permanent prints.\n- Node: use `--inspect`/Chrome DevTools protocol only when normal logs/tests are insufficient; verify the debug target and port.\n\n### Pre-commit review and simplification\n\n- Review staged/uncommitted diffs for correctness, security, tests, API compatibility, and accidental artifacts.\n- Simplification should reduce complexity without changing behavior; verify with existing tests before and after.\n\n### Spikes\n\n- Spikes are disposable experiments with a narrow question and a time/complexity bound.\n- Keep spike code separate from production until the result is understood and deliberately ported.\n\n### Skill authoring\n\n- Skills need valid YAML frontmatter, a class-level trigger description, actionable workflow, pitfalls, and verification.\n- Prefer broad umbrellas with support files over one-session micro-skills.\n- When a user asks for a \"full\" or publishable skill, do not stop at a single `SKILL.md`; include the package shape expected by the target repository when available: `references/` for extended guidance/patterns, `assets/` for schemas/config, and `scripts/` for lightweight validators or repeatable checks.\n- If the user points to an existing skill as a quality bar, inspect it for structure and useful patterns, then improve the local skill with stronger domain-specific content rather than copying generic placeholder sections.\n- For repo-backed skill libraries, update the registry/provenance metadata alongside the skill directory and run the repository's validation command before committing or reporting success.\n- For Git-backed skill/KB repos, prefer OKF-style conventions when the repo is meant to be consumed by agents: every non-reserved Markdown concept gets frontmatter (`type`, title/name, description, tags, timestamp), `index.md` provides progressive disclosure, `log.md` records semantic history, internal Markdown links form the knowledge graph, and CI validates registry/frontmatter consistency plus broken internal links.\n- Add or update a formatter/generator script when applying corpus-wide KB metadata/index changes, then run the formatter and validator before committing. Keep publishing metadata (for example `registry.json`) as the control plane, but make Markdown frontmatter self-describing enough for generic agents to consume without custom registry knowledge.\n- For Markdown skill/KB repositories, prefer an OKF-inspired corpus shape: every meaningful concept document has YAML frontmatter with `type`, `title`/`name`, `description`, `tags`, and an ISO timestamp; reserved `index.md` files provide directory listings; `log.md` files capture semantic update history; normal Markdown links form the knowledge graph; citations point to external docs.\n- When adding OKF-style conventions, make producers strict and consumers permissive: CI/validation can require complete metadata, registry/frontmatter consistency, reserved-file shape, and internal-link checks, while sync/publish consumers should tolerate unknown types/fields and warn rather than crash on optional gaps.\n- If a skill publisher reads frontmatter for marketplace metadata, handle folded YAML values like `description: >-` instead of naively publishing the literal `>-`.\n- For Markdown skill/KB repositories, prefer OKF-inspired conventions when compatible: every meaningful concept document gets YAML frontmatter with `type`, `title` or `name`, `description`, `tags`, `timestamp`, and optional `resource`/`okf_version`; reserved `index.md` files provide progressive disclosure and `log.md` files provide semantic update history.\n- Add or update repo automation when introducing KB conventions: a formatter/generator for frontmatter and indexes, validation for concept metadata/internal links/registry consistency, and publish-script parsing that handles folded YAML values such as `description: >-`.\n\n## Preserved Detail\n\nFormer standalone skill packages are preserved under `references/absorbed-packages/<skill-name>/` with their original relative layout. Treat that directory as the old skill root when consulting old support files.\n\n## Verification Notes and Pitfalls\n\n- For Vitest v4, Jest-style `--runInBand` is invalid, and older nested `--poolOptions...` flags may also be rejected. To serialize web tests, prefer `vitest run --maxWorkers=1 --no-fileParallelism` through the package script, for example `npm test --workspace <workspace> -- --maxWorkers=1 --no-fileParallelism`.\n- If restoring missing Node dependencies with `npm install` changes only lockfile metadata unrelated to the task (for example optional package platform/libc churn), inspect and revert the lockfile before committing unless the dependency graph change is intentional.\n\n## Verification Checklist\n\n- [ ] Relevant source/config/test files were read.\n- [ ] Failure or target behavior was reproduced where possible.\n- [ ] Chosen workflow matches the job class.\n- [ ] Changes are minimal and repo-conventional.\n- [ ] Targeted and broader verification commands ran or blockers are explicit.\n\n## Provenance and Attribution\n\nThis is a local Hermes Agent + dirtybits-created umbrella skill from Andy/dirtybits' Hermes environment. A 2026-06-25 provenance spike found no exact public web/GitHub/Hermes-repo match for `name: software-development-workflows`.\n\nIt consolidates older local software-development skills under `references/absorbed-packages/`. Preserve each absorbed package's original frontmatter, author, license, and attribution when redistributing. Notable adapted sources include `obra/superpowers`, `gsd-build/get-shit-done`, and Claude Code-inspired workflow patterns where cited in the absorbed files.\n",
    "files": [
      {
        "path": "index.md",
        "size": 242,
        "sha256": "78cd532ff58a1932a6697cb0b8e27ed0cdcae59eaf96e87fa38260e6c5efe03c",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "LICENSE.txt",
        "size": 1066,
        "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
        "executable": false,
        "contentType": "text/plain; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/hermes-agent-skill-authoring/SKILL.original.md",
        "size": 8005,
        "sha256": "c082b3de283ada380ea436ac4a836c25ab03b34c0a17ea5a59423b0b8b74f90e",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/node-inspect-debugger/SKILL.original.md",
        "size": 11318,
        "sha256": "cc8019c540285fede33c2b3fa1353faffa9123f70d05925614f2145358551c19",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/python-debugpy/SKILL.original.md",
        "size": 13554,
        "sha256": "6df308902af95e50082f9b7a5c8bafe6a5ed54686c1f58db4b6b84ca7aa73d97",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/simplify-code/SKILL.original.md",
        "size": 8886,
        "sha256": "9b135f0c08c06f35bf112a54eadd5efbad7a1480a7f979d8be46dada92ebcbf1",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/spike/SKILL.original.md",
        "size": 9103,
        "sha256": "4890e327f2b32c7837a11c07ea28b70270832332932ae1d845022792f79407ac",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/systematic-debugging/SKILL.original.md",
        "size": 10859,
        "sha256": "c2944ff395efbdc18cfc51f265e3fcc8f7421ae2e669d32088298e583a7652d0",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/test-driven-development/SKILL.original.md",
        "size": 9955,
        "sha256": "fe42426841fa813fe39d49c9b2913af5b682626bc514595f4654ad2dc829aaf9",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "SKILL.md",
        "size": 8483,
        "sha256": "723bff33c00df27c7630e6866251779e0585f5f22119e104c252759b920cbce2",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      }
    ],
    "tree_hash": "f992ea723d9b7b00b80db36ba89c9884bf7cd0b27bc06a5c52e3b20e474352b8",
    "storage_backend": "blob",
    "has_executable": false,
    "security_scan": {
      "verdict": "review",
      "risk": "low",
      "findings": [],
      "truncated": false,
      "scanned_at": "2026-06-26T07:12:10.369Z",
      "model": "google/gemini-2.5-flash-lite",
      "rubric_version": "v1",
      "scan_source": "model",
      "generated_by_model": true,
      "advisory": true
    },
    "signals": [
      {
        "id": "ai_scan",
        "label": "AI security scan",
        "scope": "skill",
        "status": "pass",
        "detail": "Advisory scan completed with no concrete findings."
      },
      {
        "id": "registered",
        "label": "On-chain identity",
        "scope": "author",
        "status": "pass",
        "detail": "Author is registered on-chain."
      },
      {
        "id": "vouched",
        "label": "Vouched by others",
        "scope": "author",
        "status": "pass",
        "detail": "Other accounts have staked USDC vouching for this author."
      },
      {
        "id": "author_bonded",
        "label": "Author bond",
        "scope": "author",
        "status": "pass",
        "detail": "Author posted a USDC self-bond (skin in the game)."
      },
      {
        "id": "dispute_free",
        "label": "Dispute history",
        "scope": "author",
        "status": "pass",
        "detail": "No disputes against this author."
      }
    ],
    "versions": [
      {
        "id": "955ae699-7ca6-4cb4-b7a9-810f7a8389e0",
        "files": [
          {
            "path": "index.md",
            "size": 242,
            "sha256": "78cd532ff58a1932a6697cb0b8e27ed0cdcae59eaf96e87fa38260e6c5efe03c",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "LICENSE.txt",
            "size": 1066,
            "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
            "executable": false,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/hermes-agent-skill-authoring/SKILL.original.md",
            "size": 8005,
            "sha256": "c082b3de283ada380ea436ac4a836c25ab03b34c0a17ea5a59423b0b8b74f90e",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/node-inspect-debugger/SKILL.original.md",
            "size": 11318,
            "sha256": "cc8019c540285fede33c2b3fa1353faffa9123f70d05925614f2145358551c19",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/python-debugpy/SKILL.original.md",
            "size": 13554,
            "sha256": "6df308902af95e50082f9b7a5c8bafe6a5ed54686c1f58db4b6b84ca7aa73d97",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/simplify-code/SKILL.original.md",
            "size": 8886,
            "sha256": "9b135f0c08c06f35bf112a54eadd5efbad7a1480a7f979d8be46dada92ebcbf1",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/spike/SKILL.original.md",
            "size": 9103,
            "sha256": "4890e327f2b32c7837a11c07ea28b70270832332932ae1d845022792f79407ac",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/systematic-debugging/SKILL.original.md",
            "size": 10859,
            "sha256": "c2944ff395efbdc18cfc51f265e3fcc8f7421ae2e669d32088298e583a7652d0",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/test-driven-development/SKILL.original.md",
            "size": 9955,
            "sha256": "fe42426841fa813fe39d49c9b2913af5b682626bc514595f4654ad2dc829aaf9",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 8483,
            "sha256": "723bff33c00df27c7630e6866251779e0585f5f22119e104c252759b920cbce2",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 2,
        "ipfs_cid": null,
        "changelog": "Synced from dirtybits/agent-skills",
        "tree_hash": "f992ea723d9b7b00b80db36ba89c9884bf7cd0b27bc06a5c52e3b20e474352b8",
        "created_at": "2026-06-26T07:12:09.208302+00:00",
        "has_executable": false,
        "storage_backend": "blob"
      },
      {
        "id": "6e5bc8f4-9c3e-4af1-b584-cc050f3f068f",
        "files": [
          {
            "path": "index.md",
            "size": 242,
            "sha256": "78cd532ff58a1932a6697cb0b8e27ed0cdcae59eaf96e87fa38260e6c5efe03c",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "LICENSE.txt",
            "size": 1066,
            "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
            "executable": false,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/hermes-agent-skill-authoring/SKILL.original.md",
            "size": 8005,
            "sha256": "c082b3de283ada380ea436ac4a836c25ab03b34c0a17ea5a59423b0b8b74f90e",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/node-inspect-debugger/SKILL.original.md",
            "size": 11318,
            "sha256": "cc8019c540285fede33c2b3fa1353faffa9123f70d05925614f2145358551c19",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/python-debugpy/SKILL.original.md",
            "size": 13554,
            "sha256": "6df308902af95e50082f9b7a5c8bafe6a5ed54686c1f58db4b6b84ca7aa73d97",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/simplify-code/SKILL.original.md",
            "size": 8886,
            "sha256": "9b135f0c08c06f35bf112a54eadd5efbad7a1480a7f979d8be46dada92ebcbf1",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/spike/SKILL.original.md",
            "size": 9103,
            "sha256": "4890e327f2b32c7837a11c07ea28b70270832332932ae1d845022792f79407ac",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/systematic-debugging/SKILL.original.md",
            "size": 10859,
            "sha256": "c2944ff395efbdc18cfc51f265e3fcc8f7421ae2e669d32088298e583a7652d0",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/test-driven-development/SKILL.original.md",
            "size": 9955,
            "sha256": "fe42426841fa813fe39d49c9b2913af5b682626bc514595f4654ad2dc829aaf9",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 7847,
            "sha256": "bbd50b02cf46a7447c9c5b80ded4cda351c40512041efae9cf8493c6ad5ee46f",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 1,
        "ipfs_cid": null,
        "changelog": "Synced from dirtybits/agent-skills",
        "tree_hash": "c60e62bca990cb9392db93e978a2ddf47af9195bc1c6fec7e7e31ecca79ed91d",
        "created_at": "2026-06-25T07:12:32.769353+00:00",
        "has_executable": false,
        "storage_backend": "blob"
      }
    ],
    "author_trust": {
      "isRegistered": true,
      "registeredAt": 1779082335,
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "totalStakeAtRisk": 24250000,
      "authorBondUsdcMicros": 7250000,
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_trust_summary": {
      "username": "wallet-z7wzgw",
      "github_url": "https://github.com/dirtybits",
      "display_name": null,
      "github_login": "dirtybits",
      "isRegistered": true,
      "registeredAt": 1779082335,
      "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "wallet_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "schema_version": "2026-04-03",
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "trust_updated_at": "2026-09-22T04:52:30.978Z",
      "canonical_agent_id": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "recommended_action": "allow",
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_identity": {
      "id": "1f84a1fd-7c81-4925-9ea7-7b0ba6609697",
      "canonicalAgentId": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "identitySource": "local",
      "homeChainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "status": "active",
      "displayName": null,
      "username": "wallet-z7wzgw",
      "usernameSource": "fallback",
      "githubProfile": {
        "id": "28834908",
        "login": "dirtybits",
        "name": "andy",
        "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4",
        "url": "https://github.com/dirtybits"
      },
      "bindings": [
        {
          "id": "c11bf186-49aa-46d1-82a0-732d84071113",
          "metadata": null,
          "isPrimary": true,
          "bindingRef": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
          "bindingType": "wallet_owner",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "7ac9de7b-3020-4261-be2c-d7cbefa1d257",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "094fbb11-545b-41d7-b7e7-38d66a8c5fde",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "A4dgMn4WYSmFdisAkpKzFwUcLsPr4fBJU5nbKQHWHgeA",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "147b59b5-fb6f-4901-ad99-8fa8f742f4af",
          "metadata": {
            "id": "28834908",
            "url": "https://github.com/dirtybits",
            "name": "andy",
            "login": "dirtybits",
            "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4"
          },
          "isPrimary": false,
          "bindingRef": "github:28834908",
          "bindingType": "github_profile",
          "chainContext": "github",
          "externalAgentId": "28834908",
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        }
      ],
      "ownerWallet": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "operationalWallet": null,
      "agentProfilePda": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
      "registryAsset": null
    },
    "buyerHasPurchased": false,
    "buyerPurchaseSummary": null,
    "content_verification": {
      "has_ipfs": false,
      "all_versions_pinned": false,
      "current_cid_consistent": true,
      "status": "unverified"
    },
    "priceDisclosure": null,
    "purchaseRiskWarning": null
  },
  {
    "id": "f162e1cf-a67e-4501-bc2c-54fa9eec5ae9",
    "skill_id": "research-intelligence-workflows",
    "public_slug": "research-intelligence-workflows",
    "public_author_slug": "wallet-asuavudg",
    "author_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "author_kind": "wallet",
    "author_external_id": null,
    "author_handle": null,
    "author_display_name": null,
    "publisher_identity_key": "wallet:asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "publisher_tier": "registered",
    "mirror_source_key": null,
    "synced_repo_url": "https://github.com/dirtybits/agent-skills",
    "name": "Research Intelligence Workflows",
    "description": "Use when researching papers, feeds, markets, knowledge bases, or long-form research outputs: arXiv, blog/RSS monitoring, LLM wiki knowledge bases, Polymarket, and paper-writing workflows.",
    "tags": [
      "mit"
    ],
    "current_version": 2,
    "summary": "Research intelligence workflows for papers, feeds, markets, and knowledge bases.",
    "summary_model": "google/gemini-2.5-flash-lite",
    "summary_sha256": "ebdef42f255bfd4c396c9e7c59f7ab6b385e0a913494a60dd80031859f36005e",
    "summary_capabilities": [
      "Search arXiv",
      "Monitor feeds",
      "Query markets",
      "Write papers"
    ],
    "ipfs_cid": null,
    "on_chain_address": null,
    "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
    "evm_listing_id": null,
    "evm_contract_address": null,
    "evm_tx_hash": null,
    "total_installs": 0,
    "price_usdc_micros": null,
    "currency_mint": null,
    "on_chain_protocol_version": null,
    "on_chain_program_id": null,
    "contact": "https://github.com/dirtybits/agent-skills/tree/main/skills/research-intelligence-workflows",
    "created_at": "2026-06-25T07:12:28.053Z",
    "updated_at": "2026-06-26T07:12:06.031Z",
    "source": "repo",
    "payment_flow": "free",
    "content": "---\ntype: Skill\ntitle: \"Research Intelligence Workflows\"\nresource: \"https://github.com/dirtybits/agent-skills/tree/main/skills/research-intelligence-workflows\"\ntags: [\"research\", \"papers\", \"markets\", \"feeds\", \"workflow\"]\ntimestamp: \"2026-06-25T06:43:10Z\"\nokf_version: \"0.1\"\nname: research-intelligence-workflows\ndescription: \"Use when researching papers, feeds, markets, knowledge bases, or long-form research outputs: arXiv, blog/RSS monitoring, LLM wiki knowledge bases, Polymarket, and paper-writing workflows.\"\nversion: 1.0.0\nauthor: Hermes Agent + dirtybits\nlicense: MIT\nplatforms: [linux, macos, windows]\nmetadata:\n  hermes:\n    tags: [research, arxiv, rss, papers, knowledge-base, markets, polymarket, literature]\n    related_skills: []\n---\n# Research Intelligence Workflows\n\n## Overview\n\nThis umbrella covers research discovery, monitoring, synthesis, and research-output drafting. Use it when the task is to find current sources, monitor feeds, query markets, build/query a knowledge base, or write academic/research documents.\n\nThe shared discipline is source-grounded work: collect real sources, preserve identifiers/URLs, separate evidence from interpretation, and cite or archive enough context to reproduce the result.\n\n## When to Use\n\n- Search arXiv by keyword, author, category, or ID.\n- Monitor RSS/Atom/blog feeds and summarize changes.\n- Build/query an LLM or markdown knowledge base.\n- Query Polymarket markets, orderbooks, prices, or history.\n- Plan/write ML research papers, related work, experiments, and submission checklists.\n\n## Workflow\n\n1. **Define the research question.** Scope domain, timeframe, required freshness, and output format.\n2. **Collect primary sources first.** Prefer official APIs/pages, arXiv IDs, feed URLs, market IDs, or source documents.\n3. **Normalize identifiers.** Record arXiv IDs, DOI/URL, feed URL, market slug/condition ID, or note path.\n4. **Extract enough detail.** Titles, authors, dates, abstracts/snippets, metrics/prices, and quoted evidence where needed.\n5. **Synthesize with uncertainty.** Distinguish fact, inference, and recommendation.\n6. **Archive/reproduce.** Save queries, scripts, source lists, or output paths when the work is likely to be revisited.\n\n## Labeled Subsections from Former Narrow Skills\n\n### arXiv and paper discovery\n\n- Use precise query fields when possible and preserve arXiv IDs/versions.\n- For literature reviews, cluster papers by method/task/evaluation instead of listing chronologically.\n\n### Blog/RSS monitoring\n\n- Keep feed URLs explicit, deduplicate by stable entry IDs/links, and compare against the previous checkpoint when monitoring.\n- Summaries should emphasize what changed and why it matters.\n\n### LLM wiki / knowledge-base work\n\n- Treat the KB as a graph of markdown notes: stable filenames, backlinks, summaries, and explicit source notes.\n- Query results should cite note paths and avoid overconfident synthesis when the KB is sparse.\n- For portable agent-consumable KBs, prefer OKF-inspired Markdown: concept documents with YAML frontmatter (`type`, `title` or `name`, `description`, `tags`, `timestamp`, optional `resource`/`okf_version`), normal Markdown links as graph edges, `index.md` for progressive disclosure, and `log.md` for semantic update history.\n- Keep consumption permissive but production strict: readers should tolerate unknown types/fields and some broken links, while repo CI should validate metadata shape, internal links, reserved-file rules, and registry/frontmatter consistency before publishing.\n\n### Polymarket and market intelligence\n\n- Resolve market IDs/slugs before querying prices or orderbooks.\n- Report timestamp, bid/ask/last, liquidity, and source endpoint; do not treat market odds as ground truth.\n\n### Research paper writing\n\n- Start from contribution and evidence, not template filling.\n- Maintain experiment tables, ablation plans, related-work clusters, limitations, and venue-specific checklist items.\n- Do not fabricate results, citations, or reviewer claims.\n\n## Preserved Detail\n\nFormer standalone skill packages are preserved under `references/absorbed-packages/<skill-name>/` with their original relative layout. Treat that directory as the old skill root when consulting old support files.\n\n## Verification Checklist\n\n- [ ] Research scope and freshness requirements are explicit.\n- [ ] Primary sources/API results were collected with stable identifiers.\n- [ ] Claims are tied to source URLs/IDs/paths.\n- [ ] Output separates evidence, synthesis, and recommendation.\n- [ ] Any saved archive/path/query is reported.\n\n## Provenance and Attribution\n\nThis is a local Hermes Agent + dirtybits-created umbrella skill from Andy/dirtybits' Hermes environment. A 2026-06-25 provenance spike found no exact public web/GitHub/Hermes-repo match for `name: research-intelligence-workflows`.\n\nIt consolidates older local research skills under `references/absorbed-packages/`. Preserve each absorbed package's original frontmatter, author, license, and attribution when redistributing. Notable third-party/adapted sources include `blogwatcher` by JulienTant/Hyaxia and `research-paper-writing` by Orchestra Research.\n",
    "files": [
      {
        "path": "index.md",
        "size": 244,
        "sha256": "0805e999d6f4dd74670ff4f0714cec512b72d491913f9d619b865a587c4bbb6c",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "LICENSE.txt",
        "size": 1066,
        "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
        "executable": false,
        "contentType": "text/plain; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/arxiv/scripts/search_arxiv.py",
        "size": 4272,
        "sha256": "68f0bcc09ef1f59ecd9be8a7693e47239fd99b19d62cecb80a92b8c476cca371",
        "executable": true,
        "contentType": "text/plain; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/arxiv/SKILL.original.md",
        "size": 10439,
        "sha256": "77d4f6ae1427dce42e55ec4cd8e5f5000d4169a73fd64c1dd5688c5030ce791d",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/blogwatcher/SKILL.original.md",
        "size": 5471,
        "sha256": "3f8151f2812b38a6548c875ab36a6b5fc2a7605463263e25db0296924ccbbaf6",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/llm-wiki/SKILL.original.md",
        "size": 20486,
        "sha256": "990e1a86d08a87cc386b999adf4ade109f4f695d2d7b788ded1654bc84ce0460",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/polymarket/references/api-endpoints.md",
        "size": 5000,
        "sha256": "58152a0d3d682c397821729039019b6a2a847022fe3edc209a3e77ec9f020534",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/polymarket/scripts/polymarket.py",
        "size": 10214,
        "sha256": "7873e054539a8c782a671dd84686e1ee763e29fe20245c1d10798b767d76980f",
        "executable": true,
        "contentType": "text/plain; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/polymarket/SKILL.original.md",
        "size": 3270,
        "sha256": "c7d62c413c88b286ad3c20f2c17aa47979af73a9a72256d3e81aeee7476de52b",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/references/autoreason-methodology.md",
        "size": 19634,
        "sha256": "0273a195e6ccb61e57e31dd465fa40ade8965b3f649c327b61e38bd5a628cffd",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/references/checklists.md",
        "size": 14086,
        "sha256": "55c1fd089fbf1a51f09350b28355395f0bcff5d391da87aa3e80a2f55cbd8d29",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/references/citation-workflow.md",
        "size": 15911,
        "sha256": "7f383632b20ec3047a92d2c34f7f4f0d701890be5f5870ae88bbc9a662c1cfb8",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/references/experiment-patterns.md",
        "size": 26224,
        "sha256": "f26282d3b2f83d96856fe0fbc34865c7333ea9e7cca280aeb541254c96b30cdb",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/references/human-evaluation.md",
        "size": 18697,
        "sha256": "24223a947c9a6f88863b6ca76a075986c956cc43061a1b06a5d77d90727a92c8",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/references/paper-types.md",
        "size": 16680,
        "sha256": "b676cbe2aefcfa3c6aba0bff81d13d3c405670581cccbe79a3683d3c3df693fd",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/references/reviewer-guidelines.md",
        "size": 14220,
        "sha256": "2da471450680943167d52fd31ad700304284da082469b1909945b85f5bd7defa",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/references/sources.md",
        "size": 9918,
        "sha256": "508c03ec616b6d6372dfa7a40a5b04d936e80b06beb97affdd64d4a4bac9b858",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/references/writing-guide.md",
        "size": 16762,
        "sha256": "50afe94a875fad2d84c96a2d2ad958771fc518f3ddfc7acacd1ee5e42e3ae70b",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/SKILL.original.md",
        "size": 103689,
        "sha256": "52ff01142bf61ed608d9a710433918b193ceafe16ccea2ba6db97e20a9678928",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/aaai2026/aaai2026-unified-supp.tex",
        "size": 4548,
        "sha256": "35adcff419efc25a032140c520d40520d0d0fc69123e9d8e38ad161c40ad07b7",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/aaai2026/aaai2026-unified-template.tex",
        "size": 63140,
        "sha256": "bed12c50b5e027fd88097d238ec4e7ebf1ae7b450cb06d6df7c8ae126a620aea",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/aaai2026/aaai2026.bib",
        "size": 4766,
        "sha256": "d8fcf3dc09b9d489aeff13631174c5998a48cb0d0800ac8a00a2f7bdbc40295b",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/aaai2026/aaai2026.bst",
        "size": 30207,
        "sha256": "ac26e2c66047435c0ed25f21ae36ad42d731cf3d794c4a8b5f05a62141a27294",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/aaai2026/aaai2026.sty",
        "size": 11802,
        "sha256": "a39f1866a04dd1e2603613c876fa446aaea2c2f3e34d02be868fd21520bfade5",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/aaai2026/README.md",
        "size": 18451,
        "sha256": "8f9429bce6a391c74363cae591874e36d4102b3fa97e3bdf4054d9bd023aa888",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/acl/acl_latex.tex",
        "size": 14533,
        "sha256": "339c9ee9705c1767d44ef24b85365c0bb8619ecc3fcf66172bf1356292389614",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/acl/acl_lualatex.tex",
        "size": 3050,
        "sha256": "c0bf91f00ecbf962d36dae7a302e577d61fbac00feee93946e869db09d2f8188",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/acl/acl_natbib.bst",
        "size": 45186,
        "sha256": "e332fd51dcea48e2a8a89754892c3cb99674a1cd70b527b661e9aaffc235e83c",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/acl/acl.sty",
        "size": 11615,
        "sha256": "19dfeddc2c0e448f3926a0bef048a9db3f3611b46265b760caabd7ada4f361de",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/acl/anthology.bib.txt",
        "size": 1169,
        "sha256": "2b78d2d9aeda62e14c4e46099e8225b5fc116387d8e0a54aad776485e249ceff",
        "executable": false,
        "contentType": "text/plain; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/acl/custom.bib",
        "size": 2071,
        "sha256": "d76ccb30ddceb70c9e1ad0be3f43dfe301ad5765aab2c960fc830ef67bf8232a",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/acl/formatting.md",
        "size": 18390,
        "sha256": "a1bc25dcfcd5082e2997bdc23adb7c72ac5848856423d684af7b3e6f3cb37a81",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/acl/README.md",
        "size": 2585,
        "sha256": "98f53ebdfe71e916e77a7b85fa372f3bf0d80366138da630e783790ca8344d5c",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/colm2025/colm2025_conference.bib",
        "size": 496,
        "sha256": "c5fabf46cc7d7a6e527b82860b9a9d658eb07f63abaafa9b7beb631d8abb91bd",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/colm2025/colm2025_conference.bst",
        "size": 26973,
        "sha256": "2d67552db7ed38ccfccb5957b52f95656e25c249724761d3cf5f7922ad1844c5",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/colm2025/colm2025_conference.pdf",
        "size": 122635,
        "sha256": "d8b3d74bc81aec9ba9d6b739b4922adc93ae002d7c82522b9c6064014bec1d16",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/colm2025/colm2025_conference.sty",
        "size": 7727,
        "sha256": "79df8b2a1b142dfb324a0a7e87fabcd9d5dc2a34700e1c6c083a9bbb9e5daa8e",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/colm2025/colm2025_conference.tex",
        "size": 12830,
        "sha256": "baf01cd056ccd1b35165d190019414946217de1683f8ae3ddc66b11e3c653dbc",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/colm2025/fancyhdr.sty",
        "size": 20521,
        "sha256": "b56ec4434b9f4607529a4b23dc68ad8d4b94f1f631c8cddaf7da78140d53a5ea",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/colm2025/math_commands.tex",
        "size": 12284,
        "sha256": "90473c4d0542070db244cea73ef962d6cddc5b2a746757e6a40ddf5fdfb90ba9",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/colm2025/natbib.sty",
        "size": 45154,
        "sha256": "88bc70c0e48461934cab5b2accef06b74a8b3ac45ad03ccd3f2a6b7e0d6d530d",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/colm2025/README.md",
        "size": 515,
        "sha256": "caa78a9e6b51eaf2e640f6079ed834d2163b477362bbdb10e81071a5d4f56e91",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/iclr2026/fancyhdr.sty",
        "size": 20521,
        "sha256": "b56ec4434b9f4607529a4b23dc68ad8d4b94f1f631c8cddaf7da78140d53a5ea",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/iclr2026/iclr2026_conference.bib",
        "size": 629,
        "sha256": "cdd86e7d4c31854dcf2145871657c944588a6d44c3b72e160ff4baa8df1a52fb",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/iclr2026/iclr2026_conference.bst",
        "size": 26973,
        "sha256": "2d67552db7ed38ccfccb5957b52f95656e25c249724761d3cf5f7922ad1844c5",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/iclr2026/iclr2026_conference.pdf",
        "size": 200508,
        "sha256": "cb3d414cfa4702d52de94de1c8123c34b2cf46b7a5510df49dcc1014a6c266cf",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/iclr2026/iclr2026_conference.sty",
        "size": 9025,
        "sha256": "a4852f68e080d6c5245057ca2039100b409e31727898aa93c03d78ddb84374a3",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/iclr2026/iclr2026_conference.tex",
        "size": 16899,
        "sha256": "941b58de6e52f5538de0ebfe2d20425a79e1768cb271d453b7436904b5159859",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/iclr2026/math_commands.tex",
        "size": 12284,
        "sha256": "90473c4d0542070db244cea73ef962d6cddc5b2a746757e6a40ddf5fdfb90ba9",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/iclr2026/natbib.sty",
        "size": 45154,
        "sha256": "88bc70c0e48461934cab5b2accef06b74a8b3ac45ad03ccd3f2a6b7e0d6d530d",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/icml2026/algorithm.sty",
        "size": 2223,
        "sha256": "93fd0eb31c112eb405833db8f1d7f5d238c7e691b1c05680d7276e68f36d564a",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/icml2026/algorithmic.sty",
        "size": 7414,
        "sha256": "48d18794a5d97c0479a588cc2eac0917992feb9da83acc4631b8f55757d80f9b",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/icml2026/example_paper.bib",
        "size": 2051,
        "sha256": "df950103d38f9cfc81b1f40d84c9be2a3525d046d2991a6973a4446922c06bd1",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/icml2026/example_paper.pdf",
        "size": 193509,
        "sha256": "3e8fe0e952de8702ca4697dba09ca52e83bd649767b92a8340d34a591caa4d1b",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/icml2026/example_paper.tex",
        "size": 29714,
        "sha256": "c2ca8140bf255d1ff77d1278eb3eefed4018b4b1e71065b8e1ccbc68b74c8acf",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/icml2026/fancyhdr.sty",
        "size": 31715,
        "sha256": "9130c52f91087abc6d223164ffa587e207e3257fcbcd069ef09ecb5391043f14",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/icml2026/icml_numpapers.pdf",
        "size": 2823,
        "sha256": "d34e8da982296363627996e6e18850c11fbd616e6946061237051e7a8f7080bb",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/icml2026/icml2026.bst",
        "size": 27147,
        "sha256": "0ec3d5eb9b02efb7e0b44a32f3775882f42a743d0bdc618f34e6936309b98764",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/icml2026/icml2026.sty",
        "size": 27344,
        "sha256": "7cdcf90f6a59c5219e7f15c88f7ed09fcaf598dad91e6cdddc4dc3cb0e397a95",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/neurips2025/extra_pkgs.tex",
        "size": 2837,
        "sha256": "fcd6b09156fa193c347f6acd8188d430fa28f769fb6e2c2514cbbd215c39014a",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/neurips2025/main.tex",
        "size": 574,
        "sha256": "366c093fbc3018c46de28f3fe0ecb063b4aba10a089afe037837bbf673a9c4d6",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/neurips2025/Makefile",
        "size": 1054,
        "sha256": "0983425d74e769f2457f6ff0654cf76fc0c95f8d158fc8eaec66c5697ba0594f",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/neurips2025/neurips.sty",
        "size": 11625,
        "sha256": "ef7a55f0a7c9da12fea39af7990a6a314a721b74a23b1544f252e55fcba940cd",
        "executable": false,
        "contentType": "application/octet-stream"
      },
      {
        "path": "references/absorbed-packages/research-paper-writing/templates/README.md",
        "size": 7162,
        "sha256": "ee4c0238c2b17a0c2963d2983c52e30e7eed29ed15d3f657571737a8fe362cea",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "SKILL.md",
        "size": 5156,
        "sha256": "ebdef42f255bfd4c396c9e7c59f7ab6b385e0a913494a60dd80031859f36005e",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      }
    ],
    "tree_hash": "3ba5d6c6a3d684e10e9447078107754e5a750db2f98d6667194a393f584b7cb3",
    "storage_backend": "blob",
    "has_executable": true,
    "security_scan": {
      "verdict": "review",
      "risk": "low",
      "findings": [],
      "truncated": false,
      "scanned_at": "2026-06-26T07:12:08.372Z",
      "model": "google/gemini-2.5-flash-lite",
      "rubric_version": "v1",
      "scan_source": "model",
      "generated_by_model": true,
      "advisory": true
    },
    "signals": [
      {
        "id": "ai_scan",
        "label": "AI security scan",
        "scope": "skill",
        "status": "pass",
        "detail": "Advisory scan completed with no concrete findings."
      },
      {
        "id": "registered",
        "label": "On-chain identity",
        "scope": "author",
        "status": "pass",
        "detail": "Author is registered on-chain."
      },
      {
        "id": "vouched",
        "label": "Vouched by others",
        "scope": "author",
        "status": "pass",
        "detail": "Other accounts have staked USDC vouching for this author."
      },
      {
        "id": "author_bonded",
        "label": "Author bond",
        "scope": "author",
        "status": "pass",
        "detail": "Author posted a USDC self-bond (skin in the game)."
      },
      {
        "id": "dispute_free",
        "label": "Dispute history",
        "scope": "author",
        "status": "pass",
        "detail": "No disputes against this author."
      }
    ],
    "versions": [
      {
        "id": "93d1eef7-b805-4a27-bd12-27e3188cf6c2",
        "files": [
          {
            "path": "index.md",
            "size": 244,
            "sha256": "0805e999d6f4dd74670ff4f0714cec512b72d491913f9d619b865a587c4bbb6c",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "LICENSE.txt",
            "size": 1066,
            "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
            "executable": false,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/arxiv/scripts/search_arxiv.py",
            "size": 4272,
            "sha256": "68f0bcc09ef1f59ecd9be8a7693e47239fd99b19d62cecb80a92b8c476cca371",
            "executable": true,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/arxiv/SKILL.original.md",
            "size": 10439,
            "sha256": "77d4f6ae1427dce42e55ec4cd8e5f5000d4169a73fd64c1dd5688c5030ce791d",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/blogwatcher/SKILL.original.md",
            "size": 5471,
            "sha256": "3f8151f2812b38a6548c875ab36a6b5fc2a7605463263e25db0296924ccbbaf6",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/llm-wiki/SKILL.original.md",
            "size": 20486,
            "sha256": "990e1a86d08a87cc386b999adf4ade109f4f695d2d7b788ded1654bc84ce0460",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/polymarket/references/api-endpoints.md",
            "size": 5000,
            "sha256": "58152a0d3d682c397821729039019b6a2a847022fe3edc209a3e77ec9f020534",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/polymarket/scripts/polymarket.py",
            "size": 10214,
            "sha256": "7873e054539a8c782a671dd84686e1ee763e29fe20245c1d10798b767d76980f",
            "executable": true,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/polymarket/SKILL.original.md",
            "size": 3270,
            "sha256": "c7d62c413c88b286ad3c20f2c17aa47979af73a9a72256d3e81aeee7476de52b",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/references/autoreason-methodology.md",
            "size": 19634,
            "sha256": "0273a195e6ccb61e57e31dd465fa40ade8965b3f649c327b61e38bd5a628cffd",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/references/checklists.md",
            "size": 14086,
            "sha256": "55c1fd089fbf1a51f09350b28355395f0bcff5d391da87aa3e80a2f55cbd8d29",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/references/citation-workflow.md",
            "size": 15911,
            "sha256": "7f383632b20ec3047a92d2c34f7f4f0d701890be5f5870ae88bbc9a662c1cfb8",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/references/experiment-patterns.md",
            "size": 26224,
            "sha256": "f26282d3b2f83d96856fe0fbc34865c7333ea9e7cca280aeb541254c96b30cdb",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/references/human-evaluation.md",
            "size": 18697,
            "sha256": "24223a947c9a6f88863b6ca76a075986c956cc43061a1b06a5d77d90727a92c8",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/references/paper-types.md",
            "size": 16680,
            "sha256": "b676cbe2aefcfa3c6aba0bff81d13d3c405670581cccbe79a3683d3c3df693fd",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/references/reviewer-guidelines.md",
            "size": 14220,
            "sha256": "2da471450680943167d52fd31ad700304284da082469b1909945b85f5bd7defa",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/references/sources.md",
            "size": 9918,
            "sha256": "508c03ec616b6d6372dfa7a40a5b04d936e80b06beb97affdd64d4a4bac9b858",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/references/writing-guide.md",
            "size": 16762,
            "sha256": "50afe94a875fad2d84c96a2d2ad958771fc518f3ddfc7acacd1ee5e42e3ae70b",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/SKILL.original.md",
            "size": 103689,
            "sha256": "52ff01142bf61ed608d9a710433918b193ceafe16ccea2ba6db97e20a9678928",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/aaai2026/aaai2026-unified-supp.tex",
            "size": 4548,
            "sha256": "35adcff419efc25a032140c520d40520d0d0fc69123e9d8e38ad161c40ad07b7",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/aaai2026/aaai2026-unified-template.tex",
            "size": 63140,
            "sha256": "bed12c50b5e027fd88097d238ec4e7ebf1ae7b450cb06d6df7c8ae126a620aea",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/aaai2026/aaai2026.bib",
            "size": 4766,
            "sha256": "d8fcf3dc09b9d489aeff13631174c5998a48cb0d0800ac8a00a2f7bdbc40295b",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/aaai2026/aaai2026.bst",
            "size": 30207,
            "sha256": "ac26e2c66047435c0ed25f21ae36ad42d731cf3d794c4a8b5f05a62141a27294",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/aaai2026/aaai2026.sty",
            "size": 11802,
            "sha256": "a39f1866a04dd1e2603613c876fa446aaea2c2f3e34d02be868fd21520bfade5",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/aaai2026/README.md",
            "size": 18451,
            "sha256": "8f9429bce6a391c74363cae591874e36d4102b3fa97e3bdf4054d9bd023aa888",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/acl/acl_latex.tex",
            "size": 14533,
            "sha256": "339c9ee9705c1767d44ef24b85365c0bb8619ecc3fcf66172bf1356292389614",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/acl/acl_lualatex.tex",
            "size": 3050,
            "sha256": "c0bf91f00ecbf962d36dae7a302e577d61fbac00feee93946e869db09d2f8188",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/acl/acl_natbib.bst",
            "size": 45186,
            "sha256": "e332fd51dcea48e2a8a89754892c3cb99674a1cd70b527b661e9aaffc235e83c",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/acl/acl.sty",
            "size": 11615,
            "sha256": "19dfeddc2c0e448f3926a0bef048a9db3f3611b46265b760caabd7ada4f361de",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/acl/anthology.bib.txt",
            "size": 1169,
            "sha256": "2b78d2d9aeda62e14c4e46099e8225b5fc116387d8e0a54aad776485e249ceff",
            "executable": false,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/acl/custom.bib",
            "size": 2071,
            "sha256": "d76ccb30ddceb70c9e1ad0be3f43dfe301ad5765aab2c960fc830ef67bf8232a",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/acl/formatting.md",
            "size": 18390,
            "sha256": "a1bc25dcfcd5082e2997bdc23adb7c72ac5848856423d684af7b3e6f3cb37a81",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/acl/README.md",
            "size": 2585,
            "sha256": "98f53ebdfe71e916e77a7b85fa372f3bf0d80366138da630e783790ca8344d5c",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/colm2025/colm2025_conference.bib",
            "size": 496,
            "sha256": "c5fabf46cc7d7a6e527b82860b9a9d658eb07f63abaafa9b7beb631d8abb91bd",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/colm2025/colm2025_conference.bst",
            "size": 26973,
            "sha256": "2d67552db7ed38ccfccb5957b52f95656e25c249724761d3cf5f7922ad1844c5",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/colm2025/colm2025_conference.pdf",
            "size": 122635,
            "sha256": "d8b3d74bc81aec9ba9d6b739b4922adc93ae002d7c82522b9c6064014bec1d16",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/colm2025/colm2025_conference.sty",
            "size": 7727,
            "sha256": "79df8b2a1b142dfb324a0a7e87fabcd9d5dc2a34700e1c6c083a9bbb9e5daa8e",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/colm2025/colm2025_conference.tex",
            "size": 12830,
            "sha256": "baf01cd056ccd1b35165d190019414946217de1683f8ae3ddc66b11e3c653dbc",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/colm2025/fancyhdr.sty",
            "size": 20521,
            "sha256": "b56ec4434b9f4607529a4b23dc68ad8d4b94f1f631c8cddaf7da78140d53a5ea",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/colm2025/math_commands.tex",
            "size": 12284,
            "sha256": "90473c4d0542070db244cea73ef962d6cddc5b2a746757e6a40ddf5fdfb90ba9",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/colm2025/natbib.sty",
            "size": 45154,
            "sha256": "88bc70c0e48461934cab5b2accef06b74a8b3ac45ad03ccd3f2a6b7e0d6d530d",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/colm2025/README.md",
            "size": 515,
            "sha256": "caa78a9e6b51eaf2e640f6079ed834d2163b477362bbdb10e81071a5d4f56e91",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/iclr2026/fancyhdr.sty",
            "size": 20521,
            "sha256": "b56ec4434b9f4607529a4b23dc68ad8d4b94f1f631c8cddaf7da78140d53a5ea",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/iclr2026/iclr2026_conference.bib",
            "size": 629,
            "sha256": "cdd86e7d4c31854dcf2145871657c944588a6d44c3b72e160ff4baa8df1a52fb",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/iclr2026/iclr2026_conference.bst",
            "size": 26973,
            "sha256": "2d67552db7ed38ccfccb5957b52f95656e25c249724761d3cf5f7922ad1844c5",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/iclr2026/iclr2026_conference.pdf",
            "size": 200508,
            "sha256": "cb3d414cfa4702d52de94de1c8123c34b2cf46b7a5510df49dcc1014a6c266cf",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/iclr2026/iclr2026_conference.sty",
            "size": 9025,
            "sha256": "a4852f68e080d6c5245057ca2039100b409e31727898aa93c03d78ddb84374a3",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/iclr2026/iclr2026_conference.tex",
            "size": 16899,
            "sha256": "941b58de6e52f5538de0ebfe2d20425a79e1768cb271d453b7436904b5159859",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/iclr2026/math_commands.tex",
            "size": 12284,
            "sha256": "90473c4d0542070db244cea73ef962d6cddc5b2a746757e6a40ddf5fdfb90ba9",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/iclr2026/natbib.sty",
            "size": 45154,
            "sha256": "88bc70c0e48461934cab5b2accef06b74a8b3ac45ad03ccd3f2a6b7e0d6d530d",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/icml2026/algorithm.sty",
            "size": 2223,
            "sha256": "93fd0eb31c112eb405833db8f1d7f5d238c7e691b1c05680d7276e68f36d564a",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/icml2026/algorithmic.sty",
            "size": 7414,
            "sha256": "48d18794a5d97c0479a588cc2eac0917992feb9da83acc4631b8f55757d80f9b",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/icml2026/example_paper.bib",
            "size": 2051,
            "sha256": "df950103d38f9cfc81b1f40d84c9be2a3525d046d2991a6973a4446922c06bd1",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/icml2026/example_paper.pdf",
            "size": 193509,
            "sha256": "3e8fe0e952de8702ca4697dba09ca52e83bd649767b92a8340d34a591caa4d1b",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/icml2026/example_paper.tex",
            "size": 29714,
            "sha256": "c2ca8140bf255d1ff77d1278eb3eefed4018b4b1e71065b8e1ccbc68b74c8acf",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/icml2026/fancyhdr.sty",
            "size": 31715,
            "sha256": "9130c52f91087abc6d223164ffa587e207e3257fcbcd069ef09ecb5391043f14",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/icml2026/icml_numpapers.pdf",
            "size": 2823,
            "sha256": "d34e8da982296363627996e6e18850c11fbd616e6946061237051e7a8f7080bb",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/icml2026/icml2026.bst",
            "size": 27147,
            "sha256": "0ec3d5eb9b02efb7e0b44a32f3775882f42a743d0bdc618f34e6936309b98764",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/icml2026/icml2026.sty",
            "size": 27344,
            "sha256": "7cdcf90f6a59c5219e7f15c88f7ed09fcaf598dad91e6cdddc4dc3cb0e397a95",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/neurips2025/extra_pkgs.tex",
            "size": 2837,
            "sha256": "fcd6b09156fa193c347f6acd8188d430fa28f769fb6e2c2514cbbd215c39014a",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/neurips2025/main.tex",
            "size": 574,
            "sha256": "366c093fbc3018c46de28f3fe0ecb063b4aba10a089afe037837bbf673a9c4d6",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/neurips2025/Makefile",
            "size": 1054,
            "sha256": "0983425d74e769f2457f6ff0654cf76fc0c95f8d158fc8eaec66c5697ba0594f",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/neurips2025/neurips.sty",
            "size": 11625,
            "sha256": "ef7a55f0a7c9da12fea39af7990a6a314a721b74a23b1544f252e55fcba940cd",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/README.md",
            "size": 7162,
            "sha256": "ee4c0238c2b17a0c2963d2983c52e30e7eed29ed15d3f657571737a8fe362cea",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 5156,
            "sha256": "ebdef42f255bfd4c396c9e7c59f7ab6b385e0a913494a60dd80031859f36005e",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 2,
        "ipfs_cid": null,
        "changelog": "Synced from dirtybits/agent-skills",
        "tree_hash": "3ba5d6c6a3d684e10e9447078107754e5a750db2f98d6667194a393f584b7cb3",
        "created_at": "2026-06-26T07:12:06.031387+00:00",
        "has_executable": true,
        "storage_backend": "blob"
      },
      {
        "id": "e6cae799-27a6-4def-9735-d7cddf492657",
        "files": [
          {
            "path": "index.md",
            "size": 244,
            "sha256": "0805e999d6f4dd74670ff4f0714cec512b72d491913f9d619b865a587c4bbb6c",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "LICENSE.txt",
            "size": 1066,
            "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
            "executable": false,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/arxiv/scripts/search_arxiv.py",
            "size": 4272,
            "sha256": "68f0bcc09ef1f59ecd9be8a7693e47239fd99b19d62cecb80a92b8c476cca371",
            "executable": true,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/arxiv/SKILL.original.md",
            "size": 10439,
            "sha256": "77d4f6ae1427dce42e55ec4cd8e5f5000d4169a73fd64c1dd5688c5030ce791d",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/blogwatcher/SKILL.original.md",
            "size": 5471,
            "sha256": "3f8151f2812b38a6548c875ab36a6b5fc2a7605463263e25db0296924ccbbaf6",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/llm-wiki/SKILL.original.md",
            "size": 20486,
            "sha256": "990e1a86d08a87cc386b999adf4ade109f4f695d2d7b788ded1654bc84ce0460",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/polymarket/references/api-endpoints.md",
            "size": 5000,
            "sha256": "58152a0d3d682c397821729039019b6a2a847022fe3edc209a3e77ec9f020534",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/polymarket/scripts/polymarket.py",
            "size": 10214,
            "sha256": "7873e054539a8c782a671dd84686e1ee763e29fe20245c1d10798b767d76980f",
            "executable": true,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/polymarket/SKILL.original.md",
            "size": 3270,
            "sha256": "c7d62c413c88b286ad3c20f2c17aa47979af73a9a72256d3e81aeee7476de52b",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/references/autoreason-methodology.md",
            "size": 19634,
            "sha256": "0273a195e6ccb61e57e31dd465fa40ade8965b3f649c327b61e38bd5a628cffd",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/references/checklists.md",
            "size": 14086,
            "sha256": "55c1fd089fbf1a51f09350b28355395f0bcff5d391da87aa3e80a2f55cbd8d29",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/references/citation-workflow.md",
            "size": 15911,
            "sha256": "7f383632b20ec3047a92d2c34f7f4f0d701890be5f5870ae88bbc9a662c1cfb8",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/references/experiment-patterns.md",
            "size": 26224,
            "sha256": "f26282d3b2f83d96856fe0fbc34865c7333ea9e7cca280aeb541254c96b30cdb",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/references/human-evaluation.md",
            "size": 18697,
            "sha256": "24223a947c9a6f88863b6ca76a075986c956cc43061a1b06a5d77d90727a92c8",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/references/paper-types.md",
            "size": 16680,
            "sha256": "b676cbe2aefcfa3c6aba0bff81d13d3c405670581cccbe79a3683d3c3df693fd",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/references/reviewer-guidelines.md",
            "size": 14220,
            "sha256": "2da471450680943167d52fd31ad700304284da082469b1909945b85f5bd7defa",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/references/sources.md",
            "size": 9918,
            "sha256": "508c03ec616b6d6372dfa7a40a5b04d936e80b06beb97affdd64d4a4bac9b858",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/references/writing-guide.md",
            "size": 16762,
            "sha256": "50afe94a875fad2d84c96a2d2ad958771fc518f3ddfc7acacd1ee5e42e3ae70b",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/SKILL.original.md",
            "size": 103689,
            "sha256": "52ff01142bf61ed608d9a710433918b193ceafe16ccea2ba6db97e20a9678928",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/aaai2026/aaai2026-unified-supp.tex",
            "size": 4548,
            "sha256": "35adcff419efc25a032140c520d40520d0d0fc69123e9d8e38ad161c40ad07b7",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/aaai2026/aaai2026-unified-template.tex",
            "size": 63140,
            "sha256": "bed12c50b5e027fd88097d238ec4e7ebf1ae7b450cb06d6df7c8ae126a620aea",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/aaai2026/aaai2026.bib",
            "size": 4766,
            "sha256": "d8fcf3dc09b9d489aeff13631174c5998a48cb0d0800ac8a00a2f7bdbc40295b",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/aaai2026/aaai2026.bst",
            "size": 30207,
            "sha256": "ac26e2c66047435c0ed25f21ae36ad42d731cf3d794c4a8b5f05a62141a27294",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/aaai2026/aaai2026.sty",
            "size": 11802,
            "sha256": "a39f1866a04dd1e2603613c876fa446aaea2c2f3e34d02be868fd21520bfade5",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/aaai2026/README.md",
            "size": 18451,
            "sha256": "8f9429bce6a391c74363cae591874e36d4102b3fa97e3bdf4054d9bd023aa888",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/acl/acl_latex.tex",
            "size": 14533,
            "sha256": "339c9ee9705c1767d44ef24b85365c0bb8619ecc3fcf66172bf1356292389614",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/acl/acl_lualatex.tex",
            "size": 3050,
            "sha256": "c0bf91f00ecbf962d36dae7a302e577d61fbac00feee93946e869db09d2f8188",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/acl/acl_natbib.bst",
            "size": 45186,
            "sha256": "e332fd51dcea48e2a8a89754892c3cb99674a1cd70b527b661e9aaffc235e83c",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/acl/acl.sty",
            "size": 11615,
            "sha256": "19dfeddc2c0e448f3926a0bef048a9db3f3611b46265b760caabd7ada4f361de",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/acl/anthology.bib.txt",
            "size": 1169,
            "sha256": "2b78d2d9aeda62e14c4e46099e8225b5fc116387d8e0a54aad776485e249ceff",
            "executable": false,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/acl/custom.bib",
            "size": 2071,
            "sha256": "d76ccb30ddceb70c9e1ad0be3f43dfe301ad5765aab2c960fc830ef67bf8232a",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/acl/formatting.md",
            "size": 18390,
            "sha256": "a1bc25dcfcd5082e2997bdc23adb7c72ac5848856423d684af7b3e6f3cb37a81",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/acl/README.md",
            "size": 2585,
            "sha256": "98f53ebdfe71e916e77a7b85fa372f3bf0d80366138da630e783790ca8344d5c",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/colm2025/colm2025_conference.bib",
            "size": 496,
            "sha256": "c5fabf46cc7d7a6e527b82860b9a9d658eb07f63abaafa9b7beb631d8abb91bd",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/colm2025/colm2025_conference.bst",
            "size": 26973,
            "sha256": "2d67552db7ed38ccfccb5957b52f95656e25c249724761d3cf5f7922ad1844c5",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/colm2025/colm2025_conference.pdf",
            "size": 122635,
            "sha256": "d8b3d74bc81aec9ba9d6b739b4922adc93ae002d7c82522b9c6064014bec1d16",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/colm2025/colm2025_conference.sty",
            "size": 7727,
            "sha256": "79df8b2a1b142dfb324a0a7e87fabcd9d5dc2a34700e1c6c083a9bbb9e5daa8e",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/colm2025/colm2025_conference.tex",
            "size": 12830,
            "sha256": "baf01cd056ccd1b35165d190019414946217de1683f8ae3ddc66b11e3c653dbc",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/colm2025/fancyhdr.sty",
            "size": 20521,
            "sha256": "b56ec4434b9f4607529a4b23dc68ad8d4b94f1f631c8cddaf7da78140d53a5ea",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/colm2025/math_commands.tex",
            "size": 12284,
            "sha256": "90473c4d0542070db244cea73ef962d6cddc5b2a746757e6a40ddf5fdfb90ba9",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/colm2025/natbib.sty",
            "size": 45154,
            "sha256": "88bc70c0e48461934cab5b2accef06b74a8b3ac45ad03ccd3f2a6b7e0d6d530d",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/colm2025/README.md",
            "size": 515,
            "sha256": "caa78a9e6b51eaf2e640f6079ed834d2163b477362bbdb10e81071a5d4f56e91",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/iclr2026/fancyhdr.sty",
            "size": 20521,
            "sha256": "b56ec4434b9f4607529a4b23dc68ad8d4b94f1f631c8cddaf7da78140d53a5ea",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/iclr2026/iclr2026_conference.bib",
            "size": 629,
            "sha256": "cdd86e7d4c31854dcf2145871657c944588a6d44c3b72e160ff4baa8df1a52fb",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/iclr2026/iclr2026_conference.bst",
            "size": 26973,
            "sha256": "2d67552db7ed38ccfccb5957b52f95656e25c249724761d3cf5f7922ad1844c5",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/iclr2026/iclr2026_conference.pdf",
            "size": 200508,
            "sha256": "cb3d414cfa4702d52de94de1c8123c34b2cf46b7a5510df49dcc1014a6c266cf",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/iclr2026/iclr2026_conference.sty",
            "size": 9025,
            "sha256": "a4852f68e080d6c5245057ca2039100b409e31727898aa93c03d78ddb84374a3",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/iclr2026/iclr2026_conference.tex",
            "size": 16899,
            "sha256": "941b58de6e52f5538de0ebfe2d20425a79e1768cb271d453b7436904b5159859",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/iclr2026/math_commands.tex",
            "size": 12284,
            "sha256": "90473c4d0542070db244cea73ef962d6cddc5b2a746757e6a40ddf5fdfb90ba9",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/iclr2026/natbib.sty",
            "size": 45154,
            "sha256": "88bc70c0e48461934cab5b2accef06b74a8b3ac45ad03ccd3f2a6b7e0d6d530d",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/icml2026/algorithm.sty",
            "size": 2223,
            "sha256": "93fd0eb31c112eb405833db8f1d7f5d238c7e691b1c05680d7276e68f36d564a",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/icml2026/algorithmic.sty",
            "size": 7414,
            "sha256": "48d18794a5d97c0479a588cc2eac0917992feb9da83acc4631b8f55757d80f9b",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/icml2026/example_paper.bib",
            "size": 2051,
            "sha256": "df950103d38f9cfc81b1f40d84c9be2a3525d046d2991a6973a4446922c06bd1",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/icml2026/example_paper.pdf",
            "size": 193509,
            "sha256": "3e8fe0e952de8702ca4697dba09ca52e83bd649767b92a8340d34a591caa4d1b",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/icml2026/example_paper.tex",
            "size": 29714,
            "sha256": "c2ca8140bf255d1ff77d1278eb3eefed4018b4b1e71065b8e1ccbc68b74c8acf",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/icml2026/fancyhdr.sty",
            "size": 31715,
            "sha256": "9130c52f91087abc6d223164ffa587e207e3257fcbcd069ef09ecb5391043f14",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/icml2026/icml_numpapers.pdf",
            "size": 2823,
            "sha256": "d34e8da982296363627996e6e18850c11fbd616e6946061237051e7a8f7080bb",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/icml2026/icml2026.bst",
            "size": 27147,
            "sha256": "0ec3d5eb9b02efb7e0b44a32f3775882f42a743d0bdc618f34e6936309b98764",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/icml2026/icml2026.sty",
            "size": 27344,
            "sha256": "7cdcf90f6a59c5219e7f15c88f7ed09fcaf598dad91e6cdddc4dc3cb0e397a95",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/neurips2025/extra_pkgs.tex",
            "size": 2837,
            "sha256": "fcd6b09156fa193c347f6acd8188d430fa28f769fb6e2c2514cbbd215c39014a",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/neurips2025/main.tex",
            "size": 574,
            "sha256": "366c093fbc3018c46de28f3fe0ecb063b4aba10a089afe037837bbf673a9c4d6",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/neurips2025/Makefile",
            "size": 1054,
            "sha256": "0983425d74e769f2457f6ff0654cf76fc0c95f8d158fc8eaec66c5697ba0594f",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/neurips2025/neurips.sty",
            "size": 11625,
            "sha256": "ef7a55f0a7c9da12fea39af7990a6a314a721b74a23b1544f252e55fcba940cd",
            "executable": false,
            "contentType": "application/octet-stream"
          },
          {
            "path": "references/absorbed-packages/research-paper-writing/templates/README.md",
            "size": 7162,
            "sha256": "ee4c0238c2b17a0c2963d2983c52e30e7eed29ed15d3f657571737a8fe362cea",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 4557,
            "sha256": "1c5416c5cde71955585d7a7be6a88b08f77afbb1d32a9912f2c8f1abe3c370e9",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 1,
        "ipfs_cid": null,
        "changelog": "Synced from dirtybits/agent-skills",
        "tree_hash": "a99f1323492b9ba8924740cc56948caa391f9c4005beb47137991ee1b0f91a09",
        "created_at": "2026-06-25T07:12:28.053717+00:00",
        "has_executable": true,
        "storage_backend": "blob"
      }
    ],
    "author_trust": {
      "isRegistered": true,
      "registeredAt": 1779082335,
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "totalStakeAtRisk": 24250000,
      "authorBondUsdcMicros": 7250000,
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_trust_summary": {
      "username": "wallet-z7wzgw",
      "github_url": "https://github.com/dirtybits",
      "display_name": null,
      "github_login": "dirtybits",
      "isRegistered": true,
      "registeredAt": 1779082335,
      "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "wallet_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "schema_version": "2026-04-03",
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "trust_updated_at": "2026-09-22T04:52:30.978Z",
      "canonical_agent_id": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "recommended_action": "allow",
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_identity": {
      "id": "1f84a1fd-7c81-4925-9ea7-7b0ba6609697",
      "canonicalAgentId": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "identitySource": "local",
      "homeChainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "status": "active",
      "displayName": null,
      "username": "wallet-z7wzgw",
      "usernameSource": "fallback",
      "githubProfile": {
        "id": "28834908",
        "login": "dirtybits",
        "name": "andy",
        "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4",
        "url": "https://github.com/dirtybits"
      },
      "bindings": [
        {
          "id": "c11bf186-49aa-46d1-82a0-732d84071113",
          "metadata": null,
          "isPrimary": true,
          "bindingRef": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
          "bindingType": "wallet_owner",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "7ac9de7b-3020-4261-be2c-d7cbefa1d257",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "094fbb11-545b-41d7-b7e7-38d66a8c5fde",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "A4dgMn4WYSmFdisAkpKzFwUcLsPr4fBJU5nbKQHWHgeA",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "147b59b5-fb6f-4901-ad99-8fa8f742f4af",
          "metadata": {
            "id": "28834908",
            "url": "https://github.com/dirtybits",
            "name": "andy",
            "login": "dirtybits",
            "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4"
          },
          "isPrimary": false,
          "bindingRef": "github:28834908",
          "bindingType": "github_profile",
          "chainContext": "github",
          "externalAgentId": "28834908",
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        }
      ],
      "ownerWallet": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "operationalWallet": null,
      "agentProfilePda": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
      "registryAsset": null
    },
    "buyerHasPurchased": false,
    "buyerPurchaseSummary": null,
    "content_verification": {
      "has_ipfs": false,
      "all_versions_pinned": false,
      "current_cid_consistent": true,
      "status": "unverified"
    },
    "priceDisclosure": null,
    "purchaseRiskWarning": null
  },
  {
    "id": "c8342a87-91db-4989-9ad0-7ab67d26a81a",
    "skill_id": "obsidian",
    "public_slug": "obsidian",
    "public_author_slug": "wallet-asuavudg",
    "author_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "author_kind": "wallet",
    "author_external_id": null,
    "author_handle": null,
    "author_display_name": null,
    "publisher_identity_key": "wallet:asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
    "publisher_tier": "registered",
    "mirror_source_key": null,
    "synced_repo_url": "https://github.com/dirtybits/agent-skills",
    "name": "Obsidian",
    "description": "Read, search, create, and edit notes in the Obsidian vault.",
    "tags": [
      "mit"
    ],
    "current_version": 1,
    "summary": "Manage Obsidian notes: read, search, create, append, edit, and link files in a vault.",
    "summary_model": "google/gemini-2.5-flash-lite",
    "summary_sha256": "cda12d5e99069bc48e2b59c8fe33e0702779d9f6d0fb0a16963ffefaa3e1c6e5",
    "summary_capabilities": [
      "Read notes",
      "Search files",
      "Create notes",
      "Link notes"
    ],
    "ipfs_cid": null,
    "on_chain_address": null,
    "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
    "evm_listing_id": null,
    "evm_contract_address": null,
    "evm_tx_hash": null,
    "total_installs": 0,
    "price_usdc_micros": null,
    "currency_mint": null,
    "on_chain_protocol_version": null,
    "on_chain_program_id": null,
    "contact": "https://github.com/dirtybits/agent-skills/tree/main/skills/obsidian",
    "created_at": "2026-06-25T07:12:23.541Z",
    "updated_at": "2026-06-25T07:12:23.541Z",
    "source": "repo",
    "payment_flow": "free",
    "content": "---\ntype: Skill\ntitle: \"Obsidian\"\nresource: \"https://github.com/dirtybits/agent-skills/tree/main/skills/obsidian\"\ntags: [\"obsidian\", \"notes\", \"vault\", \"knowledge-management\", \"workflow\"]\ntimestamp: \"2026-06-25T06:43:10Z\"\nokf_version: \"0.1\"\nname: obsidian\ndescription: Read, search, create, and edit notes in the Obsidian vault.\nplatforms: [linux, macos, windows]\nlicense: MIT\n---\n# Obsidian Vault\n\nUse this skill for filesystem-first Obsidian vault work: reading notes, listing notes, searching note files, creating notes, appending content, and adding wikilinks.\n\n## Vault path\n\nUse a known or resolved vault path before calling file tools.\n\nThe documented vault-path convention is the `OBSIDIAN_VAULT_PATH` environment variable, for example from `${HERMES_HOME:-~/.hermes}/.env`. If it is unset, use `~/Documents/Obsidian Vault`.\n\nFile tools do not expand shell variables. Do not pass paths containing `$OBSIDIAN_VAULT_PATH` to `read_file`, `write_file`, `patch`, or `search_files`; resolve the vault path first and pass a concrete absolute path. Vault paths may contain spaces, which is another reason to prefer file tools over shell commands.\n\nIf the vault path is unknown, `terminal` is acceptable for resolving `OBSIDIAN_VAULT_PATH` or checking whether the fallback path exists. Once the path is known, switch back to file tools.\n\n## Read a note\n\nUse `read_file` with the resolved absolute path to the note. Prefer this over `cat` because it provides line numbers and pagination.\n\n## List notes\n\nUse `search_files` with `target: \"files\"` and the resolved vault path. Prefer this over `find` or `ls`.\n\n- To list all markdown notes, use `pattern: \"*.md\"` under the vault path.\n- To list a subfolder, search under that subfolder's absolute path.\n\n## Search\n\nUse `search_files` for both filename and content searches. Prefer this over `grep`, `find`, or `ls`.\n\n- For filenames, use `search_files` with `target: \"files\"` and a filename `pattern`.\n- For note contents, use `search_files` with `target: \"content\"`, the content regex as `pattern`, and `file_glob: \"*.md\"` when you want to restrict matches to markdown notes.\n\n## Create a note\n\nUse `write_file` with the resolved absolute path and the full markdown content. Prefer this over shell heredocs or `echo` because it avoids shell quoting issues and returns structured results.\n\n## Append to a note\n\nPrefer a native file-tool workflow when it is not awkward:\n\n- Read the target note with `read_file`.\n- Use `patch` for an anchored append when there is stable context, such as adding a section after an existing heading or appending before a known trailing block.\n- Use `write_file` when rewriting the whole note is clearer than constructing a fragile patch.\n\nFor an anchored append with `patch`, replace the anchor with the anchor plus the new content.\n\nFor a simple append with no stable context, `terminal` is acceptable if it is the clearest safe option.\n\n## Targeted edits\n\nUse `patch` for focused note changes when the current content gives you stable context. Prefer this over shell text rewriting.\n\n## Scheduled vault review / lint workflow\n\nWhen asked to run a periodic vault review, do more than browse recent files:\n\n1. Read `log.md` and the vault schema (`CLAUDE.md` and/or `AGENTS.md`) first to recover current cleanup debt and indexing conventions.\n2. Build a lightweight link graph across `*.md` files: collect Obsidian wikilinks, resolve by basename, count inbound links, and list unresolved targets. It is acceptable to use a short local Python script via `terminal` when file-tool-only scanning would be awkward.\n3. Identify recent notes (mtime window from the request) and compare them against hub/index pages. New research, marketing briefs, reports, or archive entries commonly need a one-line link in the relevant `index.md`.\n4. Patch missing index links when the target hub is obvious; do not only report the orphan. Re-run the scanner after edits and report the before/after orphan count.\n5. Review `Agents/*/{Memory.md,personal-memory.md,User-Preferences.md}`. Update only durable agent context (last review state, persistent blockers/preferences), not every transient file seen.\n6. If significant changes were made, prepend a concise `log.md` entry with the file count, links added, memory files touched, and remaining cleanup debt.\n7. In the final report, keep it brief: changes made, remaining health issues, new content worth attention, and suggested next actions.\n\n## Wikilinks\n\nObsidian links notes with `[[Note Name]]` syntax. When creating notes, use these to link related content.\n\nFor vault-health scans, normalize links to Obsidian basename form where practical. Path-style links that include folder names or `.md` extensions (for example `[[daily-tech-reports/report-2026-05-16.md]]`) can create false unresolved/orphan findings in simple scanners and are harder to maintain across note moves. Prefer `[[report-2026-05-16]]` when the basename is unique, or `[[Note Name|display text]]` for readability.\n",
    "files": [
      {
        "path": "index.md",
        "size": 134,
        "sha256": "c8e939fb03051281c0d6388990446a14bdb00115e5c20404378265e4034a12dc",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      },
      {
        "path": "LICENSE.txt",
        "size": 1066,
        "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
        "executable": false,
        "contentType": "text/plain; charset=utf-8"
      },
      {
        "path": "SKILL.md",
        "size": 4996,
        "sha256": "cda12d5e99069bc48e2b59c8fe33e0702779d9f6d0fb0a16963ffefaa3e1c6e5",
        "executable": false,
        "contentType": "text/markdown; charset=utf-8"
      }
    ],
    "tree_hash": "0e40b80be2acf1c2c3f365bf5ef36cabe4ce98c7bad69f25bca7a109f170a864",
    "storage_backend": "blob",
    "has_executable": false,
    "security_scan": {
      "verdict": "review",
      "risk": "low",
      "findings": [],
      "truncated": false,
      "scanned_at": "2026-06-25T07:12:25.433Z",
      "model": "google/gemini-2.5-flash-lite",
      "rubric_version": "v1",
      "scan_source": "model",
      "generated_by_model": true,
      "advisory": true
    },
    "signals": [
      {
        "id": "ai_scan",
        "label": "AI security scan",
        "scope": "skill",
        "status": "pass",
        "detail": "Advisory scan completed with no concrete findings."
      },
      {
        "id": "registered",
        "label": "On-chain identity",
        "scope": "author",
        "status": "pass",
        "detail": "Author is registered on-chain."
      },
      {
        "id": "vouched",
        "label": "Vouched by others",
        "scope": "author",
        "status": "pass",
        "detail": "Other accounts have staked USDC vouching for this author."
      },
      {
        "id": "author_bonded",
        "label": "Author bond",
        "scope": "author",
        "status": "pass",
        "detail": "Author posted a USDC self-bond (skin in the game)."
      },
      {
        "id": "dispute_free",
        "label": "Dispute history",
        "scope": "author",
        "status": "pass",
        "detail": "No disputes against this author."
      }
    ],
    "versions": [
      {
        "id": "a9dde41a-72e0-427b-b7ac-4a06769ac76f",
        "files": [
          {
            "path": "index.md",
            "size": 134,
            "sha256": "c8e939fb03051281c0d6388990446a14bdb00115e5c20404378265e4034a12dc",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          },
          {
            "path": "LICENSE.txt",
            "size": 1066,
            "sha256": "3a1b6d07e53b828ae26c6424b43e4f785a339467d9af4a8f596384f152e2b389",
            "executable": false,
            "contentType": "text/plain; charset=utf-8"
          },
          {
            "path": "SKILL.md",
            "size": 4996,
            "sha256": "cda12d5e99069bc48e2b59c8fe33e0702779d9f6d0fb0a16963ffefaa3e1c6e5",
            "executable": false,
            "contentType": "text/markdown; charset=utf-8"
          }
        ],
        "version": 1,
        "ipfs_cid": null,
        "changelog": "Synced from dirtybits/agent-skills",
        "tree_hash": "0e40b80be2acf1c2c3f365bf5ef36cabe4ce98c7bad69f25bca7a109f170a864",
        "created_at": "2026-06-25T07:12:23.541144+00:00",
        "has_executable": false,
        "storage_backend": "blob"
      }
    ],
    "author_trust": {
      "isRegistered": true,
      "registeredAt": 1779082335,
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "totalStakeAtRisk": 24250000,
      "authorBondUsdcMicros": 7250000,
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_trust_summary": {
      "username": "wallet-z7wzgw",
      "github_url": "https://github.com/dirtybits",
      "display_name": null,
      "github_login": "dirtybits",
      "isRegistered": true,
      "registeredAt": 1779082335,
      "chain_context": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "wallet_pubkey": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "schema_version": "2026-04-03",
      "totalStakedFor": 17000000,
      "reputationScore": 373,
      "trust_updated_at": "2026-09-22T04:52:30.978Z",
      "canonical_agent_id": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "recommended_action": "allow",
      "totalVouchesReceived": 1,
      "disputesAgainstAuthor": 0,
      "activeDisputesAgainstAuthor": 0,
      "disputesUpheldAgainstAuthor": 0
    },
    "author_identity": {
      "id": "1f84a1fd-7c81-4925-9ea7-7b0ba6609697",
      "canonicalAgentId": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:agentvouch-local#asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "identitySource": "local",
      "homeChainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      "status": "active",
      "displayName": null,
      "username": "wallet-z7wzgw",
      "usernameSource": "fallback",
      "githubProfile": {
        "id": "28834908",
        "login": "dirtybits",
        "name": "andy",
        "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4",
        "url": "https://github.com/dirtybits"
      },
      "bindings": [
        {
          "id": "c11bf186-49aa-46d1-82a0-732d84071113",
          "metadata": null,
          "isPrimary": true,
          "bindingRef": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
          "bindingType": "wallet_owner",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "7ac9de7b-3020-4261-be2c-d7cbefa1d257",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "094fbb11-545b-41d7-b7e7-38d66a8c5fde",
          "metadata": null,
          "isPrimary": false,
          "bindingRef": "A4dgMn4WYSmFdisAkpKzFwUcLsPr4fBJU5nbKQHWHgeA",
          "bindingType": "agent_profile_pda",
          "chainContext": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          "externalAgentId": null,
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        },
        {
          "id": "147b59b5-fb6f-4901-ad99-8fa8f742f4af",
          "metadata": {
            "id": "28834908",
            "url": "https://github.com/dirtybits",
            "name": "andy",
            "login": "dirtybits",
            "avatarUrl": "https://avatars.githubusercontent.com/u/28834908?v=4"
          },
          "isPrimary": false,
          "bindingRef": "github:28834908",
          "bindingType": "github_profile",
          "chainContext": "github",
          "externalAgentId": "28834908",
          "registryAddress": null,
          "rawUpstreamChainId": null,
          "verificationStatus": "verified",
          "rawUpstreamChainLabel": null
        }
      ],
      "ownerWallet": "asuavUDGmrVHr4oD1b4QtnnXgtnEcBa8qdkfZz7WZgw",
      "operationalWallet": null,
      "agentProfilePda": "GFrCcMuqWTPyjb2cn3TU9zT7gGjE6c84o1bvNfkizptG",
      "registryAsset": null
    },
    "buyerHasPurchased": false,
    "buyerPurchaseSummary": null,
    "content_verification": {
      "has_ipfs": false,
      "all_versions_pinned": false,
      "current_cid_consistent": true,
      "status": "unverified"
    },
    "priceDisclosure": null,
    "purchaseRiskWarning": null
  }
];

export function getFallbackRepoSkills(): RepoSkillRow[] {
  return REAL_FALLBACK_SKILLS.map((skill) => {
    return {
      id: skill.id,
      skill_id: skill.skill_id,
      name: skill.name,
      description: skill.description || "",
      tags: skill.tags || [],
      current_version: skill.current_version || 1,
      ipfs_cid: skill.ipfs_cid || null,
      on_chain_address: skill.on_chain_address || null,
      chain_context: skill.chain_context || "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      total_installs: skill.total_installs || 0,
      contact: skill.contact || null,
      created_at: skill.created_at,
      updated_at: skill.updated_at,
      author_pubkey: skill.author_pubkey,
      price_usdc_micros: skill.price_usdc_micros || null,
      currency_mint: skill.currency_mint || null,
      on_chain_protocol_version: skill.on_chain_protocol_version || null,
      on_chain_program_id: skill.on_chain_program_id || null,
      summary: skill.summary || null,
      summary_model: skill.summary_model || null,
      summary_sha256: skill.summary_sha256 || null,
      author_kind: skill.author_kind || "wallet",
      author_external_id: skill.author_external_id || null,
      author_handle: skill.author_handle || null,
      author_display_name: skill.author_display_name || null,
      publisher_identity_key: skill.publisher_identity_key,
      publisher_tier: skill.publisher_tier || "registered",
      summary_capabilities: skill.summary_capabilities || [],
      public_slug: skill.public_slug || skill.skill_id,
      public_author_slug: skill.public_author_slug || "wallet-author",
      summary_rubric_version: skill.summary_rubric_version || "v2",
      mirror_source_key: skill.mirror_source_key || null,
      synced_repo_url: skill.synced_repo_url || null,
      evm_listing_id: skill.evm_listing_id || null,
      evm_contract_address: skill.evm_contract_address || null,
      evm_tx_hash: skill.evm_tx_hash || null,
      tree_hash: skill.tree_hash || null,
      has_executable: Boolean(skill.has_executable),
      security_scan: skill.security_scan || null,
      cached_reputation_score: skill.author_trust?.reputationScore || 0,
      cached_trust_refreshed_at: skill.updated_at,
      cached_author_trust: skill.author_trust || null,
      cached_author_trust_summary: skill.author_trust_summary || null,
    };
  }) as unknown as RepoSkillRow[];
}

export function getFallbackEnrichedSkills(): EnrichedSkillRow[] {
  return REAL_FALLBACK_SKILLS.map((skill) => {
    return {
      ...skill,
      source: skill.source || "repo",
      payment_flow: skill.payment_flow || (skill.price_usdc_micros ? "direct-purchase-skill" : "free"),
      price_usdc_micros: skill.price_usdc_micros || "0",
      signals: skill.signals || [],
      author_trust: skill.author_trust || null,
      author_trust_summary: skill.author_trust_summary || null,
      author_identity: skill.author_identity || null,
    };
  }) as unknown as EnrichedSkillRow[];
}

export function getFallbackSkillDetail(idOrSlug: string): SkillDetailSnapshot | null {
  const item = REAL_FALLBACK_SKILLS.find(
    (s) => s.id === idOrSlug || s.skill_id === idOrSlug || s.public_slug === idOrSlug
  );
  if (!item) return null;

  return {
    ...item,
    total_downloads: item.total_downloads || item.total_installs || 0,
    total_revenue: item.total_revenue || 0,
    price_usdc_micros: item.price_usdc_micros || "0",
    content: item.content || `# ${item.name}\n\n${item.description || ""}\n`,
    files: item.files || [{ path: "SKILL.md", size: (item.content || "").length, executable: false }],
    versions: item.versions || [{ version: item.current_version || 1, published_at: item.created_at, ipfs_cid: null }],
  } as unknown as SkillDetailSnapshot;
}
