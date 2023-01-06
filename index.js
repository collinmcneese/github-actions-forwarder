// index.js

const core = require('@actions/core');
const github = require('@actions/github');
const request = require('request');
const crypto = require('crypto');

// Parse inputs
const targetUrl = core.getInput('target-url');
const webhookSecret = core.getInput('webhook-secret');

async function reflector({context, targetUrl}) {
  let payloadJson = JSON.stringify(context.payload, undefined, 2);

  // Validate that targetUrl is a valid URL
  const URL = require('url').URL;

  function validateUrl(urlString) {
    try {
      new URL(urlString); // eslint-disable-line no-new
      return true;
    } catch (err) {
      throw new Error(`Invalid targetUrl: ${urlString} \n ${err}`);
    }
  }

  validateUrl(targetUrl);

  // Build request options
  // Include the signature in the headers, if a webhookSecret was provided
  let options = {
    url: targetUrl,
    method: 'POST',
    headers: {
      'X-GitHub-Event': context.eventName,
      'Content-Type': 'application/json',
      'Content-Length': context.payload.length,
    },
    body: payloadJson,
  };

  // Build GitHub signature headers with secret
  if (webhookSecret) {
    options.headers['X-Hub-Signature'] = `sha1=${crypto.createHmac('sha1', webhookSecret).update(payloadJson).digest('hex')}`;
    options.headers['X-Hub-Signature-256'] = `sha256=${crypto.createHmac('sha256', webhookSecret).update(payloadJson).digest('hex')}`;
  }

  // Send the request
  return new Promise((resolve, reject) => {
    console.log(`Sending payload to ${targetUrl} with options: ${JSON.stringify(options.headers)}`);

    request(options, (error, response, body) => {
      if (error) {
        reject(error);
      } else if (response.statusCode < 200 || response.statusCode >= 300) {
        reject(new Error(`Error sending payload to ${targetUrl}: ${response.statusCode} - ${response.statusMessage}`));
      } else {
        resolve(`Payload sent to ${targetUrl} \n response: ${response.statusCode} - ${response.statusMessage}`);
      }
    });
  });
};

// Run the Reflector action
reflector({context: github.context, targetUrl: targetUrl}).then((result) => {
  console.log(result);

  core.summary
    .addHeading('Results')
    .addRaw(result)
    .write();
});
