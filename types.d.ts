/// <reference types="typescript" />

export interface GridType {
    init(
        width: number,
        height: number,
        margin: number
    ): {
        margin: number;
        array: number[][];
    };
    
    loop(
        grid: number[][], 
        fn: (cell: number, x: number, y: number) => void
    ): void;

    getPointValue(
        x: number,
        y: number,
        grid: number[][]
    ): number | undefined;
}

export interface PolylineModel {
    getLinesAtPoint(
        x: number,
        y: number,
        polylines: [][{x:number, y:number}], 
    ): Array<{
        line: [{x:number, y:number}];
        index: number;
    }>;
    
    mirror(
        polylines: [][{x:number, y:number}], 
        type: 'x' | 'y',
        width: number, 
        height: number,
    ): [][{x:number, y:number}];

    removeDuplicates(
        polylines: [][{x:number, y:number}], 
        ): [][{x:number, y:number}];
        
    mergePolylines(
        polylines: [][{x:number, y:number}], 
        map: []["─" | "│" | "┌" | "┐" | "└" | "┘" | "├" | "┤" | "┬" | "┴" | "┼" | "0"]
    ): void;

    createMap(
        inputPolylines: [][{x:number, y:number}], 
        width: number, 
        height: number
    ): []["─" | "│" | "┌" | "┐" | "└" | "┘" | "├" | "┤" | "┬" | "┴" | "┼" | "0"]
}

export function PolylineAlgorithmModel(
    input: {
        width: number,
        height: number,
        symbols: [{
            polylines: [[{x:number, y:number},{ x:number, y:number}]],
            connectCords: [{x:number, y:number},{ x:number, y:number}]
        }],
        width: number,
        height: number,
        algorithm: {
            startPoint: {x: number, y:number},
            mirrorX: 0 | 1 | 2,
            mirrorY: 0 | 1 | 2,
            drawConnectLines: Boolean
            mask: [][0 | 1]
        }
    }
) : Object<{polylines: [][{x:number, y:number}]}>
    
export function AlgorithmModel(
    input: PolylineAlgorithmModel
) : Object<{polylines: [][{x:number, y:number}]}>

export const Grid : GridType
export const Polyline : PolylineModel
export const Algorithm : AlgorithmModel
export const PolylineAlgorithm : PolylineAlgorithmModel
