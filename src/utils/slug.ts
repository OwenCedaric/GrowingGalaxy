/** Strip directory prefixes (e.g. year folders) from entry.id to get a clean slug. */
export function getSlug(entry: { id: string }): string {
    const parts = entry.id.split('/');
    return parts[parts.length - 1];
}
