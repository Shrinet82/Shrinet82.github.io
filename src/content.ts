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
    { name: 'App quality', tools: 'backend + frontend checks', time: '3m 09s', secs: 189 },
    { name: 'Build factory', tools: 'Docker · Trivy · SBOM', time: '10m 23s', secs: 623, flag: true },
    { name: 'Delivery', tools: 'AKS rollout', time: '2m 12s', secs: 132 },
    { name: 'Verification', tools: 'smoke test · OWASP ZAP', time: '6m 39s', secs: 399 },
  ],
}

export type Project = {
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
    title: 'RootCause',
    kind: 'Observability',
    line: 'A hydroponic farm run like a production service. Dosing cycles are traces; plant health has SLOs.',
    stat: '3 alert types',
    links: [{ label: 'Repo', href: `${GH}/rootcause-hydro` }],
  },
  {
    title: 'RepoSentinel',
    kind: 'Security',
    line: 'GitHub org webhooks into Kafka, Flink SQL rules, alerts in Slack within seconds.',
    links: [{ label: 'Repo', href: `${GH}/reposentinel` }],
  },
  {
    title: 'Fraud Detection MLOps',
    kind: 'MLOps',
    line: 'DVC, MLflow and CML on GKE, with drift, fairness and data-poisoning experiments.',
    links: [{ label: 'Repo', href: `${GH}/MLOPS-Full-Data-Pipeline` }],
  },
  {
    title: 'CaseMind',
    kind: 'Graph RAG',
    line: 'Evidence files become a 3D knowledge graph on Cognee. Built for the Cognee hackathon.',
    links: [{ label: 'Repo', href: `${GH}/CaseMind` }],
  },
  {
    title: 'AI SRE Agent v1',
    kind: 'AIOps',
    line: 'The first version: Prometheus alerts, an LLM decision, safe kubectl actions.',
    links: [
      { label: 'Case study', href: '/case-studies/ai-sre.html' },
      { label: 'Repo', href: `${GH}/ai-sre-agent` },
    ],
  },
  {
    title: 'Vendorroll',
    kind: 'Product',
    line: 'Multi-tenant vendor risk platform with a policy engine that reads like sentences.',
    links: [{ label: 'Live', href: 'https://vendorroll.vercel.app' }],
  },
]

export const upstream = [
  {
    where: 'Cognee',
    what: 'Native Langfuse and OpenTelemetry integration, with a span processor that maps Cognee spans to OTel GenAI conventions.',
    state: 'merged to main',
    href: 'https://github.com/topoteretes/cognee/commits?author=Shrinet82',
  },
  {
    where: 'LikeC4',
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
