# Power BI — ready-to-import assets

The **completed interactive dashboard** is in `dashboard/` (open `index.html`, works offline). This folder provides the CSV model, **12 KPI definitions in DAX**, and a recommended visual layout for reconstructing the same dashboard in Power BI Desktop.

**A `.pbix` binary is not included.** Power BI Desktop is necessary to create/verify an actual `.pbix` file; don't claim you have one until it exists. The screenshots in this repository depict the **HTML implementation**, not Power BI.

## Import and model

1. In Power BI Desktop, select **Get data → Text/CSV** and import `../data/sales_transactions.csv` as a table named **Sales**.
2. In Power Query or Model view, set `order_date` = Date, `quantity`/`returned` = Whole number, and the numeric money / discount columns = Decimal number. Ensure no step is using text types for amounts.
3. Create the **Calendar calculated table** from `MEASURES.dax` (Modeling → New table), create the one-to-many relationship `Calendar[Date]` → `Sales[order_date]`, and mark it as the date table.
4. Create the measures from `MEASURES.dax` **one at a time** (Modeling → New measure). Do not paste the entire file into one measure. Format money as USD, ratios as percentage with one decimal place.
5. Build a report page (16:9): 12 card visuals for the KPIs; a line chart `Calendar[Date]` versus `[Net Revenue]`, column chart category vs `[Net Revenue]`, bar chart region vs `[Net Revenue]`, bar chart channel vs `[Net Revenue]`; a product ranking table using `product_name`, `[Net Revenue]`, `[Gross Profit]`; and slicers for region, category, channel and year/month.
6. Save as `Sales_KPI_Dashboard.pbix` and add that real file to the repository if you use Power BI.

### Definitions and caveats

- A completed order is any order with at least one non-returned line. The return rate is per order **line**, not per order. See `docs/DATA_DICTIONARY.md`.
- For a full-year card, MoM measures based on `DATEADD` may represent a year-over-year partial-date comparison depending on filter context. Use a month selection or a month-by-month chart to display MoM clearly. The HTML app explicitly uses the latest month in the selection.
- Do not present synthetic revenue as real-world commercial performance.
