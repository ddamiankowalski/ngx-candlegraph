import { IViewConfig } from '../interfaces/view.interface';

export class View {
    constructor(viewConfig: IViewConfig) {
        const { 
            intervalColInit, 
            intervalColRatios, 
            viewOffset, 
            intervalStep, 
            intervalCandles,
            intervalSubColRatios
        } = viewConfig;

        this.colInterval = intervalColInit;
        this.viewOffset = viewOffset;
        this.colIntervalRatios = intervalColRatios;
        this.intervalStep = intervalStep;
        this.intervalCandles = intervalCandles;
        this.subColIntervalRatios = intervalSubColRatios;
    }

    private colInterval: number;
    private viewOffset: number;
    private colIntervalRatios: number[];
    private subColIntervalRatios: number[];
    private intervalStep: number;
    private intervalCandles: number;

    public getIntervalCandles(): number {
        return this.intervalCandles;
    }

    public getDivider(): number {
        return Math.pow(2, this.intervalStep);
    }

    public getSubColRatio(): number {
        return this.subColIntervalRatios[this.intervalStep];
    }

    public addColInterval(x: number) {
        if(this.maxZoomOut(x)) {
            this.colInterval = this.getMinColInterval();
            return;
        }

        if(this.maxZoomIn(x)) {
            this.colInterval = this.getMaxColInterval();
            return;
        }

        this.colInterval += x;
        this.updateIntervalStep();
    }

    private getMinColInterval(): number {
        return this.colIntervalRatios[0];
    }

    public getIntervalStep(): number {
        return this.intervalStep;
    }

    private getMaxColInterval(): number {
        return this.colIntervalRatios[this.colIntervalRatios.length - 1];
    }

    public maxZoomOut(x: number = 0): boolean {
        return this.colInterval + x <= this.getMinColInterval() && x <= 0;
    }

    public maxZoomIn(x: number = 0): boolean {
        return this.colInterval + x >= this.getMaxColInterval()  && x >= 0;
    }

    private updateIntervalStep(): void {
        this.checkIfNextStep();
        this.checkIfPrevStep();
    }

    private checkIfNextStep(): void {
        if(this.intervalStep !== (this.colIntervalRatios.length - 1) && this.colInterval >= this.colIntervalRatios[this.intervalStep + 1]) {
            this.intervalStep++;
        } 
    }

    private checkIfPrevStep(): void {
        if(this.intervalStep !== 0 && this.colInterval < this.colIntervalRatios[this.intervalStep]) {
            this.intervalStep--;
        }
    }

    public getColInterval(): number {
        return this.colInterval;
    }

    public getViewOffset(): number {
        return this.viewOffset;
    }

    public setViewOffset(x: number): void {
        this.viewOffset = x;
    }

    public addViewOffset(x: number) {
        if(this.colInterval !== this.getMinColInterval() && this.colInterval !== this.getMaxColInterval()) {
            this.viewOffset += x;
        }
    }
}