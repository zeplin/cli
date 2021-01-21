import { PassThrough } from "stream";
import { Task, transitionTo, Workflow } from "../../src/util/task";
import { TaskUITypes, TaskContext, TaskUI } from "../../src/util/task/types";
import { TaskError } from "../../src/util/task/error";

const ui = {
    text: "Initial static text",
    subtext: "Initial static subtext"
};

const uiFn: TaskUITypes<TaskContext> = (): TaskUI<TaskContext> => ({
    text: (): string => "Initial static text",
    subtext: (): string => "Initial static text"
});

const uiFnWithParams: TaskUITypes<TaskContext> = (ctx): TaskUI<TaskContext> => ({
    text: `Rendered text: ${ctx.param}`,
    subtext: `Rendered text: ${ctx.param}`
});

const anotherUiFnWithParams: TaskUITypes<TaskContext> = (ctx): TaskUI<TaskContext> => ({
    text: `Another rendered text: ${ctx.anotherParam}`,
    subtext: `Another rendered text: ${ctx.anotherParam}`
});

const failureUiFnWithParams: TaskUITypes<TaskContext> = (ctx): TaskUI<TaskContext> => ({
    text: `Failed rendered text: ${ctx.param}`,
    subtext: `Failed rendered text: ${ctx.param}`
});

const createMockStream = (): {
    mockedStream: PassThrough;
    output: string[];
} => {
    const mockedStream = new PassThrough();
    const output: string[] = [];

    mockedStream.on("data", (data: string) => {
        output.push(`${data}`.endsWith("\n") ? data : `${data}\n`);
    });

    return {
        mockedStream,
        output: {
            ...output,
            toString: (): string => output.join("")
        }
    };
};

