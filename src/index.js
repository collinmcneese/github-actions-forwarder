// index.js

const core = require('@actions/core');
const github = require('@actions/github');
const { forwarder } = require('./forwarder');

// Parse inputs
const targetUrl = core.getInput('target-url');
const webhookSecret = core.getInput('webhook-secret');
const allowListSource = core.getInput('allow-list-source');

// Run the Forwarder action
forwarder({
  context: github.context,
  targetUrl: targetUrl,
  webhookSecret: webhookSecret,
  allowListSource: allowListSource,
}).then((result) => {
  core.info(result);

  core.summary
    .addRaw(result)
    .write();
});
