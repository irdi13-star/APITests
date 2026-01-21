import { test as base } from "@playwright/test";
import { extractCaseId } from "../helpers/extractCaseId";
import { addResultForCase } from "../testrail/testrailService";
import { formatTestrailError } from "../helpers/formatTestrailError";

export const test = base.extend({});

test.afterEach(async ({ }, testInfo) => {
    const caseId = extractCaseId(testInfo.title);
    if (!caseId) return;

    const passed = testInfo.status === "passed";

    const comment = passed
        ? "✅ Test passed via automation framework"
        : formatTestrailError(testInfo);

    await addResultForCase(caseId, passed, comment);
});

export { expect } from "@playwright/test";
