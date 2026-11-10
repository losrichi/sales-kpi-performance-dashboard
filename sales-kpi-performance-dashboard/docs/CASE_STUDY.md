# Portfolio case study — 2025 retail KPI performance

> **Synthetic exercise:** these findings come from 24,000 randomly generated order lines. The business and outcomes are entirely fictional. Use this report to demonstrate analytical methods, not as evidence of actual commercial impact.

## Business question

How would an analytics team monitor sales growth and profitability across a product catalog, regions and acquisition channels, and which indicators would they prioritize in a 12-month management review?

## Data & method

- **24,000** simulated order lines, covering **January–December 2025**.
- 12 products in 4 categories, 4 simulated territories and 3 sales channels.
- Deterministic generation and row-level financial reconciliation in Python.
- SQLite for loading, validation, segmentation and MoM calculations.
- Offline browser dashboard that recalculates unique orders and buyers on every filter.
- Excel executive summary with linked formulas; DAX definitions supplied separately.

## Results from the synthetic dataset

| Indicator | Value | Interpretation |
|---|---:|---|
| Net revenue | **$2,023,860.45** | After promotions and returned lines |
| Gross sales | $2,218,835.00 | Before promotions and refunds |
| Gross profit | **$1,100,470.45** | Net revenue minus COGS |
| Gross margin | **54.4%** | Gross profit / net revenue |
| Completed orders | **13,302** | Unique orders with at least one completed line |
| Units sold | **38,970** | Excludes returned lines |
| Average order value | **$152.15** | Net revenue / completed orders |
| Active customers | **2,095** | Unique simulated completed buyers |
| Returned-line rate | **4.0%** | Returned lines / all 24,000 lines |
| Discount rate | **4.8%** | Discounts / gross sales |
| December revenue MoM | **+11.3%** | December compared with November |
| December order MoM | **+17.1%** | December compared with November |

## Segment observations (fictional)

- **Electronics** contributes the most net revenue: **$872,919.30**; the Portable Speaker is the highest-revenue product, contributing **$368,572.75**.
- **Online** leads channels with **$1,149,399.35** in net revenue.
- **East** leads territories at **$618,195.15** in net revenue.
- **December 2025** has the highest monthly net revenue: **$219,124.90**, compared with **$196,817.05** in November.

## What a hypothetical sales team could investigate

1. Assess whether the strong Electronics contribution is linked to higher units sold, higher prices or discount patterns.
2. Analyze channel gross margins, not only revenue, before increasing marketing spend.
3. Determine whether the late-year revenue increase is driven by order volume, order value or promotional mix.
4. Monitor return rates by category and channel to identify possible product-quality or expectation gaps.

These are **investigation hypotheses**, not claims that any real company benefited from the analysis.

## Methodological caveats

- This is a **one-year simulation**, so the dataset cannot establish seasonality over multiple years or causal effects.
- A returned line is modeled as fully refunded with restocked COGS (both recognized amounts set to zero).
- Order and customer counts should be deduplicated for the selected grain. Do not sum category-level distinct counts to obtain an annual distinct total.
- Promotional rate is measured against gross *pre-refund* sales.
- In a real project, we would also validate payment settlement dates, tax treatment, fulfillment costs, partial returns, multi-currency transactions and data quality from source systems.

## Portfolio / interview-ready description

> Built a reproducible retail sales analytics case study using 24,000 **synthetic** transactions across 12 months. Designed a SQLite reporting layer and 12 documented sales KPIs, validated financial reconciliations in Python, and shipped an interactive HTML dashboard with category, region, channel and month filters alongside an Excel reporting workbook. Provided DAX measures for future Power BI implementation.
