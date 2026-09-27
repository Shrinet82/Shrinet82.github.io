// Every claim on the site comes from the resume or the project READMEs.
// Keep numbers here in sync with those sources.

const GH = 'https://github.com/Shrinet82'

export const profile = {
  name: 'Shashwat Pratap Singh',
  handle: 'Shrinet82',
  role: 'Independent DevOps & Platform Engineer',
  location: 'Gorakhpur, India',
  email: 'shashwat.pratap94550@gmail.com',
  github: GH,
  linkedin: 'https://www.linkedin.com/in/shashwat-pratap-singh-a2b984230',
  availability: 'Open to contract work & full-time Platform / SRE / DevOps roles',
}

export const stats = [
  { value: '4', unit: 'teams', label: 'running on platforms I built' },
  { value: '82%', unit: 'faster', label: 'S3 provisioning, 45m → 8m' },
  { value: '<2', unit: 'min', label: 'runaway-resource remediation, down from 4–24h' },
  { value: '1st', unit: 'place', label: 'Agents of SigNoz hackathon' },
]

export const experience = {
  title: 'Independent DevOps Consultant',
  org: 'SaaS startups & internal tooling teams · Remote',
  period: 'Jan 2025 — Present',
  groups: [
    {
      heading: 'Platform',
      points: [
        'Architected an Internal Developer Platform on Backstage + Terraform, giving 4 engineering teams self-service infrastructure.',
        'Golden-path templates cut S3 provisioning 82% (45m → 8m) and VPC setup 80% (60m → 12m).',
        'Replaced manual deploy scripts with ArgoCD GitOps: audit-friendly pipelines and safer rollbacks.',
      ],
    },
    {
      heading: 'Governance',
      points: [
        'Built Aegis, a Cloud Custodian governance engine enforcing tagging, cost controls and policy guardrails.',
        'Contained a runaway-resource incident (a platform glitch spawning S3 buckets and EC2 instances): remediation went from 4–24 hours to under 2 minutes.',
      ],
    },
    {
      heading: 'Security & reliability',
      points: [
        'Added secrets, IaC and container scanning to CI/CD to block high-risk releases before deploy.',
        'Stood up Prometheus + Grafana + Loki with dashboards and alerting for faster incident response.',
      ],
    },
  ],
}

export type Project = {
  id: string
  kicker: string
  title: string
  blurb: string
  metrics: { value: string; label: string }[]
  stack: string[]
  links: { label: string; href: string }[]
  badge?: string
  hue: string
}

