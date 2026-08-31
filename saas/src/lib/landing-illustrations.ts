/**
 * Pictures for the landing page, one per problem, in the same order as
 * `landingCopy[lang].problem.items`.
 *
 * The files live in `public/assets/landing/`. To change a picture, overwrite the
 * file at the same path — nothing here needs editing. Keep the 1.4:1 ratio
 * (1400x1000) so the layout does not shift.
 */
export const problemIllustrations = [
  "/assets/landing/problem-01-hidden-costs.jpg",
  "/assets/landing/problem-02-stock.jpg",
  "/assets/landing/problem-03-printers.jpg",
  "/assets/landing/problem-04-history.jpg",
  "/assets/landing/problem-05-profit.jpg",
  "/assets/landing/problem-06-scattered.jpg",
];

export const ILLUSTRATION_WIDTH = 1400;
export const ILLUSTRATION_HEIGHT = 1000;

/**
 * The worked example in the hero, in the currency the visitor is quoted in.
 * Both sets are chosen to land on the same 47% margin so the bar under them
 * reads the same either way.
 */
export const DEMO_JOB = {
  thb: { rows: [34, 9, 12, 40], cost: 95, price: 180, profit: 85 },
  usd: { rows: [1.1, 0.3, 0.4, 1.2], cost: 3, price: 5.7, profit: 2.7 },
} as const;

export const DEMO_MARGIN_PERCENT = 47;
