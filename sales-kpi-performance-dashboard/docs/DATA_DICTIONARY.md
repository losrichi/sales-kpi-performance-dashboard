# Data dictionary — synthetic retail order lines

**All rows, customers and transactions are generated for education.** They do not describe a real company or its customers. Amounts are in **USD**. The period is January–December **2025**. Grain: one row per **order line**; orders may contain several lines.

| Column | Type | Definition |
|---|---|---|
| `order_id` | text | Fictional unique order identifier (may repeat across lines in the same basket) |
| `order_date` | ISO date | Fictional order date (`YYYY-MM-DD`) |
| `customer_id` | text | Anonymous artificial customer identifier |
| `product_id` | text | Product catalog identifier |
| `product_name` | text | Product label |
| `category` | text | Electronics / Home & Living / Office / Accessories |
| `region` | text | North / South / East / West (imaginary sales territories) |
| `channel` | text | Online / Retail / Marketplace |
| `quantity` | integer | Units ordered on the line |
| `unit_price` | decimal | USD list price per item |
| `unit_cost` | decimal | Hypothetical USD landed cost per item |
| `discount_pct` | decimal | Fractional promotion percentage (0.10 = 10%) |
| `returned` | integer (0/1) | Entire line returned; cost and revenue reversed |
| `gross_sales` | decimal | `quantity × unit_price` before promotions and refunds |
| `discount_amount` | decimal | `gross_sales × discount_pct` |
| `net_sales` | decimal | `0` if returned; else `gross_sales − discount_amount` |
| `cogs` | decimal | `0` if returned; else `quantity × unit_cost` |
| `gross_profit` | decimal | `net_sales − cogs` |

### KPI definitions

1. **Net revenue** = `SUM(net_sales)`.
2. **Gross sales** = `SUM(gross_sales)` (before discounts/returns).
3. **Completed orders** = distinct order IDs containing ≥1 non-returned line.
4. **Units sold** = sum of quantities for non-returned lines.
5. **AOV** = net revenue / completed orders.
6. **Gross profit** = net revenue − COGS.
7. **Gross margin** = gross profit / net revenue.
8. **Active customers** = distinct customer IDs with ≥1 non-returned line.
9. **Return rate** = returned order lines / all order lines (not a per-order or per-unit rate).
10. **Discount rate** = discount amount / gross sales (before refunds).
11. **Revenue MoM** = (latest selected month's revenue − preceding month's revenue) / preceding month's revenue, with other filters preserved.
12. **Orders MoM** = same for completed orders. For the first month, MoM is unavailable.

**Important:** distinct customer/order counts cannot be added across channels, categories or months without deduplication. The browser dashboard recalculates them from source lines after every filter; the SQL queries use `COUNT(DISTINCT ...)`.

### Reproducibility

Source data: generated locally with `random.Random(20251110)` by `src/generate_data.py`. It is **not scraped, purchased, or confidential**. SQL reports, dashboard data and Excel views are all derived from the same CSV. Monetary values are rounded to cents at the line level, so totals should be summed from the already rounded data.
