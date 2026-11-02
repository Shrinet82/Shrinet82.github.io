// Every fact here comes from the resume or a project README. Numbers are
// measured values from those sources; nothing is rounded up or invented.

const GH = 'https://github.com/Shrinet82'

export const profile = {
  name: 'Shashwat Pratap Singh',
  short: 'Shashwat',
  role: 'DevOps & Platform Engineer',
  location: 'Gorakhpur, India',
  email: 'shashwat.pratap94550@gmail.com',
  github: GH,
  linkedin: 'https://www.linkedin.com/in/shashwat-pratap-singh-a2b984230',
  availability: 'Open to contract work and full-time Platform, SRE or DevOps roles',
}

export const chapters = [
  { id: 'top', num: '00', label: 'Incident' },
  { id: 'provision', num: '01', label: 'Provision' },
  { id: 'ship', num: '02', label: 'Ship' },
  { id: 'govern', num: '03', label: 'Govern' },
  { id: 'heal', num: '04', label: 'Heal' },
  { id: 'elsewhere', num: '05', label: 'Elsewhere' },
  { id: 'proof', num: '06', label: 'Proof' },
  { id: 'contact', num: '07', label: 'Pager' },
]

// The Aegis Observe demo loop, step by step. Relative timestamps; the
// workload, signatures and Slack actions are the ones in the project README.
export type LogLine = { t: string; src: string; msg: string; tone?: 'err' | 'ok' | 'amber' | 'dim' }
export const incident: LogLine[] = [
  { t: '+00s', src: 'alert', msg: 'fraud-detection-api · 504 SLO breach', tone: 'err' },
  { t: '+01s', src: 'signoz', msg: 'mcp: signoz_search_logs "504" in oppe2-app', tone: 'dim' },
  { t: '+03s', src: 'agent', msg: 'rule matched. asking the LLM to pick one tool' },
  { t: '+04s', src: 'agent', msg: 'proposal: patch the fraud-api manifest. confidence gate passed', tone: 'amber' },
  { t: '+04s', src: 'slack', msg: '#incidents  [ Approve ]  [ PR ]  [ Reject ]' },
  { t: '+31s', src: 'human', msg: 'clicked PR', tone: 'dim' },
  { t: '+33s', src: 'git', msg: 'pull request opened with the LLM reasoning attached' },
  { t: '+38s', src: 'argocd', msg: 'merged. flagship-gitops synced', tone: 'ok' },
  { t: '+40s', src: 'agent', msg: 'verified. span exported with token cost', tone: 'ok' },
]

export const provision = {
  rows: [
    { what: 'S3 bucket', before: 45, after: 8 },
    { what: 'VPC + subnets', before: 60, after: 12 },
    { what: 'App on Kubernetes', before: 30, after: 10 },
  ],
  oldWay: ['write Terraform', 'open a ticket', 'wait for review', 'plan', 'apply', 'register it somewhere'],
  newWay: 'Fill one Backstage form. Terraform runs through GitHub Actions with OIDC keyless auth, Infracost gates the cost, and the resource lands in the catalog by itself.',
}

export const pipeline = {
  total: '32m 52s',
  stages: [
    { name: 'Security gates', tools: 'Gitleaks · Checkov', time: '4m 26s', secs: 266 },
    { name: 'App quality', tools: 'backend + frontend', time: '3m 09s', secs: 189 },
    { name: 'Build factory', tools: 'Docker · Trivy · SBOM', time: '10m 23s', secs: 623, flag: true },
    { name: 'Delivery', tools: 'AKS rollout', time: '2m 12s', secs: 132 },
    { name: 'Verification', tools: 'smoke test · OWASP ZAP', time: '6m 39s', secs: 399 },
  ],
}

export type Glyph = 'roc' | 'trace' | 'stream' | 'drift' | 'graph' | 'pods' | 'rule'

