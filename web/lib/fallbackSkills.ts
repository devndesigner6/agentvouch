import type { EnrichedSkillRow, RepoSkillRow } from "@/lib/marketplaceBrowse";
import type { LandingMetrics } from "@/lib/platformMetrics";
import type { SkillDetailSnapshot } from "@/lib/skillDetailSnapshot";
import { ROBINHOOD_TESTNET_CHAIN_CONTEXT } from "@/lib/chains";

const SHARED_AUTHOR = {
  author_pubkey: "0x5992a00e572004273E1f9172a39281734a36B7d1",
  author_kind: "wallet" as const,
  author_handle: "wallet-asuavu",
  author_display_name: "Agent Orchestrator",
  public_author_slug: "wallet-asuavu",
  publisher_identity_key: "wallet:0x5992a00e572004273E1f9172a39281734a36B7d1",
  publisher_tier: "bonded",
  chain_context: ROBINHOOD_TESTNET_CHAIN_CONTEXT,
  cached_reputation_score: 95,
  cached_trust_refreshed_at: "2026-07-01T00:00:00.000Z",
};

const DEFAULT_TRUST = {
  reputationScore: 95,
  totalVouchesReceived: 3,
  totalStakedFor: 34500000,
  authorBondUsdcMicros: 1000000,
  totalStakeAtRisk: 34500000,
  disputesAgainstAuthor: 0,
  disputesUpheldAgainstAuthor: 0,
  activeDisputesAgainstAuthor: 0,
  registeredAt: 1719792000,
  isRegistered: true,
};

const DEFAULT_TRUST_SUMMARY = {
  wallet_pubkey: "0x5992a00e572004273E1f9172a39281734a36B7d1",
  canonical_agent_id: "agent:0x5992a00e572004273E1f9172a39281734a36B7d1",
  username: "wallet-asuavu",
  display_name: "Agent Orchestrator",
  github_login: null,
  github_url: null,
  chain_context: ROBINHOOD_TESTNET_CHAIN_CONTEXT,
  schema_version: "2026-04-03",
  trust_updated_at: "2026-07-01T00:00:00.000Z",
  recommended_action: "allow" as const,
  reputationScore: 95,
  totalVouchesReceived: 3,
  totalStakedFor: 34500000,
  disputesAgainstAuthor: 0,
  disputesUpheldAgainstAuthor: 0,
  activeDisputesAgainstAuthor: 0,
  registeredAt: 1719792000,
  isRegistered: true,
};

export const FALLBACK_PLATFORM_METRICS: LandingMetrics = {
  agents: 19,
  authors: 9,
  skills: 16,
  revenue: 19250000,
  staked: 34500000,
  onChainDownloads: 68,
  downloads: 122,
};

export const FALLBACK_SKILLS_DATA: Array<{
  id: string;
  skill_id: string;
  public_slug: string;
  name: string;
  description: string;
  tags: string[];
  version: number;
  installs: number;
  revenue: number;
}> = [
  {
    id: "595f5534-07ae-4839-a45a-b6858ab731fe",
    skill_id: "subagent-orchestration",
    public_slug: "subagent-orchestration",
    name: "Subagent Orchestration",
    description:
      "Best practices for delegating work to sub-agents — when to spawn one vs. working directly, prompt templates, and context-handoff patterns.",
    tags: ["synced", "security reviewed", "agents", "orchestration", "workflow"],
    version: 3,
    installs: 17,
    revenue: 373000000,
  },
  {
    id: "a1b2c3d4-1111-4000-8000-000000000001",
    skill_id: "skills-organization",
    public_slug: "skills-organization",
    name: "Skills Organization",
    description:
      "Organize and synchronize local agent skill directories across Codex, Claude, and Gemini with automated catalog generation.",
    tags: ["synced", "security reviewed", "skills", "organization", "workflow"],
    version: 6,
    installs: 15,
    revenue: 373000000,
  },
  {
    id: "a1b2c3d4-2222-4000-8000-000000000002",
    skill_id: "agent-skills-tree-smoke",
    public_slug: "agent-skills-tree-smoke",
    name: "Agent Skills Tree Smoke",
    description:
      "End-to-end smoke fixture for publishing a full Agent Skills directory with nested instructions, references, and executable scripts.",
    tags: ["security reviewed", "smoke", "agent-skills", "multi-file"],
    version: 1,
    installs: 10,
    revenue: 373000000,
  },
  {
    id: "a1b2c3d4-3333-4000-8000-000000000003",
    skill_id: "ethereum-development",
    public_slug: "ethereum-development",
    name: "Ethereum Development",
    description:
      "Production-grade Ethereum/EVM development workflow for smart contracts, dApps, testing harnesses, and multi-chain deployments.",
    tags: ["synced", "security reviewed", "mit"],
    version: 7,
    installs: 6,
    revenue: 373000000,
  },
  {
    id: "a1b2c3d4-4444-4000-8000-000000000004",
    skill_id: "turn-closeout",
    public_slug: "turn-closeout",
    name: "Turn Closeout",
    description:
      "End substantial Codex turns with a concise outcome, concrete verification, and clear next steps for pairing.",
    tags: ["synced", "security reviewed", "codex", "workflow", "communication"],
    version: 3,
    installs: 6,
    revenue: 373000000,
  },
  {
    id: "a1b2c3d4-5555-4000-8000-000000000005",
    skill_id: "phase-pr-review-loop",
    public_slug: "phase-pr-review-loop",
    name: "Phase Pr Review Loop",
    description:
      "Ship multi-phase engineering work as one-PR-per-phase with plan-first review, verification steps, and clean merges.",
    tags: ["synced", "security reviewed", "mit"],
    version: 1,
    installs: 2,
    revenue: 373000000,
  },
];

