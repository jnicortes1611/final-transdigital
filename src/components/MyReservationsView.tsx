import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Lock,
  MapPin,
  PlayCircle,
  XCircle,
} from 'lucide-react';
import { Court, Reservation, ReservationStatus, SessionUser } from '../types';
import {
  formatCOP,
  formatDateLongES,
  formatHourRange,
  getColombiaNowParts,
  getReservationStatus,
} from '../utils/colombiaTime';
import { CostSplitCalculator } from './CostSplitCalculator';

interface MyReservationsViewProps {
  sessionUser: SessionUser | null;
  reservations: Reservation[];
  courts: Court[];
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onExploreCourts: () => void;
  onCancelReservation: (reservationId: string) => { ok: boolean; error?: string };
  onUpdatePlayers: (reservationId: string, players: number) => void;
}

const STATUS_STYLE: Record<
  ReservationStatus,
  { container: string; icon: React.ReactNode; label: string }
> = {
  Confirmada: {
    container: 'bg-[#EEF7E6] border-[#B9D9A6] text-[#123C2D]',
    icon: <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />,
    label: 'Confirmada',
  },
  'En curso': {
    container: 'bg-[#FEF9C3] border-[#FDE047] text-[#713F12]',
    icon: <PlayCircle className="w-4 h-4 shrink-0" aria-hidden="true" />,
    label: 'En curso',
  },
  Finalizada: {
    container: 'bg-[#F3F5F0] border-[#D4DDD0] text-[#4C5B54]',
    icon: <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />,
    label: 'Finalizada',
  },
  Cancelada: {
    container: 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]',
    icon: <XCircle className="w-4 h-4 shrink-0" aria-hidden="true" />,
    label: 'Cancelada',
  },
};

