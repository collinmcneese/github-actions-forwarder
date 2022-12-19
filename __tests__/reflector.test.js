// Tests for the reflector module using jest

const reflector = require('../reflector');
const { test, expect } = require('@jest/globals');


test('reflector should respond with a 200 status code', () => {
  expect.assertions(1);
  return reflector({ targetUrl: 'https://some-url.localdomain/200' }).then((response) => {
    expect(response).toEqual('Payload sent to https://some-url.localdomain/200 \n response: 200 - OK');
  });
});

test('reflector should throw an error if targetUrl is not a valid URL', () => {
  expect(() => {
    reflector({ targetUrl: 'not-a-valid-url' });
  }).toThrow(TypeError);
});
