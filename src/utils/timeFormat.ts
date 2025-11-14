/**
 * Time formatting utilities for Franklin: Perfect Day
 */

/**
 * Format time string from 24h format to display format
 * @param time - Time string in format "HH:MM" (e.g., "04:00")
 * @returns Formatted time string (e.g., "4:00")
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  return `${hour}:${minutes}`;
}

/**
 * Format time range for display
 * @param startTime - Start time in format "HH:MM"
 * @param endTime - End time in format "HH:MM"
 * @returns Formatted range (e.g., "4:00–6:00")
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTime(startTime)}–${formatTime(endTime)}`;
}

/**
 * Calculate duration in minutes between two times
 * @param startTime - Start time in format "HH:MM"
 * @param endTime - End time in format "HH:MM"
 * @returns Duration in minutes
 */
export function calculateDuration(startTime: string, endTime: string): number {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  return endTotalMinutes - startTotalMinutes;
}

/**
 * Format duration in hours and minutes
 * @param minutes - Duration in minutes
 * @returns Formatted duration (e.g., "2h 30m")
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

/**
 * Get current time in HH:MM format
 * @returns Current time string
 */
export function getCurrentTime(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Get today's date in YYYY-MM-DD format
 * @returns Date string
 */
export function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date for display
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Formatted date (e.g., "Today · Tue Nov 13")
 */
export function formatDisplayDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = date.getTime() === today.getTime();

  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const monthName = date.toLocaleDateString('en-US', { month: 'short' });
  const dayNum = date.getDate();

  if (isToday) {
    return `Today · ${dayName} ${monthName} ${dayNum}`;
  }

  return `${dayName} ${monthName} ${dayNum}`;
}