export const projects: Project[] = [
  {
    id: 'aegis-observe',
    kicker: 'AI SRE · Observability',
    title: 'Aegis Observe',
    badge: '1st Place · Agents of SigNoz',
    blurb:
      'An SRE copilot that detects incidents from SigNoz / OpenTelemetry signals, lets an LLM pick the remediation behind confidence and Slack human-in-the-loop gates, then commits the fix through tiered GitOps: direct push or pull request.',
    metrics: [
      { value: '5/5', label: 'SigNoz pillars: traces, metrics, logs, dashboards, alerts' },
      { value: 'OTel', label: 'self-traced, incl. LLM token-cost spans' },
    ],
    stack: ['Kubernetes', 'SigNoz', 'OpenTelemetry', 'ArgoCD', 'Qdrant', 'Slack', 'Python'],
    links: [{ label: 'Repository', href: `${GH}/Aegis-Observe-SRE-agent` }],
    hue: '#8b5cf6',
  },
  {
    id: 'opsie',
    kicker: 'Internal Developer Platform',
    title: 'OPSIE',
    blurb:
      'Self-service golden paths for multi-cloud provisioning (AWS + Azure): parameterised Terraform with OIDC keyless auth and Infracost cost-gating. Every provision auto-registers in the Backstage catalog.',
    metrics: [
      { value: '45→8m', label: 'S3 bucket provisioning' },
      { value: '60→12m', label: 'VPC + subnets' },
    ],
    stack: ['Backstage', 'Terraform', 'ArgoCD', 'GitHub Actions OIDC', 'AWS', 'Azure'],
    links: [
      { label: 'Case study', href: '/case-studies/opsie.html' },
      { label: 'Portal', href: `${GH}/Opsie-IDP-BackStage` },
      { label: 'Infra', href: `${GH}/Opsie-backstage-infra` },
    ],
    hue: '#22d3ee',
  },
  {
    id: 'aegis',
    kicker: 'Policy-as-Code Governance',
    title: 'Project Aegis',
    blurb:
      'A cloud immune system for AWS & Azure. Cloud Custodian policies find orphaned "zombie" resources and insecure rules, then mark, sweep and revoke them automatically, with an audit trail.',
    metrics: [
      { value: '<2 min', label: 'detect → remediate, from 4–24h' },
      { value: '0', label: 'manual steps per incident' },
    ],
    stack: ['Cloud Custodian', 'AWS', 'Azure', 'Python', 'OIDC'],
    links: [
      { label: 'Case study', href: '/case-studies/aegis.html' },
      { label: 'Repository', href: `${GH}/Aegis-Governance-PaC` },
    ],
    hue: '#f97316',
  },
  {
    id: 'devsecops',
    kicker: 'DevSecOps · Azure',
    title: 'Zero-Trust DevSecOps',
    blurb:
      'A 5-stage Azure DevOps pipeline: secrets scan, IaC scan, container scan, SBOM and DAST, with severity-gated releases to AKS and runtime secrets from Key Vault CSI.',
    metrics: [
      { value: '32m 52s', label: 'commit → verified deploy' },
      { value: '2', label: 'critical CVEs found & fixed' },
    ],
    stack: ['AKS', 'ACR', 'Azure Pipelines', 'Trivy', 'Checkov', 'Gitleaks', 'OWASP ZAP'],
    links: [
      { label: 'Case study', href: '/case-studies/devsecops.html' },
      { label: 'Repository', href: `${GH}/zero-trust-devsecops` },
    ],
    hue: '#10b981',
  },
  {
    id: 'mlops',
    kicker: 'MLOps · Kubernetes',
    title: 'Credit Risk MLOps',
    blurb:
      'Train, validate, serve and monitor credit-default models on K3s. Kubeflow Pipelines with validation gates, KServe inference with autoscaling, and MLflow experiment tracking.',
    metrics: [
      { value: '0.78', label: 'AUC-ROC on held-out set' },
      { value: '~5 min', label: 'automated model deploy' },
    ],
    stack: ['K3s', 'Kubeflow', 'KServe', 'MLflow', 'MinIO', 'Prometheus', 'Grafana'],
    links: [
      { label: 'Case study', href: '/case-studies/mlops.html' },
      { label: 'Repository', href: `${GH}/ML-OPS` },
    ],
    hue: '#eab308',
  },
  {
    id: 'rootcause',
    kicker: 'Observability · Digital Twin',
    title: 'RootCause',
    blurb:
      'A physics-based digital twin of a hydroponic farm, run like a production service. Dosing cycles become distributed traces, and plant health gets SLOs, error budgets and predictive alerts.',
    metrics: [
      { value: '3', label: 'alert types: threshold, anomaly, predictive' },
      { value: 'as code', label: 'dashboards & alerts on SigNoz' },
    ],
    stack: ['Python', 'OpenTelemetry', 'SigNoz', 'FastAPI', 'Docker'],
    links: [{ label: 'Repository', href: `${GH}/rootcause-hydro` }],
    hue: '#34d399',
  },
]

