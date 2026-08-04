export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toISOString();
};

export const getDaysDifference = (
  date1: Date | string,
  date2: Date | string,
): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getMinutesDifference = (
  date1: Date | string,
  date2: Date | string,
): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60));
};

export const isWithinLast = (date: Date | string, minutes: number): boolean => {
  const d = new Date(date);
  const now = new Date();
  const diffMinutes = getMinutesDifference(d, now);
  return diffMinutes <= minutes;
};
