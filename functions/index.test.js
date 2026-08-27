const test = require('node:test');
const assert = require('node:assert/strict');

const { askGemini } = require('./index');

function makeRes() {
  return {
    headers: {},
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    set(key, value) {
      this.headers[key] = value;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    send(payload) {
      this.body = payload;
      return this;
    },
    text() {
      return this.body;
    }
  };
}

test('rejects requests from untrusted origins', async () => {
  const req = {
    method: 'POST',
    headers: { origin: 'https://evil.example' },
    body: { question: 'What is a budget?' }
  };

  const res = makeRes();
  await askGemini(req, res);

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.error, 'Origin not allowed');
});

test('allows Vercel preview origins', async () => {
  const req = {
    method: 'POST',
    headers: { origin: 'https://efg-app-git-main-abc123.vercel.app' },
    body: { question: 'What is a budget?' }
  };

  const res = makeRes();
  await askGemini(req, res);

  assert.equal(res.headers['Access-Control-Allow-Origin'], 'https://efg-app-git-main-abc123.vercel.app');
  assert.equal(res.statusCode, 500);
});
