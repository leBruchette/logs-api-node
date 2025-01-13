import request from 'supertest';
import app from '../../../src/app';
import LogStreamingService from '../../../src/api/logs/service';
import { FileOpenError, FileStatError } from '../../../src/api/logs/types';

const filesResponse = `
  "file": {
    "name": "mock.log",
    "size": 12345,
    "createdAt": "2023-10-01T12:00:00Z",
    "modifiedAt": "2023-10-02T12:00:00Z"
  }`;

const linesResponse = `
  "lines": [
    "line1",
    "line2",
    "line3"
  ]`;

const mockResponse = `{
  ${filesResponse},
  ${linesResponse}
  }`;

describe('Logs API', () => {
  jest.mock('../../../src/api/logs/service');

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('200 status for /api/v1/logs route', async () => {
    request(app)
      .get('/api/v1/logs')
      .expect(200)
      .expect({ message: 'OK' });
  });

  test('200 status and correct headers for /api/v1/logs/some.log route', async () => {
    LogStreamingService.prototype.readLines = jest.fn().mockResolvedValueOnce(mockResponse);
    request(app)
      .get('/api/v1/logs/some.log')
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8');
  });

  test('400 status for invalid payload on /api/v1/logs route', async () => {
    request(app)
      .get('/api/v1/logs/')
      .send({ lines: 'twelve' })
      .expect(400);
  });

  test('400 status for empty payload on /api/v1/logs route', async () => {
    request(app)
      .get('/api/v1/logs')
      .send({ })
      .expect(400);
  });

  test('404 status for /api/v1/logs/non-existent route', async () => {
    const errorMessage = "I'm not here";
    LogStreamingService.prototype.readLines = jest.fn().mockRejectedValueOnce(new FileOpenError(errorMessage));
    request(app)
      .get('/api/v1/logs/unknown.log')
      .expect(404)
      .expect({ message: errorMessage });
  });

  test('500 status for /api/v1/logs/ route', async () => {
    const errorMessage = 'Kaboom';
    LogStreamingService.prototype.readLines = jest.fn().mockRejectedValueOnce(new FileStatError(errorMessage));
    request(app)
      .get('/api/v1/logs/unknown.log')
      .expect(404)
      .expect({ message: errorMessage });
  });
});