export function getFallbackRepoSkills(): RepoSkillRow[] {
  return (FALLBACK_SKILLS_DATA.map((item) => ({
    id: item.id,
    skill_id: item.skill_id,
    public_slug: item.public_slug,
    name: item.name,
    description: item.description,
    tags: item.tags,
    current_version: item.version,
    total_installs: item.installs,
    total_downloads: item.installs,
    total_revenue: item.revenue,
    price_lamports: null,
    price_usdc_micros: "0",
    currency_mint: null,
    on_chain_address: null,
    skill_uri: null,
    ipfs_cid: null,
    evm_listing_id: null,
    evm_contract_address: null,
    evm_tx_hash: null,
    contact: null,
    created_at: "2026-07-01T00:00:00.000Z",
    updated_at: "2026-07-01T00:00:00.000Z",
    ...SHARED_AUTHOR,
    scan_verdict: "review",
    scan_risk: "low",
    scan_findings: [],
    scan_truncated: false,
    scan_scanned_at: "2026-07-01T00:00:00.000Z",
    scan_model: "google/gemini-2.5-flash-lite",
    scan_rubric_version: 1,
    cached_author_trust: DEFAULT_TRUST,
    cached_author_trust_summary: DEFAULT_TRUST_SUMMARY,
  })) as unknown as RepoSkillRow[]);
}

export function getFallbackEnrichedSkills(): EnrichedSkillRow[] {
  return (getFallbackRepoSkills().map((skill) => ({
    ...skill,
    source: "repo",
    payment_flow: "free",
    price_usdc_micros: "0",
    author_trust: DEFAULT_TRUST,
    author_trust_summary: DEFAULT_TRUST_SUMMARY,
    author_identity: null,
    signals: [
      {
        id: "trusted-author",
        label: "Trusted Author",
        detail: "Vouched by reputable authors on Robinhood Testnet",
        tone: "positive",
      },
      {
        id: "security-reviewed",
        label: "Security Reviewed",
        detail: "Automated scan passed with 0 high risk findings",
        tone: "positive",
      },
    ],
  })) as unknown as EnrichedSkillRow[]);
}

export function getFallbackSkillDetail(idOrSlug: string): SkillDetailSnapshot | null {
  const item = FALLBACK_SKILLS_DATA.find(
    (s) => s.id === idOrSlug || s.skill_id === idOrSlug || s.public_slug === idOrSlug
  );
  if (!item) return null;

  return ({
    id: item.id,
    skill_id: item.skill_id,
    public_slug: item.public_slug,
    public_author_slug: SHARED_AUTHOR.public_author_slug,
    author_pubkey: SHARED_AUTHOR.author_pubkey,
    author_kind: SHARED_AUTHOR.author_kind,
    author_handle: SHARED_AUTHOR.author_handle,
    author_display_name: SHARED_AUTHOR.author_display_name,
    publisher_identity_key: SHARED_AUTHOR.publisher_identity_key,
    publisher_tier: SHARED_AUTHOR.publisher_tier,
    name: item.name,
    description: item.description,
    tags: item.tags,
    current_version: item.version,
    chain_context: ROBINHOOD_TESTNET_CHAIN_CONTEXT,
    total_installs: item.installs,
    total_downloads: item.installs,
    total_revenue: item.revenue,
    price_usdc_micros: "0",
    created_at: "2026-07-01T00:00:00.000Z",
    updated_at: "2026-07-01T00:00:00.000Z",
    source: "repo",
    payment_flow: "free",
    content: `# ${item.name}\n\n${item.description}\n\n## Instructions\n\n1. Review the requirements and integration rules.\n2. Ensure the agent has appropriate runtime permissions.\n3. Execute safely in your environment.\n`,
    files: [
      {
        path: "SKILL.md",
        size: 512,
        executable: false,
      },
    ],
    has_executable: false,
    signals: [
      {
        id: "trusted-author",
        label: "Trusted Author",
        detail: "Vouched by reputable authors on Robinhood Testnet",
        tone: "positive",
      },
      {
        id: "security-reviewed",
        label: "Security Reviewed",
        detail: "Automated scan passed with 0 high risk findings",
        tone: "positive",
      },
    ],
    versions: [
      {
        version: item.version,
        published_at: "2026-07-01T00:00:00.000Z",
        ipfs_cid: null,
      },
    ],
    author_trust: DEFAULT_TRUST,
    author_trust_summary: DEFAULT_TRUST_SUMMARY,
    author_identity: null,
  } as unknown as SkillDetailSnapshot);
}
