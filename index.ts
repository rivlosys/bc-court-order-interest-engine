/**
 * BC Court Order Interest Act (RSBC 1996 c. 79) Engine
 * Reference Implementation: Prejudgment & Postjudgment Statutory Interest
 * Official BC Supreme Court Half-Year Gazette Rates (2011 - 2026)
 *
 * Released by UseCOS (https://usecos.app/legal/bc/court-order-interest)
 */

export const COURT_ORDER_RATE_PERIODS: ReadonlyArray<readonly [string, string, number, number]> = [
  ["2011-01-01", "2011-06-30", 1.0, 3.0],
  ["2011-07-01", "2011-12-31", 1.0, 3.0],
  ["2012-01-01", "2012-06-30", 1.0, 3.0],
  ["2012-07-01", "2012-12-31", 1.0, 3.0],
  ["2013-01-01", "2013-06-30", 1.0, 3.0],
  ["2013-07-01", "2013-12-31", 1.0, 3.0],
  ["2014-01-01", "2014-06-30", 1.0, 3.0],
  ["2014-07-01", "2014-12-31", 1.0, 3.0],
  ["2015-01-01", "2015-06-30", 1.0, 3.0],
  ["2015-07-01", "2015-12-31", 0.85, 2.85],
  ["2016-01-01", "2016-06-30", 0.7, 2.7],
  ["2016-07-01", "2016-12-31", 0.7, 2.7],
  ["2017-01-01", "2017-06-30", 0.7, 2.7],
  ["2017-07-01", "2017-12-31", 0.7, 2.7],
  ["2018-01-01", "2018-06-30", 1.2, 3.2],
  ["2018-07-01", "2018-12-31", 1.45, 3.45],
  ["2019-01-01", "2019-06-30", 1.95, 3.95],
  ["2019-07-01", "2019-12-31", 1.95, 3.95],
  ["2020-01-01", "2020-06-30", 1.95, 3.95],
  ["2020-07-01", "2020-12-31", 0.45, 2.45],
  ["2021-01-01", "2021-06-30", 0.45, 2.45],
  ["2021-07-01", "2021-12-31", 0.45, 2.45],
  ["2022-01-01", "2022-06-30", 0.45, 2.45],
  ["2022-07-01", "2022-12-31", 1.7, 3.7],
  ["2023-01-01", "2023-06-30", 4.45, 6.45],
  ["2023-07-01", "2023-12-31", 4.95, 6.95],
  ["2024-01-01", "2024-06-30", 5.2, 7.2],
  ["2024-07-01", "2024-12-31", 4.95, 6.95],
  ["2025-01-01", "2025-06-30", 3.45, 5.45],
  ["2025-07-01", "2025-12-31", 2.95, 4.95],
  ["2026-01-01", "2026-06-30", 2.45, 4.45],
  ["2026-07-01", "2026-12-31", 2.45, 4.45],
];

const DAY_MS = 86_400_000;

export type CourtInterestKind = "pre" | "post";

export type CourtInterestPayment = {
  id: string;
  date: string;
  amount: number;
};

export type CourtInterestSegment = {
  start: string;
  end: string;
  days: number;
  rate: number;
  openingPrincipal: number;
  interestAccrued: number;
};

export type CourtInterestPaymentApplication = {
  id: string;
  date: string;
  amount: number;
  appliedToInterest: number;
  appliedToPrincipal: number;
  excess: number;
  interestAfter: number;
  principalAfter: number;
};

export type CourtInterestResult = {
  principalOriginal: number;
  principalOutstanding: number;
  interestAccruedTotal: number;
  interestOutstanding: number;
  balanceOutstanding: number;
  totalPayments: number;
  days: number;
  currentRate: number;
  currentPerDiem: number;
  segments: CourtInterestSegment[];
  paymentApplications: CourtInterestPaymentApplication[];
};

