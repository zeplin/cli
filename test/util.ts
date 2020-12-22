const mockResolvedWithValue = (mocked: jest.Mock, value: unknown, nth = 0): Promise<void> =>
    mocked.mock.results[nth].value.then((result: unknown) => expect(result).toEqual(value));

const mockRejectedWithValue = (mocked: jest.Mock, value: unknown, nth = 0): Promise<void> =>
    mocked.mock.results[nth].value.then((result: unknown) => expect(result).toEqual(value));

export { mockResolvedWithValue, mockRejectedWithValue };
