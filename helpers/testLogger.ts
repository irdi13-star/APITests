export class TestLogger {
    private logs: string[] = [];

    log(message: string) {
        const entry = `[LOG] ${message}`;
        console.log(entry);
        this.logs.push(entry);
    }

    error(message: string) {
        const entry = `[ERROR] ${message}`;
        console.error(entry);
        this.logs.push(entry);
    }

    getLogs(): string {
        return this.logs.join("\n");
    }
}
