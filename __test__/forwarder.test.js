import { describe, expect, test } from 'vitest';
import { forwarderPrivate as forwarder } from '../src/forwarder.js';
const { validateUrl, fetchAllowListSource, validateAllowList, getWebhookSignature, getRequestOptions } = forwarder;

const allowListObject = [
  'https://github.com',
  'https://api.github.com',
  'https://*.github.localdomain',
  'https://smee.io',
  'https://*.ngrok.io'
];

describe('validateUrl', () => {
  test('returns true for valid URL', () => {
    expect(validateUrl('https://github.com')).toBe(true);
  });

  test('throws error for invalid URL', () => {
    expect(() => {
      validateUrl('github.com');
    }).toThrow();
  });
});

describe('fetchAllowListSource', () => {
  const allowListSource = './__test__/allowlist.mock';

  test('returns an object and that members contain mock values', async () => {
    const allowList = await fetchAllowListSource(allowListSource);

    expect(Array.isArray(allowList)).toBe(true);
    expect([...allowList].sort()).toEqual([...allowListObject].sort());
  });
});

describe('validateAllowList', () => {
  const allowList = allowListObject;

  test('returns true for valid URL', () => {
    expect(validateAllowList('https://api.github.com', allowList)).toBe(true);
  });

  test('returns true for valid URL with wildcard', () => {
    expect(validateAllowList('https://api.github.localdomain', allowList)).toBe(true);
  });

  test('returns false for invalid URL', () => {
    expect(validateAllowList('https://invalid.url', allowList)).toBe(false);
  });
});

describe('getWebhookSignature', () => {

  test('returns a sha1 string with the proper value', () => {
    const payload = 'payload';
    const secret = 'abc123';
    const algorithm = 'sha1';
    const expected = 'sha1=bf995fbe34d0a428d0cf1d7d45c8990ccefc9250';
    expect(getWebhookSignature(payload, secret, algorithm)).toBe(expected);
  });

  test('returns a sha256 string with the proper value', () => {
    const payload = 'payload';
    const secret = 'abc123';
    const algorithm = 'sha256';
    const expected = 'sha256=ba245390d5b4bf305fbef57917c6919d580db46f6989347b7a1f03c4fced02c1';
    expect(getWebhookSignature(payload, secret, algorithm)).toBe(expected);
  });
});

describe('getRequestOptions', () => {
  const context = {
    eventName: 'push',
    payload: {
      test: 'test'
    }
  };
  const targetUrl = 'https://github.com';
  const webhookSecret = 'abc123';

  test('returns an object with the proper values', () => {
    const options = getRequestOptions(context, targetUrl, webhookSecret);
    expect(options).toEqual(expect.any(Object));
    expect(options.url).toBe(targetUrl);
    expect(options.method).toBe('POST');
    expect(options.headers['X-GitHub-Event']).toBe(context.eventName);
    expect(options.headers['X-Hub-Signature']).toBe('sha1=2aa4571fded2cb5bc29e911b177f5f0d6e0775fa');
    expect(options.headers['X-Hub-Signature-256']).toBe('sha256=34187ae3db37f4e3b61b8b87849737a400be580cd7b05ee81afd5feeb9c3a758');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(options.body).toBe(JSON.stringify(context.payload, undefined, 2));
  });
});