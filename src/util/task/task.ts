import chalk from "chalk";
import logSymbols from "log-symbols";
import ora from "ora";
import { indent } from "../text";
import {
    State,
    TaskConstructor,
    TaskContext,
    TaskStep,
    TaskSkipFunction,
    TaskUITypes,
    TaskErrorHandler
} from "./types";
import { TaskError } from "./error";

interface RenderedUI {
    text?: string;
    subtext?: string;
}

function renderUI<T>(context: T, ui?: TaskUITypes<T>): RenderedUI {
    const msg = typeof ui === "function" ? ui(context) : ui;

    if (typeof msg === "string") {
        return { text: msg };
    } else if (typeof msg === "object") {
        const { text, subtext } = msg;
        const t = typeof text === "function" ? text(context) : text;
        const st = typeof subtext === "function" ? subtext(context) : subtext;
        return { text: t, subtext: st };
    }

    return {};
}

const defaultSkipFn = (): boolean => false;

const defaultErrorHandler = (err: Error): never => {
    const error = TaskError.isTaskError(err) ? (err.cause || err) : err;
    throw error;
};

function formatUI(renderedUI?: RenderedUI): string | undefined {
    const { text, subtext } = renderedUI || {};
    return subtext ? `${text}\n${chalk.dim(indent(subtext, "   → "))}` : text;
}

function wrapStepsIntoTask<T>(steps: TaskStep<T>[]) {
    return async (ctx: T, task: Task<T>): Promise<T> => {
        for (const step of steps) {
            if (task.isPending()) {
                // eslint-disable-next-line no-await-in-loop
                const result = await step(ctx, task);
                if (result) {
                    task.render(ctx, result);
                }
            }
        }
        return ctx;
    };
}

export class Task<T = TaskContext> {
    private readonly steps: TaskStep<T>[];
    private readonly skipFn: TaskSkipFunction<T>;
    private readonly spinner: ora.Ora;
    private readonly errorHandler: TaskErrorHandler<T>;
    private ui: TaskUITypes<T>;
    private renderedUI?: RenderedUI;
    private state = State.PENDING;

    constructor(params: TaskConstructor<T>) {
        this.steps = params.steps || [];
        this.ui = params.initial || "Running task...";
        this.skipFn = params.skip || defaultSkipFn;
        this.spinner = ora(params.spinnerOptions);
        this.errorHandler = params.errorHandler || defaultErrorHandler;
    }

    isPending(): boolean {
        return this.state === State.PENDING;
    }

    isCompleted(): boolean {
        return this.state === State.COMPLETED;
    }

    isFailed(): boolean {
        return this.state === State.FAILED;
    }

    isSkipped(): boolean {
        return this.state === State.SKIPPED;
    }

    private renderUIText(context: T, ui?: TaskUITypes<T>): string | undefined {
        const renderedUI = renderUI(context, ui);
        if (renderedUI.text) {
            this.ui = ui;
            this.renderedUI = renderedUI;
        } else if (renderedUI.subtext && this.renderedUI) {
            this.renderedUI.subtext = renderedUI.subtext;
        }
        return formatUI(this.renderedUI);
    }

    /**
     * Update UI.
     *
     * Does not change current state of the task.
     *
     * @param {T} context Task context
     * @param {TaskUITypes<T>} ui New UI
     * @returns {void}
     */
    render(context: T, ui: TaskUITypes<T>): void {
        const msg = this.renderUIText(context, ui);
        if (msg) {
            this.spinner.text = msg;
            this.spinner.render();
        }
    }

    /**
     * Stops the spinner and changes it with skip symbol and persists
     *
     * Changes current state to SKIPPED.
     *
     * @param {T} context Task context
     * @param {TaskUITypes<T>} ui Persists this UI if provided.
     * @returns {void}
     */
    skip(context: T, ui?: TaskUITypes<T>): void {
        this.state = State.SKIPPED;
        this.spinner.info(this.renderUIText(context, ui));
    }

    /**
     * Stops the spinner and changes it with failure symbol and persists
     *
     * Changes current state to FAILED.
     *
     * @param {T} context Task context
     * @param {TaskUITypes<T>} ui Persists this UI if provided.
     * @returns {void}
     */
    fail(context: T, ui?: TaskUITypes<T>): void {
        this.state = State.FAILED;
        this.spinner.fail(this.renderUIText(context, ui));
    }

    /**
     * Stops the spinner and changes it with succeed symbol and persists
     *
     * Changes current state to COMPLETED.
     *
     * @param {T} context Task context
     * @param {TaskUITypes<T>} ui Persists this UI if provided.
     * @returns {void}
     */
    complete(context: T, ui?: TaskUITypes<T>): void {
        this.state = State.COMPLETED;
        this.spinner.succeed(this.renderUIText(context, ui));
    }

    isSpinning(): boolean {
        return this.spinner.isSpinning;
    }

    /**
     * Starts the spinner.
     *
     * No effect if the spinner is already started.
     *
     * Does not change current state of the task.
     *
     * @param {T} context Task context
     * @param {TaskUITypes<T>} ui Persists this UI if provided.
     * @returns {void}
     */
    startSpinner(context: T, ui?: TaskUITypes<T>): void {
        if (!this.spinner.isSpinning) {
            this.spinner.start(this.renderUIText(context, ui));
        }
    }

    /**
     * Stops the spinner.
     *
     * Persists the given UI or clears the current spinner.
     * No effect if the spinner is already stopped.
     *
     * Does not change current state of the task.
     *
     * @param {T} context Task context
     * @param {TaskUITypes<T>} ui Persists this UI if provided.
     * @returns {void}
     */
    stopSpinner(context: T, ui?: TaskUITypes<T>): void {
        if (this.spinner.isSpinning) {
            if (ui) {
                this.spinner.stopAndPersist({
                    symbol: logSymbols.info,
                    text: this.renderUIText(context, ui)
                });
            } else {
                this.spinner.stop();
                this.spinner.clear();
            }
        }
    }

    /**
     * Clears current task spinner
     *
     * @returns {void}
     */
    clearSpinner(): void {
        this.spinner.clear();
    }
    /**
     * Returns the current rendered text.
     *
     * @returns {String} Rendered text
     */
    getCurrentText(): string {
        return this.spinner.text;
    }

    async run(context?: T): Promise<T> {
        const ctx = context || Object.create(null);
        try {
            this.startSpinner(ctx, this.ui);

            const skipped = await this.skipFn(ctx);
            if (skipped) {
                if (typeof skipped === "boolean") {
                    this.skip(ctx);
                } else {
                    this.skip(ctx, skipped);
                }
            }

            if (!this.isSkipped()) {
                const task = wrapStepsIntoTask(this.steps);

                await task(ctx, this);

                if (this.isPending()) {
                    this.complete(ctx);
                }
            }

            return ctx;
        } catch (e) {
            if (TaskError.isTaskError<T>(e)) {
                e.message = this.renderUIText(ctx, e.ui) || e.message;
            }

            this.fail(ctx, e.ui);
            this.errorHandler(e, ctx, this);

            return ctx;
        }
    }
}