const MS_PER_DAY = 1000 * 60 * 60 * 24;

export type BurnRateForecast = {
  dailyBurnRate: number;
  daysElapsed: number;
  totalDays: number;
  daysRemaining: number;
  projectedTotalSpend: number;
  willExceedBudget: boolean;
  /** Days from `today` until spend is projected to cross the budget, if within the project window. */
  daysUntilOverBudget: number | null;
};

/**
 * Linear burn-rate projection: assumes the average daily spend so far continues
 * for the rest of the project window, then compares the projected total to budget.
 */
export function calculateBurnRate({
  startDate,
  endDate,
  totalSpent,
  totalBudget,
  today = new Date(),
}: {
  startDate: Date;
  endDate: Date;
  totalSpent: number;
  totalBudget: number;
  today?: Date;
}): BurnRateForecast {
  const totalDays = Math.max(
    1,
    Math.round((endDate.getTime() - startDate.getTime()) / MS_PER_DAY)
  );
  const daysElapsed = Math.max(
    0,
    Math.min(totalDays, Math.round((today.getTime() - startDate.getTime()) / MS_PER_DAY))
  );
  const daysRemaining = totalDays - daysElapsed;

  const dailyBurnRate = daysElapsed > 0 ? totalSpent / daysElapsed : 0;
  const projectedTotalSpend = dailyBurnRate * totalDays;
  const willExceedBudget = projectedTotalSpend > totalBudget;

  let daysUntilOverBudget: number | null = null;
  if (totalSpent >= totalBudget) {
    daysUntilOverBudget = 0;
  } else if (willExceedBudget && dailyBurnRate > 0) {
    daysUntilOverBudget = Math.round((totalBudget - totalSpent) / dailyBurnRate);
  }

  return {
    dailyBurnRate,
    daysElapsed,
    totalDays,
    daysRemaining,
    projectedTotalSpend,
    willExceedBudget,
    daysUntilOverBudget,
  };
}
