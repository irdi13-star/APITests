import { test as base } from "@playwright/test";
import { extractCaseId } from "../helpers/extractCaseId";
import { addResultForCase } from "../testrail/testrailService";
import { formatTestrailError } from "../helpers/formatTestrailError";
import { TestLogger } from "../helpers/testLogger";

export const test = base.extend<{
    logger: TestLogger;
}>({
    logger: async ({ }, use) => {
        const logger = new TestLogger();
        await use(logger);
    }
});

test.afterEach(async ({ logger }, testInfo) => {
    const caseId = extractCaseId(testInfo.title);
    if (!caseId) return;

    const passed = testInfo.status === "passed";

    let comment = passed
        ? "✅ Test passed via automation framework"
        : formatTestrailError(testInfo);

    const logs = logger.getLogs();
    if (logs) {
        comment += `\n\n--- Logs ---\n${logs}`;
    }

    await addResultForCase(caseId, passed, comment);
});

export { expect } from "@playwright/test";
