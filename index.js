// index.js

const core = require('@actions/core');
const github = require('@actions/github');
const request = require('request');

async function reflector({context, targetUrl}) {
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

  let options = {
    url: targetUrl,
    method: 'POST',
    headers: {
      'X-GitHub-Event': context.eventName,
      'Content-Type': 'application/json',
      'Content-Length': context.payload.length,
    },
    body: JSON.stringify(context.payload),
  };

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

reflector({context: github.context, targetUrl: core.getInput('targetUrl')}).then((result) => {
  console.log(result);

  core.summary
    .addHeading('Results')
    .addRaw(result)
    .write();
});
