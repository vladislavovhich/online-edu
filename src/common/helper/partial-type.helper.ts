export function PartialClass<T extends object>(BaseClass: new () => T): new () => Partial<T> {
    class PartializedClass {}
    Object.keys(new BaseClass()).forEach((key) => {
        Object.defineProperty(PartializedClass.prototype, key, {
            get() {
                return (this as any)[key];
            },
            set(value: any) {
                (this as any)[key] = value;
            },
        });
    });
    return PartializedClass as any;
}
