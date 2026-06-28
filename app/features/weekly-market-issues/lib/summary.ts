/**
 * summary 필드에 마크다운 h2/h3(##, ###)가 포함된 경우,
 * 해당 마커 이후 내용을 제거합니다.
 */
export function stripSummaryAfterMarkdownHeading(text: string): string {
  const indices = ["###", "##"]
    .map((marker) => text.indexOf(marker))
    .filter((index) => index !== -1);

  if (indices.length === 0) {
    return text;
  }

  return text.slice(0, Math.min(...indices)).trimEnd();
}
