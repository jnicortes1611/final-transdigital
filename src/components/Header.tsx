import React from 'react';
import { LogOut, User } from 'lucide-react';
import { SessionUser } from '../types';

export type AppView = 'explore' | 'detail' | 'reservations';

interface HeaderProps {
  activeView: AppView;
  onNavigate: (view: 'explore' | 'reservations') => void;
  sessionUser: SessionUser | null;
  activeReservationCount: number;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onNavigate,
  sessionUser,
  activeReservationCount,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <header className="bg-white border-b border-[#E2E6DC] md:sticky md:top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-8 min-h-[64px] py-2.5">
          {/* Zone 1: Brand wordmark */}
          <button
            type="button"
            onClick={() => onNavigate('explore')}
            className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 rounded-lg py-1 pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D]"
            aria-label="CanchaYa, ir al inicio"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="shrink-0"
            >
              <rect width="28" height="28" rx="7" fill="#123C2D" />
              <rect
                x="5"
                y="7"
                width="18"
                height="14"
                rx="1.5"
                stroke="#D4F86B"
                strokeWidth="1.75"
              />
              <line x1="14" y1="7" x2="14" y2="21" stroke="#D4F86B" strokeWidth="1.5" />
              <circle cx="14" cy="14" r="2.75" stroke="#D4F86B" strokeWidth="1.5" />
            </svg>
            <span className="font-['Manrope'] text-xl font-extrabold tracking-tight text-[#123C2D]">
              CanchaYa
            </span>
          </button>

          {/* Zone 2: Primary navigation links */}
          <nav
            aria-label="Navegación principal"
            className="order-3 md:order-2 w-full md:w-auto flex items-center gap-6 border-t md:border-t-0 border-[#E2E6DC] pt-2 md:pt-0"
          >
            <button
              type="button"
              onClick={() => onNavigate('explore')}
              className={`min-h-[44px] md:min-h-[40px] inline-flex items-center text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D] rounded-t ${
                activeView === 'explore' || activeView === 'detail'
                  ? 'border-[#123C2D] text-[#123C2D] font-semibold'
                  : 'border-transparent text-[#4C5B54] hover:text-[#123C2D]'
              }`}
            >
              Explorar canchas
            </button>
            <button
              type="button"
              onClick={() => onNavigate('reservations')}
              className={`min-h-[44px] md:min-h-[40px] inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D] rounded-t ${
                activeView === 'reservations'
                  ? 'border-[#123C2D] text-[#123C2D] font-semibold'
                  : 'border-transparent text-[#4C5B54] hover:text-[#123C2D]'
              }`}
            >
              <span>Mis reservas</span>
              {sessionUser && activeReservationCount > 0 && (
                <span className="tabular-nums text-xs text-[#4C5B54]">
                  ({activeReservationCount})
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: Auth / Client account */}
          <div className="order-2 md:order-3 flex items-center gap-3 shrink-0">
            {sessionUser ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[#123C2D] max-w-[150px] sm:max-w-[200px]">
                  <User className="w-4 h-4 shrink-0 text-[#123C2D]" aria-hidden="true" />
                  <span className="truncate">{sessionUser.name}</span>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="min-h-[44px] sm:min-h-[40px] px-3.5 py-2 inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#13211B] bg-[#F8F9F5] hover:bg-[#EAEFE4] border border-[#D4DDD0] rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D]"
                >
                  <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="min-h-[44px] sm:min-h-[40px] px-4 py-2 text-sm font-semibold text-[#123C2D] bg-[#D4F86B] hover:bg-[#C6EE50] rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D] focus-visible:ring-offset-2"
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
