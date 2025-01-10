import request from 'supertest';
import app from '../src/app';

describe('Application', () => {
  test('200 status for /status route', async () => {
    request(app)
      .get('/status')
      .expect(200)
      .expect({ message: 'OK' });
  });

  test('404 status for non-existent API route', async () => {
    request(app)
      .get('/api/v1/non-existent')
      .expect(404)
      .expect({ message: 'Not Found' });
  });

  test('404 status for unknown routes', async () => {
    request(app)
      .get('/unknown-route')
      .expect(404)
      .expect({ message: 'Not Found' });
  });

  test('uses security middleware header values', async () => {
    request(app)
      .get('/status')
      .expect('x-dns-prefetch-control', 'off')
      .expect('x-frame-options', 'DENY')
      .expect('x-download-options', 'noopen')
      .expect('x-content-type-options', 'nosniff')
      .expect('x-permitted-cross-domain-policies', 'none');
  });

  test('returns correct CORS headers', async () => {
    request(app)
      .get('/status')
      .expect('access-control-allow-origin', '*')
      .expect('access-control-allow-methods', 'GET,HEAD,PUT,PATCH,POST,DELETE')
      .expect('access-control-allow-headers', 'Origin, X-Requested-With, Content-Type, Accept');
  });
});
