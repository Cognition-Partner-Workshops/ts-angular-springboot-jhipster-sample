# CI/CD

Two GitHub Actions workflows live in `.github/workflows/`.

> **Demo notice:** the CD pipeline ships with mock AWS identifiers and never
> touches a real AWS account. See [Mock vs. real](#mock-vs-real).

## CI — `.github/workflows/ci.yml`

Runs on every push to `main` and on every pull request. Superseded runs on the
same ref are cancelled (`concurrency`), and the workflow has read-only
`permissions`.

| Job            | What it does                                                                                                                                                               |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `backend`      | `./mvnw -Pprod verify` with the frontend skipped (`-Dskip.installnodenpm -Dskip.npm`); unit + integration tests (Testcontainers PostgreSQL). Maven cache via `setup-java`. |
| `frontend`     | `npm ci`, `npm run lint`, `npm test` (Vitest, with coverage), `npm run webapp:build:prod`. npm cache via `setup-node`.                                                     |
| `code-quality` | `npm run prettier:check`, `./mvnw checkstyle:check` (nohttp rules from `checkstyle.xml`), `./mvnw javadoc:javadoc`, and `actionlint` over the workflow files.              |

Surefire/Failsafe/JaCoCo reports and the frontend coverage report are uploaded
as artifacts (7-day retention). No step uses `continue-on-error` — a real
failure fails the run.

Java 21 (Temurin) and Node 24.13.0 mirror `<java.version>` / `<node.version>`
in `pom.xml`.

## CD — `.github/workflows/cd.yml`

Triggered by pushes to `main` and by `workflow_dispatch` with an
`environment` input (`staging` | `production`).

```
configure ──> build-image (Jib) ──> deploy-staging ──> deploy-production
 (dry-run?)        (ECR)            (env: staging)     (env: production,
                                                        required reviewers)
```

- **configure** resolves the deployment mode and the image tag
  (`${GITHUB_SHA::12}`).
- **build-image** builds the production image with the Jib Maven plugin already
  configured in `pom.xml`.
- **deploy-staging / deploy-production** render an ECS task definition and
  update the ECS service. The `production` job uses the `production` GitHub
  Environment; enable **Required reviewers** on that environment to get the
  manual approval gate between staging and production.
- AWS authentication is **GitHub OIDC only**
  (`aws-actions/configure-aws-credentials` with `role-to-assume`). No long-lived
  access keys are stored or used; jobs request `id-token: write` and nothing else
  beyond `contents: read`.
- All actions are pinned to commit SHAs (with the version in a trailing comment).

## Mock vs. real

`configure` sets `dry_run=true` whenever `AWS_ACCOUNT_ID` is still the mock
`123456789012`. In dry-run mode:

- the image is built with `jib:buildTar` into `target/jib-image.tar` and uploaded
  as an artifact — **nothing is pushed to ECR**;
- the deploy jobs only print the deployment plan — **no ECS/AWS API call is made**.

Setting a real `AWS_ACCOUNT_ID` repository variable flips every guarded step on.

### Variables (repository or environment scoped)

| Variable                     | Mock default                                                         |
| ---------------------------- | -------------------------------------------------------------------- |
| `AWS_REGION`                 | `us-east-1`                                                          |
| `AWS_ACCOUNT_ID`             | `123456789012`                                                       |
| `AWS_DEPLOY_ROLE_ARN`        | `arn:aws:iam::123456789012:role/gha-deploy-ts-java-angular-jhipster` |
| `ECR_REPOSITORY`             | `demo/jhipster-sample-application`                                   |
| `ECS_CLUSTER_STAGING`        | `demo-staging`                                                       |
| `ECS_SERVICE_STAGING`        | `demo-staging-jhipster-sample-application`                           |
| `ECS_TASK_FAMILY_STAGING`    | `demo-staging-jhipster-sample-application`                           |
| `ECS_CLUSTER_PRODUCTION`     | `demo-prod`                                                          |
| `ECS_SERVICE_PRODUCTION`     | `demo-prod-jhipster-sample-application`                              |
| `ECS_TASK_FAMILY_PRODUCTION` | `demo-prod-jhipster-sample-application`                              |
| `ECS_CONTAINER_NAME`         | `jhipster-sample-application`                                        |

### Secrets

None. OIDC role assumption replaces static credentials; the only AWS trust
configuration lives in the IAM role's trust policy
(`token.actions.githubusercontent.com`, `sub` restricted to this repository and
the `staging` / `production` environments).

### To go live

1. Create the ECR repository, ECS cluster/service and task definition family.
2. Create an IAM role trusting the GitHub OIDC provider, scoped to this repo,
   with permissions for ECR push and `ecs:UpdateService` /
   `ecs:RegisterTaskDefinition` / `iam:PassRole` on the task roles only.
3. Create the `staging` and `production` GitHub Environments; add required
   reviewers to `production`.
4. Replace the variables in the table above with the real values (at minimum
   `AWS_ACCOUNT_ID`, which is what disables dry-run mode).

## Dependabot

`.github/dependabot.yml` watches Maven, npm (Angular packages grouped) and
GitHub Actions weekly.
