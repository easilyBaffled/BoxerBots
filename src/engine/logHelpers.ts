import type { LogEntry } from '../types/game';

let _logId = 0;

export function addLog(
  log: LogEntry[],
  entry: Omit<LogEntry, 'id' | 'timestamp'>,
): LogEntry[] {
  const newEntry: LogEntry = {
    ...entry,
    id: `log_${_logId++}`,
    timestamp: Date.now(),
    type: entry.type ?? 'info',
  };
  return [...log, newEntry];
}
