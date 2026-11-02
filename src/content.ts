// Every fact here comes from the resume, a project README or GitHub itself.
// Numbers are the measured values from those sources; the swagger is ours.

const GH = 'https://github.com/Shrinet82'

export const profile = {
  name: 'Shashwat Pratap Singh',
  handle: 'shrinet82',
  role: 'DevOps & Platform Engineer',
  location: 'Gorakhpur, India · remote',
  email: 'shashwat.pratap94550@gmail.com',
  github: GH,
  linkedin: 'https://www.linkedin.com/in/shashwat-pratap-singh-a2b984230',
}

export const nav = [
  { href: '#work', label: 'Work' },
  { href: '#lab', label: 'Lab' },
  { href: '#upstream', label: 'Open source' },
  { href: '#record', label: 'Record' },
]

export const headline = {
  lines: ['I build the platform.', 'Your team just ships.'],
  sub: 'Independent DevOps and platform engineer. Golden-path IDPs, GitOps delivery, policy-as-code guardrails, and an AI SRE agent that fixes production through pull requests. It took first place at the Agents of SigNoz hackathon.',
}

export const stats = [
  { big: '−82%', label: 'S3 provisioning time', note: '45 min → 8 min on OPSIE' },
  { big: '<2 min', label: 'runaway-resource cleanup', note: 'down from 4–24 hours' },
  { big: '#1', label: 'Agents of SigNoz', note: '1st place, Aegis Observe' },
  { big: '4', label: 'engineering teams', note: 'shipping on platforms I built' },
]

export type Step = { title: string; body: string }
export type Feature = {
  id: string
  scene: 'observe' | 'opsie' | 'govern' | 'gates'
  index: string
  kicker: string
  name: string
  pitch: string
  badge?: string
  steps: Step[]
  stack: string[]
  links: { label: string; href: string }[]
}

export const features: Feature[] = [
  {
    id: 'aegis-observe',
    scene: 'observe',
    index: '01',
    kicker: 'AI SRE copilot',
    name: 'Aegis Observe',
    badge: '1st place · Agents of SigNoz',
    pitch: 'An on-call engineer that never sleeps and never pushes to prod without asking. It reads SigNoz, picks one fix, waits for a human yes in Slack, then lands the change through GitOps.',
    steps: [
      { title: 'Detect', body: 'Rule-based signals over SigNoz through MCP: log signatures like 504, OOMKilled and drift, plus Kubernetes status.' },
      { title: 'Decide', body: 'An LLM chooses exactly one remediation tool. A confidence gate and a circuit-breaker lock stop it from thrashing.' },
      { title: 'Ask', body: 'A Slack Block Kit card offers Approve, PR or Reject. Nothing touches the cluster without a click.' },
      { title: 'Fix', body: 'Tier 1 commits straight to main. Tier 2 opens a pull request with the LLM’s reasoning attached. ArgoCD syncs it.' },
      { title: 'Prove', body: 'The agent traces itself with OpenTelemetry, LLM token cost included, and remembers incidents in Qdrant.' },
    ],
    stack: ['Kubernetes', 'SigNoz', 'OpenTelemetry', 'ArgoCD', 'Slack', 'Qdrant', 'Python'],
    links: [
      { label: 'Repo', href: `${GH}/Aegis-Observe-SRE-agent` },
      { label: 'GitOps repo', href: `${GH}/flagship-gitops` },
    ],
  },
  {
    id: 'opsie',
    scene: 'opsie',
    index: '02',
    kicker: 'Internal developer platform',
    name: 'OPSIE',
    pitch: 'Tickets out, golden paths in. One Backstage form provisions real cloud infrastructure across AWS and Azure, checks what it will cost, and files itself in the catalog.',
    steps: [
      { title: 'Ask', body: 'A developer fills one Backstage template. No Terraform to write, no ticket to chase.' },
      { title: 'Plan', body: 'GitHub Actions runs parameterised Terraform with OIDC keyless auth. No long-lived cloud keys anywhere.' },
      { title: 'Gate', body: 'Infracost prices the plan before apply. Over budget means it stops.' },
      { title: 'Land', body: 'The resource is registered in the Backstage catalog on every provision, with owner and cost-centre tags.' },
    ],
    stack: ['Backstage', 'Terraform', 'ArgoCD', 'GitHub Actions OIDC', 'Infracost', 'AWS', 'Azure'],
    links: [
      { label: 'Portal repo', href: `${GH}/Opsie-IDP-BackStage` },
      { label: 'Infra repo', href: `${GH}/Opsie-backstage-infra` },
    ],
  },
  {
    id: 'aegis-governance',
    scene: 'govern',
    index: '03',
    kicker: 'Policy-as-code governance',
    name: 'Aegis Governance',
    pitch: 'A cloud immune system. When a platform glitch started spawning S3 buckets and EC2 instances nobody owned, Aegis found them and cleared them before a human could have opened the console.',
    steps: [
      { title: 'Runaway', body: 'Untagged resources multiply. Each one is cost leakage or an open door.' },
      { title: 'Policy', body: 'Cloud Custodian rules in YAML: tagging, cost controls, insecure security groups. Reviewed like any other code.' },
      { title: 'Mark', body: 'Offenders are tagged for action with a grace period, so an admin can still say “wait”.' },
      { title: 'Sweep', body: 'The sweeper deletes what is still non-compliant. Remediation went from 4–24 hours to under 2 minutes.' },
    ],
    stack: ['Cloud Custodian', 'AWS Lambda', 'EventBridge', 'CloudTrail', 'Powerpipe', 'Azure'],
    links: [{ label: 'Repo', href: `${GH}/Aegis-Governance-PaC` }],
  },
  {
    id: 'zero-trust',
    scene: 'gates',
    index: '04',
    kicker: 'DevSecOps pipeline',
    name: 'Zero-Trust on AKS',
    pitch: 'Five stages, every one of them allowed to say no. Secrets, IaC, image and runtime scanning gate the release, and it still goes from commit to live in 32 minutes 52 seconds.',
    steps: [
      { title: 'Gates', body: 'Gitleaks and Checkov run before anything is built.' },
      { title: 'Build', body: 'Docker build, Trivy image scan and a CycloneDX SBOM for backend and frontend.' },
      { title: 'Catch', body: 'Trivy found two CRITICAL CVEs in h11 and httpx. Patched, rebuilt, re-scanned to zero.' },
      { title: 'Ship', body: 'AKS rollout, smoke tests and an OWASP ZAP scan. Secrets arrive at runtime from Key Vault via CSI.' },
    ],
    stack: ['Azure Pipelines', 'AKS', 'ACR', 'Trivy', 'Checkov', 'Gitleaks', 'OWASP ZAP', 'Key Vault'],
    links: [{ label: 'Repo', href: `${GH}/zero-trust-devsecops` }],
  },
]