export type Project = {
  glyph?: Glyph
  caption?: string
  title: string
  kind: string
  line: string
  stat?: string
  links: { label: string; href: string }[]
}

export const repos = {
  opsie: [
    { label: 'Case study', href: '/case-studies/opsie.html' },
    { label: 'Portal repo', href: `${GH}/Opsie-IDP-BackStage` },
    { label: 'Infra repo', href: `${GH}/Opsie-backstage-infra` },
  ],
  devsecops: [
    { label: 'Case study', href: '/case-studies/devsecops.html' },
    { label: 'Repo', href: `${GH}/zero-trust-devsecops` },
  ],
  aegis: [
    { label: 'Case study', href: '/case-studies/aegis.html' },
    { label: 'Repo', href: `${GH}/Aegis-Governance-PaC` },
  ],
  observe: [{ label: 'Repo', href: `${GH}/Aegis-Observe-SRE-agent` }],
}

export const healSteps = [
  { verb: 'Detect', what: 'SigNoz MCP searches logs and traces for known signatures: OOMKilled, 504, drift detected.' },
  { verb: 'Decide', what: 'An LLM picks exactly one remediation tool. Low confidence stops here.' },
  { verb: 'Ask', what: 'A Slack card offers Approve, PR or Reject. A lock holds the incident while it waits.' },
  { verb: 'Fix', what: 'Tier 1 pushes straight to main. Tier 2 opens a pull request with the reasoning.' },
  { verb: 'Verify', what: 'ArgoCD syncs. The agent traces itself in OpenTelemetry, token cost included.' },
]

export const elsewhere: Project[] = [
  {
    glyph: 'roc',
    caption: 'fig. ROC curve on held-out data, AUC 0.78',
    title: 'Credit Risk MLOps',
    kind: 'MLOps',
    line: 'Kubeflow pipelines with validation gates, KServe serving, MLflow tracking on K3s.',
    stat: 'AUC 0.78',
    links: [
      { label: 'Case study', href: '/case-studies/mlops.html' },
      { label: 'Repo', href: `${GH}/ML-OPS` },
    ],
  },
  {
    glyph: 'trace',
    caption: 'fig. one nutrient-dosing cycle, drawn as a trace',
    title: 'RootCause',
    kind: 'Observability',
    line: 'A hydroponic farm run like a production service. Dosing cycles are traces; plant health has SLOs.',
    stat: '3 alert types',
    links: [{ label: 'Repo', href: `${GH}/rootcause-hydro` }],
  },
  {
    glyph: 'stream',
    caption: 'fig. a force-push, flagged as the events stream past',
    title: 'RepoSentinel',
    kind: 'Security',
    line: 'GitHub org webhooks into Kafka, Flink SQL rules, alerts in Slack within seconds.',
    links: [{ label: 'Repo', href: `${GH}/reposentinel` }],
  },
  {
    glyph: 'drift',
    caption: 'fig. a feature distribution drifting between datasets',
    title: 'Fraud Detection MLOps',
    kind: 'MLOps',
    line: 'DVC, MLflow and CML on GKE, with drift, fairness and data-poisoning experiments.',
    links: [{ label: 'Repo', href: `${GH}/MLOPS-Full-Data-Pipeline` }],
  },
  {
    glyph: 'graph',
    caption: 'fig. people and organisations linked from case files',
    title: 'CaseMind',
    kind: 'Graph RAG',
    line: 'Evidence files become a 3D knowledge graph on Cognee. Built for the Cognee hackathon.',
    links: [{ label: 'Repo', href: `${GH}/CaseMind` }],
  },
  {
    glyph: 'pods',
    caption: 'fig. 4 restarts in 5 minutes, then a rollout restart',
    title: 'AI SRE Agent v1',
    kind: 'AIOps',
    line: 'The first version: Prometheus alerts, an LLM decision, safe kubectl actions.',
    links: [
      { label: 'Case study', href: '/case-studies/ai-sre.html' },
      { label: 'Repo', href: `${GH}/ai-sre-agent` },
    ],
  },
  {
    glyph: 'rule',
    caption: 'fig. a vendor policy that reads like a sentence',
    title: 'Vendorroll',
    kind: 'Product',
    line: 'Multi-tenant vendor risk platform with a policy engine that reads like sentences.',
    links: [{ label: 'Live', href: 'https://vendorroll.vercel.app' }],
  },
]

