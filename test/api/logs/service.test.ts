import mock from 'mock-fs';
import LogStreamingService from '../../../src/api/logs/service';

describe('LogStreamingService', () => {
  jest.mock('fs/promises');
  const mockResponseWriter = jest.fn();

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mock({
      'test.log': 'line1\nline2\nline3\nline4\n',
      'partial.log': 'line1\nline2\nline3\npartial',
      'empty.log': '',
    });
  });

  afterEach(() => {
    mock.restore();
  });

  it('should read lines from log file using default parameter', async () => {
    await new LogStreamingService(mockResponseWriter).readLines({ path: 'test.log', lines: 30, search: '' });

    expect(mockResponseWriter).toHaveBeenNthCalledWith(1, expect.stringContaining('{\n\"file\": {\"name\":\"test.log\",\"size\":24,'));
    expect(mockResponseWriter).toHaveBeenNthCalledWith(2, '\"line4\"');
    expect(mockResponseWriter).toHaveBeenNthCalledWith(3, ',\n');
    expect(mockResponseWriter).toHaveBeenNthCalledWith(4, '\"line3\"');
    expect(mockResponseWriter).toHaveBeenNthCalledWith(5, ',\n');
    expect(mockResponseWriter).toHaveBeenNthCalledWith(6, '\"line2\"');
    expect(mockResponseWriter).toHaveBeenNthCalledWith(7, ',\n');
    expect(mockResponseWriter).toHaveBeenNthCalledWith(8, '\"line1\"');
    expect(mockResponseWriter).toHaveBeenNthCalledWith(9, '\n]\n}');
  });

  it('should read lines from log file using line parameter', async () => {
    await new LogStreamingService(mockResponseWriter).readLines({ path: 'test.log', lines: 1, search: '' });

    expect(mockResponseWriter).toHaveBeenNthCalledWith(1, expect.stringContaining('{\n\"file\": {\"name\":\"test.log\",\"size\":24,'));
    expect(mockResponseWriter).toHaveBeenNthCalledWith(2, '\"line4\"');
    expect(mockResponseWriter).toHaveBeenNthCalledWith(3, '\n]\n}');
  });

  it('should handle empty log file', async () => {
    await new LogStreamingService(mockResponseWriter).readLines({ path: 'empty.log', lines: 10, search: '' });

    expect(mockResponseWriter).toHaveBeenNthCalledWith(1, expect.stringContaining('{\n\"file\": {\"name\":\"empty.log\",\"size\":0,'));
    expect(mockResponseWriter).toHaveBeenNthCalledWith(2, '\n]\n}');
  });

  it('should handle log file with no matching lines', async () => {
    await new LogStreamingService(mockResponseWriter).readLines({ path: 'test.log', lines: 2, search: 'bingo' });

    expect(mockResponseWriter).toHaveBeenNthCalledWith(1, expect.stringContaining('{\n\"file\": {\"name\":\"test.log\",\"size\":24,'));
    expect(mockResponseWriter).toHaveBeenNthCalledWith(2, '\n]\n}');
  });

  it('should handle log file with partial lines', async () => {
    await new LogStreamingService(mockResponseWriter).readLines({ path: 'partial.log', lines: 3, search: '' });

    expect(mockResponseWriter).toHaveBeenNthCalledWith(1, expect.stringContaining('{\n\"file\": {\"name\":\"partial.log\",\"size\":25'));
    expect(mockResponseWriter).toHaveBeenNthCalledWith(2, '\"partial\"');
    expect(mockResponseWriter).toHaveBeenNthCalledWith(3, ',\n');
    expect(mockResponseWriter).toHaveBeenNthCalledWith(4, '\"line3\"');
    expect(mockResponseWriter).toHaveBeenNthCalledWith(5, ',\n');
    expect(mockResponseWriter).toHaveBeenNthCalledWith(6, '\"line2\"');
    expect(mockResponseWriter).toHaveBeenNthCalledWith(7, '\n]\n}');
  });
});