export const MyReservationsView: React.FC<MyReservationsViewProps> = ({
  sessionUser,
  reservations,
  courts,
  onOpenAuth,
  onExploreCourts,
  onCancelReservation,
  onUpdatePlayers,
}) => {
  const [nowTick, setNowTick] = useState<Date>(() => new Date());
  const [cancelCandidate, setCancelCandidate] = useState<Reservation | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowTick(new Date());
    }, 20000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!cancelCandidate) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCancelCandidate(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cancelCandidate]);

  const courtMap = new Map(courts.map((c) => [c.id, c]));
  const colombiaNow = getColombiaNowParts(nowTick);

  if (!sessionUser) {
    return (
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border border-[#E2E6DC] rounded-2xl p-8 sm:p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-[#F8F9F5] border border-[#E2E6DC] flex items-center justify-center mx-auto mb-4">
            <Lock className="w-5 h-5 text-[#123C2D]" aria-hidden="true" />
          </div>
          <h1 className="font-['Manrope'] text-2xl font-extrabold text-[#13211B]">
            Inicia sesión para ver tus reservas
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#4C5B54] max-w-md mx-auto">
            En Mis reservas solo se muestran los partidos guardados de la cuenta activa, con opción
            de cancelación anticipada y calculadora para dividir el costo.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="min-h-[44px] px-5 py-2.5 text-sm font-bold text-[#123C2D] bg-[#D4F86B] hover:bg-[#C6EE50] rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D]"
            >
              Iniciar sesión o registrarme
            </button>
            <button
              type="button"
              onClick={onExploreCourts}
              className="min-h-[44px] px-5 py-2.5 text-sm font-semibold text-[#13211B] bg-[#F8F9F5] hover:bg-[#EAEFE4] border border-[#CFD7C9] rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D]"
            >
              Explorar canchas
            </button>
          </div>
        </div>
      </section>
    );
  }

  const userReservations = reservations
    .filter((r) => r.userId === sessionUser.id)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startHour - b.startHour;
    });

  const handleConfirmCancel = () => {
    if (!cancelCandidate) return;
    setActionError(null);
    setActionSuccess(null);

    const res = onCancelReservation(cancelCandidate.id);
    setCancelCandidate(null);

    if (!res.ok) {
      setActionError(res.error ?? 'No fue posible cancelar la reserva.');
      return;
    }

    setActionSuccess(
      'Reserva cancelada. Conservamos el registro en tu historial y el horario quedó libre nuevamente.'
    );
  };

  return (
    <section
      aria-labelledby="my-reservations-heading"
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E2E6DC]">
        <div>
          <h1
            id="my-reservations-heading"
            className="font-['Manrope'] text-2xl sm:text-3xl font-extrabold text-[#13211B] tracking-tight"
          >
            Mis reservas
          </h1>
          <p className="mt-1 text-sm sm:text-base text-[#4C5B54]">
            Reservas de <span className="font-semibold text-[#13211B]">{sessionUser.name}</span>{' '}
            ordenadas por fecha.
          </p>
        </div>

        <div className="text-xs font-semibold text-[#123C2D] bg-white border border-[#E2E6DC] px-3 py-2 rounded-xl tabular-nums self-start sm:self-auto">
          Hora Colombia: {colombiaNow.formattedTime}
        </div>
      </div>

      <p className="mt-4 text-xs sm:text-sm text-[#4C5B54]">
        Las cuentas y reservas se guardan en <span className="font-semibold">localStorage</span> de
        este navegador (no sincronizan entre dispositivos). Prototipo sin pagos reales.
      </p>

      {actionError && (
        <div
          role="alert"
          className="mt-5 p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-sm text-[#991B1B] flex items-start gap-2.5"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div
          role="status"
          className="mt-5 p-4 rounded-xl bg-[#EEF7E6] border border-[#B9D9A6] text-sm text-[#123C2D] flex items-start gap-2.5"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {userReservations.length === 0 ? (
        <div className="mt-8 bg-white border border-[#E2E6DC] rounded-2xl p-10 text-center">
          <h2 className="font-['Manrope'] text-xl font-bold text-[#13211B]">
            Aún no tienes reservas registradas
          </h2>
          <p className="mt-2 text-sm text-[#4C5B54] max-w-md mx-auto">
            Explora nuestras 10 canchas privadas en Medellín y municipios cercanos para apartar tu
            próximo partido.
          </p>
          <button
            type="button"
            onClick={onExploreCourts}
            className="mt-6 min-h-[44px] px-5 py-2.5 text-sm font-bold text-[#123C2D] bg-[#D4F86B] hover:bg-[#C6EE50] rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D]"
          >
            Explorar canchas
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {userReservations.map((reservation) => {
            const court = courtMap.get(reservation.courtId);
            const status = getReservationStatus(reservation, nowTick);
            const statusCfg = STATUS_STYLE[status];
            const canCancel = status === 'Confirmada';

            return (
              <article
                key={reservation.id}
                className="bg-white border border-[#E2E6DC] rounded-2xl p-5 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${statusCfg.container}`}
                      >
                        {statusCfg.icon}
                        <span>{statusCfg.label}</span>
                      </span>

                      {court && (
                        <span className="text-xs font-semibold text-[#4C5B54]">
                          {court.modality} · {court.municipality}
                        </span>
                      )}
                    </div>

                    <h2 className="mt-2 font-['Manrope'] text-xl font-extrabold text-[#13211B]">
                      {court ? court.name : 'Cancha privada'}
                    </h2>

                    {court && (
                      <p className="mt-1 flex items-start gap-1.5 text-xs sm:text-sm text-[#4C5B54]">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                        <span>{court.address}</span>
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#13211B]">
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <Calendar className="w-4 h-4 text-[#123C2D]" aria-hidden="true" />
                        <span>{formatDateLongES(reservation.date)}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-semibold tabular-nums">
                        <Clock className="w-4 h-4 text-[#123C2D]" aria-hidden="true" />
                        <span>{formatHourRange(reservation.startHour)} (Colombia)</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                    <div className="sm:text-right">
                      <span className="block text-xs text-[#4C5B54]">Valor de la hora</span>
                      <span className="font-['Manrope'] text-xl font-extrabold text-[#123C2D] tabular-nums">
                        {formatCOP(reservation.totalPrice)}
                      </span>
                    </div>

                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => {
                          setActionError(null);
                          setActionSuccess(null);
                          setCancelCandidate(reservation);
                        }}
                        className="min-h-[44px] px-4 py-2 text-sm font-semibold text-[#991B1B] bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] rounded-xl transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#991B1B]"
                      >
                        Cancelar reserva
                      </button>
                    )}
                  </div>
                </div>

                {status !== 'Cancelada' ? (
                  <CostSplitCalculator
                    reservationId={reservation.id}
                    totalPrice={reservation.totalPrice}
                    savedPlayers={reservation.splitPlayers || 1}
                    onPlayersChange={onUpdatePlayers}
                  />
                ) : (
                  <p className="mt-4 pt-3 border-t border-[#E2E6DC] text-xs text-[#991B1B]">
                    Reserva cancelada. Este registro se conserva como historial y el horario ya fue
                    liberado.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Accessible Cancel Confirmation Modal */}
      {cancelCandidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#091F17]/65 backdrop-blur-xs"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCancelCandidate(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-dialog-title"
            className="w-full max-w-md bg-white border border-[#E2E6DC] rounded-2xl p-6 shadow-xl"
          >
            <h2
              id="cancel-dialog-title"
              className="font-['Manrope'] text-xl font-extrabold text-[#13211B]"
            >
              ¿Confirmar cancelación?
            </h2>
            <p className="mt-2 text-sm text-[#4C5B54] leading-relaxed">
              Vas a cancelar tu reserva en{' '}
              <span className="font-semibold text-[#13211B]">
                {courtMap.get(cancelCandidate.courtId)?.name ?? 'esta cancha'}
              </span>{' '}
              el {formatDateLongES(cancelCandidate.date)} de{' '}
              <span className="tabular-nums font-semibold">
                {formatHourRange(cancelCandidate.startHour)}
              </span>
              . El registro permanecerá en tu historial como Cancelada y el horario quedará libre
              de inmediato.
            </p>

            <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancelCandidate(null)}
                className="min-h-[44px] px-4 py-2.5 text-sm font-semibold text-[#13211B] bg-[#F8F9F5] hover:bg-[#EAEFE4] border border-[#CFD7C9] rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D]"
              >
                Mantener reserva
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="min-h-[44px] px-4 py-2.5 text-sm font-bold text-white bg-[#991B1B] hover:bg-[#7F1D1D] rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#991B1B]"
              >
                Sí, cancelar reserva
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
