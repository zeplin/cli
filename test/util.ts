const mockResolvedWithValue = (mocked: jest.Mock, value: unknown, nth = 0): Promise<void> =>
    expect(mocked.mock.results[nth].value).resolves.toEqual(value);

const mockRejectedWithValue = (mocked: jest.Mock, value: string | Error, nth = 0): Promise<void> =>
    expect(mocked.mock.results[nth].value).rejects.toThrow(value);

export { mockResolvedWithValue, mockRejectedWithValue };
