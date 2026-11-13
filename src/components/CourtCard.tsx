import React, { useState } from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { Court } from '../types';
import { formatCOP } from '../utils/colombiaTime';

interface CourtCardProps {
  court: Court;
  onSelectCourt: (court: Court) => void;
}

export const CourtCard: React.FC<CourtCardProps> = ({ court, onSelectCourt }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <article className="bg-white border border-[#E2E6DC] rounded-2xl overflow-hidden flex flex-col transition-transform duration-150 hover:-translate-y-0.5 hover:border-[#C5CFC0]">
      <div className="aspect-[4/3] w-full bg-[#EAEFE4] overflow-hidden relative">
        {!imageError ? (
          <img
            src={court.image}
            alt={`${court.name} — cancha de ${court.modality} en ${court.municipality}`}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#123C2D] to-[#1D5440] text-white text-center">
            <span className="font-['Manrope'] font-bold text-base">{court.modality}</span>
            <span className="text-xs text-[#D4F86B] mt-1">{court.municipality}</span>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#123C2D] tracking-wide">
          <span>{court.modality}</span>
          <span aria-hidden="true" className="text-[#8FA096]">
            ·
          </span>
          <span className="text-[#4C5B54]">{court.municipality}</span>
        </div>

        <h3 className="mt-1.5 font-['Manrope'] text-lg font-bold text-[#13211B] leading-snug">
          {court.name}
        </h3>

        <p className="mt-1 flex items-start gap-1.5 text-xs text-[#4C5B54]">
          <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#4C5B54]" aria-hidden="true" />
          <span>{court.address}</span>
        </p>

        <p className="mt-3 text-sm text-[#4C5B54] leading-relaxed flex-1">
          {court.services.join(' · ')}
        </p>

        <div className="mt-5 pt-4 border-t border-[#E2E6DC] flex items-center justify-between gap-3">
          <div>
            <span className="block text-xs text-[#4C5B54]">Tarifa por hora</span>
            <span className="font-['Manrope'] text-lg font-extrabold text-[#123C2D] tabular-nums">
              {formatCOP(court.pricePerHour)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onSelectCourt(court)}
            className="min-h-[44px] px-4 py-2.5 inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#123C2D] hover:bg-[#0D2D21] rounded-xl transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D] focus-visible:ring-offset-2"
          >
            <span>Ver horarios</span>
            <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
};
