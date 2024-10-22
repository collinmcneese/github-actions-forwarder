[![ci](https://github.com/collinmcneese/github-actions-forwarder/actions/workflows/ci.yml/badge.svg)](https://github.com/collinmcneese/github-actions-forwarder/actions/workflows/ci.yml)

# GitHub Actions Forwarder

GitHub Actions workflow meant to run on [self-hosted](https://docs.github.com/en/actions/hosting-your-own-runners/about-self-hosted-runners) runners to leverage internal or private tooling (such as CICD systems) with GitHub repositories without the need to configure GitHub webhooks or use reverse-proxy/API-gateway implementations.  Additionally could be used with [GitHub Larger Runners](https://docs.github.com/en/actions/using-github-hosted-runners/using-larger-runners) with reserved IPs to minimize ingress points and remove the need for self-hosted runner administration and maintenance.

This action can work to subscribe to [Repository level events](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#available-events) and deliver a payload to a downstream modeling what a GitHub webhook would look like.  Since this is a Repository-scoped action, it can only subscribe to Repository level events unlike [Organizational and Enterprise webhook event options](https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads) which include additional scopes.

This repository is a work-in-progress.  See [TODOs](#todos)

The contents of this repository are individually maintained and are not a direct contribution from GitHub as an organization.  References to `GitHub Actions` in terminology in this repository are for reference only to GitHub technologies and in no way associated with official branding or supportability.

## Usage

### Inputs

- `target-url`: **String**, **Required**

  The target URL destination where webhook event payloads will be forwarded to.
- `webhook-secret`: **String**, **Optional**

  Secret data value to use for webhook payload.  Populates `X-Hub-Signature` and `X-Hub-Signature-256` header values. See [Securing Your Webhooks](https://docs.github.com/en/developers/webhooks-and-events/webhooks/securing-your-webhooks) for additional context.
- `allow-list-source`: **String**, **Optional**

  Source location(relative file location or URL) for a newline-delimited list of entries which specify the allow-list for `target-url` filtering.
  - Example `allow-list` file contents:

    ```plain
    # example-allow-list.txt
    # Comment line and blank lines are ignored

    # Entries in this file should be prefixed with transport type (http/https)
    https://github.com
    https://api.github.com
    https://*.github.localdomain
    ```

### Examples

Example simple workflow for consuming forwarder:

```yaml
name: forwarder-call

on:
  pull_request:

jobs:
  forwarder-call:
    runs-on: self-hosted
    steps:
    - name: GitHub Actions Forwarder
      uses: collinmcneese/github-actions-forwarder@v1
      with:
        target-url: 'http://172.17.0.1:8080/github-webhook/'
        webhook-secret: ${{ secrets.FORWARDER_WEBHOOK_SECRET }}
```

Example workflow using [variables](https://docs.github.com/en/actions/learn-github-actions/variables) to target requests to different endpoints:

```yaml
name: forwarder-dynamic

on:
  pull_request:
  push:
  issues:

jobs:
  forwarder-call:
    runs-on: self-hosted
    steps:
    - name: Push - Forwarder
      if: |
        github.event_name == 'push' ||
        github.event_name == 'pull_request'
      uses: collinmcneese/github-actions-forwarder@v1
      with:
        target-url: ${{ vars.FORWARDER_TARGET_PUSH }}
        webhook-secret: ${{ secrets.FORWARDER_WEBHOOK_SECRET_PUSH }}
        allow-list-source: ${{ vars.FORWARDER_ALLOW_LIST }}
    - name: Issue - Forwarder
      if: ${{ github.event_name == 'issues' }}
      uses: collinmcneese/github-actions-forwarder@v1
      with:
        target-url:  ${{ vars.FORWARDER_TARGET_ISSUES }}
        webhook-secret: ${{ secrets.FORWARDER_WEBHOOK_SECRET_ISSUES }}
        allow-list-source: ${{ vars.FORWARDER_ALLOW_LIST }}
```

## Why Does This Exist?

### Forwarder Method

Example overview of an implementation which uses the Actions Forwarder workflow to route repository webhook events to internal systems.  Actions Forwarder is executed as a GitHub Actions workflow from `on:` events such as `push:` or `pull_request:` on self-hosted runners, routing event payloads to downstream target systems.  This configuration leverages queueing, notification and retransmission capabilities of GitHub Actions and leverages self-hosted runners to prevent the need for ingress traffic initiation at a network edge.

<img src="./docs/010.png" alt="forwarder-setup">

---

### Reverse Proxy Method (not Using Forwarder)

Example overview of an implementation which uses reverse proxy or an API gateway to allow webhook traffic from GitHub cloud repositories to internal systems.  In this setup, webhook events are sent from github.com to a reverse proxy or API gateway which are routed to an internal CICD system.  This example pattern becomes more complicated when adding additional reliability measures in place such as webhook notifications (success or failure), retransmissions and potentially a queueing mechanism at the API gateway layer to handle traffic bursts and scale as required.

<img src="./docs/001.png" alt="reverse-proxy-setup">

## TODOs

- [ ] Complete documentation
- [X] Add logic for handling secrets to downstream webhook targets
- [X] Add code testing
- [X] Add quick setup example references for easy testing
- [X] Add URL filtering capability to handle controlling valid URL targets via configuration (allow-list).
