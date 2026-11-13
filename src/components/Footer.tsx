import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#123C2D] text-[#D9E5DF] border-t border-[#0D2D21] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-['Manrope'] text-lg font-extrabold text-white">CanchaYa</span>
          <p className="mt-1 text-xs sm:text-sm text-[#B8CCC2]">
            Canchas privadas de pago en Medellín, Bello, Envigado, Itagüí y Sabaneta. Excluye
            escenarios del INDER.
          </p>
        </div>

        <p className="text-xs text-[#B8CCC2] max-w-md md:text-right leading-relaxed">
          Prototipo funcional sin pagos reales. Cuentas (con resumen SHA-256 + sal) y reservas se
          almacenan en <span className="font-semibold text-white">localStorage</span> de este
          navegador y no se sincronizan entre dispositivos.
        </p>
      </div>
    </footer>
  );
};
