// src/helpers/logger.ts
export class TestLogger {
    private logs: string[] = [];
    private testName: string = '';

    setTestName(name: string) {
        this.testName = name;
    }

    log(message: string, data?: any) {
        const timestamp = new Date().toISOString();
        const prefix = this.testName ? `[${this.testName}]` : '';
        const entry = `[${timestamp}]${prefix}[LOG] ${message}`;

        console.log(entry);
        this.logs.push(entry);

        if (data) {
            const dataStr = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
            console.log(dataStr);
            this.logs.push(dataStr);
        }
    }

    error(message: string, error?: any) {
        const timestamp = new Date().toISOString();
        const prefix = this.testName ? `[${this.testName}]` : '';
        const entry = `[${timestamp}]${prefix}[ERROR] ${message}`;

        console.error(entry);
        this.logs.push(entry);

        if (error) {
            const errorStr = error instanceof Error ? error.stack : String(error);
            console.error(errorStr);
            this.logs.push(errorStr!);
        }
    }

    warn(message: string) {
        const timestamp = new Date().toISOString();
        const prefix = this.testName ? `[${this.testName}]` : '';
        const entry = `[${timestamp}]${prefix}[WARN] ${message}`;

        console.warn(entry);
        this.logs.push(entry);
    }

    info(message: string) {
        const timestamp = new Date().toISOString();
        const prefix = this.testName ? `[${this.testName}]` : '';
        const entry = `[${timestamp}]${prefix}[INFO] ${message}`;

        console.info(entry);
        this.logs.push(entry);
    }

    getLogs(): string {
        return this.logs.join("\n");
    }

    clear() {
        this.logs = [];
    }
}