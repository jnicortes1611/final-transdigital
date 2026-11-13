import { useCallback, useEffect, useState } from 'react';
import { AuthModal } from './components/AuthModal';
import {
  CatalogSection,
  MAX_PRICE_FILTER,
} from './components/CatalogSection';
import { CourtDetailView } from './components/CourtDetailView';
import { Footer } from './components/Footer';
import { AppView, Header } from './components/Header';
import { Hero } from './components/Hero';
import { MyReservationsView } from './components/MyReservationsView';
import { PRELOADED_COURTS } from './data/courts';
import { Court, Modality, Municipality, PaymentMethod, Reservation, SessionUser } from './types';
import { getReservationStatus } from './utils/colombiaTime';
import {
  RESERVATIONS_STORAGE_KEY,
  SESSION_STORAGE_KEY,
  cancelReservationAtomic,
  createReservationAtomic,
  getStoredReservations,
  getStoredSession,
  saveStoredSession,
  updateReservationPlayersAtomic,
} from './utils/storage';

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('explore');
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);

  const [sessionUser, setSessionUser] = useState<SessionUser | null>(() =>
    getStoredSession()
  );
  const [reservations, setReservations] = useState<Reservation[]>(() =>
    getStoredReservations()
  );

  // Combinable catalog filters
  const [selectedModality, setSelectedModality] = useState<Modality | 'Todas'>('Todas');
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | 'Todos'>(
    'Todos'
  );
  const [maxPrice, setMaxPrice] = useState<number>(MAX_PRICE_FILTER);

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authContextMessage, setAuthContextMessage] = useState<string | null>(null);

  // Sync reservations and session across tabs in the same browser
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === RESERVATIONS_STORAGE_KEY || event.key === null) {
        setReservations(getStoredReservations());
      }
      if (event.key === SESSION_STORAGE_KEY || event.key === null) {
        setSessionUser(getStoredSession());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleNavigate = useCallback((view: 'explore' | 'reservations') => {
    setActiveView(view);
    if (view === 'explore') {
      setSelectedCourtId(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleExploreFromHero = useCallback(() => {
    setActiveView('explore');
    setSelectedCourtId(null);
    setTimeout(() => {
      const target = document.getElementById('catalogo-canchas');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 30);
  }, []);

  const handleSelectCourt = useCallback((court: Court) => {
    setSelectedCourtId(court.id);
    setActiveView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleResetFilters = useCallback(() => {
    setSelectedModality('Todas');
    setSelectedMunicipality('Todos');
    setMaxPrice(MAX_PRICE_FILTER);
  }, []);

  const handleOpenAuth = useCallback(
    (mode: 'login' | 'register' = 'login', message: string | null = null) => {
      setAuthModalMode(mode);
      setAuthContextMessage(message);
      setAuthModalOpen(true);
    },
    []
  );

  const handleLogout = useCallback(() => {
    saveStoredSession(null);
    setSessionUser(null);
  }, []);

  const handleConfirmBooking = useCallback(
    (params: {
      court: Court;
      date: string;
      startHour: number;
      paymentMethod: PaymentMethod;
      paymentReference?: string | null;
    }) => {
      if (!sessionUser) {
        return {
          ok: false,
          error: 'Debes iniciar sesión para confirmar una reserva.',
        };
      }

      const result = createReservationAtomic({
        courtId: params.court.id,
        userId: sessionUser.id,
        userName: sessionUser.name,
        date: params.date,
        startHour: params.startHour,
        totalPrice: params.court.pricePerHour,
        defaultPlayers: params.court.defaultPlayers,
        paymentMethod: params.paymentMethod,
        paymentAccount: params.court.paymentAccount,
        paymentReference: params.paymentReference,
      });

      if (result.reservations) {
        setReservations(result.reservations);
      } else {
        setReservations(getStoredReservations());
      }

      return {
        ok: result.ok,
        error: result.error,
        reservation: result.reservation,
      };
    },
    [sessionUser]
  );

  const handleCancelReservation = useCallback(
    (reservationId: string) => {
      if (!sessionUser) {
        return { ok: false, error: 'Inicia sesión para gestionar tus reservas.' };
      }

      const result = cancelReservationAtomic(reservationId, sessionUser.id);
      if (result.reservations) {
        setReservations(result.reservations);
      } else {
        setReservations(getStoredReservations());
      }

      return {
        ok: result.ok,
        error: result.error,
      };
    },
    [sessionUser]
  );

  const handleUpdatePlayers = useCallback(
    (reservationId: string, players: number) => {
      if (!sessionUser) return;
      const result = updateReservationPlayersAtomic(reservationId, sessionUser.id, players);
      if (result.reservations) {
        setReservations(result.reservations);
      }
    },
    [sessionUser]
  );

  const selectedCourt =
    PRELOADED_COURTS.find((c) => c.id === selectedCourtId) ?? null;

  const activeReservationCount = sessionUser
    ? reservations.filter((r) => {
        if (r.userId !== sessionUser.id) return false;
        const st = getReservationStatus(r);
        return st === 'Confirmada' || st === 'En curso';
      }).length
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9F5] text-[#13211B]">
      <Header
        activeView={activeView}
        onNavigate={handleNavigate}
        sessionUser={sessionUser}
        activeReservationCount={activeReservationCount}
        onOpenAuth={(mode) => handleOpenAuth(mode ?? 'login', null)}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {activeView === 'explore' && (
          <>
            <Hero onExploreClick={handleExploreFromHero} />
            <CatalogSection
              courts={PRELOADED_COURTS}
              selectedModality={selectedModality}
              selectedMunicipality={selectedMunicipality}
              maxPrice={maxPrice}
              onModalityChange={setSelectedModality}
              onMunicipalityChange={setSelectedMunicipality}
              onMaxPriceChange={setMaxPrice}
              onResetFilters={handleResetFilters}
              onSelectCourt={handleSelectCourt}
            />
          </>
        )}

        {activeView === 'detail' && selectedCourt && (
          <CourtDetailView
            court={selectedCourt}
            reservations={reservations}
            sessionUser={sessionUser}
            onBack={() => handleNavigate('explore')}
            onRequireAuth={(msg) => handleOpenAuth('login', msg)}
            onConfirmBooking={handleConfirmBooking}
            onGoToReservations={() => handleNavigate('reservations')}
          />
        )}

        {activeView === 'reservations' && (
          <MyReservationsView
            sessionUser={sessionUser}
            reservations={reservations}
            courts={PRELOADED_COURTS}
            onOpenAuth={(mode) => handleOpenAuth(mode ?? 'login', null)}
            onExploreCourts={() => handleNavigate('explore')}
            onCancelReservation={handleCancelReservation}
            onUpdatePlayers={handleUpdatePlayers}
          />
        )}
      </main>

      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        contextMessage={authContextMessage}
        onClose={() => {
          setAuthModalOpen(false);
          setAuthContextMessage(null);
        }}
        onSuccess={(user) => {
          setSessionUser(user);
          setAuthModalOpen(false);
          setAuthContextMessage(null);
        }}
      />
    </div>
  );
}
