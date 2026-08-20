# GitHub Actions workflows

CI/CD for this JHipster monolith (Java 21 + Spring Boot, Angular frontend, Maven wrapper, npm).

| Workflow   | File                                                   | Triggers                                       | What it does                                                                                                                                                                                                                                                                |
| ---------- | ------------------------------------------------------ | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CI         | [`workflows/ci.yml`](workflows/ci.yml)                 | push to `main`/`master`, pull requests, manual | `build` (fast path: `./mvnw verify -DskipTests -Pprod`, uploads the jar), `backend` (`./mvnw -ntp verify` — surefire + failsafe + JaCoCo, publishes the JUnit report and uploads test results and coverage), `frontend` (`npm run lint`, `npm test` → Vitest with coverage) |
| Validation | [`workflows/validation.yml`](workflows/validation.yml) | push, pull requests, weekly cron, manual       | `format` (`npm run prettier:check`, `./mvnw spotless:check`, `./mvnw checkstyle:check` — the repo's `checkstyle.xml` is the JHipster nohttp ruleset) and `dependency-scan` (`npm audit`, Trivy filesystem scan uploaded as SARIF to code scanning)                          |
| CD         | [`workflows/cd.yml`](workflows/cd.yml)                 | `workflow_dispatch` only                       | Builds a container image with Jib, pushes it to Amazon ECR and deploys to Amazon ECS. **Mocked for the demo — see below.**                                                                                                                                                  |

Both CI and Validation use concurrency groups that cancel superseded runs on branches
(never on `main`/`master`), and least-privilege `permissions:` (`contents: read`, plus
`security-events: write` only for the SARIF upload and `id-token: write` only for the CD jobs
that assume an AWS role).

Java and Node versions are set from `pom.xml` (`<java.version>21</java.version>`,
`<node.version>v24.13.0</node.version>`) via the `JAVA_VERSION` / `NODE_VERSION` env blocks —
update both together when the pom changes.

## CD is mocked

Every AWS identifier in `cd.yml` is a placeholder and none of the resources exist:

| Setting                            | Placeholder value                                                           |
| ---------------------------------- | --------------------------------------------------------------------------- |
| Account / region                   | `123456789012` / `us-east-1`                                                |
| ECR registry                       | `123456789012.dkr.ecr.us-east-1.amazonaws.com`                              |
| ECR repository                     | `demo-jhipster/jhipster-sample-application`                                 |
| ECS cluster / service              | `demo-cluster` / `demo-jhipster-service`                                    |
| Kubernetes namespace (EKS variant) | `demo-jhipster`                                                             |
| OIDC role ARNs                     | `arn:aws:iam::123456789012:role/demo-github-actions-deploy[-<environment>]` |
| Environment URL                    | `https://<environment>.demo-jhipster.example.com`                           |

Three independent gates keep it away from real infrastructure:

1. it only runs on `workflow_dispatch` — nothing triggers it automatically;
2. the `dry_run` input defaults to `true`, and while it is true every AWS-mutating step is
   skipped and replaced by an echo of the command that would have run (the image is still
   built locally with `jib:dockerBuild`, so the Jib config is genuinely exercised);
3. even with `dry_run=false`, a real deployment additionally requires the repository variable
   `ENABLE_REAL_DEPLOY` to be set to `true`.

### Making it real

1. Replace the placeholders above with real values.
2. Create the GitHub environments `staging` and `production`; configure **required reviewers**
   on `production` so the `deploy` job pauses for approval.
3. Create an IAM role trusting GitHub's OIDC provider
   (`token.actions.githubusercontent.com`) with permission to push to ECR and update the ECS
   service, and point `role-to-assume` at it.
4. Set the repository variable `ENABLE_REAL_DEPLOY=true` and run the workflow with
   `dry_run=false`.

### Secrets and variables

No secrets are required for CI, Validation, or a dry-run CD.

| Name                 | Kind                   | Used by                    | Notes                                                                    |
| -------------------- | ---------------------- | -------------------------- | ------------------------------------------------------------------------ |
| `ENABLE_REAL_DEPLOY` | repository variable    | `cd.yml`                   | Must equal `true` for a non-dry-run deployment. Unset in this demo repo. |
| `GITHUB_TOKEN`       | provided automatically | `ci.yml`, `validation.yml` | Publishing the test report and uploading SARIF.                          |

Authentication to AWS uses OIDC role assumption, so no long-lived `AWS_ACCESS_KEY_ID` /
`AWS_SECRET_ACCESS_KEY` secrets are needed.

## Dependabot

[`dependabot.yml`](dependabot.yml) watches the `maven`, `npm` and `github-actions` ecosystems
weekly, with grouped minor/patch updates (plus dedicated Spring and Angular groups) to keep the
PR volume low.

## Action pinning

Third-party actions are pinned to their major version tag (`actions/checkout@v4`,
`aws-actions/configure-aws-credentials@v4`, `mikepenz/action-junit-report@v5`, …). The one
exception is `aquasecurity/trivy-action`, which publishes no major-version tag and is therefore
pinned to an exact release (`0.28.0`); Dependabot's `github-actions` ecosystem keeps it current.
