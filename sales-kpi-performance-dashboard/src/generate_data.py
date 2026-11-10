"""Create a deterministic, fictional retail transactions dataset (stdlib only)."""
from __future__ import annotations
import csv
from datetime import date
from pathlib import Path
import random

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'data' / 'sales_transactions.csv'
SEED = 20251110
TARGET_LINES = 24_000
PRODUCTS = [
    ('P001', 'Wireless Headphones', 'Electronics', 89, 43),
    ('P002', 'Portable Speaker', 'Electronics', 119, 62),
    ('P003', 'Smart Desk Lamp', 'Electronics', 75, 32),
    ('P004', 'Ceramic Vase', 'Home & Living', 42, 17),
    ('P005', 'Cotton Throw', 'Home & Living', 59, 26),
    ('P006', 'Desk Organizer', 'Home & Living', 32, 12),
    ('P007', 'Ergonomic Mouse', 'Office', 49, 20),
    ('P008', 'Notebook Set', 'Office', 24, 7),
    ('P009', 'Monitor Stand', 'Office', 64, 28),
    ('P010', 'Travel Bottle', 'Accessories', 29, 10),
    ('P011', 'Canvas Tote', 'Accessories', 35, 13),
    ('P012', 'Laptop Sleeve', 'Accessories', 39, 15),
]
HEADERS = [
    'order_id','order_date','customer_id','product_id','product_name','category',
    'region','channel','quantity','unit_price','unit_cost','discount_pct',
    'returned','gross_sales','discount_amount','net_sales','cogs','gross_profit',
]

def generate(path: Path = OUTPUT, lines: int = TARGET_LINES, seed: int = SEED) -> int:
    """Generate exactly `lines` order lines; all figures are artificial USD amounts."""
    rng = random.Random(seed)
    path.parent.mkdir(parents=True, exist_ok=True)
    month_weights = [7, 7, 8, 8, 8, 8, 8, 8, 8, 9, 10, 11]
    count = 0
    order_no = 0
    with path.open('w', encoding='utf-8', newline='') as fh:
        writer = csv.writer(fh)
        writer.writerow(HEADERS)
        while count < lines:
            order_no += 1
            order_id = f'SO-{order_no:06d}'
            month = rng.choices(range(1, 13), weights=month_weights, k=1)[0]
            day = rng.randint(1, (date(2026 if month == 12 else 2025, 1 if month == 12 else month + 1, 1) - date(2025, month, 1)).days)
            order_date = date(2025, month, day).isoformat()
            customer_id = f'C-{rng.randint(1, 2100):05d}'
            region = rng.choices(['North','South','East','West'], weights=[22, 27, 30, 21], k=1)[0]
            channel = rng.choices(['Online','Retail','Marketplace'], weights=[56, 30, 14], k=1)[0]
            line_count = min(rng.choices([1, 2, 3], weights=[40, 42, 18], k=1)[0], lines-count)
            items = rng.sample(PRODUCTS, k=line_count)
            for pid, product_name, category, list_price, cost in items:
                qty = rng.choices([1,2,3,4],weights=[54,28,13,5],k=1)[0]
                discount_pct = rng.choices([0, .05, .10, .15, .20], weights=[50,20,17,9,4],k=1)[0]
                returned = int(rng.random() < (.06 if channel == 'Marketplace' else .035))
                gross = round(qty * list_price, 2)
                discount_amt = round(gross * discount_pct, 2)
                net = round((gross-discount_amt)*(1-returned),2)
                cogs = round(qty*cost*(1-returned), 2)
                profit = round(net-cogs,2)
                writer.writerow([order_id,order_date,customer_id,pid,product_name,category,
                    region,channel,qty,list_price,cost,f'{discount_pct:.2f}',returned,
                    f'{gross:.2f}',f'{discount_amt:.2f}',f'{net:.2f}',f'{cogs:.2f}',f'{profit:.2f}'])
                count += 1
    return count

if __name__ == '__main__':
    print(f'Generated {generate():,} synthetic order lines in {OUTPUT}')
