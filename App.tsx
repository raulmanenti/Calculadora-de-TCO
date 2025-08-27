
import React, { useState, useCallback } from 'react';
import type { CalculatorParams, TcoResult } from './types';
import SliderInput from './components/SliderInput';
import Button from './components/Button';
import ResultsCard from './components/ResultsCard';

const DEFAULT_DIESEL_COST = 6.18;
const DEFAULT_GASOLINA_COST = 6.25;

const DEFAULT_PARAMS: CalculatorParams = {
  monthlyMileage: 3000,
  usageTime: 3,
  fleetSize: 3,
  fuelCost: DEFAULT_DIESEL_COST, // Default to Diesel cost
  energyCost: 0.73,
  fuelType: 'diesel',
};

// Vehicle constants for calculation
const DIESEL_EFFICIENCY_KMPL = 3.5; // km per liter
const DIESEL_MAINTENANCE_PER_KM = 0.45; // R$ per km
const DIESEL_ACQUISITION_COST = 350000; // R$ per vehicle

const GASOLINA_EFFICIENCY_KMPL = 7; // km per liter
const GASOLINA_MAINTENANCE_PER_KM = 0.35; // R$ per km
const GASOLINA_ACQUISITION_COST = 300000; // R$ per vehicle

const FEVER_NEXTEM_EFFICIENCY_KMPKWH = 2; // km per kWh
const FEVER_NEXTEM_MAINTENANCE_PER_KM = 0.15; // R$ per km
const FEVER_NEXTEM_ACQUISITION_COST = 650000; // R$ per vehicle

// Environmental constants
const CO2_EMISSION_DIESEL_KG_PER_LITER = 2.68;
const CO2_EMISSION_GASOLINA_KG_PER_LITER = 2.31;
const CO2_ABSORPTION_PER_TREE_KG_PER_YEAR = 22;