// The hero's margin ledger: the numbers worth leading with.
export const ledger = [
  { big: '−82%', what: 'S3 provisioning time', note: '45 → 8 min on OPSIE' },
  { big: '< 2 min', what: 'runaway-resource cleanup', note: 'was 4 to 24 hours' },
  { big: '1st', what: 'Agents of SigNoz', note: 'Aegis Observe' },
  { big: '4', what: 'engineering teams', note: 'on platforms I built' },
]

// Pull requests sent to projects whose tools I use every day. Opened, not
// merged: said plainly so nobody has to check.
export const sent = [
  { where: 'Trivy', stars: '39k★', what: 'Removed an unused Insecure field from the RPC ServiceOption.', href: 'https://github.com/aquasecurity/trivy/pull/10169' },
  { where: 'Tracee', stars: '4.7k★', what: 'Mainline-kernel testing in CI through QEMU, and a fix for a flaky engine test.', href: 'https://github.com/aquasecurity/tracee/pull/5233' },
  { where: 'OpenClaw', stars: '394k★', what: 'Container vulnerability scanning before images are pushed.', href: 'https://github.com/openclaw/openclaw/pull/7438' },
]

export const upstream = [
  {
    where: 'Cognee',
    stars: '33k★',
    what: 'Native Langfuse and OpenTelemetry integration, with a span processor that maps Cognee spans to OTel GenAI conventions.',
    state: 'merged to main',
    href: 'https://github.com/topoteretes/cognee/commits?author=Shrinet82',
  },
  {
    where: 'LikeC4',
    stars: '6k★',
    what: 'Test coverage for the $exclude predicate in deployment views.',
    state: 'PR #2576 merged',
    href: 'https://github.com/likec4/likec4/pull/2576',
  },
  {
    where: 'IEEE IoT-SIU 2025',
    what: 'ResCNN intrusion detection for IoT and WSN networks on N-BaIoT. 87.49% accuracy.',
    state: 'published',
    href: 'https://ieeexplore.ieee.org/document/11402860',
  },
]

export const awards = [
  { what: 'Agents of SigNoz Hackathon', note: '1st place, Aegis Observe' },
  { what: 'Hangover Part 1 Hackathon', note: 'PR track, top 20' },
  { what: 'Smart India Hackathon', note: 'Finalist' },
  { what: 'Patent, co-filed', note: 'Assistive technology' },
  { what: "Vice-Chancellor's Award", note: 'Chandigarh University' },
]

export const certs = [
  'OCI DevOps Professional',
  'OCI Architect Associate',
  'OCI Generative AI Professional',
  'Oracle AI Vector Search Professional',
  'Linux Foundation LFS162',
  'Canonical Ubuntu Linux Professional',
  'Google Cloud Foundations',
  'Docker Foundations',
  'PagerDuty DevOps',
]

export const stack = [
  ['Cloud', 'OCI, GKE, AKS, AWS'],
  ['Platform', 'Kubernetes, Helm, ArgoCD, Backstage'],
  ['IaC', 'Terraform, Cloud Custodian, OPA Gatekeeper'],
  ['CI/CD', 'GitHub Actions, GitLab CI, Azure Pipelines, Jenkins'],
  ['Signals', 'OpenTelemetry, SigNoz, Prometheus, Grafana, Loki'],
  ['Security', 'Trivy, Checkov, Gitleaks, OWASP ZAP'],
  ['MLOps', 'Kubeflow, KServe, MLflow, DVC'],
  ['Code', 'Python, Bash'],
]

