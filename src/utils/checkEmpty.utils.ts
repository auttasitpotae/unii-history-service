export class CheckEmpty {
    constructor() { }

    public checkStringNotEmpty(value: string): boolean {
        let status = true
        if (value === '' || value === null || value === undefined) {
            status = false
        }

        return status
    }
}