const App: React.FC = () => {
  const [params, setParams] = useState<CalculatorParams>(DEFAULT_PARAMS);
  const [results, setResults] = useState<TcoResult | null>(null);
  
  const [fuelCostStr, setFuelCostStr] = useState(DEFAULT_PARAMS.fuelCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  const [energyCostStr, setEnergyCostStr] = useState(DEFAULT_PARAMS.energyCost.toLocaleString('pt-BR'));


  const handleSliderChange = (field: keyof Omit<CalculatorParams, 'fuelType'>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setParams(prev => ({ ...prev, [field]: value }));
  };
  
  const handleTextChange = (field: 'fuelCost' | 'energyCost') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    if (field === 'fuelCost') {
      setFuelCostStr(rawValue);
    } else {
      setEnergyCostStr(rawValue);
    }

    const sanitizedValue = rawValue.replace(/\./g, '').replace(',', '.');
    const parsedValue = parseFloat(sanitizedValue);

    if (!isNaN(parsedValue)) {
      setParams(prev => ({ ...prev, [field]: parsedValue }));
    } else {
      setParams(prev => ({ ...prev, [field]: 0 }));
    }
  };
  
  const handleFuelTypeChange = (type: 'diesel' | 'gasolina') => {
    const newFuelCost = type === 'diesel' ? DEFAULT_DIESEL_COST : DEFAULT_GASOLINA_COST;
    setParams(prev => ({
      ...prev,
      fuelType: type,
      fuelCost: newFuelCost
    }));
    setFuelCostStr(newFuelCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  const handleCalculate = useCallback(() => {
    const totalMonths = params.usageTime * 12;
    const totalKmPerVehicle = params.monthlyMileage * totalMonths;
    const totalKmFleet = totalKmPerVehicle * params.fleetSize;
    
    const isDiesel = params.fuelType === 'diesel';
    
    const combustionEfficiency = isDiesel ? DIESEL_EFFICIENCY_KMPL : GASOLINA_EFFICIENCY_KMPL;
    const combustionMaintenancePerKm = isDiesel ? DIESEL_MAINTENANCE_PER_KM : GASOLINA_MAINTENANCE_PER_KM;
    const combustionAcquisitionCost = isDiesel ? DIESEL_ACQUISITION_COST : GASOLINA_ACQUISITION_COST;

    // Combustion Vehicle Calculation
    const combustionFuelCostTotal = (totalKmFleet / combustionEfficiency) * params.fuelCost;
    const combustionMaintenanceTotal = totalKmFleet * combustionMaintenancePerKm;
    const combustionAcquisitionTotal = combustionAcquisitionCost * params.fleetSize;
    const combustionTotalCost = combustionAcquisitionTotal + combustionFuelCostTotal + combustionMaintenanceTotal;

    // Fever NEXTEM Calculation
    const feverNextemEnergyCostTotal = (totalKmFleet / FEVER_NEXTEM_EFFICIENCY_KMPKWH) * params.energyCost;
    const feverNextemMaintenanceTotal = totalKmFleet * FEVER_NEXTEM_MAINTENANCE_PER_KM;
    const feverNextemAcquisitionTotal = FEVER_NEXTEM_ACQUISITION_COST * params.fleetSize;
    const feverNextemTotalCost = feverNextemAcquisitionTotal + feverNextemEnergyCostTotal + feverNextemMaintenanceTotal;
    
    const totalSavings = combustionTotalCost - feverNextemTotalCost;

    // Environmental Impact Calculation
    const totalLiters = totalKmFleet / combustionEfficiency;
    const co2EmissionPerLiter = isDiesel ? CO2_EMISSION_DIESEL_KG_PER_LITER : CO2_EMISSION_GASOLINA_KG_PER_LITER;
    const co2SavingsKg = totalLiters * co2EmissionPerLiter;
    const treesSaved = co2SavingsKg / (CO2_ABSORPTION_PER_TREE_KG_PER_YEAR * params.usageTime);

    // Fuel and Maintenance Savings Calculation
    const fuelEnergySavings = combustionFuelCostTotal - feverNextemEnergyCostTotal;
    const maintenanceSavings = combustionMaintenanceTotal - feverNextemMaintenanceTotal;
    
    const maintenanceChartData = [];
    for (let year = 1; year <= params.usageTime; year++) {
      const cumulativeKm = params.monthlyMileage * 12 * year * params.fleetSize;
      const combustionMaintenanceCumulative = cumulativeKm * combustionMaintenancePerKm;
      const feverNextemMaintenanceCumulative = cumulativeKm * FEVER_NEXTEM_MAINTENANCE_PER_KM;
      maintenanceChartData.push({
        ano: year,
        combustionCost: combustionMaintenanceCumulative,
        feverNextemCost: feverNextemMaintenanceCumulative,
      });
    }

    const fuelTypeName = isDiesel ? 'Diesel' : 'Gasolina';
    
    // Summary Table Calculation
    const summaryTableData = [];
    const periods = [
        { name: 'Em 1 dia', days: 1 },
        { name: 'Em 1 mês', days: 30 },
        { name: 'Em 1 ano', days: 365 },
        { name: 'Em 5 anos', days: 365 * 5 },
    ];

    for (const period of periods) {
        const periodKmFleet = (params.monthlyMileage / 30) * period.days * params.fleetSize;

        const combustionOperationalCost = 
            (periodKmFleet / combustionEfficiency) * params.fuelCost +
            periodKmFleet * combustionMaintenancePerKm;
            
        const feverNextemOperationalCost = 
            (periodKmFleet / FEVER_NEXTEM_EFFICIENCY_KMPKWH) * params.energyCost +
            periodKmFleet * FEVER_NEXTEM_MAINTENANCE_PER_KM;

        summaryTableData.push({
            period: period.name,
            combustionCost: combustionOperationalCost,
            feverNextemCost: feverNextemOperationalCost,
        });
    }
    
    setResults({
      combustionTotalCost,
      feverNextemTotalCost,
      totalSavings,
      co2SavingsKg,
      treesSaved,
      fuelEnergySavings,
      chartData: [
        { name: `Gasto ${fuelTypeName}`, value: combustionFuelCostTotal, fill: '#ef4444' },
        { name: 'Gasto Fever NEXTEM', value: feverNextemEnergyCostTotal, fill: '#2dd4bf' },
      ],
      maintenanceSavings,
      maintenanceChartData,
      summaryTableData,
    });
  }, [params]);

  const handleReset = () => {
    setParams(DEFAULT_PARAMS);
    setResults(null);
    setFuelCostStr(DEFAULT_PARAMS.fuelCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    setEnergyCostStr(DEFAULT_PARAMS.energyCost.toLocaleString('pt-BR'));
  };

  const fuelTypeName = params.fuelType === 'diesel' ? 'Diesel' : 'Gasolina';

  return (
    <div className="min-h-screen w-full flex justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <main className="max-w-5xl w-full">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">Calculadora de TCO • Fever NEXTEM FN1000 vs {fuelTypeName}</h1>
          <p className="text-slate-500 mt-2 text-base sm:text-lg">Ajuste os controles e veja custos operacionais e a economia estimada.</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-600 mb-4">Parâmetros do Cálculo</h2>

           <div className="mb-4 py-4 border-b border-slate-200">
            <label className="block text-slate-800 font-semibold mb-3">Tipo de Combustível</label>
            <div className="flex gap-[5px]">
                <button 
                    onClick={() => handleFuelTypeChange('diesel')}
                    className={`w-1/2 p-2 rounded-md text-sm font-semibold transition-all duration-200 ${params.fuelType === 'diesel' ? 'bg-slate-700 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    aria-pressed={params.fuelType === 'diesel'}
                >
                    Diesel
                </button>
                <button 
                    onClick={() => handleFuelTypeChange('gasolina')}
                    className={`w-1/2 p-2 rounded-md text-sm font-semibold transition-all duration-200 ${params.fuelType === 'gasolina' ? 'bg-slate-700 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    aria-pressed={params.fuelType === 'gasolina'}
                >
                    Gasolina
                </button>
            </div>
          </div>
          
          <SliderInput
            label="Quilometragem Mensal"
            value={params.monthlyMileage}
            min={0}
            max={15000}
            step={10}
            unit="km"
            onChange={handleSliderChange('monthlyMileage')}
          />
          <SliderInput
            label="Tempo de Uso"
            value={params.usageTime}
            min={1}
            max={10}
            step={1}
            unit={params.usageTime > 1 ? 'anos' : 'ano'}
            onChange={handleSliderChange('usageTime')}
          />
          <SliderInput
            label="Tamanho da Frota"
            value={params.fleetSize}
            min={1}
            max={50}
            step={1}
            unit={params.fleetSize > 1 ? 'veículos' : 'veículo'}
            onChange={handleSliderChange('fleetSize')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 pt-6">
            <div>
              <label className="block text-slate-800 font-semibold mb-2">Custo do Combustível (R$/litro)</label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center text-slate-500 text-lg pointer-events-none">
                  R$
                </span>
                <input
                  type="text"
                  value={fuelCostStr}
                  onChange={handleTextChange('fuelCost')}
                  className="w-full p-2 pl-8 bg-transparent border-b border-slate-300 focus:outline-none focus:border-emerald-400 text-lg transition-colors text-slate-800"
                  aria-label="Custo do combustível em reais por litro"
                />
              </div>
            </div>
            <div className="mt-6 sm:mt-0">
              <label className="block text-slate-800 font-semibold mb-2">Custo da Energia (R$/kWh)</label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center text-slate-500 text-lg pointer-events-none">
                  R$
                </span>
                <input
                  type="text"
                  value={energyCostStr}
                  onChange={handleTextChange('energyCost')}
                  className="w-full p-2 pl-8 bg-transparent border-b border-slate-300 focus:outline-none focus:border-emerald-400 text-lg transition-colors text-slate-800"
                  aria-label="Custo da energia em reais por kilowatt-hora"
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            *Esses são valores da média de preços no Brasil no primeiro semestre de 2025. Você pode ajustar com o preço da sua cidade.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 mt-8">
            <Button onClick={handleCalculate} variant="primary">Calcular TCO</Button>
            <Button onClick={handleReset} variant="secondary">Restaurar padrão</Button>
          </div>
        </div>

        {results && <ResultsCard results={results} fuelType={params.fuelType} />}

      </main>
    </div>
  );
};

export default App;
