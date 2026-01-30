# Docker Permission Fix + CI/CD Race Condition

## TL;DR

> **Quick Summary**: Fix Laravel storage directory permission errors in Docker containers by running entrypoint permissions setup as root, and prevent CI/CD race conditions by merging base/app workflows with proper job dependencies.
> 
> **Deliverables**:
> - Fixed `docker/entrypoint.d/10-storage-permissions.sh` with root execution
> - Merged GitHub Actions workflow with job dependencies
> - Removal of redundant workflow file
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 → Task 3 → Task 4

---

## Context

### Original Request
User reported Docker permission error:
```
mkdir: cannot create directory '/var/www/html/storage/framework': Permission denied
```
Also requested CI/CD workflow fix: when Dockerfile.base changes, app image build should wait for base image build to complete (race condition prevention).

### Interview Summary
**Key Discussions**:
- Permission error occurs because entrypoint script runs `chown` as www-data user
- serversideup/php base image runs entrypoint.d scripts as container user (www-data)
- CI/CD has two separate workflows without dependency chain
- Research confirmed: single merged workflow with `needs:` is best pattern

**Research Findings**:
- serversideup/php entrypoint mechanism: scripts in `/etc/entrypoint.d/` execute at startup
- GitHub Actions `needs:` keyword creates job dependencies within single workflow
- Docker permission fix pattern: run as root in Dockerfile or entrypoint, exec as www-data
- `dorny/paths-filter` action enables conditional job execution based on changed files

### Metis Review
**Identified Gaps** (addressed):
- Need executable acceptance criteria → Added specific docker commands for verification
- Edge case: volume mounts override permissions → Entrypoint runs AFTER mounts, handles this
- Edge case: pre-existing directories with wrong owner → `mkdir -p` + `chown -R` handles both cases
- Scope creep risk → Explicit guardrails added below

---

## Work Objectives

### Core Objective
Fix Docker container startup permission errors and eliminate CI/CD race conditions when building base and app images.

### Concrete Deliverables
- `docker/entrypoint.d/10-storage-permissions.sh` - Fixed script that runs as root
- `.github/workflows/docker.yml` - Merged workflow with job dependencies
- Deletion of `.github/workflows/docker-build.yml` and `.github/workflows/docker-build-app.yml`

### Definition of Done
- [ ] `docker compose up` starts without permission errors
- [ ] CI/CD builds base image before app image when both change
- [ ] App-only changes don't trigger base image rebuild
- [ ] Container runs as www-data user (not root) at runtime

### Must Have
- Permission fix must work with Docker Compose volume mounts
- CI/CD must support manual workflow_dispatch triggers
- Container must run as www-data after startup (security requirement)
- Workflow must fail fast if base build fails

### Must NOT Have (Guardrails)
- ❌ Running Laravel application as root user
- ❌ Modifying serversideup/php base image directly
- ❌ Adding deployment/release workflows (out of scope)
- ❌ Adding Kubernetes manifests or Helm charts
- ❌ Changing Docker Compose orchestration beyond this fix
- ❌ Adding notification systems (Slack, email)
- ❌ Implementing multi-environment branch strategies

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO (Docker/CI infrastructure tests)
- **User wants tests**: Manual-only (CI/CD run verification)
- **Framework**: Docker CLI + GitHub Actions UI verification

### Automated Verification (ALWAYS include)

Each TODO includes EXECUTABLE verification procedures:

**For Docker changes** (using Bash):
```bash
# Build and run container
docker build -t nakes:test .
docker run -d --name nakes-test -p 8080:8080 nakes:test
sleep 15

# Verify storage ownership
docker exec nakes-test stat -c "%U:%G" /var/www/html/storage
# Assert: "www-data:www-data"

# Verify can write to storage
docker exec nakes-test php -r "file_put_contents('/var/www/html/storage/logs/test.log', 'test');"
# Assert: Exit code 0

# Verify runtime user
docker exec nakes-test whoami
# Assert: "www-data"

# Cleanup
docker stop nakes-test && docker rm nakes-test
```

