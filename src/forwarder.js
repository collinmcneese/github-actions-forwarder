// forwarder.js

import request from 'request';
import crypto from 'crypto';
import { URL } from 'url';
import console from 'console';
import fs from 'fs';

// Function to validate that passed URL is a valid URL
function validateUrl(urlString) {
  try {
    new URL(urlString);
    return true;
  } catch (err) {
    throw new Error(`Invalid URL: ${urlString} \n ${err}`);
  }
}

// Function to fetch contents of allowListSource and parse into an array
// Source can be a URL or a file path
// Format of allowListSource file is newline separated list of URL patterns
async function fetchAllowListSource(allowListSource) {
  return new Promise((resolve, reject) => {
    if (allowListSource.startsWith('http')) {
      request(allowListSource, (error, response, body) => {
        if (error) {
          reject(error);
        } else if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`Error fetching allowListSource: ${allowListSource}: ${response.statusCode} - ${response.statusMessage}`));
        } else {
          // Remove comments and split into array based on newline
          resolve(body.split('\n').filter((line) => !line.startsWith('#')).filter((line) => line.length > 0));
        }
      });
    } else {
      fs.readFile(allowListSource, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          // Remove comments and split into array based on newline
          resolve(data.split('\n').filter((line) => !line.startsWith('#')).filter((line) => line.length > 0));
        }
      });
    }
  });
}

// Function to validate that passed target URL is in the passed allowList array via pattern matching
function validateAllowList(targetUrl, allowList) {
  const targetUrlObj = new URL(targetUrl);

  for (let i = 0; i < allowList.length; i++) {
    const allowListUrlObj = new URL(allowList[i]);

    if (targetUrlObj.hostname === allowListUrlObj.hostname) {
      return true;
    }
    // support for wildcard partial matching in allowList
    if (allowListUrlObj.hostname.startsWith('*')) {
      const wildcard = allowListUrlObj.hostname.replace('*', '');
      if (targetUrlObj.hostname.endsWith(wildcard)) {
        return true;
      }
    }
  }

  return false;
}

// Function to return webhook signature value
// Specify sha1 or sha256
function getWebhookSignature(payload, secret, algorithm) {
  if (algorithm !== 'sha1' && algorithm !== 'sha256') {
    throw new Error(`Invalid algorithm: ${algorithm} \n Must be sha1 or sha256`);
  }

  return `${algorithm}=${crypto.createHmac(algorithm, secret).update(payload).digest('hex')}`;
}

// Function to return Request object with passed context, targetUrl and webhookSecret
function getRequestOptions(context, targetUrl, webhookSecret) {
  const payloadJson = JSON.stringify(context.payload, undefined, 2);

  // Build request options
  // Include the signature in the headers, if a webhookSecret was provided
  const options = {
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
    options.headers['X-Hub-Signature'] = getWebhookSignature(payloadJson, webhookSecret, 'sha1');
    options.headers['X-Hub-Signature-256'] = getWebhookSignature(payloadJson, webhookSecret, 'sha256');
  }

  return options;
}

// Main Forwarder function
async function forwarder({context, targetUrl, webhookSecret, allowListSource}) {
  // Validate that targetUrl is a valid URL
  validateUrl(targetUrl);

  // If allowListSource is provided, fetch the allowList and validate that targetUrl is in the allowList
  if (allowListSource) {
    const allowList = await fetchAllowListSource(allowListSource);

    if (!validateAllowList(targetUrl, allowList)) {
      throw new Error(`targetUrl: ${targetUrl} is not in allowListSource: ${allowListSource}`);
    } else {
      console.log(`targetUrl: ${targetUrl} is in allowListSource: ${allowListSource}`);
    }
  }

  // Build request options
  const options = getRequestOptions(context, targetUrl, webhookSecret);

  // Send the request
  return new Promise((resolve, reject) => {
    request(options, (error, response) => {
      if (error) {
        reject(error);
      } else if (response.statusCode < 200 || response.statusCode >= 300) {
        reject(new Error(`Error sending payload to ${targetUrl}: ${response.statusCode} \n ${response.statusMessage}`));
      } else {
        resolve(`Payload sent to ${targetUrl} \n response: ${response.statusCode} - ${response.statusMessage}`);
      }
    });
  });
};

// Export private functions for testing
const forwarderPrivate = {
  validateUrl,
  fetchAllowListSource,
  validateAllowList,
  getWebhookSignature,
  getRequestOptions,
};

export {
  forwarderPrivate,
  forwarder,
};
