import { format, differenceInDays, addDays, isFirstDayOfMonth, getMonth, getYear, getDate } from "date-fns"

// Format a date to YYYY-MM-DD
export function formatDate(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

// Get the number of days between two dates
export function getDaysBetween(startDate: Date, endDate: Date): number {
  return differenceInDays(endDate, startDate)
}

// Get the month name (short format)
export function getMonthName(date: Date): string {
  return format(date, "MMM")
}

// Check if a date is the first day of the month
export function isFirstDay(date: Date): boolean {
  return isFirstDayOfMonth(date)
}

// Add days to a date
export function addDaysToDate(date: Date, days: number): Date {
  return addDays(date, days)
}

// Get the last day of a month
export function getLastDayOfMonth(date: Date): Date {
  return new Date(getYear(date), getMonth(date) + 1, 0)
}

// Check if a date is between two other dates (inclusive)
export function isDateBetween(date: Date, startDate: Date, endDate: Date): boolean {
  const d = new Date(date)
  return d >= new Date(startDate) && d <= new Date(endDate)
}

// Set the date to the first day of the month
export function startOfMonth(date: Date): Date {
  return new Date(getYear(date), getMonth(date), 1)
}

// Set the date to the last day of the month
export function endOfMonth(date: Date): Date {
  return new Date(getYear(date), getMonth(date) + 1, 0)
}

// Add months to a date
export function addMonthsToDate(date: Date, months: number): Date {
  return new Date(getYear(date), getMonth(date) + months, getDate(date))
}
