export type Modality = 'Fútbol 6' | 'Fútbol 7' | 'Fútbol 8' | 'Pádel';

export type Municipality = 'Medellín' | 'Bello' | 'Envigado' | 'Itagüí' | 'Sabaneta';

export interface VenuePaymentAccount {
  legalName: string;
  nit: string;
  bank: string;
  accountType: string;
  accountNumber: string;
  transferKey: string;
}

export interface Court {
  id: string;
  name: string;
  modality: Modality;
  municipality: Municipality;
  neighborhood: string;
  address: string;
  services: string[];
  pricePerHour: number;
  defaultPlayers: number;
  image: string;
  surface: string;
  paymentAccount: VenuePaymentAccount;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

export type ReservationStatus = 'Confirmada' | 'En curso' | 'Finalizada' | 'Cancelada';

export type PaymentMethod = 'efectivo_sede' | 'transferencia';

export type PaymentStatus = 'Pendiente en sede' | 'Pagada (simulado)' | 'Anulada';

export interface Reservation {
  id: string;
  courtId: string;
  userId: string;
  userName: string;
  date: string; // YYYY-MM-DD in Colombia time
  startHour: number; // 6..22
  endHour: number; // startHour + 1 (7..23)
  totalPrice: number;
  splitPlayers: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentAccountSummary: string;
  paymentReference: string | null;
  cancelledAt: string | null;
  createdAt: string;
}
