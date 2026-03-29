const DATE_FORMATTER = new Intl.DateTimeFormat('en-CA');

export const getLocalDateKey = (date = new Date()) => DATE_FORMATTER.format(date);

export const getStartOfLocalDay = (date = new Date()) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const addLocalDays = (date: Date, days: number) => {
  const nextDate = getStartOfLocalDay(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};
