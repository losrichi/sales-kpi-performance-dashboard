-- query: monthly_performance
SELECT month, net_revenue, gross_sales, orders, units_sold, gross_profit,
       ROUND(net_revenue/NULLIF(orders,0),2) AS aov,
       ROUND(100.0*gross_profit/NULLIF(net_revenue,0),2) AS gross_margin_pct,
       customers, return_rate_pct, discount_rate_pct
FROM v_monthly_kpis ORDER BY month;
-- query: category_performance
SELECT category, ROUND(SUM(net_sales),2) AS net_revenue,
       ROUND(SUM(gross_profit),2) AS gross_profit,
       COUNT(DISTINCT CASE WHEN returned = 0 THEN order_id END) AS orders,
       ROUND(100.0*SUM(gross_profit)/NULLIF(SUM(net_sales),0),2) AS gross_margin_pct
FROM sales GROUP BY category ORDER BY net_revenue DESC;
-- query: channel_performance
SELECT channel, ROUND(SUM(net_sales),2) AS net_revenue,
       ROUND(SUM(gross_profit),2) AS gross_profit,
       COUNT(DISTINCT CASE WHEN returned = 0 THEN order_id END) AS orders
FROM sales GROUP BY channel ORDER BY net_revenue DESC;
-- query: region_performance
SELECT region, ROUND(SUM(net_sales),2) AS net_revenue,
       ROUND(SUM(gross_profit),2) AS gross_profit,
       COUNT(DISTINCT CASE WHEN returned = 0 THEN order_id END) AS orders
FROM sales GROUP BY region ORDER BY net_revenue DESC;
-- query: top_products
SELECT product_id, product_name, category,
       SUM(CASE WHEN returned=0 THEN quantity ELSE 0 END) AS units_sold,
       ROUND(SUM(net_sales),2) AS net_revenue,
       ROUND(SUM(gross_profit),2) AS gross_profit
FROM sales GROUP BY product_id, product_name, category ORDER BY net_revenue DESC LIMIT 12;
-- query: data_quality_checks
SELECT COUNT(*) AS total_lines,
       SUM(CASE WHEN net_sales < 0 OR gross_profit > net_sales OR quantity <= 0 THEN 1 ELSE 0 END) AS invalid_lines,
       SUM(CASE WHEN ABS(gross_profit-(net_sales-cogs))>0.011 THEN 1 ELSE 0 END) AS inconsistent_profit,
       SUM(CASE WHEN returned=1 AND (net_sales<>0 OR cogs<>0) THEN 1 ELSE 0 END) AS return_errors,
       COUNT(DISTINCT substr(order_date,1,7)) AS months_present
FROM sales;
