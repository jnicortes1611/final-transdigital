import { Reservation, SessionUser, UserAccount } from '../types';
import { hashPasswordWithSalt, verifyPasswordWithSalt } from './authCrypto';
import {
  FIRST_START_HOUR,
  LAST_START_HOUR,
  getReservationStatus,
  isDateInAllowedRange,
  isSlotPastInColombia,
} from './colombiaTime';

export const USERS_STORAGE_KEY = 'canchaya_users_v1';
export const SESSION_STORAGE_KEY = 'canchaya_session_v1';
export const RESERVATIONS_STORAGE_KEY = 'canchaya_reservations_v1';

function safeParseJSON<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getStoredUsers(): UserAccount[] {
  if (typeof window === 'undefined') return [];
  const parsed = safeParseJSON<unknown>(window.localStorage.getItem(USERS_STORAGE_KEY), []);
  return Array.isArray(parsed) ? (parsed as UserAccount[]) : [];
}

function saveStoredUsers(users: UserAccount[]): void {
  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export function getStoredSession(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  const parsed = safeParseJSON<SessionUser | null>(
    window.localStorage.getItem(SESSION_STORAGE_KEY),
    null
  );
  if (!parsed || !parsed.id || !parsed.email || !parsed.name) return null;
  return parsed;
}

export function saveStoredSession(session: SessionUser | null): void {
  if (session) {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

export function getStoredReservations(): Reservation[] {
  if (typeof window === 'undefined') return [];
  const parsed = safeParseJSON<unknown>(
    window.localStorage.getItem(RESERVATIONS_STORAGE_KEY),
    []
  );
  return Array.isArray(parsed) ? (parsed as Reservation[]) : [];
}

function saveStoredReservations(reservations: Reservation[]): void {
  window.localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(reservations));
}

export function generateId(prefix: string): string {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return `${prefix}_${window.crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export interface AuthResult {
  ok: boolean;
  user?: SessionUser;
  error?: string;
}

export async function registerLocalAccount(params: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const cleanName = params.name.trim();
  const cleanEmail = params.email.trim().toLowerCase();
  const users = getStoredUsers();

  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return {
      ok: false,
      error: 'Ya existe una cuenta registrada con ese correo electrónico en este navegador.',
    };
  }

  const passwordHash = await hashPasswordWithSalt(params.password);
  const newUser: UserAccount = {
    id: generateId('usr'),
    name: cleanName,
    email: cleanEmail,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  saveStoredUsers([...users, newUser]);

  const session: SessionUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
  };
  saveStoredSession(session);

  return { ok: true, user: session };
}

export async function loginLocalAccount(params: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const cleanEmail = params.email.trim().toLowerCase();
  const users = getStoredUsers();
  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return {
      ok: false,
      error: 'Correo o contraseña incorrectos.',
    };
  }

  const valid = await verifyPasswordWithSalt(params.password, user.passwordHash);
  if (!valid) {
    return {
      ok: false,
      error: 'Correo o contraseña incorrectos.',
    };
  }

  const session: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
  };
  saveStoredSession(session);

  return { ok: true, user: session };
}

export interface ReservationResult {
  ok: boolean;
  reservation?: Reservation;
  reservations?: Reservation[];
  error?: string;
}

export function createReservationAtomic(params: {
  courtId: string;
  userId: string;
  userName: string;
  date: string;
  startHour: number;
  totalPrice: number;
  defaultPlayers: number;
}): ReservationResult {
  if (!isDateInAllowedRange(params.date)) {
    return {
      ok: false,
      error: 'La fecha seleccionada está fuera del rango permitido (hoy hasta 30 días adelante en hora de Colombia).',
    };
  }

  if (
    !Number.isInteger(params.startHour) ||
    params.startHour < FIRST_START_HOUR ||
    params.startHour > LAST_START_HOUR
  ) {
    return {
      ok: false,
      error: 'El horario seleccionado no es válido (franjas de 06:00 a 22:00).',
    };
  }

  if (isSlotPastInColombia(params.date, params.startHour)) {
    return {
      ok: false,
      error: 'Este horario ya pasó en hora de Colombia. Selecciona una franja futura.',
    };
  }

  // Re-read fresh reservations from localStorage right before writing
  const latest = getStoredReservations();
  const conflict = latest.find(
    (r) =>
      r.courtId === params.courtId &&
      r.date === params.date &&
      r.startHour === params.startHour &&
      !r.cancelledAt
  );

  if (conflict) {
    return {
      ok: false,
      reservations: latest,
      error: 'Este horario ya fue reservado por otra cuenta en este navegador. Selecciona otra hora disponible.',
    };
  }

  const newReservation: Reservation = {
    id: generateId('res'),
    courtId: params.courtId,
    userId: params.userId,
    userName: params.userName,
    date: params.date,
    startHour: params.startHour,
    endHour: params.startHour + 1,
    totalPrice: params.totalPrice,
    splitPlayers: Math.max(1, Math.floor(params.defaultPlayers)),
    cancelledAt: null,
    createdAt: new Date().toISOString(),
  };

  const updated = [...latest, newReservation];
  saveStoredReservations(updated);

  return {
    ok: true,
    reservation: newReservation,
    reservations: updated,
  };
}

export function cancelReservationAtomic(reservationId: string, userId: string): ReservationResult {
  const latest = getStoredReservations();
  const targetIndex = latest.findIndex(
    (r) => r.id === reservationId && r.userId === userId
  );

  if (targetIndex === -1) {
    return {
      ok: false,
      reservations: latest,
      error: 'No se encontró la reserva para cancelar.',
    };
  }

  const target = latest[targetIndex];
  const currentStatus = getReservationStatus(target);

  if (currentStatus !== 'Confirmada') {
    return {
      ok: false,
      reservations: latest,
      error:
        currentStatus === 'Cancelada'
          ? 'Esta reserva ya había sido cancelada.'
          : 'Solo puedes cancelar una reserva antes de su hora de inicio.',
    };
  }

  const updatedReservation: Reservation = {
    ...target,
    cancelledAt: new Date().toISOString(),
  };

  const updated = [...latest];
  updated[targetIndex] = updatedReservation;
  saveStoredReservations(updated);

  return {
    ok: true,
    reservation: updatedReservation,
    reservations: updated,
  };
}

export function updateReservationPlayersAtomic(
  reservationId: string,
  userId: string,
  players: number
): ReservationResult {
  if (!Number.isInteger(players) || players < 1) {
    return {
      ok: false,
      error: 'Ingresa un número entero positivo de jugadores.',
    };
  }

  const latest = getStoredReservations();
  const targetIndex = latest.findIndex(
    (r) => r.id === reservationId && r.userId === userId
  );

  if (targetIndex === -1) {
    return {
      ok: false,
      reservations: latest,
      error: 'Reserva no encontrada.',
    };
  }

  if (latest[targetIndex].cancelledAt) {
    return {
      ok: false,
      reservations: latest,
      error: 'Las reservas canceladas no permiten dividir costos.',
    };
  }

  const updated = [...latest];
  updated[targetIndex] = {
    ...updated[targetIndex],
    splitPlayers: players,
  };
  saveStoredReservations(updated);

  return {
    ok: true,
    reservation: updated[targetIndex],
    reservations: updated,
  };
}
