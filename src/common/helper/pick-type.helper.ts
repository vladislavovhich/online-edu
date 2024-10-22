export function PickClass<T, K extends keyof T>(BaseClass: new () => T, keys: K[]): new () => Pick<T, K> {
    class PickedClass {}
    
    keys.forEach((key) => {
        Object.defineProperty(PickedClass.prototype, key, {
            get() {
                return (this as any)[key];
            },
            set(value: any) {
                (this as any)[key] = value;
            },
        });
    });

    return PickedClass as any;
}