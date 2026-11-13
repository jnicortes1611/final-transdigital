import { Reservation, ReservationStatus } from '../types';

export const COLOMBIA_TIMEZONE = 'America/Bogota';
export const FIRST_START_HOUR = 6;
export const LAST_START_HOUR = 22; // Last slot is 22:00 - 23:00
export const MAX_BOOKING_DAYS_AHEAD = 30;

export const HOUR_SLOTS: number[] = Array.from(
  { length: LAST_START_HOUR - FIRST_START_HOUR + 1 },
  (_, idx) => FIRST_START_HOUR + idx
);

export interface ColombiaNowParts {
  dateStr: string;
  hour: number;
  minute: number;
  second: number;
  formattedTime: string;
  formattedDate: string;
}

export function getColombiaNowParts(now: Date = new Date()): ColombiaNowParts {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: COLOMBIA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const get = (type: string): string => parts.find((p) => p.type === type)?.value ?? '00';

  const year = get('year');
  const month = get('month');
  const day = get('day');
  let hour = Number(get('hour'));
  if (hour === 24) hour = 0;
  const minute = Number(get('minute'));
  const second = Number(get('second'));

  const dateStr = `${year}-${month}-${day}`;
  const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const formattedDate = formatDateLongES(dateStr);

  return {
    dateStr,
    hour,
    minute,
    second,
    formattedTime,
    formattedDate,
  };
}

function parseDateStrToUTC(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1));
}

export function addDaysToDateStr(dateStr: string, offsetDays: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const utc = new Date(Date.UTC(y, (m || 1) - 1, (d || 1) + offsetDays));
  return utc.toISOString().slice(0, 10);
}

export interface AllowedDateOption {
  dateStr: string;
  dayShort: string;
  dayNum: string;
  monthShort: string;
  labelLong: string;
  isToday: boolean;
}

export function getAllowedDates(now: Date = new Date()): AllowedDateOption[] {
  const { dateStr: todayStr } = getColombiaNowParts(now);
  const options: AllowedDateOption[] = [];

  for (let i = 0; i <= MAX_BOOKING_DAYS_AHEAD; i++) {
    const dateStr = addDaysToDateStr(todayStr, i);
    const utcDate = parseDateStrToUTC(dateStr);

    const dayShort = new Intl.DateTimeFormat('es-CO', {
      timeZone: 'UTC',
      weekday: 'short',
    })
      .format(utcDate)
      .replace('.', '');

    const dayNum = new Intl.DateTimeFormat('es-CO', {
      timeZone: 'UTC',
      day: '2-digit',
    }).format(utcDate);

    const monthShort = new Intl.DateTimeFormat('es-CO', {
      timeZone: 'UTC',
      month: 'short',
    })
      .format(utcDate)
      .replace('.', '');

    options.push({
      dateStr,
      dayShort: dayShort.charAt(0).toUpperCase() + dayShort.slice(1),
      dayNum,
      monthShort,
      labelLong: formatDateLongES(dateStr),
      isToday: i === 0,
    });
  }

  return options;
}

export function isDateInAllowedRange(dateStr: string, now: Date = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const { dateStr: todayStr } = getColombiaNowParts(now);
  const maxDateStr = addDaysToDateStr(todayStr, MAX_BOOKING_DAYS_AHEAD);
  return dateStr >= todayStr && dateStr <= maxDateStr;
}

export function isSlotPastInColombia(
  dateStr: string,
  startHour: number,
  now: Date = new Date()
): boolean {
  const { dateStr: todayStr, hour, minute } = getColombiaNowParts(now);
  if (dateStr < todayStr) return true;
  if (dateStr > todayStr) return false;
  const currentMinutes = hour * 60 + minute;
  return currentMinutes >= startHour * 60;
}

export function getReservationStatus(
  reservation: Reservation,
  now: Date = new Date()
): ReservationStatus {
  if (reservation.cancelledAt) {
    return 'Cancelada';
  }

  const { dateStr: todayStr, hour, minute } = getColombiaNowParts(now);
  if (reservation.date < todayStr) {
    return 'Finalizada';
  }
  if (reservation.date > todayStr) {
    return 'Confirmada';
  }

  const currentMinutes = hour * 60 + minute;
  const startMinutes = reservation.startHour * 60;
  const endMinutes = reservation.endHour * 60;

  if (currentMinutes < startMinutes) {
    return 'Confirmada';
  }
  if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
    return 'En curso';
  }
  return 'Finalizada';
}

export function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

export function formatHourRange(startHour: number): string {
  return `${formatHour(startHour)} – ${formatHour(startHour + 1)}`;
}

export function formatDateLongES(dateStr: string): string {
  const utcDate = parseDateStrToUTC(dateStr);
  const formatted = new Intl.DateTimeFormat('es-CO', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(utcDate);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatDateCompactES(dateStr: string): string {
  const utcDate = parseDateStrToUTC(dateStr);
  const formatted = new Intl.DateTimeFormat('es-CO', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(utcDate);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatCOP(amount: number, maxDecimals: number = 0): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  }).format(amount);
}
