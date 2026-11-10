-- 12 SQL KPI definitions. Monetary values are USD. Returned lines have zero net revenue.
-- query: net_revenue
SELECT ROUND(SUM(net_sales),2) AS net_revenue_usd FROM sales;
-- query: gross_sales
SELECT ROUND(SUM(gross_sales),2) AS gross_sales_usd FROM sales;
-- query: orders
SELECT COUNT(DISTINCT order_id) AS completed_orders FROM sales WHERE returned = 0;
-- query: units_sold
SELECT SUM(quantity) AS units_sold FROM sales WHERE returned = 0;
-- query: average_order_value
SELECT ROUND(SUM(net_sales) / NULLIF(COUNT(DISTINCT CASE WHEN returned = 0 THEN order_id END),0),2) AS aov_usd FROM sales;
-- query: gross_profit
SELECT ROUND(SUM(gross_profit),2) AS gross_profit_usd FROM sales;
-- query: gross_margin
SELECT ROUND(100.0 * SUM(gross_profit) / NULLIF(SUM(net_sales),0),2) AS gross_margin_pct FROM sales;
-- query: active_customers
SELECT COUNT(DISTINCT customer_id) AS active_customers FROM sales WHERE returned = 0;
-- query: return_rate
SELECT ROUND(100.0 * SUM(returned) / COUNT(*),2) AS returned_order_lines_pct FROM sales;
-- query: discount_rate
SELECT ROUND(100.0 * SUM(discount_amount) / NULLIF(SUM(gross_sales),0),2) AS discount_rate_pct FROM sales;
-- query: revenue_mom
WITH m AS (
 SELECT month, net_revenue,
 LAG(net_revenue) OVER (ORDER BY month) AS prior_revenue
 FROM v_monthly_kpis
)
SELECT month, ROUND(100.0*(net_revenue-prior_revenue)/NULLIF(prior_revenue,0),2) AS revenue_mom_pct
FROM m ORDER BY month;
-- query: orders_mom
WITH m AS (
 SELECT month, orders, LAG(orders) OVER (ORDER BY month) AS prior_orders
 FROM v_monthly_kpis
)
SELECT month, ROUND(100.0*(orders-prior_orders)/NULLIF(prior_orders,0),2) AS orders_mom_pct
FROM m ORDER BY month;
