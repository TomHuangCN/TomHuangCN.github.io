export function formatDateTimeForFilename(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "_" +
    pad(date.getHours()) +
    "-" +
    pad(date.getMinutes()) +
    "-" +
    pad(date.getSeconds())
  );
}

/**
 * 生成带时间戳的文件名
 */
export function generateTimestampedFilename(filename: string): string {
  const now = new Date();
  const formatted = formatDateTimeForFilename(now);

  if (filename.endsWith(".json")) {
    return filename.replace(/\.json$/, "") + "_" + formatted + ".json";
  }
  return filename + "_" + formatted + ".json";
}
