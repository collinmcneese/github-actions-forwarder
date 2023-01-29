#!/bin/bash

# CI script to run NPM tests and capture the exit code if any tests fail

# Wrapper function to run a command and capture the exit code
function ci-run {
  echo "::Running: $@"
  $@
  local status=$?
  if [ $status -ne 0 ]; then
    echo "::Error: $@"
    exit $status
  fi
  return $status
}

cd "$(dirname "$0")/.."

ci-run npx eslint --ignore-path .eslintignore .
ci-run npx cspell *.js *.md
ci-run npx markdownlint-cli -c markdownlint.yml *.md
ci-run npx jest
