import { AnimationsManager } from './animations-manager';

export class Animation {
    constructor(type: string, duration: number, startValues: number[], endValues: number[], callback: (...arg: any[]) => void, easeType: boolean) {
        this.type = type;
        this.animationStartTime = AnimationsManager.getCurrentTimeStamp();
        this.msDuration = duration;
        this.startValues = startValues;
        this.endValues = endValues;
        this.setValCallback = callback;
        this.easeType = easeType;
    }

    public isFinished = false;

    public type: string;
    private easeType: boolean;
    private animationStartTime: number;
    private msDuration: number;
    private startValues: number[];
    private endValues: number[];
    private setValCallback: (...arg: any[]) => void;

    public updateAnimationPositions(): void {
        const currentTime = AnimationsManager.getCurrentTimeStamp();

        if(currentTime - this.animationStartTime <= this.msDuration) {
            const timeProgress = this.getTimeProgress(currentTime);
            const ease = this.getEaseFunction(timeProgress);

            const resultValues = this.startValues.map((v, index) => v + (this.endValues[index] - v) * ease);
            this.setValCallback(resultValues, this);
        } else {
            this.isFinished = true;
        }
    }

    private getEaseFunction(timeProgress: number): number {
        if(!this.easeType) {
            return this.easeInOutQuint(timeProgress);
        } else {
            return this.easeInOutSine(timeProgress);
        }
    }

    private getTimeProgress(currentTime: number): number {
        return (currentTime - this.animationStartTime) / this.msDuration;
    }

    private easeInOutQuint(x: number): number {
        return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    }

    private easeInOutSine(x: number): number {
        return x < 0.5
        ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
        : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
    }

    public setStartValues(values: number[]): void {
        this.startValues = values;
    }

    public setEndValues(values: number[]): void {
        this.endValues = values;
    }

    public getValues(): any {
        return {
            startValues: this.startValues,
            endValues: this.endValues
        }
    }
}