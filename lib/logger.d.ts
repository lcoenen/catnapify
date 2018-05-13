export interface LoggerConfig {
    logger: any;
    input?: string;
    output?: string;
    error?: string;
    internal?: string;
}
export declare function logger<T>(config?: LoggerConfig): (root: any, member: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
