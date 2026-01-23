import { TestInfo } from "@playwright/test";

export function formatTestrailError(testInfo: TestInfo): string {
    if (!testInfo.error) {
        return "Test passed";
    }

    return `
❌ Test failed

Test name:
${testInfo.title}

Error:
${testInfo.error.message}

Location:
${testInfo.error.stack?.split("\n")[1] ?? "N/A"}
`.trim();
}
