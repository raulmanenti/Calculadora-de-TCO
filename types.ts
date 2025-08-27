
export interface SummaryRow {
  period: string;
  feverNextemCost: number;
  combustionCost: number;
}

export interface CalculatorParams {
  monthlyMileage: number;
  usageTime: number;
  fleetSize: number;
  fuelCost: number;
  energyCost: number;
  fuelType: 'diesel' | 'gasolina';
}

export interface TcoResult {
  feverNextemTotalCost: number;
  combustionTotalCost: number;
  totalSavings: number;
  fuelEnergySavings: number;
  chartData: {
    name: string;
    value: number;
    fill: string;
  }[];
  maintenanceSavings: number;
  maintenanceChartData: {
    ano: number;
    feverNextemCost: number;
    combustionCost: number;
  }[];
  co2SavingsKg: number;
  treesSaved: number;
  summaryTableData: SummaryRow[];
}