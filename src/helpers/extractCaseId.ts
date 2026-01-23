export function extractCaseId(title: string): number | null {
    const match = title.match(/C(\d+)/);
    return match ? Number(match[1]) : null;
}
