import { Hello } from ".";

describe("Hello#hello", () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it("should print on console", () => {
        const HELLO_STRING = "test";
        const hello = new Hello(HELLO_STRING);

        const consoleSpy = jest.spyOn(global.console, "log");

        hello.hello();

        expect(consoleSpy).toHaveBeenCalledWith(`Hello ${HELLO_STRING}!`);
    });
});

