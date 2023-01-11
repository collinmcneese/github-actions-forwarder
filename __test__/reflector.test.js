// Tests for functions in reflector.js

const reflector = require('../src/reflector');
const { validateUrl, fetchAllowListSource, validateAllowList, getWebhookSignature, getRequestOptions } = reflector.reflectorPrivate;

let allowListObject = [
  'https://github.com',
  'https://api.github.com',
  'https://*.github.localdomain',
  'https://smee.io',
  'https://*.ngrok.io'
];

describe('validateUrl', () => {
  test('validateUrl() returns true for valid URL', () => {
    expect(validateUrl('https://github.com')).toBe(true);
  });

  test('validateUrl() throws error for invalid URL', () => {
    expect(() => {
      validateUrl('github.com');
    }).toThrow();
  });
});

describe('fetchAllowListSource', () => {
  let allowListSource = './__test__/allowlist.mock';

  test('fetchAllowListSource() returns an object and that members contain mock values', async () => {
    let allowList = await fetchAllowListSource(allowListSource);

    expect(typeof allowList).toBe('object');

    expect(allowList.sort()).toEqual(allowListObject.sort());
  });
});

describe('validateAllowList', () => {
  let allowList = allowListObject;

  test('validateAllowList() returns true for valid URL', () => {
    expect(validateAllowList('https://api.github.com', allowList)).toBe(true);
  });

  test('validateAllowList() returns true for valid URL with wildcard', () => {
    expect(validateAllowList('https://api.github.localdomain', allowList)).toBe(true);
  });

  test('validateAllowList() returns false for invalid URL', () => {
    expect(validateAllowList('https://invalid.url', allowList)).toBe(false);
  });
});

describe('getWebhookSignature', () => {

  test('getWebhookSignature() returns a sha1 string with the proper value', () => {
    let payload = 'payload';
    let secret = 'abc123';
    let algorithm = 'sha1';
    let expected = 'sha1=bf995fbe34d0a428d0cf1d7d45c8990ccefc9250';
    expect(getWebhookSignature(payload, secret, algorithm)).toBe(expected);
  });

  test('getWebhookSignature() returns a sha256 string with the proper value', () => {
    let payload = 'payload';
    let secret = 'abc123';
    let algorithm = 'sha256';
    let expected = 'sha256=ba245390d5b4bf305fbef57917c6919d580db46f6989347b7a1f03c4fced02c1';
    expect(getWebhookSignature(payload, secret, algorithm)).toBe(expected);
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

  test('getRequestOptions() returns an object with the proper values', () => {
    let options = getRequestOptions(context, targetUrl, webhookSecret);
    expect(typeof options).toBe('object');
    expect(options.url).toBe(targetUrl);
    expect(options.method).toBe('POST');
    expect(options.headers['X-GitHub-Event']).toBe(context.eventName);
    expect(options.headers['X-Hub-Signature']).toBe('sha1=2aa4571fded2cb5bc29e911b177f5f0d6e0775fa');
    expect(options.headers['X-Hub-Signature-256']).toBe('sha256=34187ae3db37f4e3b61b8b87849737a400be580cd7b05ee81afd5feeb9c3a758');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(options.body).toBe(JSON.stringify(context.payload, undefined, 2));
  });
});
