import { testrail }  from "./testrailClient";

// function to add test result
export async function addResultForCase(caseId: number, passed: boolean, comment = "") {
    const runId = Number(process.env.TESTRAIL_RUN_ID);
    const statusId = passed ? 1 : 5; // 1 = Passed, 5 = Failed

    return testrail.post(
        `add_result_for_case/${runId}/${caseId}`,
        { status_id: statusId, comment }
    );
}
