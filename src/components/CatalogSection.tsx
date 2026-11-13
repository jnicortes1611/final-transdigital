import React from 'react';
import { RotateCcw, SearchX } from 'lucide-react';
import { Court, Modality, Municipality } from '../types';
import { MODALITIES, MUNICIPALITIES } from '../data/courts';
import { formatCOP } from '../utils/colombiaTime';
import { CourtCard } from './CourtCard';

export const MIN_PRICE_FILTER = 100000;
export const MAX_PRICE_FILTER = 250000;

interface CatalogSectionProps {
  courts: Court[];
  selectedModality: Modality | 'Todas';
  selectedMunicipality: Municipality | 'Todos';
  maxPrice: number;
  onModalityChange: (modality: Modality | 'Todas') => void;
  onMunicipalityChange: (municipality: Municipality | 'Todos') => void;
  onMaxPriceChange: (price: number) => void;
  onResetFilters: () => void;
  onSelectCourt: (court: Court) => void;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  courts,
  selectedModality,
  selectedMunicipality,
  maxPrice,
  onModalityChange,
  onMunicipalityChange,
  onMaxPriceChange,
  onResetFilters,
  onSelectCourt,
}) => {
  const filteredCourts = courts.filter((court) => {
    const matchesModality =
      selectedModality === 'Todas' || court.modality === selectedModality;
    const matchesMunicipality =
      selectedMunicipality === 'Todos' || court.municipality === selectedMunicipality;
    const matchesPrice = court.pricePerHour <= maxPrice;
    return matchesModality && matchesMunicipality && matchesPrice;
  });

  const hasActiveFilters =
    selectedModality !== 'Todas' ||
    selectedMunicipality !== 'Todos' ||
    maxPrice < MAX_PRICE_FILTER;

  return (
    <section
      id="catalogo-canchas"
      aria-labelledby="catalog-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2
            id="catalog-heading"
            className="font-['Manrope'] text-2xl sm:text-3xl font-extrabold text-[#13211B] tracking-tight"
          >
            Explorar canchas privadas
          </h2>
          <p className="mt-1 text-sm sm:text-base text-[#4C5B54]">
            Filtra por deporte, municipio del Valle de Aburrá y presupuesto por hora.
          </p>
        </div>

        <p
          aria-live="polite"
          className="text-sm font-medium text-[#4C5B54] tabular-nums whitespace-nowrap"
        >
          {filteredCourts.length === 1
            ? '1 cancha encontrada'
            : `${filteredCourts.length} canchas encontradas`}
        </p>
      </div>

      {/* Filters panel */}
      <div className="bg-white border border-[#E2E6DC] rounded-2xl p-4 sm:p-6 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
          {/* Modality segmented control */}
          <div className="lg:col-span-5">
            <span
              id="label-modality"
              className="block text-sm font-semibold text-[#13211B] mb-2"
            >
              Modalidad
            </span>
            <div
              role="group"
              aria-labelledby="label-modality"
              className="flex flex-wrap gap-1.5 p-1 bg-[#F8F9F5] border border-[#E2E6DC] rounded-xl"
            >
              {(['Todas', ...MODALITIES] as const).map((modality) => {
                const isActive = selectedModality === modality;
                return (
                  <button
                    key={modality}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => onModalityChange(modality)}
                    className={`min-h-[40px] px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D] ${
                      isActive
                        ? 'bg-[#123C2D] text-white'
                        : 'text-[#4C5B54] hover:text-[#13211B] hover:bg-white'
                    }`}
                  >
                    {modality}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Municipality select */}
          <div className="lg:col-span-3">
            <label
              htmlFor="filter-municipality"
              className="block text-sm font-semibold text-[#13211B] mb-2"
            >
              Municipio
            </label>
            <select
              id="filter-municipality"
              value={selectedMunicipality}
              onChange={(e) =>
                onMunicipalityChange(e.target.value as Municipality | 'Todos')
              }
              className="w-full min-h-[44px] px-3.5 py-2 text-sm text-[#13211B] bg-[#F8F9F5] border border-[#CFD7C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#123C2D] focus:border-[#123C2D]"
            >
              <option value="Todos">Todos los municipios</option>
              {MUNICIPALITIES.map((mun) => (
                <option key={mun} value={mun}>
                  {mun}
                </option>
              ))}
            </select>
          </div>

          {/* Max price range */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <label
                htmlFor="filter-max-price"
                className="text-sm font-semibold text-[#13211B]"
              >
                Precio máximo / hora
              </label>
              <span className="text-sm font-bold text-[#123C2D] tabular-nums">
                {formatCOP(maxPrice)}
              </span>
            </div>
            <div className="min-h-[44px] flex items-center">
              <input
                id="filter-max-price"
                type="range"
                min={MIN_PRICE_FILTER}
                max={MAX_PRICE_FILTER}
                step={5000}
                value={maxPrice}
                onChange={(e) => onMaxPriceChange(Number(e.target.value))}
                className="w-full accent-[#123C2D] cursor-pointer h-2 bg-[#E2E6DC] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D]"
              />
            </div>
          </div>

          {/* Reset button */}
          <div className="lg:col-span-1 flex lg:justify-end">
            <button
              type="button"
              onClick={onResetFilters}
              disabled={!hasActiveFilters}
              title="Restablecer todos los filtros"
              aria-label="Restablecer filtros"
              className="w-full lg:w-auto min-h-[44px] px-3.5 py-2 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-[#13211B] bg-[#F8F9F5] hover:bg-[#EAEFE4] disabled:opacity-45 disabled:cursor-not-allowed border border-[#CFD7C9] rounded-xl transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D]"
            >
              <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="lg:hidden">Restablecer filtros</span>
            </button>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 pt-3 border-t border-[#E2E6DC] flex flex-wrap items-center justify-between gap-2 text-xs text-[#4C5B54]">
            <span>
              Filtros activos: {selectedModality} ·{' '}
              {selectedMunicipality === 'Todos' ? 'Todos los municipios' : selectedMunicipality} ·{' '}
              Hasta {formatCOP(maxPrice)}/h
            </span>
            <button
              type="button"
              onClick={onResetFilters}
              className="font-semibold text-[#123C2D] underline underline-offset-2 hover:text-[#0D2D21] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D] rounded"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </div>

      {/* Results grid or empty state */}
      {filteredCourts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourts.map((court) => (
            <CourtCard key={court.id} court={court} onSelectCourt={onSelectCourt} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#E2E6DC] rounded-2xl p-10 text-center max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-[#F8F9F5] border border-[#E2E6DC] flex items-center justify-center mx-auto mb-4">
            <SearchX className="w-6 h-6 text-[#4C5B54]" aria-hidden="true" />
          </div>
          <h3 className="font-['Manrope'] text-xl font-bold text-[#13211B]">
            Sin resultados para esta combinación
          </h3>
          <p className="mt-2 text-sm text-[#4C5B54]">
            Ninguna de nuestras 10 canchas coincide con la modalidad, municipio y precio máximo
            seleccionados.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-6 min-h-[44px] px-5 py-2.5 inline-flex items-center gap-2 text-sm font-bold text-[#123C2D] bg-[#D4F86B] hover:bg-[#C6EE50] rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C2D]"
          >
            <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Restablecer filtros</span>
          </button>
        </div>
      )}
    </section>
  );
};
