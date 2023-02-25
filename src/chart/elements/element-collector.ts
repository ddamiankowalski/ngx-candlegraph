import { Time } from '../time';
import { Dimensions } from '../dimensions';
import { View } from '../view';
import { CandlePayload } from '../../interfaces/candlestick';
import { Candle } from './candle';
import { Line } from './line';
import { Element } from './element';
import { Text } from './text';

export class ElementCollector {
    constructor(
        time: Time,
        dimensions: Dimensions,
        view: View,
        candleData: CandlePayload[],
        context: CanvasRenderingContext2D
    ) {
        this.time = time;
        this.dimensions = dimensions;
        this.view = view;
        this.candleData = candleData;
        this.context = context;
        this.setElements();
    }

    /**
     * a set of elements to render in the end
     */
    private renderingElementsSet: Set<Element[]> = new Set();

    private time: Time;
    private dimensions: Dimensions;
    private view: View;
    private candleData: CandlePayload[];
    
    private context: CanvasRenderingContext2D;

    private candles: Candle[] = [];
    private mainColumnLines: Line[] = [];
    private subColumnLines: Line[] = [];
    private text: Text[] = [];

    public getElements(): Set<Element[]> {
        return this.renderingElementsSet;
    }

    private setElements(): void {
        const { width: canvasWidth, height: canvasHeight } = this.dimensions.getDimensions();
        let currentColumn = 0;

        for(let xDrawingOffset = canvasWidth; xDrawingOffset + this.view.getViewOffset() > 0; xDrawingOffset = xDrawingOffset - this.view.getColInterval()) { 
            const xDrawingPosition = xDrawingOffset + this.view.getViewOffset() - this.dimensions.getHorizontalMargin();
            const [ yStartDrawingPosition, yEndDrawingPosition ] = [ 0, canvasHeight - this.dimensions.getVerticalMargin() ];
            currentColumn++;          

            if(xDrawingPosition > 0 && xDrawingPosition < canvasWidth + this.view.getColInterval()) {
                this.addCandlesInInterval(xDrawingPosition, this.candleData, currentColumn, canvasWidth);
                this.addMainColumnLine(xDrawingPosition, yStartDrawingPosition, yEndDrawingPosition);
                this.addSubColumnLines(xDrawingPosition, yStartDrawingPosition, yEndDrawingPosition);      
                this.addTimeStamps(xDrawingPosition, currentColumn, this.candleData);
            }
        }

        this.renderingElementsSet.add(this.subColumnLines);
        this.renderingElementsSet.add(this.mainColumnLines);
        this.renderingElementsSet.add(this.candles);
        this.renderingElementsSet.add(this.text);
    }

    private addMainColumnLine(xStart: number, yStart: number, yEnd: number): void {
        this.mainColumnLines.push(new Line({ xStart, xEnd: xStart, yStart, yEnd }, { width: .4 }));
    }

    private addCandlesInInterval(xMainColumnDrawingPosition: number, candlesData: CandlePayload[], currentColumn: number, graphWidth: number): void {
        const distanceBetweenCandles = this.getIntervalCandleDistance();

        for(let candle = 0; candle < this.time.candlesInInterval(); candle++) {
            const currentCandleToRender = candlesData[candle + this.time.candlesInInterval() * (currentColumn - 1)];
            this.addCandleIfInView(xMainColumnDrawingPosition, candle, distanceBetweenCandles, graphWidth, currentCandleToRender);
        }
    }

    private getIntervalCandleDistance(): number {
        return this.view.getColInterval() / this.time.candlesInInterval();
    }

    private addCandleIfInView(
        xMainColumnDrawingPosition: number, 
        candleNumInInterval: number, 
        distanceBetweenCandles: number, 
        graphWidth: number,
        currentCandleToRender: CandlePayload
    ): void {
        if(
            xMainColumnDrawingPosition - candleNumInInterval * distanceBetweenCandles > 0 && 
            xMainColumnDrawingPosition - candleNumInInterval * distanceBetweenCandles < graphWidth - this.dimensions.getHorizontalMargin() + 10
        ) {
            const candleXRenderPosition = xMainColumnDrawingPosition - candleNumInInterval * distanceBetweenCandles;
            this.candles.push(new Candle({ xStart: candleXRenderPosition }, { width: 1 }, currentCandleToRender, this.view.getZoom()))
        }
    }

    private addSubColumnLines(xStart: number, yStart: number, yEnd: number): void {
        debugger
        let drawingOffset = xStart;
        let candlesInInterval = this.time.candlesInInterval();

        if(candlesInInterval >= 30) {
            candlesInInterval = candlesInInterval / 5;
        }
        const gap = this.view.getColInterval() / candlesInInterval;

        for(let currentSubLine = 0; currentSubLine < candlesInInterval; currentSubLine++) {
            const xStart = drawingOffset - gap;
            this.subColumnLines.push(new Line({ xStart, xEnd: xStart, yStart, yEnd }, { width: .1 }));
            drawingOffset = drawingOffset - gap;
        }
    }

    private addTimeStamps(xStart: number, columnOffset: number, candlesData: CandlePayload[]): void {
            const yDrawingPosition = this.dimensions.getHeight() - this.dimensions.getVerticalMargin() + 23;
            const date = new Date(Date.parse(candlesData[0].time));
            date.setMinutes(date.getMinutes() - this.time.candlesInInterval() * (columnOffset - 1));
            this.text.push(new Text({ xStart: xStart - 10, yStart: yDrawingPosition }, {}, `${date.getHours()}:${date.getMinutes()}`));

            let distanceBetweenCandle = this.view.getColInterval() / this.time.candlesInInterval();

            for(let i = 0; i < this.time.candlesInInterval(); i++) {
                this.text.push(new Text({ xStart: xStart - 10 - (distanceBetweenCandle + distanceBetweenCandle * i), yStart: yDrawingPosition }, {}, `i`));
            }
    }
}