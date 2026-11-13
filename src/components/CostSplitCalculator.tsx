import React, { useEffect, useState } from 'react';
import { Minus, Plus, Users } from 'lucide-react';
import { formatCOP } from '../utils/colombiaTime';

interface CostSplitCalculatorProps {
  reservationId: string;
  totalPrice: number;
  savedPlayers: number;
  onPlayersChange: (reservationId: string, players: number) => void;
}

export const CostSplitCalculator: React.FC<CostSplitCalculatorProps> = ({
  reservationId,
  totalPrice,
  savedPlayers,
  onPlayersChange,
}) => {
  const [inputValue, setInputValue] = useState<string>(String(savedPlayers));
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setInputValue(String(savedPlayers));
    setValidationError(null);
  }, [savedPlayers, reservationId]);

  const parsed = Number(inputValue);
  const isInputValid =
    inputValue.trim() !== '' &&
    /^\d+$/.test(inputValue.trim()) &&
    Number.isInteger(parsed) &&
    parsed >= 1;

  const effectivePlayers = isInputValid ? parsed : savedPlayers;
  const perPlayerAmount = totalPrice / effectivePlayers;

  const handleInputChange = (raw: string) => {
    setInputValue(raw);
    const trimmed = raw.trim();

    if (trimmed === '') {
      setValidationError('Ingresa un número entero positivo de jugadores.');
      return;
    }

    if (!/^\d+$/.test(trimmed)) {
      setValidationError('Solo se permiten números enteros positivos (sin decimales ni signos).');
      return;
    }

    const num = Number(trimmed);
    if (!Number.isInteger(num) || num < 1) {
      setValidationError('La cantidad mínima es 1 jugador.');
      return;
    }

    setValidationError(null);
    onPlayersChange(reservationId, num);
  };

  const handleStep = (delta: number) => {
    const base = isInputValid ? parsed : savedPlayers;
    const next = Math.max(1, base + delta);
    setInputValue(String(next));
    setValidationError(null);
    onPlayersChange(reservationId, next);
  };

  const inputId = `players-input-${reservationId}`;

  return (
    <div className="mt-5 pt-4 border-t border-[#E2E6DC]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <label
            htmlFor={inputId}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#13211B] mb-2"
          >
            <Users className="w-4 h-4 text-[#123C2D] shrink-0" aria-hidden="true" />
            <span>Dividir costo entre jugadores</span>
          </label>

          <div className="flex items-center gap-2 max-w-[220px]">
            <button
              type="button"
              onClick={() => handleStep(-1)}
              disabled={effectivePlayers <= 1}
              aria-label="Disminuir número de jugadores"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-[#F8F9F5] hover:bg-[#EAEFE4] disabled:opacity-40 disabled:cursor-not-allowed border border-[#CFD7C9] rounded-xl text-[#13211B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D]"
            >
              <Minus className="w-4 h-4" aria-hidden="true" />
            </button>

            <input
              id={inputId}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              aria-invalid={Boolean(validationError)}
              aria-describedby={validationError ? `${inputId}-err` : undefined}
              className="w-full min-h-[44px] px-3 py-2 text-center text-sm font-bold text-[#13211B] bg-[#F8F9F5] border border-[#CFD7C9] rounded-xl tabular-nums focus:outline-none focus:ring-2 focus:ring-[#123C2D] focus:border-[#123C2D]"
            />

            <button
              type="button"
              onClick={() => handleStep(1)}
              aria-label="Aumentar número de jugadores"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-[#F8F9F5] hover:bg-[#EAEFE4] border border-[#CFD7C9] rounded-xl text-[#13211B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D]"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="sm:text-right bg-[#F8F9F5] border border-[#E2E6DC] rounded-xl px-4 py-3">
          <span className="block text-xs text-[#4C5B54]">
            Aporte por jugador ({effectivePlayers}{' '}
            {effectivePlayers === 1 ? 'jugador' : 'jugadores'})
          </span>
          <span className="font-['Manrope'] text-xl font-extrabold text-[#123C2D] tabular-nums">
            {formatCOP(perPlayerAmount, 2)}
          </span>
        </div>
      </div>

      {validationError && (
        <p id={`${inputId}-err`} role="alert" className="mt-2 text-xs font-medium text-[#991B1B]">
          {validationError}
        </p>
      )}

      <p className="mt-2.5 text-xs text-[#4C5B54]">
        Cálculo informativo para repartir el valor en partes iguales. CanchaYa no procesa pagos ni
        transferencias.
      </p>
    </div>
  );
};
