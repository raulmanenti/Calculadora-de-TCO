
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend } from 'recharts';
import type { TcoResult } from '../types';

interface ResultsCardProps {
  results: TcoResult;
  fuelType: 'diesel' | 'gasolina';
}

const ResultsCard: React.FC<ResultsCardProps> = ({ results, fuelType }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
  
  const formatCo2 = (kg: number) => {
    if (kg >= 1000) {
      const tonnes = kg / 1000;
      return `${tonnes.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} t`;
    }
    return `${kg.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kg`;
  };

  const fuelTypeName = fuelType === 'diesel' ? 'Diesel' : 'Gasolina';

  return (
    <div className="mt-8 bg-white rounded-xl shadow-lg p-6 sm:p-8 animate-fade-in">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Resultados do Cálculo de TCO</h2>
      <p className="text-slate-500 mb-6">Comparativo de custos operacionais, economia e impacto ambiental.</p>
      
       <div className="my-8 py-6 border-y border-slate-200">
        <h3 className="text-lg sm:text-xl font-bold text-slate-700 mb-4 text-center">Impacto Ambiental Positivo</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <div>
              <p className="text-blue-600 text-sm font-semibold">Redução de CO₂</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-800">{formatCo2(results.co2SavingsKg)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex-shrink-0">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V11m0 0C9.653 9.88 7 7.5 7 5.5a5 5 0 1110 0c0 2-2.653 4.38-5 5.5z" />
               </svg>
            </div>
            <div>
              <p className="text-green-700 text-sm font-semibold">Árvores Salvas (equivalente)</p>
              <p className="text-xl sm:text-2xl font-bold text-green-800">{Math.round(results.treesSaved).toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg sm:text-xl font-bold text-slate-700 mb-4 text-center">Economia em combustível desde o primeiro dia</h3>
        
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md mb-6 shadow-sm" role="status">
          <p className="text-green-700 font-semibold">Economia Direta em Combustível</p>
          <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">{formatCurrency(results.fuelEnergySavings)}</p>
        </div>

        <div className="w-full h-80">
           <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={results.chartData}
                margin={{
                  top: 5,
                  right: 20,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" interval={0} tick={{ fontSize: 12, textAnchor: 'middle', dy: 10 }} />
                <YAxis 
                  tickFormatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(value)} 
                  stroke="#64748b"
                  tick={{ fontSize: 12 }} 
                />
                <Tooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'rgba(203, 213, 225, 0.3)'}} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                   {results.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="mt-12 pt-8 border-t border-slate-200">
        <h3 className="text-lg sm:text-xl font-bold text-slate-700 mb-4 text-center">Custo Acumulado em Manutenção</h3>
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md mb-6 shadow-sm" role="status">
          <p className="text-blue-700 font-semibold">Economia Total em Manutenção</p>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1">{formatCurrency(results.maintenanceSavings)}</p>
        </div>

        <div className="w-full h-80">
           <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={results.maintenanceChartData}
                margin={{
                  top: 5,
                  right: 20,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ano" stroke="#64748b" tickFormatter={(ano) => `Ano ${ano}`} />
                <YAxis 
                  tickFormatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(value)} 
                  stroke="#64748b"
                  tick={{ fontSize: 12 }} 
                />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="combustionCost" name={fuelTypeName} stroke="#f87171" strokeWidth={2} activeDot={{ r: 6 }} dot={false} />
                <Line type="monotone" dataKey="feverNextemCost" name="Fever NEXTEM" stroke="#2dd4bf" strokeWidth={2} activeDot={{ r: 6 }} dot={false} />
              </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="mt-12 pt-8 border-t border-slate-200">
        <h3 className="text-lg sm:text-xl font-bold text-slate-700 mb-6 text-center">Resumo de Custos Operacionais Projetados</h3>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full bg-white text-sm text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 font-semibold text-slate-600">Período</th>
                <th className="p-3 font-semibold text-red-600 text-right">Custo {fuelTypeName}</th>
                <th className="p-3 font-semibold text-teal-600 text-right">Custo Fever NEXTEM</th>
              </tr>
            </thead>
            <tbody>
              {results.summaryTableData.map((row) => (
                <tr key={row.period} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-medium text-slate-800">{row.period}</td>
                  <td className="p-3 text-red-500 font-mono text-right">{formatCurrency(row.combustionCost)}</td>
                  <td className="p-3 text-teal-500 font-mono text-right">{formatCurrency(row.feverNextemCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ResultsCard;
