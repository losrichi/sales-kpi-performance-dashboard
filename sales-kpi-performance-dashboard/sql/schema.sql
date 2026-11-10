-- Synthetic retail sales. All amounts denominated in USD.
DROP VIEW IF EXISTS v_monthly_kpis;
DROP TABLE IF EXISTS sales;
CREATE TABLE sales (
    order_id TEXT NOT NULL,
    order_date TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    category TEXT NOT NULL,
    region TEXT NOT NULL,
    channel TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price REAL NOT NULL CHECK (unit_price >= 0),
    unit_cost REAL NOT NULL CHECK (unit_cost >= 0),
    discount_pct REAL NOT NULL CHECK (discount_pct BETWEEN 0 AND 1),
    returned INTEGER NOT NULL CHECK (returned IN (0,1)),
    gross_sales REAL NOT NULL,
    discount_amount REAL NOT NULL,
    net_sales REAL NOT NULL,
    cogs REAL NOT NULL,
    gross_profit REAL NOT NULL
);
CREATE INDEX idx_sales_date ON sales(order_date);
CREATE INDEX idx_sales_category ON sales(category);
CREATE INDEX idx_sales_region ON sales(region);
CREATE INDEX idx_sales_channel ON sales(channel);
CREATE VIEW v_monthly_kpis AS
SELECT substr(order_date,1,7) AS month,
       ROUND(SUM(net_sales),2) AS net_revenue,
       ROUND(SUM(gross_sales),2) AS gross_sales,
       COUNT(DISTINCT CASE WHEN returned = 0 THEN order_id END) AS orders,
       SUM(CASE WHEN returned = 0 THEN quantity ELSE 0 END) AS units_sold,
       ROUND(SUM(gross_profit),2) AS gross_profit,
       COUNT(DISTINCT CASE WHEN returned = 0 THEN customer_id END) AS customers,
       ROUND(100.0 * SUM(returned) / COUNT(*),2) AS return_rate_pct,
       ROUND(100.0 * SUM(discount_amount) / NULLIF(SUM(gross_sales),0),2) AS discount_rate_pct
FROM sales
GROUP BY substr(order_date,1,7);
