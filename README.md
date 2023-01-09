[![CodeQL](https://github.com/collinmcneese/github-actions-reflector/actions/workflows/codeql.yml/badge.svg)](https://github.com/collinmcneese/github-actions-reflector/actions/workflows/codeql.yml) [![ci](https://github.com/collinmcneese/github-actions-reflector/actions/workflows/ci.yml/badge.svg)](https://github.com/collinmcneese/github-actions-reflector/actions/workflows/ci.yml)

# GitHub Actions Reflector

GitHub Actions workflow meant to run on self-hosted runners to leverage internal or private tooling (such as CICD systems) with GitHub  repositories without the need to use reverse proxy implementations.

This repository is a work-in-progress.  See [TODOs](#todos)

The contents of this repository are individually maintained and are not a direct contribution from GitHub as an organization.  References to `GitHub Actions` in terminology in this repository are for reference only to GitHub technologies and in no way associated with official branding or supportability.

## Usage

### Inputs

- `target-url`: **String**, **Required**

  The target URL destination where webhook event payloads will be reflected to.
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

### Example

Example workflow for consuming reflector:

```yaml
name: reflector-call

on:
  pull_request:

jobs:
  reflector-call:
    runs-on: self-hosted
    steps:
    - name: GitHub Actions Reflector
      uses: collinmcneese/github-actions-reflector@main
      with:
        target-url: 'http://172.17.0.1:8080/github-webhook/'
        webhook-secret: 'my-secret-value'
```

## Why Does This Exist?

### Reflector Method

Example overview of an implementation which uses the Actions Reflector workflow to route repository webhook events to internal systems.  Actions Reflector is executed as a GitHub Actions workflow from `on:` events such as `push:` or `pull_request:` on self-hosted runners, routing event payloads to downstream target systems.  This configuration leverages queueing, notification and retransmission capabilities of GitHub Actions and leverages self-hosted runners to prevent the need for ingress traffic initiation at a network edge.

<img src="./docs/010.png" alt="reflector-setup">

---

### Reverse Proxy Method (not Using Reflector)

Example overview of an implementation which uses reverse proxy or an API gateway to allow webhook traffic from GitHub cloud repositories to internal systems.  In this setup, webhook events are sent from github.com to a reverse proxy or API gateway which are routed to an internal CICD system.  This example pattern becomes more complicated when adding additional reliability measures in place such as webhook notifications (success or failure), retransmissions and potentially a queueing mechanism at the API gateway layer to handle traffic bursts and scale as required.

<img src="./docs/001.png" alt="reverse-proxy-setup">

## TODOs

- [ ] Complete documentation
- [X] Add logic for handling secrets to downstream webhook targets
- [X] Add code testing
- [ ] Add quick setup example references for easy testing
- [ ] Add URL filtering capability to handle controlling valid URL targets via configuration (allow-list).