export const moreBuilds = [
  {
    title: 'RepoSentinel',
    blurb: 'Real-time GitHub security monitor: org webhooks → Kafka → Flink SQL rules → Slack/Discord.',
    href: `${GH}/reposentinel`,
  },
  {
    title: 'CaseMind',
    blurb: 'Graph-RAG investigative memory on Cognee: evidence to a 3D knowledge graph. Cognee hackathon.',
    href: `${GH}/CaseMind`,
  },
  {
    title: 'Fraud Detection MLOps',
    blurb: 'DVC + MLflow + CML on GKE, with drift (Evidently), fairness (Fairlearn/SHAP) and poisoning tests.',
    href: `${GH}/MLOPS-Full-Data-Pipeline`,
  },
  {
    title: 'AI SRE Agent (v1)',
    blurb: 'The first Kubernetes self-healing agent: Prometheus alerts → LLM decision → safe kubectl actions.',
    href: `${GH}/ai-sre-agent`,
  },
  {
    title: 'Vendorroll',
    blurb: 'Multi-tenant vendor risk & compliance platform with a sentence-style policy engine.',
    href: 'https://vendorroll.vercel.app',
  },
  {
    title: 'AudiencePulse',
    blurb: 'AI creator-vetting SaaS: trust scores and audience DNA from YouTube comment analysis.',
    href: `${GH}/audiencepulse`,
  },
]

export const openSource = [
  {
    project: 'Cognee',
    what: 'AI memory engine',
    detail:
      'Landed a native Langfuse ↔ OpenTelemetry integration: a config surface plus a span processor mapping Cognee spans to OTel GenAI semantic conventions. Merged to main.',
    href: 'https://github.com/topoteretes/cognee/commits?author=Shrinet82',
  },
  {
    project: 'LikeC4',
    what: 'Architecture-as-code',
    detail: 'Merged PR #2576: test coverage for the $exclude predicate in deployment views.',
    href: 'https://github.com/likec4/likec4/pull/2576',
  },
]

export const recognition = [
  { title: 'Agents of SigNoz Hackathon', note: '1st Place: Aegis Observe' },
  { title: 'Hangover Part 1 Hackathon', note: 'PR Track winner (top 20)' },
  { title: 'Smart India Hackathon', note: 'Finalist' },
  { title: 'Patent (co-filed)', note: 'Assistive technology, with the university robotics dept.' },
  { title: "Vice-Chancellor's Award", note: 'Academic & extracurricular performance' },
]

export const publication = {
  title: 'Design for Automated Reporting and Intervention for High-Risk Irregularities in WSN Environment',
  venue: 'IEEE IoT-SIU 2025 · Dehradun',
  detail: 'ResCNN intrusion detection for IoT/WSN networks on N-BaIoT (Mirai, Gafgyt): 87.49% accuracy.',
  href: 'https://ieeexplore.ieee.org/document/11402860',
}

export const stack = [
  { group: 'Cloud', items: ['OCI', 'GCP · GKE', 'Azure · AKS', 'AWS'] },
  { group: 'Platform', items: ['Kubernetes', 'Docker', 'Helm', 'ArgoCD', 'Backstage', 'GitOps'] },
  { group: 'CI/CD', items: ['GitHub Actions', 'GitLab CI', 'Azure Pipelines', 'Jenkins'] },
  { group: 'IaC & Policy', items: ['Terraform', 'Cloud Custodian', 'OPA Gatekeeper'] },
  { group: 'Observability', items: ['OpenTelemetry', 'SigNoz', 'Prometheus', 'Grafana', 'Loki', 'Alertmanager'] },
  { group: 'Security', items: ['Trivy', 'Checkov', 'Gitleaks', 'OWASP ZAP'] },
  { group: 'MLOps', items: ['Kubeflow', 'KServe', 'MLflow', 'DVC'] },
  { group: 'Code', items: ['Python', 'Bash'] },
]

export const certifications = [
  { name: 'OCI DevOps Professional', by: 'Oracle', year: '2025' },
  { name: 'OCI Architect Associate', by: 'Oracle', year: '2025' },
  { name: 'OCI Generative AI Professional', by: 'Oracle', year: '2025' },
  { name: 'Oracle AI Vector Search Professional', by: 'Oracle', year: '2025' },
  { name: 'LFS162 · DevOps & SRE', by: 'Linux Foundation' },
  { name: 'Ubuntu Linux Professional', by: 'Canonical' },
  { name: 'Google Cloud Foundations', by: 'Google' },
  { name: 'Docker Foundations', by: 'Docker' },
  { name: 'DevOps Certificate', by: 'PagerDuty' },
]

export const education = {
  school: 'Chandigarh University',
  degree: 'B.E. Electronics & Telecommunication Engineering',
  period: '2021 — 2025',
}
