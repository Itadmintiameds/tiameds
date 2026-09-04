'use client';

import React, { useState } from 'react';
import { useLabs } from '@/context/LabContext';
import { triggerCategoryRollupBackfill } from '../../../../../services/adminStatService';
import type { CategoryRollupBackfillResult } from '@/types/adminStatsData';

/**
 * Admin-only tool: re-syncs the daily_lab_category_stats rollup (backs the
 * "Tests By Category" dashboard card) for the current lab over a date range.
 * Needed once after the rollup ships (no historical data yet) and again any
 * time the category breakdown looks stale relative to the live numbers.
 */
const CategoryRollupBackfill = () => {
  const { currentLab } = useLabs();
  const labId = currentLab?.id;

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CategoryRollupBackfillResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBackfill = async () => {
    if (!labId || !startDate || !endDate) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await triggerCategoryRollupBackfill(labId, startDate, endDate);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Backfill failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl bg-base-white rounded-lg p-6 border border-pneutral-200">
      <h2 className="font-heading text-h6 text-pneutral-900 mb-1">
        Category Stats Rollup Backfill
      </h2>
      <p className="text-p4 text-pneutral-500 mb-4">
        Recomputes the &quot;Tests By Category&quot; rollup for this lab over the
        selected date range. Safe to re-run any time.
      </p>

      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <label className="flex-1 flex flex-col gap-1">
            <span className="text-p4 text-pneutral-700">Start date</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-pneutral-300 rounded px-3 py-2"
            />
          </label>
          <label className="flex-1 flex flex-col gap-1">
            <span className="text-p4 text-pneutral-700">End date</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-pneutral-300 rounded px-3 py-2"
            />
          </label>
        </div>

        <button
          onClick={handleBackfill}
          disabled={!labId || !startDate || !endDate || loading}
          className="self-start bg-secondary-600 text-pneutral-50 rounded-full px-5 py-2 disabled:opacity-50"
        >
          {loading ? 'Backfilling...' : 'Run Backfill'}
        </button>

        {!labId && (
          <p className="text-p4 text-error-600">No lab selected.</p>
        )}
        {error && <p className="text-p4 text-error-600">{error}</p>}
        {result && (
          <p className="text-p4 text-success-600">
            Done — processed {result.dayRowsProcessed} day(s) from {result.startDate} to {result.endDate}.
          </p>
        )}
      </div>
    </div>
  );
};

export default CategoryRollupBackfill;
