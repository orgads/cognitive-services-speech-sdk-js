interface IWorkerTimers {
    clearTimeout: (timerId: number) => void;
    setTimeout: (func: () => any, delay: number) => number;
}
export declare class Timeout {
    private static workerTimers;
    static clearTimeout: IWorkerTimers["clearTimeout"];
    static setTimeout: IWorkerTimers["setTimeout"];
    static load: (url: string) => {
        clearTimeout: (timerId: number) => void;
        setTimeout: (func: () => void, delay: number) => number;
    };
    private static loadWorkerTimers;
    static timers: () => IWorkerTimers;
    private static isCallNotification;
    private static isClearResponse;
}
export {};