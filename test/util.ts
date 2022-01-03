import { MockedFunction } from "jest-mock";

/* eslint-disable @typescript-eslint/no-explicit-any */
const mockResolvedWithValue = <T extends (...args: any[]) => any>(
    mocked: MockedFunction<T>,
    value: unknown,
    nth = 0
): Promise<void> => expect(mocked.mock.results[nth].value).resolves.toEqual(value);

const mockRejectedWithValue = <T extends (...args: any[]) => any>(
    mocked: MockedFunction<T>,
    value: string | Error,
    nth = 0
): Promise<void> => expect(mocked.mock.results[nth].value).rejects.toThrow(value);

export { mockResolvedWithValue, mockRejectedWithValue };