function parseDate(value: string): Date | null {
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addOneDay(date: Date): Date {
  return new Date(date.getTime() + DAY_MS);
}

function subtractOneDay(date: Date): Date {
  return new Date(date.getTime() - DAY_MS);
}

export function ratePeriodForDate(value: string) {
  return COURT_ORDER_RATE_PERIODS.find(
    ([start, end]) => value >= start && value <= end,
  );
}

export function rateForDate(value: string, kind: CourtInterestKind): number | null {
  const period = ratePeriodForDate(value);
  if (!period) return null;
  return kind === "pre" ? period[2] : period[3];
}

export function calculateBCCourtInterest({
  principal,
  start,
  end,
  kind,
  payments = [],
}: {
  principal: number;
  start: string;
  end: string;
  kind: CourtInterestKind;
  payments?: CourtInterestPayment[];
}): CourtInterestResult | { error: string } {
  const startDate = parseDate(start);
  const endDate = parseDate(end);

  if (!Number.isFinite(principal) || principal <= 0) {
    return { error: "Enter a principal amount greater than zero." };
  }
  if (!startDate || !endDate || endDate <= startDate) {
    return { error: "Enter an end date after the start date." };
  }
  if (start < "2011-01-01" || start > "2026-12-31" || end > "2027-01-01") {
    return {
      error:
        "This engine currently supports accrual dates from January 1, 2011 through December 31, 2026.",
    };
  }
  if (kind === "pre" && payments.length > 0) {
    return {
      error:
        "Partial-payment allocation is available only for postjudgment calculations because prejudgment adjustments require case-specific judicial treatment.",
    };
  }

  const normalizedPayments = [...payments]
    .filter(
      (payment) =>
        Number.isFinite(payment.amount) &&
        payment.amount > 0 &&
        payment.date >= start &&
        payment.date <= end,
    )
    .sort((a, b) =>
      a.date === b.date ? a.id.localeCompare(b.id) : a.date.localeCompare(b.date),
    );

  const paymentsByDate = new Map<string, CourtInterestPayment[]>();
  for (const payment of normalizedPayments) {
    const existing = paymentsByDate.get(payment.date) ?? [];
    existing.push(payment);
    paymentsByDate.set(payment.date, existing);
  }

  let principalOutstanding = principal;
  let interestOutstanding = 0;
  let interestAccruedTotal = 0;
  let days = 0;
  const segments: CourtInterestSegment[] = [];
  const paymentApplications: CourtInterestPaymentApplication[] = [];

  for (
    let cursor = startDate;
    cursor <= endDate;
    cursor = addOneDay(cursor)
  ) {
    const date = toDateString(cursor);

    for (const payment of paymentsByDate.get(date) ?? []) {
      let remaining = payment.amount;
      const appliedToInterest = Math.min(remaining, interestOutstanding);
      interestOutstanding -= appliedToInterest;
      remaining -= appliedToInterest;

      const appliedToPrincipal = Math.min(remaining, principalOutstanding);
      principalOutstanding -= appliedToPrincipal;
      remaining -= appliedToPrincipal;

      paymentApplications.push({
        id: payment.id,
        date,
        amount: payment.amount,
        appliedToInterest,
        appliedToPrincipal,
        excess: remaining,
        interestAfter: interestOutstanding,
        principalAfter: principalOutstanding,
      });
    }

    if (cursor.getTime() === endDate.getTime()) break;

    const ratePeriod = ratePeriodForDate(date);
    if (!ratePeriod) {
      return { error: `No official rate is loaded for ${date}.` };
    }
    const rate = kind === "pre" ? ratePeriod[2] : ratePeriod[3];
    const dailyInterest = principalOutstanding * (rate / 100) / 365;
    interestOutstanding += dailyInterest;
    interestAccruedTotal += dailyInterest;
    days += 1;

    const last = segments.at(-1);
    const startsNewOfficialPeriod = date === ratePeriod[0];
    if (
      last &&
      !startsNewOfficialPeriod &&
      last.rate === rate &&
      Math.abs(last.openingPrincipal - principalOutstanding) < 0.000001 &&
      last.end === date
    ) {
      last.end = toDateString(addOneDay(cursor));
      last.days += 1;
      last.interestAccrued += dailyInterest;
    } else {
      segments.push({
        start: date,
        end: toDateString(addOneDay(cursor)),
        days: 1,
        rate,
        openingPrincipal: principalOutstanding,
        interestAccrued: dailyInterest,
      });
    }
  }

  const lastAccrualDate = toDateString(subtractOneDay(endDate));
  const currentRate = rateForDate(lastAccrualDate, kind) ?? 0;
  const currentPerDiem = principalOutstanding * (currentRate / 100) / 365;

  return {
    principalOriginal: principal,
    principalOutstanding,
    interestAccruedTotal,
    interestOutstanding,
    balanceOutstanding: principalOutstanding + interestOutstanding,
    totalPayments: normalizedPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    ),
    days,
    currentRate,
    currentPerDiem,
    segments,
    paymentApplications,
  };
}
