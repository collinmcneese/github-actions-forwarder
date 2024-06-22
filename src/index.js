// index.js

import * as core from '@actions/core';
import * as github from '@actions/github';
import { forwarder } from './forwarder.js';

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
