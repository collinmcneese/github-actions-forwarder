# GitHub Actions Reflector

GitHub Actions workflow meant to run on self-hosted runners to leverage internal or private tooling (such as CICD systems) with GitHub cloud-hosted repositories without the need to use reverse proxy implementations.

Example overview of an implementation which uses reverse proxy or an API gateway to allow webhook traffic from GitHub cloud repositories to internal systems:
<img src="./docs/001.png" alt="reverse-proxy-setup">

Example overview of an implementation which uses the GitHub Actions Reflector workflow to route repository webhook events to internal systems:
<img src="./docs/010.png" alt="reflector-setup">

## Usage

Example workflow for consuming reflector:

```yaml
name: reflector-call

on:
  push:

  pull_request:
  - main

jobs:
  reflector-call:
    # Path to reusable workflow
    uses: collinmcneese/github-actions-reflector/.github/workflows/reflector.yml@main
    with:
      targetUrl: 'http://172.17.0.1:8080/github-webhook/'
```

## TODO

- [ ] Complete documentation
- [ ] Add logic for handling secrets to downstream webhook targets
- [ ] Add code testing
- [ ] Add quick setup example references for easy testing