export type LabItem = { name: string; kind: string; line: string; tags: string[]; href: string; flag?: string }

export const lab: LabItem[] = [
  {
    name: 'RootCause',
    kind: 'Observability',
    line: 'A hydroponic farm run like a production service. Every nutrient-dosing cycle is a distributed trace, plant health has SLOs, and alerts page you before the plants die.',
    tags: ['OpenTelemetry', 'SigNoz', 'FastAPI'],
    href: `${GH}/rootcause-hydro`,
    flag: 'Agents of SigNoz',
  },
  {
    name: 'Credit Risk MLOps',
    kind: 'MLOps',
    line: 'Train, validate, serve and watch credit-risk models on Kubernetes. Kubeflow pipelines with validation gates, KServe autoscaling under load, AUC-ROC 0.78.',
    tags: ['Kubeflow', 'KServe', 'MLflow', 'K3s'],
    href: `${GH}/ML-OPS`,
  },
  {
    name: 'RepoSentinel',
    kind: 'Streaming security',
    line: 'GitHub org webhooks into Kafka, evaluated live with Flink SQL. Force-pushes to main, edited CI workflows and new admins hit Slack in seconds.',
    tags: ['Confluent', 'Kafka', 'Flink SQL'],
    href: `${GH}/reposentinel`,
  },
  {
    name: 'Fraud Detection MLOps',
    kind: 'MLOps on GKE',
    line: 'DVC, MLflow and CML on GitHub Actions, served from GKE with HPA, traced with OpenTelemetry. Drift, fairness and data-poisoning experiments included.',
    tags: ['GKE', 'DVC', 'CML', 'Evidently'],
    href: `${GH}/MLOPS-Full-Data-Pipeline`,
  },
  {
    name: 'Decision Trace',
    kind: 'Graph + MCP',
    line: 'Ask why any decision was made. Tickets, ADRs and meeting notes in one FalkorDB graph, answered with the evidence path and an MCP endpoint for agents.',
    tags: ['FalkorDB', 'Cognee', 'MCP'],
    href: `${GH}/decision-trace`,
    flag: 'FalkorDB Hackathon',
  },
  {
    name: 'ShipMate',
    kind: 'Platform tooling',
    line: 'Describe an app, get a validated zerops.yaml and a live architecture map. It deploys itself on the five-service stack it generates.',
    tags: ['Zerops', 'Postgres', 'Valkey'],
    href: `${GH}/ShipMate`,
    flag: 'Zerops Challenge',
  },
  {
    name: 'Homelab + GitOps',
    kind: 'Infrastructure',
    line: 'The cluster behind the demos: k3s homelab, AIOps and MLOps stacks, dashboards backed up as code, all synced from an ArgoCD root app.',
    tags: ['k3s', 'ArgoCD', 'Grafana'],
    href: `${GH}/homelab-infra`,
  },
  {
    name: 'CaseMind',
    kind: 'Graph RAG',
    line: 'Legal evidence in, a persistent 3D knowledge graph out. People, organisations and timelines extracted with Cognee.',
    tags: ['Cognee', 'FastAPI', 'React'],
    href: `${GH}/CaseMind`,
    flag: 'Cognee Hackathon',
  },
]