**For CI/CD changes** (using GitHub CLI):
```bash
# Verify workflow file exists and is valid
gh workflow view docker.yml

# Trigger manual build
gh workflow run docker.yml

# Check run status
gh run list --workflow=docker.yml --limit=1
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Fix entrypoint permissions script
└── Task 2: Create merged GitHub Actions workflow

Wave 2 (After Wave 1):
├── Task 3: Update Dockerfile to use fixed entrypoint
└── Task 4: Remove old workflow files + test

Critical Path: Task 1 → Task 3 → Task 4
Parallel Speedup: ~30% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 3 | 2 |
| 2 | None | 4 | 1 |
| 3 | 1 | 4 | None |
| 4 | 2, 3 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 2 | delegate_task(category="quick", load_skills=[], run_in_background=true) |
| 2 | 3, 4 | dispatch after Wave 1 completes |

---

## TODOs

- [x] 1. Fix entrypoint permissions script to run as root

  **What to do**:
  - Modify `docker/entrypoint.d/10-storage-permissions.sh` to include shebang that executes as root
  - Use serversideup/php's documented pattern for root execution in entrypoint.d
  - Add explicit error handling for mkdir/chown failures
  - Ensure script exits cleanly after permission setup

  **Must NOT do**:
  - Do NOT modify permissions for directories outside storage/bootstrap
  - Do NOT keep container running as root after permissions are set
  - Do NOT add additional Laravel artisan commands to this script

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file modification with clear requirements
  - **Skills**: `[]`
    - No special skills needed for shell script editing
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not needed for code changes, only for commits

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Task 3
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL):

  **Pattern References**:
  - `docker/entrypoint.d/10-storage-permissions.sh:1-22` - Current script to modify
  - `Dockerfile:36-38` - How entrypoint is copied and made executable

  **External References**:
  - serversideup/php docs: https://serversideup.net/open-source/docker-php/docs/customizing-the-image/running-scripts-on-container-start
  - Pattern for root execution: Use `S6_USER=root` environment variable or wrapper script

  **WHY Each Reference Matters**:
  - Current script shows the exact mkdir/chown commands that need root privileges
  - Dockerfile shows the script is already set executable, just needs content fix

  **Acceptance Criteria**:

  ```bash
  # Agent runs:
  # Build test image
  docker build -t nakes:perm-test -f Dockerfile .
  # Assert: Exit code 0

  # Run container with volume mount (simulates production)
  docker run -d --name perm-test -v nakes-storage:/var/www/html/storage nakes:perm-test
  sleep 10

  # Verify storage directories exist with correct ownership
  docker exec perm-test stat -c "%U:%G" /var/www/html/storage/framework/sessions
  # Assert: Output contains "www-data:www-data"

  # Verify write access
  docker exec perm-test touch /var/www/html/storage/framework/sessions/test
  # Assert: Exit code 0

  # Verify runtime user is NOT root
  docker exec perm-test whoami
  # Assert: Output is "www-data"

  # Cleanup
  docker stop perm-test && docker rm perm-test && docker volume rm nakes-storage
  ```

  **Evidence to Capture:**
  - [ ] Terminal output showing successful docker build
  - [ ] Terminal output showing www-data:www-data ownership
  - [ ] Terminal output showing www-data runtime user

  **Commit**: YES
  - Message: `fix(docker): run storage permissions setup as root in entrypoint`
  - Files: `docker/entrypoint.d/10-storage-permissions.sh`
  - Pre-commit: Docker build test

---

- [x] 2. Create merged GitHub Actions workflow with job dependencies

  **What to do**:
  - Create new `.github/workflows/docker.yml` that combines base and app builds
  - Use `dorny/paths-filter@v3` to detect which files changed
  - Implement conditional job execution: build-base only when Dockerfile.base/composer/package changes
  - Use `needs:` keyword to ensure app build waits for base build when both are triggered
  - Preserve existing tagging strategy (base, latest, develop, sha tags)
  - Support `workflow_dispatch` for manual triggers with force_build options

  **Must NOT do**:
  - Do NOT add deployment steps (only build and push)
  - Do NOT change image registry (keep ghcr.io)
  - Do NOT add notification integrations
  - Do NOT add approval gates

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: YAML file creation with clear patterns from research
  - **Skills**: `[]`
    - No special skills needed for workflow creation
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not needed until commit phase

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 4
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL):

  **Pattern References**:
  - `.github/workflows/docker-build.yml:1-163` - Current base workflow to merge
  - `.github/workflows/docker-build-app.yml:1-133` - Current app workflow to merge

  **External References**:
  - dorny/paths-filter: https://github.com/dorny/paths-filter
  - Docker build-push-action: https://github.com/docker/build-push-action
  - GitHub Actions `needs`: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idneeds

  **WHY Each Reference Matters**:
  - Current workflows show exact build configuration, tags, and permissions needed
  - dorny/paths-filter enables conditional base image rebuild
  - needs keyword creates the dependency chain preventing race condition

  **Acceptance Criteria**:

  ```bash
  # Agent runs:
  # Validate workflow YAML syntax
  gh workflow view docker.yml --yaml
  # Assert: Valid YAML, no syntax errors

  # Check workflow has correct jobs structure
  cat .github/workflows/docker.yml | grep -E "^  (detect-changes|build-base|build-app):"
  # Assert: All three job names present

  # Check needs dependency exists
  cat .github/workflows/docker.yml | grep -A5 "build-app:" | grep "needs:"
  # Assert: Contains "needs: [detect-changes, build-base]" or similar

  # Check paths-filter is configured
  cat .github/workflows/docker.yml | grep "dorny/paths-filter"
  # Assert: Present in workflow

  # Check workflow_dispatch is preserved
  cat .github/workflows/docker.yml | grep "workflow_dispatch"
  # Assert: Present with force_build input
  ```

  **Evidence to Capture:**
  - [ ] Terminal output showing valid YAML
  - [ ] Terminal output showing job dependencies
  - [ ] Workflow file content showing paths-filter configuration

  **Commit**: NO (groups with Task 4)

---

- [x] 3. Update Dockerfile entrypoint configuration if needed

  **What to do**:
  - Review if Dockerfile needs changes to work with updated entrypoint script
  - Verify USER directive order is correct (root for setup, www-data for runtime)
  - Ensure entrypoint script is copied to correct location
  - Test that the fix works with the existing Dockerfile structure

  **Must NOT do**:
  - Do NOT change base image version
  - Do NOT modify multi-stage build structure
  - Do NOT add new environment variables beyond what's needed

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Minor Dockerfile review and potential adjustment
  - **Skills**: `[]`
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (after Task 1)
  - **Blocks**: Task 4
  - **Blocked By**: Task 1

  **References** (CRITICAL):

  **Pattern References**:
  - `Dockerfile:36-49` - Current entrypoint setup and USER directives
  - `Dockerfile.base:64-78` - User switching in base image

  **External References**:
  - serversideup/php USER documentation: https://serversideup.net/open-source/docker-php/docs/guide/default-configurations

  **WHY Each Reference Matters**:
  - Dockerfile shows current USER switching pattern that must be preserved
  - Base image docs explain expected user behavior

  **Acceptance Criteria**:

  ```bash
  # Agent runs:
  # Full docker compose build test
  docker compose build app
  # Assert: Exit code 0

  # Start all services
  docker compose up -d
  sleep 20

  # Verify app container is healthy
  docker compose ps --format json | jq -r '.[] | select(.Service=="app") | .Health'
  # Assert: "healthy"

  # Check Laravel responds
  curl -f http://localhost:8080/up
  # Assert: HTTP 200

  # Cleanup
  docker compose down -v
  ```

  **Evidence to Capture:**
  - [ ] Terminal output showing successful build
  - [ ] Terminal output showing healthy container
  - [ ] curl response showing Laravel up

  **Commit**: YES
  - Message: `fix(docker): ensure correct USER directives for permission fix`
  - Files: `Dockerfile` (if changed)
  - Pre-commit: `docker compose build`

---

- [x] 4. Remove old workflow files and test merged workflow

  **What to do**:
  - Delete `.github/workflows/docker-build.yml`
  - Delete `.github/workflows/docker-build-app.yml`
  - Rename or ensure `.github/workflows/docker.yml` is the only Docker workflow
  - Push changes and verify GitHub Actions runs correctly
  - Test manual trigger via workflow_dispatch

  **Must NOT do**:
  - Do NOT delete other workflow files (only Docker-related ones)
  - Do NOT trigger force push or destructive git operations

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: File deletion and verification
  - **Skills**: `["git-master"]`
    - Needed for proper commit with multiple file changes
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (final task)
  - **Blocks**: None (final)
  - **Blocked By**: Task 2, Task 3

  **References** (CRITICAL):

  **Pattern References**:
  - `.github/workflows/docker-build.yml` - File to delete
  - `.github/workflows/docker-build-app.yml` - File to delete
  - `.github/workflows/docker.yml` - New merged workflow (created in Task 2)

  **WHY Each Reference Matters**:
  - Must delete old files to prevent duplicate workflow triggers
  - New workflow must be tested to ensure it works

  **Acceptance Criteria**:

  ```bash
  # Agent runs:
  # Verify old files are deleted
  ls .github/workflows/docker-build.yml 2>&1
  # Assert: "No such file or directory"

  ls .github/workflows/docker-build-app.yml 2>&1
  # Assert: "No such file or directory"

  # Verify new workflow exists
  ls .github/workflows/docker.yml
  # Assert: File exists

  # List all workflow files
  ls .github/workflows/*.yml
  # Assert: Only docker.yml for Docker builds (other workflows may exist)

  # After push - verify workflow appears in GitHub
  gh workflow list
  # Assert: Shows "Build Docker Images" or similar name
  ```

  **Evidence to Capture:**
  - [ ] Terminal output showing old files deleted
  - [ ] Terminal output showing new workflow exists
  - [ ] GitHub Actions workflow list showing merged workflow

  **Commit**: YES
  - Message: `ci(docker): merge base and app workflows, fix race condition`
  - Files: `.github/workflows/docker.yml`, delete `docker-build.yml`, delete `docker-build-app.yml`
  - Pre-commit: Workflow YAML validation

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `fix(docker): run storage permissions setup as root in entrypoint` | `docker/entrypoint.d/10-storage-permissions.sh` | docker build test |
| 3 | `fix(docker): ensure correct USER directives for permission fix` | `Dockerfile` (if changed) | docker compose build |
| 4 | `ci(docker): merge base and app workflows, fix race condition` | `.github/workflows/docker.yml`, deletions | gh workflow list |

---

## Success Criteria

### Verification Commands
```bash
# 1. Permission fix works
docker compose up -d
docker compose exec app stat -c "%U:%G" /var/www/html/storage
# Expected: www-data:www-data

# 2. Container runs as non-root
docker compose exec app whoami
# Expected: www-data

# 3. Merged workflow exists
gh workflow view docker.yml
# Expected: Valid workflow displayed

# 4. Old workflows removed
ls .github/workflows/docker-build*.yml 2>&1 | grep -c "No such file"
# Expected: 2 (both files not found)
```

### Final Checklist
- [x] All "Must Have" present
- [x] All "Must NOT Have" absent
- [x] Container starts without permission errors
- [x] CI/CD builds in correct order
