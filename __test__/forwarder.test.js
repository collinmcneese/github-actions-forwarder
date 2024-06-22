// Tests for functions in forwarder.js using Mocha and Chai


import { expect } from 'chai';
import { forwarderPrivate as forwarder } from '../src/forwarder.js';
const { validateUrl, fetchAllowListSource, validateAllowList, getWebhookSignature, getRequestOptions } = forwarder;

let allowListObject = [
  'https://github.com',
  'https://api.github.com',
  'https://*.github.localdomain',
  'https://smee.io',
  'https://*.ngrok.io'
];

describe('validateUrl', () => {
  it('returns true for valid URL', () => {
    expect(validateUrl('https://github.com')).to.be.true;
  });

  it('throws error for invalid URL', () => {
    expect(() => {
      validateUrl('github.com');
    }).to.throw();
  });
});

describe('fetchAllowListSource', () => {
  let allowListSource = './__test__/allowlist.mock';

  it('returns an object and that members contain mock values', async () => {
    let allowList = await fetchAllowListSource(allowListSource);

    expect(allowList).to.be.an('array');
    expect(allowList.sort()).to.deep.equal(allowListObject.sort());
  });
});

describe('validateAllowList', () => {
  let allowList = allowListObject;

  it('returns true for valid URL', () => {
    expect(validateAllowList('https://api.github.com', allowList)).to.be.true;
  });

  it('returns true for valid URL with wildcard', () => {
    expect(validateAllowList('https://api.github.localdomain', allowList)).to.be.true;
  });

  it('returns false for invalid URL', () => {
    expect(validateAllowList('https://invalid.url', allowList)).to.be.false;
  });
});

describe('getWebhookSignature', () => {

  it('returns a sha1 string with the proper value', () => {
    let payload = 'payload';
    let secret = 'abc123';
    let algorithm = 'sha1';
    let expected = 'sha1=bf995fbe34d0a428d0cf1d7d45c8990ccefc9250';
    expect(getWebhookSignature(payload, secret, algorithm)).to.equal(expected);
  });

  it('returns a sha256 string with the proper value', () => {
    let payload = 'payload';
    let secret = 'abc123';
    let algorithm = 'sha256';
    let expected = 'sha256=ba245390d5b4bf305fbef57917c6919d580db46f6989347b7a1f03c4fced02c1';
    expect(getWebhookSignature(payload, secret, algorithm)).to.equal(expected);
  });
});

describe('getRequestOptions', () => {
  let context = {
    eventName: 'push',
    payload: {
      test: 'test'
    }
  };
  let targetUrl = 'https://github.com';
  let webhookSecret = 'abc123';

  it('returns an object with the proper values', () => {
    let options = getRequestOptions(context, targetUrl, webhookSecret);
    expect(options).to.be.an('object');
    expect(options.url).to.equal(targetUrl);
    expect(options.method).to.equal('POST');
    expect(options.headers['X-GitHub-Event']).to.equal(context.eventName);
    expect(options.headers['X-Hub-Signature']).to.equal('sha1=2aa4571fded2cb5bc29e911b177f5f0d6e0775fa');
    expect(options.headers['X-Hub-Signature-256']).to.equal('sha256=34187ae3db37f4e3b61b8b87849737a400be580cd7b05ee81afd5feeb9c3a758');
    expect(options.headers['Content-Type']).to.equal('application/json');
    expect(options.body).to.equal(JSON.stringify(context.payload, undefined, 2));
  });
});