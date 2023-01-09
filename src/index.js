// index.js

const core = require('@actions/core');
const github = require('@actions/github');
const { reflector } = require('./reflector');

// Parse inputs
const targetUrl = core.getInput('target-url');
const webhookSecret = core.getInput('webhook-secret');
const allowListSource = core.getInput('allow-list-source');

// Run the Reflector action
reflector({
  context: github.context,
  targetUrl: targetUrl,
  webhookSecret: webhookSecret,
  allowListSource: allowListSource,
}).then((result) => {
  console.log(result);

  core.summary
    .addRaw(result)
    .write();
});
