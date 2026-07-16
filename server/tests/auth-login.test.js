const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');

let server;
const port = 5010;
const baseUrl = `http://127.0.0.1:${port}`;

function waitForServer(url, timeoutMs = 10000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      fetch(url)
        .then(() => resolve())
        .catch(() => {
          if (Date.now() - start > timeoutMs) {
            reject(new Error('Server did not become ready in time'));
            return;
          }
          setTimeout(tryConnect, 200);
        });
    };

    tryConnect();
  });
}

test.before(async () => {
  server = spawn(process.execPath, ['index.js'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: String(port), NODE_ENV: 'test' },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let output = '';
  server.stdout.on('data', (chunk) => {
    output += chunk.toString();
  });
  server.stderr.on('data', (chunk) => {
    output += chunk.toString();
  });

  await waitForServer(baseUrl);
});

test.after(() => {
  if (server) {
    server.kill();
  }
});

test('login accepts case-insensitive email addresses', async () => {
  const uniqueEmail = `authcase${Date.now()}@Example.com`;
  const password = 'StrongPass123!';

  const registerRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Case Test',
      email: uniqueEmail,
      password,
      role: 'employee',
      organization: 'Test Org'
    })
  });

  assert.equal(registerRes.status, 201);

  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: uniqueEmail.toLowerCase(), password })
  });

  assert.equal(loginRes.status, 200);
  const body = await loginRes.json();
  assert.ok(body.token);
  assert.equal(body.user.email, uniqueEmail.toLowerCase());
});
