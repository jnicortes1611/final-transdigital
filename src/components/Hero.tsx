import React, { useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { HERO_SPORTS_IMAGE } from '../data/courts';

interface HeroProps {
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <section className="bg-[#123C2D] text-white border-b border-[#0D2D21]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-xs sm:text-sm font-medium text-[#D4F86B] tracking-wide mb-3">
              Medellín · Bello · Envigado · Itagüí · Sabaneta
            </p>
            <h1 className="font-['Manrope'] text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.12] text-white [text-wrap:balance]">
              Arma el partido con tu parche sin llamadas ni enredos
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[#D9E5DF] leading-relaxed max-w-xl">
              Compara canchas privadas de fútbol 6, 7, 8 y pádel, consulta franjas reales en hora
              de Colombia, reserva en segundos y calcula cuánto aporta cada jugador.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onExploreClick}
                className="min-h-[48px] px-6 py-3 inline-flex items-center justify-center gap-2 text-base font-bold text-[#123C2D] bg-[#D4F86B] hover:bg-[#C6EE50] active:scale-[0.99] rounded-xl transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4F86B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#123C2D]"
              >
                <span>Buscar cancha</span>
                <ArrowDown className="w-4 h-4 shrink-0" aria-hidden="true" />
              </button>
            </div>

            <p className="mt-6 pt-5 border-t border-white/15 text-xs sm:text-sm text-[#B8CCC2] leading-relaxed">
              Prototipo demostrativo con 10 canchas privadas ficticias en el Valle de Aburrá
              (excluye escenarios del INDER). No procesa pagos reales y guarda los datos localmente
              en este navegador.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="relative h-64 sm:h-80 lg:h-full min-h-[260px] rounded-2xl overflow-hidden bg-[#0D2D21] border border-white/10">
              {!imageError ? (
                <img
                  src={HERO_SPORTS_IMAGE}
                  alt="Complejo privado de canchas sintéticas de fútbol y pádel iluminado al atardecer en las montañas de Medellín"
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-6 text-center bg-gradient-to-br from-[#123C2D] to-[#091F17]">
                  <span className="font-['Manrope'] text-lg font-semibold text-[#D4F86B]">
                    Canchas privadas en el Valle de Aburrá
                  </span>
                </div>
              )}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#0A2219]/60 via-transparent to-transparent pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