describe("Task", () => {
    describe("Steps", () => {
        test("step should access the given context", async () => {
            const context = {
                randomNumber: Math.random()
            };

            const mock = jest.fn();

            const task = new Task({
                steps: [(ctx): void => {
                    mock(ctx);
                }],
                spinnerOptions: {
                    isSilent: true
                }
            });

            await task.run(context);

            expect(mock).toHaveBeenCalledWith(context);
        });

        test("step should access context params set by previous steps", async () => {
            const context = {
                randomNumber: Math.random()
            };

            const newParam = Math.random();

            const mock = jest.fn();

            const task = new Task({
                steps: [(ctx): void => {
                    ctx.newParam = newParam;
                }, (ctx): void => {
                    mock(ctx.newParam);
                }],
                spinnerOptions: {
                    isSilent: true
                }
            });

            const outputContext = await task.run(context);

            expect(mock).toHaveBeenCalledWith(newParam);
            expect(outputContext.newParam).toEqual(newParam);
        });

        test("step should not access context params set by later steps", async () => {
            const randomNumber = Math.random();

            const context = {
                randomNumber
            };

            const newValue = Math.random();

            const mock = jest.fn();

            const task = new Task({
                steps: [(ctx): void => {
                    mock(ctx.randomNumber);
                }, (ctx): void => {
                    ctx.randomNumber = newValue;
                }],
                spinnerOptions: {
                    isSilent: true
                }
            });

            const outputContext = await task.run(context);

            expect(mock).toHaveBeenCalledWith(randomNumber);
            expect(outputContext.randomNumber).toEqual(newValue);
        });

        test("step should not be invoked if task is skipped at the beginning", async () => {
            const randomNumber = Math.random();

            const context = {
                randomNumber
            };

            const newValue = Math.random();

            const mock = jest.fn();

            const task = new Task({
                skip: (): boolean => true,
                steps: [(ctx): void => {
                    ctx.randomNumber = newValue;
                    mock(ctx.randomNumber);
                }],
                spinnerOptions: {
                    isSilent: true
                }
            });

            const outputContext = await task.run(context);

            expect(mock).not.toHaveBeenCalled();
            expect(outputContext.randomNumber).toEqual(randomNumber);
        });

        test("step should not be invoked if task is skipped on previous steps", async () => {
            const randomNumber = Math.random();

            const context = {
                randomNumber
            };

            const newValue = Math.random();

            const mock = jest.fn();
            const skippedMock = jest.fn();

            const task = new Task({
                steps: [(ctx): void => {
                    ctx.randomNumber = newValue;
                    mock(newValue);
                }, (ctx, t): void => {
                    t.skip(ctx);
                }, (ctx): void => {
                    skippedMock(ctx.randomNumber);
                }],
                spinnerOptions: {
                    isSilent: true
                }
            });

            const outputContext = await task.run(context);

            expect(task.isSkipped()).toBeTruthy();
            expect(mock).toHaveBeenCalledWith(newValue);
            expect(skippedMock).not.toHaveBeenCalled();
            expect(outputContext.randomNumber).toEqual(newValue);
        });

        test("step should not be invoked if task is complete on previous steps", async () => {
            const randomNumber = Math.random();

            const context = {
                randomNumber
            };

            const newValue = Math.random();

            const mock = jest.fn();
            const skippedMock = jest.fn();

            const task = new Task({
                steps: [(ctx): void => {
                    ctx.randomNumber = newValue;
                    mock(newValue);
                }, (ctx, t): void => {
                    t.complete(ctx);
                }, (ctx): void => {
                    skippedMock(ctx.randomNumber);
                }],
                spinnerOptions: {
                    isSilent: true
                }
            });

            const outputContext = await task.run(context);

            expect(task.isCompleted()).toBeTruthy();
            expect(mock).toHaveBeenCalledWith(newValue);
            expect(skippedMock).not.toHaveBeenCalled();
            expect(outputContext.randomNumber).toEqual(newValue);
        });

        test("step should not be invoked if task is failed on previous steps", async () => {
            const randomNumber = Math.random();

            const context = {
                randomNumber
            };

            const newValue = Math.random();

            const mock = jest.fn();
            const skippedMock = jest.fn();

            const task = new Task({
                steps: [(ctx): void => {
                    ctx.randomNumber = newValue;
                    mock(newValue);
                }, (ctx, t): void => {
                    t.fail(ctx);
                }, (ctx): void => {
                    skippedMock(ctx.randomNumber);
                }],
                spinnerOptions: {
                    isSilent: true
                }
            });

            const outputContext = await task.run(context);

            expect(task.isFailed()).toBeTruthy();
            expect(mock).toHaveBeenCalledWith(newValue);
            expect(skippedMock).not.toHaveBeenCalled();
            expect(outputContext.randomNumber).toEqual(newValue);
        });

        test("step should not be invoked if previos step throws", async () => {
            const randomNumber = Math.random();

            const context = {
                randomNumber
            };

            const newValue = Math.random();

            const mock = jest.fn();
            const skippedMock = jest.fn();

            const task = new Task({
                steps: [(ctx): void => {
                    ctx.randomNumber = newValue;
                    mock(newValue);
                }, (ctx, t): void => {
                    t.fail(ctx);
                }, (ctx): void => {
                    skippedMock(ctx.randomNumber);
                }],
                spinnerOptions: {
                    isSilent: true
                }
            });

            const outputContext = await task.run(context);

            expect(task.isFailed()).toBeTruthy();
            expect(mock).toHaveBeenCalledWith(newValue);
            expect(skippedMock).not.toHaveBeenCalled();
            expect(outputContext.randomNumber).toEqual(newValue);
        });
    });

    describe("UI", () => {
        describe("no steps", () => {
            test("task should only render static initial UI", async () => {
                const { mockedStream, output } = createMockStream();

                const task = new Task({
                    steps: [],
                    initial: ui,
                    spinnerOptions: {
                        stream: mockedStream,
                        isEnabled: false
                    }
                });

                await task.run();

                expect(output.toString()).toMatchSnapshot();
            });

            test("task should only render function initial UI", async () => {
                const { mockedStream, output } = createMockStream();

                const task = new Task({
                    steps: [],
                    initial: uiFn,
                    spinnerOptions: {
                        stream: mockedStream,
                        isEnabled: false
                    }
                });

                await task.run();

                expect(output.toString()).toMatchSnapshot();
            });

            test("task should only render function initial UI with params", async () => {
                const { mockedStream, output } = createMockStream();

                const task = new Task({
                    steps: [],
                    initial: uiFnWithParams,
                    spinnerOptions: {
                        stream: mockedStream,
                        isEnabled: false
                    }
                });

                await task.run({
                    param: "should render this param"
                });

                expect(output.toString()).toMatchSnapshot();
            });
        });

        describe("with steps", () => {
            test("task should not update UI if not explicitly called", async () => {
                const { mockedStream, output } = createMockStream();

                const mock = jest.fn();

                const task = new Task({
                    steps: [(): void => {
                        mock("invoked inside a step");
                    }],
                    initial: ui,
                    spinnerOptions: {
                        stream: mockedStream,
                        isEnabled: false
                    }
                });

                await task.run();

                expect(mock).toHaveBeenCalledWith("invoked inside a step");
                expect(output.toString()).toMatchSnapshot();
            });

            test("task should update UI if render is called in a step", async () => {
                const { mockedStream, output } = createMockStream();

                const mock = jest.fn();

                const task = new Task({
                    steps: [(ctx, t): void => {
                        mock("invoked inside a step");
                        ctx.param = "should render this param";
                        t.render(ctx, uiFnWithParams);
                    }],
                    initial: ui,
                    spinnerOptions: {
                        stream: mockedStream,
                        isEnabled: false
                    }
                });

                await task.run();

                expect(mock).toHaveBeenCalledWith("invoked inside a step");
                expect(output.toString()).toMatchSnapshot();
            });

            test("task should update UI with transitionTo", async () => {
                const { mockedStream, output } = createMockStream();

                const mock = jest.fn();

                const task = new Task({
                    steps: [
                        (ctx, t): void => {
                            mock("invoked inside a step");
                            ctx.param = "should render this param";
                            t.render(ctx, uiFnWithParams);
                        },
                        (ctx): void => {
                            ctx.anotherParam = "should render this another param";
                        },
                        transitionTo(anotherUiFnWithParams),
                        (ctx): void => {
                            ctx.anotherParam = "should render this another param 2";
                        },
                        transitionTo(anotherUiFnWithParams)
                    ],
                    initial: ui,
                    spinnerOptions: {
                        stream: mockedStream,
                        isEnabled: false
                    }
                });

                await task.run();

                expect(mock).toHaveBeenCalledWith("invoked inside a step");
                expect(output.toString()).toMatchSnapshot();
            });

            test("task should update UI with step's returned value", async () => {
                const { mockedStream, output } = createMockStream();

                const mock = jest.fn();

                const task = new Task({
                    steps: [
                        (): string => {
                            mock("invoked inside a step 1");
                            return "step 1 UI output";
                        },
                        (): string => {
                            mock("invoked inside a step 2");
                            return "step 2 UI output";
                        }
                    ],
                    initial: ui,
                    spinnerOptions: {
                        stream: mockedStream,
                        isEnabled: false
                    }
                });

                await task.run();

                expect(mock).toHaveBeenNthCalledWith(1, "invoked inside a step 1");
                expect(mock).toHaveBeenNthCalledWith(2, "invoked inside a step 2");
                expect(output.toString()).toMatchSnapshot();
            });

            test("task should update UI if skip is called with another UI", async () => {
                const { mockedStream, output } = createMockStream();

                const mock = jest.fn();

                const task = new Task({
                    steps: [(ctx, t): void => {
                        mock("invoked inside a step");
                        ctx.param = "should render this param";
                        t.skip(ctx, uiFnWithParams);
                    }],
                    initial: ui,
                    spinnerOptions: {
                        stream: mockedStream,
                        isEnabled: false
                    }
                });

                await task.run();

                expect(task.isSkipped()).toBeTruthy();
                expect(mock).toHaveBeenCalledWith("invoked inside a step");
                expect(output.toString()).toMatchSnapshot();
            });

            test("task should update UI if complete is called with another UI", async () => {
                const { mockedStream, output } = createMockStream();

                const mock = jest.fn();

                const task = new Task({
                    steps: [(ctx, t): void => {
                        mock("invoked inside a step");
                        ctx.param = "should render this param";
                        t.complete(ctx, uiFnWithParams);
                    }],
                    initial: ui,
                    spinnerOptions: {
                        stream: mockedStream,
                        isEnabled: false
                    }
                });

                await task.run();

                expect(task.isCompleted()).toBeTruthy();
                expect(mock).toHaveBeenCalledWith("invoked inside a step");
                expect(output.toString()).toMatchSnapshot();
            });

            test("task should update UI if fail is called with another UI", async () => {
                const { mockedStream, output } = createMockStream();

                const mock = jest.fn();

                const task = new Task({
                    steps: [(ctx, t): void => {
                        mock("invoked inside a step");
                        ctx.param = "should render this param";
                        t.fail(ctx, uiFnWithParams);
                    }],
                    initial: ui,
                    spinnerOptions: {
                        stream: mockedStream,
                        isEnabled: false
                    }
                });

                await task.run();

                expect(task.isFailed()).toBeTruthy();
                expect(mock).toHaveBeenCalledWith("invoked inside a step");
                expect(output.toString()).toMatchSnapshot();
            });
        });
    });

    describe("Multiple Tasks", () => {
        describe("UI", () => {
            test("tasks should run consecutively", async () => {
                const { mockedStream, output } = createMockStream();

                const mock = jest.fn();

                const random = Math.random();

                const task1 = new Task({
                    steps: [
                        (ctx): void => {
                            mock("invoked inside a task 1");
                            ctx.param = "task 1";
                            ctx.random = random;
                        },
                        transitionTo(uiFnWithParams)
                    ],
                    initial: ui,
                    spinnerOptions: {
                        stream: mockedStream,
                        isEnabled: false
                    }
                });

                const task2 = new Task({
                    steps: [
                        (ctx): void => {
                            mock(`invoked inside a task 2, ${random}`);
                            ctx.param = "task 2";
                        },
                        transitionTo(uiFnWithParams)
                    ],
                    initial: ui,
                    spinnerOptions: {
                        stream: mockedStream,
                        isEnabled: false
                    }
                });

                const tasks = new Workflow({
                    context: {},
                    tasks: [
                        task1,
                        task2
                    ]
                });

                await tasks.run();

                expect(task1.isCompleted()).toBeTruthy();
                expect(mock).toHaveBeenNthCalledWith(1, "invoked inside a task 1");

                expect(task2.isCompleted()).toBeTruthy();
                expect(mock).toHaveBeenNthCalledWith(2, `invoked inside a task 2, ${random}`);

                expect(output.toString()).toMatchSnapshot();
            });

            test("tasks should fail and throw if one of tasks throws", async () => {
                const { mockedStream, output } = createMockStream();

                const mock = jest.fn();
                const notCalledMock = jest.fn();

                const random = Math.random();

                const innerError = new Error("inner error");
                const taskError = new TaskError(failureUiFnWithParams, innerError);

                const task1 = new Task({
                    steps: [
                        (ctx): void => {
                            mock("invoked inside a task 1");
                            ctx.param = "task 1";
                            ctx.random = random;
                        },
                        transitionTo(uiFnWithParams)
                    ],
                    initial: ui,
                    spinnerOptions: {
                        stream: mockedStream,
                        isEnabled: false
                    }
                });

                const task2 = new Task({
                    steps: [
                        (): void => {
                            mock(`invoked inside a task 2, ${random}`);
                            throw taskError;
                        },
                        transitionTo(uiFnWithParams)
                    ],
                    initial: ui,
                    spinnerOptions: {
                        stream: mockedStream,
                        isEnabled: false
                    }
                });

                const task3 = new Task({
                    steps: [
                        (ctx): void => {
                            notCalledMock(`invoked inside a task 3`);
                            ctx.param = "task 3";
                        },
                        transitionTo(uiFnWithParams)
                    ],
                    initial: ui,
                    spinnerOptions: {
                        stream: mockedStream,
                        isEnabled: false
                    }
                });

                const tasks = new Workflow({
                    context: {},
                    tasks: [
                        task1,
                        task2,
                        task3
                    ]
                });

                await expect(tasks.run()).rejects.toThrowError(innerError);

                expect(task1.isCompleted()).toBeTruthy();
                expect(task2.isFailed()).toBeTruthy();
                expect(task3.isPending()).toBeTruthy();

                expect(mock).toHaveBeenNthCalledWith(1, "invoked inside a task 1");
                expect(mock).toHaveBeenNthCalledWith(2, `invoked inside a task 2, ${random}`);
                expect(notCalledMock).not.toHaveBeenCalled();

                expect(output.toString()).toMatchSnapshot();
            });

            test("tasks should fail and throw if one of tasks throws regular error", async () => {
                const { mockedStream, output } = createMockStream();

                const mock = jest.fn();
                const notCalledMock = jest.fn();

                const random = Math.random();

                const error = new Error("Error text");

                const task1 = new Task({
                    steps: [
                        (ctx): void => {
                            mock("invoked inside a task 1");
                            ctx.param = "task 1";
                            ctx.random = random;
                        },
                        transitionTo(uiFnWithParams)
                    ],
                    initial: ui,
                    spinnerOptions: {
                        stream: mockedStream,
                        isEnabled: false
                    }
                });

                const task2 = new Task({
                    steps: [
                        (): void => {
                            mock(`invoked inside a task 2, ${random}`);
                            throw error;
                        },
                        transitionTo(uiFnWithParams)
                    ],
                    initial: ui,
                    spinnerOptions: {
                        stream: mockedStream,
                        isEnabled: false
                    }
                });

                const task3 = new Task({
                    steps: [
                        (ctx): void => {
                            notCalledMock(`invoked inside a task 3`);
                            ctx.param = "task 3";
                        },
                        transitionTo(uiFnWithParams)
                    ],
                    initial: ui,
                    spinnerOptions: {
                        stream: mockedStream,
                        isEnabled: false
                    }
                });

                const tasks = new Workflow({
                    context: {},
                    tasks: [
                        task1,
                        task2,
                        task3
                    ]
                });

                await expect(tasks.run()).rejects.toThrowError(error);

                expect(task1.isCompleted()).toBeTruthy();
                expect(task2.isFailed()).toBeTruthy();
                expect(task3.isPending()).toBeTruthy();

                expect(mock).toHaveBeenNthCalledWith(1, "invoked inside a task 1");
                expect(mock).toHaveBeenNthCalledWith(2, `invoked inside a task 2, ${random}`);
                expect(notCalledMock).not.toHaveBeenCalled();

                expect(output.toString()).toMatchSnapshot();
            });

            test("tasks should run even if one of tasks throws regular error with no-op failure handler", async () => {
                const { mockedStream, output } = createMockStream();

                const mock = jest.fn();

                const random = Math.random();

                const error = new Error("Error text");

                const task1 = new Task({
                    steps: [
                        (ctx): void => {
                            mock("invoked inside a task 1");
                            ctx.param = "task 1";
                            ctx.random = random;
                        },
                        transitionTo(uiFnWithParams)
                    ],
                    initial: ui,
                    spinnerOptions: {
                        stream: mockedStream,
                        isEnabled: false
                    }
                });

                const task2 = new Task({
                    steps: [
                        (): void => {
                            mock(`invoked inside a task 2, ${random}`);
                            throw error;
                        },
                        transitionTo(uiFnWithParams)
                    ],
                    initial: ui,
                    spinnerOptions: {
                        stream: mockedStream,
                        isEnabled: false
                    },
                    errorHandler: (): void => {}
                });

                const task3 = new Task({
                    steps: [
                        (ctx): void => {
                            mock(`invoked inside a task 3`);
                            ctx.param = "task 3";
                        },
                        transitionTo(uiFnWithParams)
                    ],
                    initial: ui,
                    spinnerOptions: {
                        stream: mockedStream,
                        isEnabled: false
                    }
                });

                const tasks = new Workflow({
                    context: {},
                    tasks: [
                        task1,
                        task2,
                        task3
                    ]
                });

                await tasks.run();

                expect(task1.isCompleted()).toBeTruthy();
                expect(task2.isFailed()).toBeTruthy();
                expect(task3.isCompleted()).toBeTruthy();

                expect(mock).toHaveBeenNthCalledWith(1, "invoked inside a task 1");
                expect(mock).toHaveBeenNthCalledWith(2, `invoked inside a task 2, ${random}`);
                expect(mock).toHaveBeenNthCalledWith(3, `invoked inside a task 3`);

                expect(output.toString()).toMatchSnapshot();
            });
        });
    });
});