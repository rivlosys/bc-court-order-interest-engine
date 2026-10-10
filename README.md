# BC Court Order Interest Engine (RSBC 1996 c. 79)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)](https://www.typescriptlang.org/)
[![BC Supreme Court Rates](https://img.shields.io/badge/BC_Gazette-2011--2026_Rates-success.svg)](https://www.bccourts.ca/supreme_court/about_the_supreme_court/Court_Order_Interest_Rates.aspx)
[![Interactive Calculator](https://img.shields.io/badge/Interactive_Tool-usecos.app%2Flegal%2Fbc-emerald)](https://usecos.app/legal/bc/court-order-interest)

A zero-dependency TypeScript implementation of the **British Columbia Court Order Interest Act (RSBC 1996 c. 79)** with official BC Supreme Court half-year gazette interest rates from **January 1, 2011 to December 31, 2026**.

Includes statutory **prejudgment simple interest accrual** across rate periods, **postjudgment interest**, and exact **partial-payment allocation logic** (interest satisfied prior to principal).

> **Interactive Online Tool:** Run calculations, view period-by-period statutory rate segments, and export court summaries at [**UseCOS BC Court Order Interest Calculator**](https://usecos.app/legal/bc/court-order-interest).

---

## 1. What This Engine Implements

Under the *Court Order Interest Act* of British Columbia:
1. **Prejudgment Interest (Section 1):** Accrues simple interest on pecuniary judgments from the date the cause of action arose to the date of the order.
2. **Postjudgment Interest (Section 7):** Accrues interest on outstanding judgments until satisfied in full.
3. **Official Half-Year Statutory Rates:** Interest rates are published semi-annually (January 1 - June 30 and July 1 - December 31) by the Registrar of the BC Supreme Court based on prime bank lending rates.
4. **Postjudgment Partial Payment Priority:** When a judgment debtor makes a payment, statutory legal arithmetic applies funds **first to outstanding accrued interest**, and only the excess to reduce the judgment principal.

---

## 2. Installation & Quick Start

```bash
npm install bc-court-order-interest-engine
```

*(Or copy `index.ts` directly into your application with zero runtime dependencies).*

### Example Usage

```typescript
import { calculateBCCourtInterest } from 'bc-court-order-interest-engine';

// Calculate Postjudgment Interest with Partial Payments
const result = calculateBCCourtInterest({
  principal: 25000,
  start: '2023-01-01',
  end: '2024-12-31',
  kind: 'post',
  payments: [
    { id: 'payment-1', date: '2023-07-01', amount: 5000 },
    { id: 'payment-2', date: '2024-03-15', amount: 8000 }
  ]
});

if ('principalOutstanding' in result) {
  console.log(`Original Principal: $${result.principalOriginal}`);
  console.log(`Total Interest Accrued: $${result.interestAccruedTotal.toFixed(2)}`);
  console.log(`Remaining Principal: $${result.principalOutstanding.toFixed(2)}`);
  console.log(`Total Balance Due: $${result.balanceOutstanding.toFixed(2)}`);
}
```

---

## 3. Official BC Supreme Court Rate Table (Sample)

| Period | Prejudgment Rate | Postjudgment Rate |
| :--- | :--- | :--- |
| **Jan 1, 2026 – Dec 31, 2026** | **2.45%** | **4.45%** |
| **Jul 1, 2025 – Dec 31, 2025** | 2.95% | 4.95% |
| **Jan 1, 2025 – Jun 30, 2025** | 3.45% | 5.45% |
| **Jul 1, 2024 – Dec 31, 2024** | 4.95% | 6.95% |
| **Jan 1, 2024 – Jun 30, 2024** | 5.20% | 7.20% |
| **Jul 1, 2023 – Dec 31, 2023** | 4.95% | 6.95% |
| **Jan 1, 2023 – Jun 30, 2023** | 4.45% | 6.45% |

---

## 4. Academic & Research Citation

If citing this software for legal procedure analysis or litigation automation:

```bibtex
@software{usecos_bc_court_interest_2026,
  author = {{UseCOS Engineering Team}},
  title = {British Columbia Court Order Interest Act Engine: Reference Implementation},
  year = {2026},
  url = {https://github.com/rivlosys/bc-court-order-interest-engine}
}
```

---

## 5. License & Disclaimer

MIT License. Copyright 2026 UseCOS.

*Disclaimer: This package performs mathematical calculations according to the published schedules of the British Columbia Court Order Interest Act. It does not provide legal advice and does not replace official court registry calculations or judicial orders.*
