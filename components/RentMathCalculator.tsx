'use client';

import React, { useState } from 'react';
import { Calculator, TrendingUp, ShieldAlert, ArrowRight, RefreshCw } from 'lucide-react';
import { calculateRentMath, formatIndianCurrency } from '@/lib/formatters';

interface RentMathCalculatorProps {
  initialMonthlyRent?: number | null;
  initialDeposit?: number | null;
  initialEscalationPercent?: number | null;
  initialTermMonths?: number | null;
  state?: string;
}

export function RentMathCalculator({
  initialMonthlyRent = 25000,
  initialDeposit = 75000,
  initialEscalationPercent = 10,
  initialTermMonths = 11,
  state = 'Maharashtra',
}: RentMathCalculatorProps) {
  const [monthlyRent, setMonthlyRent] = useState<number>(initialMonthlyRent || 25000);
  const [deposit, setDeposit] = useState<number>(
    initialDeposit || (initialMonthlyRent ? initialMonthlyRent * 3 : 75000)
  );
  const [escalation, setEscalation] = useState<number>(initialEscalationPercent ?? 10);
  const [termMonths, setTermMonths] = useState<number>(initialTermMonths || 11);

  const math = calculateRentMath({
    monthlyRent,
    securityDeposit: deposit,
    escalationPercent: escalation,
    termMonths,
    state,
  });

  const handleReset = () => {
    setMonthlyRent(initialMonthlyRent || 25000);
    setDeposit(initialDeposit || 75000);
    setEscalation(initialEscalationPercent ?? 10);
    setTermMonths(initialTermMonths || 11);
  };

  return (
    <div
      id="rent-math-calculator"
      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Rent Math & Escalation Projection
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deterministic JavaScript arithmetic based on extracted contract numbers. Adjust values
              to project your financial commitment.
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          title="Reset to extracted contract numbers"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Inputs grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Monthly Rent (₹)
          </label>
          <input
            id="rent-math-monthly-input"
            type="number"
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(Number(e.target.value) || 0)}
            className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Security Deposit (₹)
          </label>
          <input
            id="rent-math-deposit-input"
            type="number"
            value={deposit}
            onChange={(e) => setDeposit(Number(e.target.value) || 0)}
            className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Escalation (%)
          </label>
          <input
            id="rent-math-escalation-input"
            type="number"
            value={escalation}
            onChange={(e) => setEscalation(Number(e.target.value) || 0)}
            className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Term (Months)
          </label>
          <input
            id="rent-math-term-input"
            type="number"
            value={termMonths}
            onChange={(e) => setTermMonths(Number(e.target.value) || 0)}
            className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Summary Outgo Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="p-3 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900">
          <span className="text-[11px] font-medium text-indigo-700 dark:text-indigo-300">
            Total Rent for {termMonths} Months
          </span>
          <p className="text-base font-bold text-indigo-950 dark:text-white mt-0.5">
            {math.formattedTotalRent}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
            Deposit Locked
          </span>
          <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
            {formatIndianCurrency(deposit)}
            <span className="text-xs font-normal text-slate-500 ml-1">
              ({math.depositMultipleMonths}x rent)
            </span>
          </p>
        </div>

        <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
          <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
            Total Cash Outgo (Rent + Deposit)
          </span>
          <p className="text-base font-bold text-emerald-950 dark:text-white mt-0.5">
            {math.formattedTotalOutgo}
          </p>
        </div>
      </div>

      {/* Year by Year Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden mb-4">
        <div className="bg-slate-100/70 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span>Escalation Timeline (Year-on-Year)</span>
          <span className="text-[10px] text-slate-500 font-normal">
            Compounding at {escalation}%
          </span>
        </div>
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[11px]">
            <tr>
              <th className="px-3 py-2">Year</th>
              <th className="px-3 py-2">Monthly Rent</th>
              <th className="px-3 py-2">Annualized Outgo</th>
              <th className="px-3 py-2">Hike vs Initial</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {math.yearProjections.map((yp) => {
              const diff = yp.monthlyRent - monthlyRent;
              return (
                <tr key={yp.year} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-3 py-2.5 font-medium text-slate-800 dark:text-slate-200">
                    {yp.label}
                  </td>
                  <td className="px-3 py-2.5 font-semibold text-indigo-700 dark:text-indigo-300">
                    {yp.formattedMonthly}
                  </td>
                  <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">
                    {yp.formattedAnnual}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">
                    {diff === 0 ? 'Baseline' : `+${formatIndianCurrency(diff)}/mo`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Model Tenancy Act note */}
      <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
        <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">{math.modelTenancyDepositBenchmarkNote}</p>
      </div>
    </div>
  );
}
