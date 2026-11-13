import React, { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, ShieldAlert, X } from 'lucide-react';
import { SessionUser } from '../types';
import { loginLocalAccount, registerLocalAccount } from '../utils/storage';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  contextMessage?: string | null;
  onClose: () => void;
  onSuccess: (user: SessionUser) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  contextMessage,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const firstInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 30);
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const switchMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setError(null);
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (mode === 'register') {
      if (!trimmedName) {
        setError('Ingresa tu nombre completo.');
        return;
      }
      if (trimmedName.length < 2) {
        setError('El nombre debe tener al menos 2 caracteres.');
        return;
      }
      if (!trimmedEmail) {
        setError('Ingresa tu correo electrónico.');
        return;
      }
      if (!EMAIL_REGEX.test(trimmedEmail)) {
        setError('El formato del correo electrónico no es válido.');
        return;
      }
      if (!password) {
        setError('Ingresa una contraseña.');
        return;
      }
      if (password.length < 8) {
        setError('La contraseña debe tener mínimo 8 caracteres.');
        return;
      }
      if (!confirmPassword) {
        setError('Confirma tu contraseña.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }

      setSubmitting(true);
      try {
        const res = await registerLocalAccount({
          name: trimmedName,
          email: trimmedEmail,
          password,
        });
        if (!res.ok || !res.user) {
          setError(res.error ?? 'No se pudo completar el registro.');
          return;
        }
        onSuccess(res.user);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Login validation
    if (!trimmedEmail) {
      setError('Ingresa tu correo electrónico.');
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('El formato del correo electrónico no es válido.');
      return;
    }
    if (!password) {
      setError('Ingresa tu contraseña.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await loginLocalAccount({
        email: trimmedEmail,
        password,
      });
      if (!res.ok || !res.user) {
        setError(res.error ?? 'No se pudo iniciar sesión.');
        return;
      }
      onSuccess(res.user);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#091F17]/65 backdrop-blur-xs"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="w-full max-w-md bg-white border border-[#E2E6DC] rounded-2xl shadow-xl overflow-hidden max-h-[92vh] overflow-y-auto"
      >
        <div className="px-6 pt-5 pb-4 border-b border-[#E2E6DC] flex items-center justify-between gap-4">
          <div>
            <h2
              id="auth-modal-title"
              className="font-['Manrope'] text-xl font-extrabold text-[#13211B]"
            >
              {mode === 'login' ? 'Iniciar sesión en CanchaYa' : 'Crear cuenta en CanchaYa'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana de acceso"
            className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-xl text-[#4C5B54] hover:text-[#13211B] hover:bg-[#F8F9F5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D]"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6">
          {/* Mode switcher */}
          <div
            role="tablist"
            aria-label="Opciones de acceso"
            className="grid grid-cols-2 gap-1 p-1 bg-[#F8F9F5] border border-[#E2E6DC] rounded-xl mb-5"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              onClick={() => switchMode('login')}
              className={`min-h-[40px] px-3 py-2 text-sm font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D] ${
                mode === 'login'
                  ? 'bg-[#123C2D] text-white'
                  : 'text-[#4C5B54] hover:text-[#13211B]'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              onClick={() => switchMode('register')}
              className={`min-h-[40px] px-3 py-2 text-sm font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D] ${
                mode === 'register'
                  ? 'bg-[#123C2D] text-white'
                  : 'text-[#4C5B54] hover:text-[#13211B]'
              }`}
            >
              Crear cuenta
            </button>
          </div>

          {contextMessage && (
            <div className="mb-4 p-3 rounded-xl bg-[#F8F9F5] border border-[#D4DDD0] text-xs sm:text-sm text-[#123C2D]">
              {contextMessage}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-4 p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-sm text-[#991B1B] flex items-start gap-2.5"
            >
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="auth-name"
                  className="block text-sm font-semibold text-[#13211B] mb-1.5"
                >
                  Nombre completo
                </label>
                <input
                  ref={mode === 'register' ? firstInputRef : undefined}
                  id="auth-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Laura Gómez"
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm text-[#13211B] bg-[#F8F9F5] border border-[#CFD7C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#123C2D] focus:border-[#123C2D]"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="auth-email"
                className="block text-sm font-semibold text-[#13211B] mb-1.5"
              >
                Correo electrónico
              </label>
              <input
                ref={mode === 'login' ? firstInputRef : undefined}
                id="auth-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu.correo@ejemplo.com"
                className="w-full min-h-[44px] px-3.5 py-2 text-sm text-[#13211B] bg-[#F8F9F5] border border-[#CFD7C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#123C2D] focus:border-[#123C2D]"
              />
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="block text-sm font-semibold text-[#13211B] mb-1.5"
              >
                Contraseña {mode === 'register' && <span className="font-normal text-[#4C5B54]">(mínimo 8 caracteres)</span>}
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  required
                  minLength={mode === 'register' ? 8 : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full min-h-[44px] pl-3.5 pr-12 py-2 text-sm text-[#13211B] bg-[#F8F9F5] border border-[#CFD7C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#123C2D] focus:border-[#123C2D]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={showPassword}
                  className="absolute right-0 top-0 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#4C5B54] hover:text-[#13211B] rounded-r-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D]"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label
                  htmlFor="auth-confirm-password"
                  className="block text-sm font-semibold text-[#13211B] mb-1.5"
                >
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    id="auth-confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                    className="w-full min-h-[44px] pl-3.5 pr-12 py-2 text-sm text-[#13211B] bg-[#F8F9F5] border border-[#CFD7C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#123C2D] focus:border-[#123C2D]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={
                      showConfirmPassword
                        ? 'Ocultar confirmación de contraseña'
                        : 'Mostrar confirmación de contraseña'
                    }
                    aria-pressed={showConfirmPassword}
                    className="absolute right-0 top-0 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#4C5B54] hover:text-[#13211B] rounded-r-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D]"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[48px] px-4 py-3 text-sm font-bold text-[#123C2D] bg-[#D4F86B] hover:bg-[#C6EE50] disabled:opacity-60 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D] focus-visible:ring-offset-2"
            >
              {submitting
                ? 'Procesando...'
                : mode === 'login'
                ? 'Entrar a mi cuenta'
                : 'Registrarme y continuar'}
            </button>
          </form>

          <p className="mt-5 pt-4 border-t border-[#E2E6DC] text-xs text-[#4C5B54] leading-relaxed">
            Acceso local de demostración: las cuentas se almacenan en este navegador (contraseña
            protegida como resumen SHA-256 con sal) y no se sincronizan entre dispositivos.
          </p>
        </div>
      </div>
    </div>
  );
};
