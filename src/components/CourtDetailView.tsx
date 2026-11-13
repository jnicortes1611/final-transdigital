import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  MapPin,
} from 'lucide-react';
import { Court, PaymentMethod, Reservation, SessionUser } from '../types';
import {
  HOUR_SLOTS,
  formatCOP,
  formatDateLongES,
  formatHourRange,
  getAllowedDates,
  getColombiaNowParts,
  isSlotPastInColombia,
} from '../utils/colombiaTime';

interface CourtDetailViewProps {
  court: Court;
  reservations: Reservation[];
  sessionUser: SessionUser | null;
  onBack: () => void;
  onRequireAuth: (message: string) => void;
  onConfirmBooking: (params: {
    court: Court;
    date: string;
    startHour: number;
    paymentMethod: PaymentMethod;
    paymentReference?: string | null;
  }) => { ok: boolean; error?: string; reservation?: Reservation };
  onGoToReservations: () => void;
}

export const CourtDetailView: React.FC<CourtDetailViewProps> = ({
  court,
  reservations,
  sessionUser,
  onBack,
  onRequireAuth,
  onConfirmBooking,
  onGoToReservations,
}) => {
  const [nowTick, setNowTick] = useState<Date>(() => new Date());
  const allowedDates = getAllowedDates(nowTick);
  const [selectedDate, setSelectedDate] = useState<string>(() => allowedDates[0].dateStr);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo_sede');
  const [transferReference, setTransferReference] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);
  const [imageError, setImageError] = useState(false);

  // Refresh Colombia clock every 20 seconds so past slots update live
  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowTick(new Date());
    }, 20000);
    return () => window.clearInterval(interval);
  }, []);

  // Reset payment fields when switching court
  useEffect(() => {
    setPaymentMethod('efectivo_sede');
    setTransferReference('');
    setCopiedField(null);
    setBookingError(null);
    setConfirmedReservation(null);
  }, [court.id]);

  // Ensure selected date remains valid if day rolls over
  useEffect(() => {
    if (!allowedDates.some((d) => d.dateStr === selectedDate)) {
      setSelectedDate(allowedDates[0].dateStr);
      setSelectedHour(null);
    }
  }, [allowedDates, selectedDate]);

  // Clear selectedHour if it became past or occupied due to live updates
  useEffect(() => {
    if (selectedHour === null) return;
    const past = isSlotPastInColombia(selectedDate, selectedHour, nowTick);
    const occupied = reservations.some(
      (r) =>
        r.courtId === court.id &&
        r.date === selectedDate &&
        r.startHour === selectedHour &&
        !r.cancelledAt
    );
    if (past || occupied) {
      setSelectedHour(null);
    }
  }, [reservations, court.id, selectedDate, selectedHour, nowTick]);

  const colombiaNow = getColombiaNowParts(nowTick);

  const occupiedHoursSet = new Set(
    reservations
      .filter((r) => r.courtId === court.id && r.date === selectedDate && !r.cancelledAt)
      .map((r) => r.startHour)
  );

  let availableCount = 0;
  let occupiedCount = 0;
  let pastCount = 0;

  HOUR_SLOTS.forEach((hour) => {
    if (isSlotPastInColombia(selectedDate, hour, nowTick)) {
      pastCount++;
    } else if (occupiedHoursSet.has(hour)) {
      occupiedCount++;
    } else {
      availableCount++;
    }
  });

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedHour(null);
    setBookingError(null);
    setConfirmedReservation(null);
  };

  const handleCopyText = async (fieldId: string, value: string) => {
    try {
      await navigator.clipboard?.writeText(value);
      setCopiedField(fieldId);
      window.setTimeout(() => {
        setCopiedField((curr) => (curr === fieldId ? null : curr));
      }, 2000);
    } catch {
      setCopiedField(null);
    }
  };

  const handleConfirmClick = () => {
    setBookingError(null);

    if (selectedHour === null) {
      setBookingError('Selecciona primero una franja horaria disponible.');
      return;
    }

    if (!sessionUser) {
      onRequireAuth(
        `Inicia sesión o crea una cuenta para confirmar tu reserva en ${court.name}.`
      );
      return;
    }

    const result = onConfirmBooking({
      court,
      date: selectedDate,
      startHour: selectedHour,
      paymentMethod,
      paymentReference: paymentMethod === 'transferencia' ? transferReference : null,
    });

    if (!result.ok) {
      setBookingError(
        result.error ?? 'No se pudo completar la reserva. Intenta con otro horario.'
      );
      return;
    }

    if (result.reservation) {
      setConfirmedReservation(result.reservation);
      setSelectedHour(null);
      setTransferReference('');
    }
  };

  return (
    <section
      aria-labelledby="court-detail-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10"
    >
      <button
        type="button"
        onClick={onBack}
        className="min-h-[44px] px-3 -ml-3 mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#123C2D] hover:text-[#0D2D21] hover:bg-[#EAEFE4] rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D]"
      >
        <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>Volver a explorar canchas</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Court Info */}
        <div className="lg:col-span-5 bg-white border border-[#E2E6DC] rounded-2xl overflow-hidden">
          <div className="aspect-[4/3] w-full bg-[#EAEFE4] overflow-hidden">
            {!imageError ? (
              <img
                src={court.image}
                alt={`${court.name} — ${court.modality} en ${court.municipality}`}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#123C2D] to-[#1D5440] text-white text-center">
                <span className="font-['Manrope'] font-bold text-lg">{court.modality}</span>
                <span className="text-sm text-[#D4F86B] mt-1">{court.municipality}</span>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#123C2D]">
              <span>{court.modality}</span>
              <span aria-hidden="true" className="text-[#8FA096]">
                ·
              </span>
              <span className="text-[#4C5B54]">{court.municipality}</span>
              <span aria-hidden="true" className="text-[#8FA096]">
                ·
              </span>
              <span className="text-[#4C5B54]">{court.surface}</span>
            </div>

            <h1
              id="court-detail-heading"
              className="mt-2 font-['Manrope'] text-2xl sm:text-3xl font-extrabold text-[#13211B] tracking-tight"
            >
              {court.name}
            </h1>

            <p className="mt-2 flex items-start gap-2 text-sm text-[#4C5B54]">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#123C2D]" aria-hidden="true" />
              <span>{court.address}</span>
            </p>

            <div className="mt-5 pt-5 border-t border-[#E2E6DC]">
              <h2 className="text-sm font-bold text-[#13211B] mb-2">Servicios incluidos</h2>
              <p className="text-sm text-[#4C5B54] leading-relaxed">
                {court.services.join(' · ')}
              </p>
            </div>

            <div className="mt-5 pt-5 border-t border-[#E2E6DC] flex items-baseline justify-between gap-4">
              <span className="text-sm font-medium text-[#4C5B54]">Tarifa por 1 hora</span>
              <span className="font-['Manrope'] text-2xl font-extrabold text-[#123C2D] tabular-nums">
                {formatCOP(court.pricePerHour)}
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-[#E2E6DC] text-xs text-[#4C5B54] space-y-1">
              <p className="font-semibold text-[#13211B]">Cuenta recaudadora de la sede (demo)</p>
              <p>
                {court.paymentAccount.legalName} · {court.paymentAccount.bank} (
                {court.paymentAccount.accountNumber})
              </p>
            </div>

            <p className="mt-4 p-3.5 rounded-xl bg-[#F8F9F5] border border-[#E2E6DC] text-xs text-[#4C5B54] leading-relaxed">
              Escenario privado ficticio (no pertenece al INDER). Prototipo sin débitos bancarios
              reales; la disponibilidad se comparte entre cuentas dentro de este mismo navegador.
            </p>
          </div>
        </div>

        {/* Right Column: Date, Hourly Availability & Payment Gateway */}
        <div className="lg:col-span-7 bg-white border border-[#E2E6DC] rounded-2xl p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-[#E2E6DC]">
            <div>
              <h2 className="font-['Manrope'] text-xl font-extrabold text-[#13211B]">
                Disponibilidad y reserva
              </h2>
              <p className="text-sm text-[#4C5B54] mt-0.5">
                Franjas de 1 hora entre las 06:00 y las 23:00 (último inicio 22:00).
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#123C2D] bg-[#F8F9F5] border border-[#E2E6DC] px-3 py-1.5 rounded-lg tabular-nums self-start sm:self-auto">
              <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Hora Colombia: {colombiaNow.formattedTime}</span>
            </div>
          </div>

          {/* Date Selector: Hoy up to +30 days */}
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <label
                htmlFor="booking-date-select"
                className="flex items-center gap-2 text-sm font-bold text-[#13211B]"
              >
                <Calendar className="w-4 h-4 text-[#123C2D] shrink-0" aria-hidden="true" />
                <span>Fecha del partido (hoy hasta 30 días adelante)</span>
              </label>

              <select
                id="booking-date-select"
                value={selectedDate}
                onChange={(e) => handleDateSelect(e.target.value)}
                className="min-h-[44px] px-3 py-2 text-sm font-medium text-[#13211B] bg-[#F8F9F5] border border-[#CFD7C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#123C2D]"
              >
                {allowedDates.map((d) => (
                  <option key={d.dateStr} value={d.dateStr}>
                    {d.isToday ? `Hoy · ${d.labelLong}` : d.labelLong}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick horizontal touch date strip */}
            <div
              role="group"
              aria-label="Selección rápida de fecha"
              className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1"
            >
              {allowedDates.map((d) => {
                const isSelected = d.dateStr === selectedDate;
                return (
                  <button
                    key={d.dateStr}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleDateSelect(d.dateStr)}
                    className={`min-w-[68px] min-h-[60px] px-2.5 py-2 rounded-xl border text-center shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D] ${
                      isSelected
                        ? 'bg-[#123C2D] border-[#123C2D] text-white'
                        : 'bg-[#F8F9F5] border-[#E2E6DC] text-[#13211B] hover:border-[#123C2D]'
                    }`}
                  >
                    <span
                      className={`block text-[11px] font-medium ${
                        isSelected ? 'text-[#D4F86B]' : 'text-[#4C5B54]'
                      }`}
                    >
                      {d.isToday ? 'Hoy' : d.dayShort}
                    </span>
                    <span className="block font-['Manrope'] text-base font-extrabold tabular-nums">
                      {d.dayNum}
                    </span>
                    <span
                      className={`block text-[11px] ${
                        isSelected ? 'text-white/80' : 'text-[#4C5B54]'
                      }`}
                    >
                      {d.monthShort}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hourly Slots Grid */}
          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span id="slots-heading" className="text-sm font-bold text-[#13211B]">
                Elige un horario ({formatDateLongES(selectedDate)})
              </span>
              <span className="text-xs text-[#4C5B54] tabular-nums">
                {availableCount} disponibles · {occupiedCount} ocupados · {pastCount} pasados
              </span>
            </div>

            <div
              role="group"
              aria-labelledby="slots-heading"
              className="grid grid-cols-2 sm:grid-cols-3 gap-2.5"
            >
              {HOUR_SLOTS.map((hour) => {
                const isPast = isSlotPastInColombia(selectedDate, hour, nowTick);
                const isOccupied = !isPast && occupiedHoursSet.has(hour);
                const isDisabled = isPast || isOccupied;
                const isSelected = selectedHour === hour && !isDisabled;

                let stateText = 'Disponible';
                if (isPast) stateText = 'Pasado';
                else if (isOccupied) stateText = 'Ocupado';
                else if (isSelected) stateText = 'Seleccionado';

                return (
                  <button
                    key={hour}
                    type="button"
                    disabled={isDisabled}
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSelectedHour(hour);
                      setBookingError(null);
                      setConfirmedReservation(null);
                    }}
                    className={`min-h-[56px] px-3 py-2.5 rounded-xl border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D] ${
                      isDisabled
                        ? 'bg-[#F3F5F0] border-[#E2E6DC] text-[#7D8B83] cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#D4F86B] border-[#123C2D] text-[#123C2D]'
                        : 'bg-white border-[#CFD7C9] text-[#13211B] hover:border-[#123C2D] hover:bg-[#F8F9F5]'
                    }`}
                  >
                    <span
                      className={`block text-sm font-bold tabular-nums ${
                        isOccupied ? 'line-through' : ''
                      }`}
                    >
                      {formatHourRange(hour)}
                    </span>
                    <span
                      className={`block text-xs mt-0.5 ${
                        isSelected
                          ? 'font-bold text-[#123C2D]'
                          : isDisabled
                          ? 'text-[#7D8B83]'
                          : 'font-medium text-[#123C2D]'
                      }`}
                    >
                      {stateText}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Booking Error Banner */}
          {bookingError && (
            <div
              role="alert"
              className="mt-6 p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-sm text-[#991B1B] flex items-start gap-2.5"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{bookingError}</span>
            </div>
          )}

          {/* Confirmation Feedback */}
          {confirmedReservation && (
            <div
              role="status"
              className="mt-6 p-5 rounded-2xl bg-[#EEF7E6] border border-[#B9D9A6] text-[#123C2D]"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#123C2D]" aria-hidden="true" />
                <div className="flex-1">
                  <h3 className="font-['Manrope'] text-base font-extrabold">
                    Reserva confirmada · {confirmedReservation.paymentStatus}
                  </h3>
                  <p className="mt-1 text-sm text-[#1F4A3A]">
                    {court.name} · {formatDateLongES(confirmedReservation.date)} ·{' '}
                    <span className="tabular-nums font-semibold">
                      {formatHourRange(confirmedReservation.startHour)}
                    </span>{' '}
                    (hora Colombia). Valor:{' '}
                    <span className="tabular-nums font-semibold">
                      {formatCOP(confirmedReservation.totalPrice)}
                    </span>
                    .
                  </p>
                  <p className="mt-1 text-xs text-[#1F4A3A]">
                    {confirmedReservation.paymentMethod === 'transferencia'
                      ? `Transferencia simulada hacia ${confirmedReservation.paymentAccountSummary}${
                          confirmedReservation.paymentReference
                            ? ` · Ref: ${confirmedReservation.paymentReference}`
                            : ''
                        }.`
                      : `Método elegido: pago en efectivo al llegar a ${court.name}.`}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={onGoToReservations}
                      className="min-h-[44px] px-4 py-2 text-sm font-bold text-[#123C2D] bg-[#D4F86B] hover:bg-[#C6EE50] rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D]"
                    >
                      Ir a Mis reservas y dividir costo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Booking Summary + Simulated Payment Gateway */}
          {selectedHour !== null && (
            <div className="mt-6 p-5 rounded-2xl bg-[#F8F9F5] border border-[#CFD7C9]">
              <h3 className="font-['Manrope'] text-base font-extrabold text-[#13211B]">
                Resumen y método de pago
              </h3>

              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-[#4C5B54]">Cancha</dt>
                  <dd className="font-semibold text-[#13211B] text-right">
                    {court.name} ({court.modality})
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#4C5B54]">Fecha</dt>
                  <dd className="font-semibold text-[#13211B] text-right">
                    {formatDateLongES(selectedDate)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#4C5B54]">Horario (Colombia)</dt>
                  <dd className="font-semibold text-[#13211B] tabular-nums text-right">
                    {formatHourRange(selectedHour)} (1 hora)
                  </dd>
                </div>
                <div className="pt-2 border-t border-[#E2E6DC] flex justify-between gap-4 items-baseline">
                  <dt className="font-bold text-[#13211B]">Total de la cancha</dt>
                  <dd className="font-['Manrope'] text-xl font-extrabold text-[#123C2D] tabular-nums">
                    {formatCOP(court.pricePerHour)}
                  </dd>
                </div>
              </dl>

              {/* Two-option Simulated Payment Gateway */}
              <div className="mt-5 pt-4 border-t border-[#E2E6DC]">
                <span
                  id="payment-method-label"
                  className="block text-sm font-bold text-[#13211B] mb-2.5"
                >
                  Elige cómo pagar esta reserva
                </span>

                <div
                  role="radiogroup"
                  aria-labelledby="payment-method-label"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={paymentMethod === 'efectivo_sede'}
                    onClick={() => setPaymentMethod('efectivo_sede')}
                    className={`min-h-[68px] p-3.5 rounded-xl border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D] ${
                      paymentMethod === 'efectivo_sede'
                        ? 'bg-[#123C2D] border-[#123C2D] text-white'
                        : 'bg-white border-[#CFD7C9] text-[#13211B] hover:border-[#123C2D]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <Banknote
                        className={`w-4 h-4 shrink-0 ${
                          paymentMethod === 'efectivo_sede' ? 'text-[#D4F86B]' : 'text-[#123C2D]'
                        }`}
                        aria-hidden="true"
                      />
                      <span>Pago en efectivo en el lugar</span>
                    </div>
                    <p
                      className={`mt-1 text-xs ${
                        paymentMethod === 'efectivo_sede' ? 'text-[#D9E5DF]' : 'text-[#4C5B54]'
                      }`}
                    >
                      Pagas en la recepción de la sede antes de jugar.
                    </p>
                  </button>

                  <button
                    type="button"
                    role="radio"
                    aria-checked={paymentMethod === 'transferencia'}
                    onClick={() => setPaymentMethod('transferencia')}
                    className={`min-h-[68px] p-3.5 rounded-xl border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D] ${
                      paymentMethod === 'transferencia'
                        ? 'bg-[#123C2D] border-[#123C2D] text-white'
                        : 'bg-white border-[#CFD7C9] text-[#13211B] hover:border-[#123C2D]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <Building2
                        className={`w-4 h-4 shrink-0 ${
                          paymentMethod === 'transferencia' ? 'text-[#D4F86B]' : 'text-[#123C2D]'
                        }`}
                        aria-hidden="true"
                      />
                      <span>Pagar ya mediante transferencia</span>
                    </div>
                    <p
                      className={`mt-1 text-xs ${
                        paymentMethod === 'transferencia' ? 'text-[#D9E5DF]' : 'text-[#4C5B54]'
                      }`}
                    >
                      Cuenta directa de {court.name} ({court.paymentAccount.bank}).
                    </p>
                  </button>
                </div>

                {/* Venue receiving account details when transfer is selected */}
                {paymentMethod === 'transferencia' && (
                  <div className="mt-3 p-4 rounded-xl bg-white border border-[#CFD7C9] space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E2E6DC]">
                      <span className="text-xs font-bold text-[#123C2D]">
                        Datos de transferencia · {court.paymentAccount.legalName}
                      </span>
                      <span className="text-xs text-[#4C5B54] tabular-nums">
                        NIT {court.paymentAccount.nit}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="block text-[#4C5B54]">Entidad y tipo de cuenta</span>
                        <span className="font-semibold text-[#13211B]">
                          {court.paymentAccount.bank} · {court.paymentAccount.accountType}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[#4C5B54]">Monto exacto</span>
                        <span className="font-bold text-[#123C2D] tabular-nums">
                          {formatCOP(court.pricePerHour)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 bg-[#F8F9F5] px-3 py-2 rounded-lg border border-[#E2E6DC]">
                        <div className="min-w-0">
                          <span className="block text-[11px] text-[#4C5B54]">Número de cuenta</span>
                          <span className="font-bold text-[#13211B] tabular-nums truncate block">
                            {court.paymentAccount.accountNumber}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyText('acc', court.paymentAccount.accountNumber)
                          }
                          className="min-h-[36px] px-2.5 py-1 inline-flex items-center gap-1 text-xs font-semibold text-[#123C2D] bg-white hover:bg-[#EAEFE4] border border-[#CFD7C9] rounded-lg shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D]"
                        >
                          {copiedField === 'acc' ? (
                            <>
                              <Check className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-2 bg-[#F8F9F5] px-3 py-2 rounded-lg border border-[#E2E6DC]">
                        <div className="min-w-0">
                          <span className="block text-[11px] text-[#4C5B54]">Llave / Nequi</span>
                          <span className="font-bold text-[#13211B] truncate block">
                            {court.paymentAccount.transferKey}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyText('key', court.paymentAccount.transferKey)
                          }
                          className="min-h-[36px] px-2.5 py-1 inline-flex items-center gap-1 text-xs font-semibold text-[#123C2D] bg-white hover:bg-[#EAEFE4] border border-[#CFD7C9] rounded-lg shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D]"
                        >
                          {copiedField === 'key' ? (
                            <>
                              <Check className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="transfer-ref-input"
                        className="block text-xs font-semibold text-[#13211B] mb-1"
                      >
                        Número de comprobante simulado (opcional)
                      </label>
                      <input
                        id="transfer-ref-input"
                        type="text"
                        value={transferReference}
                        onChange={(e) => setTransferReference(e.target.value)}
                        placeholder="Ej. TRF-90421 (si lo dejas vacío generamos uno de prueba)"
                        className="w-full min-h-[42px] px-3 py-2 text-xs sm:text-sm text-[#13211B] bg-[#F8F9F5] border border-[#CFD7C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#123C2D]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <p className="mt-3 text-xs text-[#4C5B54]">
                Pasarela simulada de prototipo: las cuentas mostradas son ficticias y no se ejecutan
                cobros bancarios reales. Al confirmar, revalidamos que la franja siga disponible.
              </p>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleConfirmClick}
                  className="w-full min-h-[48px] px-5 py-3 text-sm sm:text-base font-bold text-[#123C2D] bg-[#D4F86B] hover:bg-[#C6EE50] rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D] focus-visible:ring-offset-2"
                >
                  {!sessionUser
                    ? 'Inicia sesión para confirmar reserva'
                    : paymentMethod === 'transferencia'
                    ? 'Confirmar reserva y registrar transferencia'
                    : 'Confirmar reserva (pago en el lugar)'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