export type Upstream = { project: string; stars: string; what: string; state: 'merged' | 'opened'; href: string }

export const upstream: Upstream[] = [
  {
    project: 'Cognee',
    stars: '33k',
    what: 'Wired Langfuse natively into Cognee’s OpenTelemetry pipeline, with a span processor that maps spans to OTel GenAI conventions so LLM calls show up as proper generations.',
    state: 'merged',
    href: 'https://github.com/topoteretes/cognee/commits?author=Shrinet82',
  },
  {
    project: 'LikeC4',
    stars: '6k',
    what: 'Test coverage for the $exclude predicate in deployment views. PR #2576.',
    state: 'merged',
    href: 'https://github.com/likec4/likec4/pull/2576',
  },
  {
    project: 'Tracee',
    stars: '4.7k',
    what: 'Mainline-kernel testing in CI via QEMU, and a fix for a flaky engine test.',
    state: 'opened',
    href: 'https://github.com/aquasecurity/tracee/pull/5233',
  },
  {
    project: 'Trivy',
    stars: '39k',
    what: 'Removed an unused Insecure field from the RPC ServiceOption.',
    state: 'opened',
    href: 'https://github.com/aquasecurity/trivy/pull/10169',
  },
  {
    project: 'OpenClaw',
    stars: '394k',
    what: 'Container vulnerability scanning before images are pushed.',
    state: 'opened',
    href: 'https://github.com/openclaw/openclaw/pull/7438',
  },
]

export const experience = {
  role: 'Independent DevOps Consultant',
  where: 'SaaS startups and internal tooling teams · remote',
  when: 'Jan 2025 – now',
  points: [
    'Architected an internal developer platform on Backstage and Terraform. Four engineering teams now self-serve infrastructure instead of filing tickets.',
    'Golden-path templates cut S3 provisioning by 82% (45m → 8m) and VPC setup by 80% (60m → 12m).',
    'Replaced hand-run deploy scripts with ArgoCD GitOps: audit-friendly, with safe rollbacks.',
    'Killed a runaway-resource incident with Cloud Custodian auto-remediation: 4–24 hours down to under 2 minutes.',
    'Put secrets, IaC and container scanning in CI so high-risk releases are blocked before they deploy.',
    'Stood up Prometheus, Grafana and Loki with dashboards and alerts people actually use during incidents.',
  ],
}

export const stack: [string, string[]][] = [
  ['Cloud', ['AWS', 'Azure', 'GCP', 'OCI']],
  ['Platform', ['Kubernetes', 'Helm', 'ArgoCD', 'Backstage', 'Docker']],
  ['IaC + policy', ['Terraform', 'Cloud Custodian', 'OPA Gatekeeper']],
  ['CI/CD', ['GitHub Actions', 'Azure Pipelines', 'GitLab CI', 'Jenkins']],
  ['Observability', ['OpenTelemetry', 'SigNoz', 'Prometheus', 'Grafana', 'Loki']],
  ['Security', ['Trivy', 'Checkov', 'Gitleaks', 'OWASP ZAP']],
  ['MLOps', ['Kubeflow', 'KServe', 'MLflow', 'DVC']],
  ['Code', ['Python', 'Bash', 'TypeScript']],
]

export const wins = [
  { what: 'Agents of SigNoz Hackathon', note: '1st place · Aegis Observe' },
  { what: 'Hangover Part 1 Hackathon', note: 'PR track winner · top 20' },
  { what: 'Smart India Hackathon', note: 'Finalist' },
  { what: 'IEEE IoT-SIU 2025', note: 'Published · ResCNN IoT intrusion detection, 87.49%', href: 'https://ieeexplore.ieee.org/document/11402860' },
  { what: 'Patent, co-filed', note: 'Assistive technology, university robotics dept.' },
  { what: "Vice-Chancellor's Award", note: 'Chandigarh University' },
]

export const certs = [
  'OCI DevOps Professional',
  'OCI Architect Associate',
  'OCI Generative AI Professional',
  'Oracle AI Vector Search Professional',
  'Linux Foundation LFS162 · DevOps & SRE',
  'Canonical Ubuntu Linux Professional',
  'Google Cloud Foundations',
  'Docker Foundations',
  'PagerDuty DevOps',
]

export const education = 'B.E. Electronics & Telecommunication · Chandigarh University · 2021–2025'