export const education = 'B.E. Electronics & Telecommunication, Chandigarh University, 2021 to 2025'

// Short verses that open each plate. Placeholders in the site's voice;
// replace with your own poems whenever you like.
export const verses = {
  provision: ['A bucket used to take an afternoon,', 'three people, and a ticket no one read.', 'Now it takes a form.'],
  ship: ['One belt, five checks, and every one asks a question.', 'The image does not get to lie at any of them.'],
  govern: ['The glitch kept making buckets in the dark.', 'A rule woke up before anyone had to.'],
  heal: ['It notices. It proposes. It waits for a yes,', 'then writes the fix down in Git,', 'where everything worth keeping is kept.'],
}

// Captions for the pinned films. `at` is the composition frame where each
// step begins; the caption under a film follows the scroll with it.
export type FilmStep = { at: number; title: string; text: string }
export const filmSteps: Record<'golden' | 'conveyor' | 'lighthouse' | 'loop', FilmStep[]> = {
  golden: [
    { at: 0, title: 'The queue', text: 'Every bucket was a ticket: six manual steps and 45 minutes of waiting.' },
    { at: 150, title: 'One form', text: 'Instead, a developer fills one Backstage golden-path form.' },
    { at: 200, title: 'The pipeline', text: 'Terraform plans, Infracost checks the budget, OIDC applies with no stored keys.' },
    { at: 252, title: 'Catalogued', text: 'It lands in the catalog. S3 in 8 minutes, a VPC in 12, an app on Kubernetes in 10.' },
  ],
  conveyor: [
    { at: 0, title: 'Security gates', text: 'Gitleaks and Checkov: no secrets in the code, no holes in the IaC.' },
    { at: 120, title: 'App quality', text: 'Probes drop in: backend and frontend checks both have to pass.' },
    { at: 200, title: 'Build factory', text: 'Trivy X-rays every layer. Two critical CVEs in the dependencies: upgraded, rebuilt, SBOM printed.' },
    { at: 310, title: 'Delivery', text: 'The crane loads the image onto the cluster: a rollout to AKS.' },
    { at: 400, title: 'Verification', text: 'OWASP ZAP and a smoke test against the running app. Secrets arrive from Key Vault.' },
  ],
  lighthouse: [
    { at: 0, title: 'The glitch', text: 'A platform glitch keeps creating buckets and servers. One has SSH open to the world.' },
    { at: 145, title: 'Mark', text: 'The Aegis lighthouse runs Cloud Custodian: everything that breaks a rule gets tagged.' },
    { at: 232, title: 'Sweep', text: 'The sweep removes the strays and revokes the open SSH rule, with an audit trail.' },
    { at: 290, title: 'Contained', text: 'Under 2 minutes, 0 manual steps. The on-call path would still be on step two.' },
  ],
  loop: [
    { at: 0, title: 'Detect', text: 'A 504 spike. The agent searches SigNoz logs for known signatures.' },
    { at: 100, title: 'Decide', text: 'An LLM picks exactly one remediation. Low confidence stops it here.' },
    { at: 200, title: 'Ask', text: 'A Slack card offers Approve, PR or Reject. The incident stays locked until a human answers.' },
    { at: 300, title: 'Fix', text: 'A pull request with the reasoning, merged and synced by ArgoCD.' },
    { at: 400, title: 'Verify', text: 'Latency back under the SLO, and the agent traces itself in OpenTelemetry.' },
  ],
}

export const plates = [
  { id: 'provision', roman: 'I', label: 'Provision' },
  { id: 'ship', roman: 'II', label: 'Ship' },
  { id: 'govern', roman: 'III', label: 'Govern' },
  { id: 'heal', roman: 'IV', label: 'Heal' },
  { id: 'studies', roman: 'V', label: 'Studies' },
  { id: 'catalogue', roman: 'VI', label: 'Catalogue' },
  { id: 'contact', roman: 'VII', label: 'Letters' },
]
