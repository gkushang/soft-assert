export declare class SoftAssert {
    private captured;
    private capture;
    proxy<T>(target: T): T;
    private proxyObj;
    private proxyFn;
    wrap<T extends Function>(target: T): T;
    soft(target: Function): void;
    flush(): void;
}
export declare const softAssert: SoftAssert;
export declare const wrap: <T>(target: T) => T;
export declare const proxy: <T>(target: T) => T;
export declare const soft: any;
export declare const flush: any;
