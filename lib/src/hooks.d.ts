interface Hook {
    priority?: number;
}
interface HooksTable {
    before?: Hook | Hook[];
    after?: Hook | Hook[];
    error?: Hook | Hook[];
}
declare function hooks(table: HooksTable): (root: any, member: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
declare function before(cb: Function): (root: any, member: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
declare function after(cb: Function): (root: any, member: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
declare function error(cb: Function): (root: any, member: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export { Hook, HooksTable, hooks, before, after, error };
