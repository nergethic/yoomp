/**
 * @module time
 */

export const SECOND: number = 1.0;
export const MILLISECOND: number = 0.001;

export function getTimeInSeconds(): number {
	const nowMs = (typeof performance !== 'undefined' ? performance.now() : Date.now());
	return nowMs * MILLISECOND;
}

export class Clock {
    public running: boolean = false;
    public startTime: number = 0;
    public oldTime: number = 0;
    public elapsedTime: number = 0;

    constructor() { }

    private now(): number {
        return (typeof performance !== 'undefined' ? performance.now() : Date.now());
    }

    start(): void {
        this.startTime = this.now();
        this.oldTime = this.startTime;
        this.elapsedTime = 0;
        this.running = true;
    }

    stop(): void {
    	if (this.running) {
            this.getElapsedTime();
            this.running = false;
        }
    }

    getDt(): number {
        if (!this.running) {
            console.warn("Clock.getDt() called while clock was stopped. Starting clock.");
            this.start();

            return 0.0;
        }

        const currentTime = this.now();
        const dtMilliseconds = currentTime - this.oldTime;
        const dtSeconds = dtMilliseconds * MILLISECOND;

        this.oldTime = currentTime;
        this.elapsedTime += dtSeconds;

        return dtSeconds;
    }

    getElapsedTime(): number {
        if (this.running) {
            this.getDt();
        }

        return this.elapsedTime;
    }
}

export class Timer {
    public timeToTick: number;
    public frequency: number;

    public time: number = 0.0;        // NOTE: Current accumulated time towards the next tick
    public totalTime: number = 0.0;   // NOTE: Total time accumulated by the timer
    public pause: boolean = false;
    public tick: boolean = false;     // NOTE: Flag indicating if a tick occurred in the last advance
    public doneProcessing: boolean = true; // NOTE: Flag used by ifTick to run an action only once

    /**
     * @param {number} frequency - Multiplier for the delta time (dt) passed to advance. 1.0 is normal speed.
     * @param {number} timeToTick - The amount of scaled time that needs to accumulate before a tick occurs.
     */
    constructor(frequency: number, timeToTick: number) {
        if (timeToTick <= 0) {
            throw new Error("Timer timeToTick must be positive.");
        }
        this.frequency = frequency;
        this.timeToTick = timeToTick;
    }

    /**
     * Resets the timer after a tick, preserving any overshoot time.
     * Sets the 'doneProcessing' flag for ifTick.
     */
    private reset(): void {
        if (this.tick) {
            this.time -= this.timeToTick;
            if (this.time < 0)
				this.time = 0;

            this.doneProcessing = false; // Signal that the tick needs processing by ifTick
        } else {
            this.time = 0.0;
        }

        this.tick = false;
    }

    /**
     * Executes an action once if a tick has occurred and hasn't been processed yet.
     * Allows pausing the timer based on a condition.
     * @param {() => void} action - The function to execute upon a processed tick.
     * @param {boolean} continueCondition - If false, the timer will be paused after this check.
     * @returns {boolean} True if the action was executed (meaning a tick was processed), false otherwise.
     */
    ifTick(action: () => void, continueCondition: boolean = true): boolean {
        let executedAction = false;
        if (!this.doneProcessing) {
            action();
            this.doneProcessing = true;
            executedAction = true;
        }

        this.pause = !continueCondition;
        return executedAction;
    }

    /**
     * Advances the timer by a delta time, scaled by the frequency.
     * @param {number} dt - Delta time in seconds (usually from a Clock).
     * @returns {boolean} True if a tick occurred during this advancement, false otherwise.
     */
    advance(dt: number): boolean {
         this.tick = false;

        if (!this.pause) {
            const scaledDt = dt * this.frequency;
            this.time += scaledDt;
            this.totalTime += scaledDt;

            if (this.time >= this.timeToTick) {
                this.tick = true;
                this.reset();

                return true;
            }
        }

        return false;
    }

    setPaused(paused: boolean): void {
    	this.pause = paused;
    }

    manualReset(): void {
        this.time = 0.0;
        this.totalTime = 0.0;
        this.tick = false;
        this.doneProcessing = true;
    }
}