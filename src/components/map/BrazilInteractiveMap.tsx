import React, { useState } from 'react';
import {
  BRAZIL_STATES,
  REGIONS_INFO,
  StateMapItem,
} from '../../data/brazilMapData';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  Info,
  MapPin,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Client } from '../../types';

interface BrazilInteractiveMapProps {
  onSelectState?: (uf: string) => void;
  onAddClientForState?: (uf: string) => void;
  isWidgetMode?: boolean;
}

export const BrazilInteractiveMap: React.FC<BrazilInteractiveMapProps> = ({
  onSelectState,
  onAddClientForState,
  isWidgetMode = false,
}) => {
  const { clientsByState, clients, freelanceProjects, statesWithJobsCount } = useFinance();
  const [hoveredUF, setHoveredUF] = useState<string | null>(null);
  const [selectedUF, setSelectedUF] = useState<string>('SP');

  // Calculate totals
  const totalFreelanceRevenue = (Object.values(clientsByState) as Array<{ totalBilled: number }>).reduce(
    (acc, curr) => acc + (curr?.totalBilled || 0),
    0
  );

  const selectedStateData = BRAZIL_STATES.find((s) => s.uf === selectedUF);
  const selectedStateStats = clientsByState[selectedUF];

  const hoveredStateData = BRAZIL_STATES.find((s) => s.uf === hoveredUF);
  const hoveredStateStats = hoveredUF ? clientsByState[hoveredUF] : null;

  // Compute state color based on billing level
  const getStateColor = (uf: string) => {
    const stat = clientsByState[uf];
    const isSelected = selectedUF === uf;
    const isHovered = hoveredUF === uf;

    if (!stat || stat.clientsCount === 0) {
      if (isSelected) return '#3f3f46'; // zinc-700
      if (isHovered) return '#27272a'; // zinc-800
      return '#18181b'; // zinc-900 (empty)
    }

    // Has clients / jobs
    if (stat.totalBilled >= 10000) {
      return isSelected || isHovered ? '#10b981' : '#059669'; // High emerald
    }
    if (stat.totalBilled >= 5000) {
      return isSelected || isHovered ? '#38bdf8' : '#0284c7'; // Cyan/sky
    }
    return isSelected || isHovered ? '#818cf8' : '#4f46e5'; // Indigo/violet
  };

  const handleStateClick = (uf: string) => {
    setSelectedUF(uf);
    if (onSelectState) onSelectState(uf);
  };

  // Regional breakdown
  const regionalStats = REGIONS_INFO.map((region) => {
    const totalBilled = region.ufs.reduce(
      (sum, uf) => sum + (clientsByState[uf]?.totalBilled || 0),
      0
    );
    const clientsCount = region.ufs.reduce(
      (sum, uf) => sum + (clientsByState[uf]?.clientsCount || 0),
      0
    );
    const percentage = totalFreelanceRevenue > 0 ? (totalBilled / totalFreelanceRevenue) * 100 : 0;
    return {
      ...region,
      totalBilled,
      clientsCount,
      percentage,
    };
  }).sort((a, b) => b.totalBilled - a.totalBilled);

  // Top states by billing
  const rankedStates = BRAZIL_STATES
    .filter((s) => (clientsByState[s.uf]?.totalBilled || 0) > 0)
    .map((s) => ({
      ...s,
      ...clientsByState[s.uf],
    }))
    .sort((a, b) => b.totalBilled - a.totalBilled);

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      {!isWidgetMode && (
        <div className="p-5 rounded-2xl bg-[#18181b] border border-[#27272a] relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <MapPin className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-[#fafafa] tracking-tight">
                  Alcance dos Trabalhos no Brasil
                </h2>
              </div>
              <p className="text-xs text-[#a1a1aa] mt-1 max-w-2xl">
                Mapa interativo dos seus clientes e projetos de Freelancer em todo o território nacional.
                Passe o mouse ou clique no estado para conferir faturamento, cidades e clientes atendidos.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="px-3.5 py-2 rounded-xl bg-[#09090b] border border-[#27272a]">
                <span className="text-[#a1a1aa] block text-[11px]">Estados Atendidos</span>
                <span className="text-sm font-bold text-emerald-400">{statesWithJobsCount} / 27 UFs</span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-[#09090b] border border-[#27272a]">
                <span className="text-[#a1a1aa] block text-[11px]">Faturamento Total Freela</span>
                <span className="text-sm font-bold text-[#fafafa]">{formatCurrency(totalFreelanceRevenue)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Map on Left, Details & Ranking on Right */}
      <div className={`grid grid-cols-1 ${isWidgetMode ? 'lg:grid-cols-1' : 'lg:grid-cols-12'} gap-6`}>
        {/* Vector SVG Map Container */}
        <div
          className={`${
            isWidgetMode ? 'lg:col-span-1' : 'lg:col-span-7'
          } p-4 sm:p-6 rounded-2xl bg-[#18181b] border border-[#27272a] flex flex-col items-center justify-center relative min-h-[420px]`}
        >
          {/* Map Legend */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2 pb-3 mb-2 border-b border-[#27272a] text-xs">
            <span className="text-[#a1a1aa] font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Densidade de Faturamento
            </span>
            <div className="flex items-center gap-3 text-[11px] text-[#a1a1aa]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981]" />
                <span>+R$ 10k</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#38bdf8]" />
                <span>R$ 5k - 10k</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#818cf8]" />
                <span>&lt; R$ 5k</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#18181b] border border-[#27272a]" />
                <span>Sem Freela</span>
              </div>
            </div>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative w-full max-w-[540px] aspect-[600/620]">
            <svg
              viewBox="0 0 600 620"
              className="w-full h-full drop-shadow-xl"
              style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))' }}
            >
              {BRAZIL_STATES.map((state) => {
                const stat = clientsByState[state.uf];
                const hasJobs = stat && stat.clientsCount > 0;
                const isSelected = selectedUF === state.uf;
                const isHovered = hoveredUF === state.uf;
                const color = getStateColor(state.uf);

                return (
                  <g
                    key={state.uf}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredUF(state.uf)}
                    onMouseLeave={() => setHoveredUF(null)}
                    onClick={() => handleStateClick(state.uf)}
                  >
                    <path
                      d={state.path}
                      fill={color}
                      stroke={isSelected ? '#ffffff' : isHovered ? '#a1a1aa' : '#27272a'}
                      strokeWidth={isSelected ? 2.5 : isHovered ? 1.8 : 1}
                      className="transition-colors duration-200"
                    />

                    {/* State Abbreviation Label */}
                    <text
                      x={state.cx}
                      y={state.cy}
                      fill={hasJobs ? '#ffffff' : '#71717a'}
                      fontSize={hasJobs ? 11 : 9}
                      fontWeight={hasJobs ? 'bold' : 'normal'}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="pointer-events-none select-none font-mono"
                    >
                      {state.uf}
                    </text>

                    {/* Indicator Dot for Active Jobs */}
                    {hasJobs && (
                      <circle
                        cx={state.cx + 10}
                        cy={state.cy - 7}
                        r={3.5}
                        fill="#34d399"
                        stroke="#064e3b"
                        strokeWidth={1}
                        className="animate-pulse"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Floating Card */}
            {hoveredUF && hoveredStateData && (
              <div
                className="absolute top-3 left-3 pointer-events-none z-20 p-3.5 rounded-xl bg-[#09090b]/95 border border-[#27272a] shadow-2xl backdrop-blur-md text-xs min-w-[200px] animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between gap-2 border-b border-[#27272a] pb-1.5 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#fafafa] text-sm">
                      {hoveredStateData.name} ({hoveredStateData.uf})
                    </span>
                  </div>
                  <span className="text-[10px] text-[#a1a1aa] bg-[#27272a] px-1.5 py-0.5 rounded-full">
                    {hoveredStateData.region}
                  </span>
                </div>

                {hoveredStateStats && hoveredStateStats.clientsCount > 0 ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[#fafafa]">
                      <span className="text-[#a1a1aa]">Faturamento:</span>
                      <span className="font-bold text-emerald-400">
                        {formatCurrency(hoveredStateStats.totalBilled)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#fafafa]">
                      <span className="text-[#a1a1aa]">Clientes Atendidos:</span>
                      <span className="font-semibold text-[#fafafa]">
                        {hoveredStateStats.clientsCount} cliente(s)
                      </span>
                    </div>
                    <div className="flex justify-between text-[#fafafa]">
                      <span className="text-[#a1a1aa]">Projetos:</span>
                      <span className="font-semibold text-blue-400">
                        {hoveredStateStats.projectsCount} projeto(s)
                      </span>
                    </div>
                    <div className="pt-1 text-[10px] text-emerald-400 italic">
                      Clique para ver clientes de {hoveredStateData.uf}
                    </div>
                  </div>
                ) : (
                  <div className="text-[#71717a] italic py-1">
                    Nenhum projeto registrado neste estado ainda.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selected State Details & Regional Stats on Right */}
        <div className={`${isWidgetMode ? 'lg:col-span-1' : 'lg:col-span-5'} space-y-5`}>
          {/* Selected State Highlight Card */}
          {selectedStateData && (
            <div className="p-5 rounded-2xl bg-[#18181b] border border-[#27272a] space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {selectedStateData.uf}
                    </span>
                    <h3 className="font-bold text-[#fafafa] text-base">
                      {selectedStateData.name}
                    </h3>
                  </div>
                  <p className="text-xs text-[#a1a1aa] mt-0.5">
                    Região {selectedStateData.region} • Capital {selectedStateData.capital}
                  </p>
                </div>

                {onAddClientForState && (
                  <button
                    onClick={() => onAddClientForState(selectedStateData.uf)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Novo Cliente {selectedStateData.uf}</span>
                  </button>
                )}
              </div>

              {/* State Metrics Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-[#09090b] border border-[#27272a]">
                  <span className="text-[10px] text-[#a1a1aa] block">Faturado</span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-400 block mt-0.5">
                    {formatCurrency(selectedStateStats?.totalBilled || 0)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#09090b] border border-[#27272a]">
                  <span className="text-[10px] text-[#a1a1aa] block">Clientes</span>
                  <span className="text-xs sm:text-sm font-bold text-[#fafafa] block mt-0.5">
                    {selectedStateStats?.clientsCount || 0}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#09090b] border border-[#27272a]">
                  <span className="text-[10px] text-[#a1a1aa] block">Projetos</span>
                  <span className="text-xs sm:text-sm font-bold text-blue-400 block mt-0.5">
                    {selectedStateStats?.projectsCount || 0}
                  </span>
                </div>
              </div>

              {/* Client List for this State */}
              <div>
                <h4 className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Clientes em {selectedStateData.name}</span>
                  <span className="text-[#71717a] font-normal lowercase">
                    {selectedStateStats?.clients?.length || 0} cadastrado(s)
                  </span>
                </h4>

                {selectedStateStats && selectedStateStats.clients.length > 0 ? (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {selectedStateStats.clients.map((cli) => (
                      <div
                        key={cli.id}
                        className="p-2.5 rounded-xl bg-[#09090b] border border-[#27272a] hover:border-[#3f3f46] transition-colors flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-[#fafafa] truncate">{cli.name}</div>
                          <div className="text-[11px] text-[#a1a1aa] flex items-center gap-1.5 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#71717a]" />
                            <span>{cli.city}</span>
                            <span>•</span>
                            <span className="text-[#a1a1aa] truncate">{cli.serviceType}</span>
                          </div>
                        </div>
                        <div className="text-right pl-2">
                          <span className="font-bold text-emerald-400 block">
                            {formatCurrency(cli.totalBilled)}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              cli.pendingAmount > 0
                                ? 'bg-yellow-500/10 text-yellow-300'
                                : 'bg-emerald-500/10 text-emerald-300'
                            }`}
                          >
                            {cli.pendingAmount > 0 ? `Pendente: ${formatCurrency(cli.pendingAmount)}` : '100% Pago'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#09090b] border border-dashed border-[#27272a] text-center text-xs text-[#71717a]">
                    Nenhum cliente cadastrado no estado de {selectedStateData.name} ainda.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Regional Summary Bars */}
          {!isWidgetMode && (
            <div className="p-5 rounded-2xl bg-[#18181b] border border-[#27272a] space-y-3.5">
              <h3 className="text-xs font-bold text-[#fafafa] uppercase tracking-wider flex items-center justify-between">
                <span>Faturamento por Região do Brasil</span>
                <span className="text-[#a1a1aa] font-normal">Participação</span>
              </h3>

              <div className="space-y-3">
                {regionalStats.map((reg) => (
                  <div key={reg.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-[#fafafa] flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: reg.color }}
                        />
                        {reg.name}
                        <span className="text-[10px] text-[#71717a]">({reg.clientsCount} clientes)</span>
                      </span>
                      <span className="font-bold text-[#fafafa]">
                        {formatCurrency(reg.totalBilled)} ({reg.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#09090b] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(reg.percentage, reg.totalBilled > 0 ? 3 : 0)}%`,
                          backgroundColor: reg.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top States Ranking List */}
          {!isWidgetMode && rankedStates.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#18181b] border border-[#27272a] space-y-3">
              <h3 className="text-xs font-bold text-[#fafafa] uppercase tracking-wider">
                Top Estados Mais Lucrativos
              </h3>
              <div className="space-y-2">
                {rankedStates.slice(0, 4).map((st, idx) => (
                  <div
                    key={st.uf}
                    onClick={() => handleStateClick(st.uf)}
                    className="p-2.5 rounded-xl bg-[#09090b] hover:bg-[#27272a] cursor-pointer border border-[#27272a] transition-all flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#27272a] flex items-center justify-center font-bold text-[10px] text-[#a1a1aa]">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-semibold text-[#fafafa]">{st.name}</span>
                        <span className="text-[10px] text-[#71717a] ml-1.5">({st.uf})</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-400">{formatCurrency(st.totalBilled)}</span>
                      <span className="text-[10px] text-[#71717a] block">{st.clientsCount} cliente(s)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
