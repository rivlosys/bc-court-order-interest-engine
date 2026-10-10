import test from 'node:test';
import assert from 'node:assert';
import { calculateBCCourtInterest } from './index.ts';

test('BC Court Order Interest - Simple Prejudgment Calculation', () => {
  const result = calculateBCCourtInterest({
    principal: 10000,
    start: '2024-01-01',
    end: '2024-06-30',
    kind: 'pre',
  });

  assert('principalOriginal' in result);
  assert.strictEqual(result.principalOriginal, 10000);
  assert.strictEqual(result.principalOutstanding, 10000);
  assert.strictEqual(result.days, 181);
  assert.strictEqual(result.currentRate, 5.2);
  assert(result.interestAccruedTotal > 250 && result.interestAccruedTotal < 265);
});

test('BC Court Order Interest - Postjudgment with Partial Payment Allocation', () => {
  const result = calculateBCCourtInterest({
    principal: 20000,
    start: '2024-01-01',
    end: '2024-12-31',
    kind: 'post',
    payments: [
      { id: 'pay-1', date: '2024-07-01', amount: 5000 },
    ],
  });

  assert('principalOriginal' in result);
  assert.strictEqual(result.paymentApplications.length, 1);
  const app = result.paymentApplications[0];
  assert.strictEqual(app.amount, 5000);
  // Interest accrued up to July 1 must be satisfied first
  assert(app.appliedToInterest > 0);
  // Remaining portion reduces principal
  assert(app.appliedToPrincipal > 0);
  assert.strictEqual(app.appliedToInterest + app.appliedToPrincipal, 5000);
  assert(result.principalOutstanding < 20000);
});

test('BC Court Order Interest - Validation Errors', () => {
  const zeroPrincipal = calculateBCCourtInterest({
    principal: 0,
    start: '2024-01-01',
    end: '2024-12-31',
    kind: 'post',
  });
  assert('error' in zeroPrincipal);

  const preWithPayment = calculateBCCourtInterest({
    principal: 5000,
    start: '2024-01-01',
    end: '2024-12-31',
    kind: 'pre',
    payments: [{ id: 'p1', date: '2024-06-01', amount: 1000 }],
  });
  assert('error' in preWithPayment);
});
