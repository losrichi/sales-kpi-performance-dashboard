"""Run SQLite analytics against committed source CSV; export auditable query results."""
from __future__ import annotations
import csv
from pathlib import Path
import sqlite3
import sys
try:
    from .generate_data import ROOT, HEADERS
except ImportError:
    from generate_data import ROOT, HEADERS

CSV_PATH = ROOT / 'data' / 'sales_transactions.csv'
DB_PATH = ROOT / 'analysis' / 'sales_analysis.sqlite'
REPORTS_DIR = ROOT / 'analysis' / 'exports'
NUMERIC = {'quantity': int, 'unit_price': float, 'unit_cost': float, 'discount_pct': float,
           'returned': int,'gross_sales':float,'discount_amount':float,
           'net_sales':float,'cogs':float,'gross_profit':float}

def load_sales(con: sqlite3.Connection, path: Path=CSV_PATH) -> int:
    con.executescript((ROOT/'sql'/'schema.sql').read_text(encoding='utf-8'))
    placeholders = ','.join(['?']*len(HEADERS))
    count=0
    with path.open(encoding='utf-8',newline='') as f:
        reader=csv.DictReader(f)
        if reader.fieldnames != HEADERS:
            raise ValueError('Unexpected CSV schema')
        batch=[]
        for row in reader:
            batch.append([NUMERIC.get(key,str)(row[key]) for key in HEADERS])
            if len(batch)==1000:
                con.executemany(f'INSERT INTO sales VALUES ({placeholders})',batch)
                count+=len(batch);batch=[]
        if batch:
            con.executemany(f'INSERT INTO sales VALUES ({placeholders})',batch)
            count+=len(batch)
    con.commit()
    return count

def parse_named_queries(sql_text: str):
    name=None;lines=[]
    for line in sql_text.splitlines():
        if line.strip().startswith('-- query:'):
            if name and lines:
                yield name,'\n'.join(lines).strip().rstrip(';')
            name=line.split(':',1)[1].strip();lines=[]
        elif name:
            lines.append(line)
    if name and lines:
        yield name,'\n'.join(lines).strip().rstrip(';')

def execute_reports(con: sqlite3.Connection, path: Path=REPORTS_DIR):
    path.mkdir(parents=True,exist_ok=True)
    report_counts={}
    for filename in ['report_queries.sql','kpi_queries.sql']:
        queries=list(parse_named_queries((ROOT/'sql'/filename).read_text(encoding='utf-8')))
        for name,query in queries:
            c=con.execute(query)
            columns=[d[0] for d in c.description]
            rows=c.fetchall()
            filepath=path/f'{name}.csv'
            with filepath.open('w',newline='',encoding='utf-8') as f:
                wr=csv.writer(f);wr.writerow(columns);wr.writerows(rows)
            report_counts[name]=len(rows)
    return report_counts

def main():
    DB_PATH.parent.mkdir(parents=True,exist_ok=True)
    with sqlite3.connect(DB_PATH) as con:
        count=load_sales(con)
        outputs=execute_reports(con)
        issues=con.execute('SELECT invalid_lines, inconsistent_profit, return_errors, months_present FROM (SELECT SUM(CASE WHEN net_sales < 0 OR gross_profit > net_sales OR quantity <=0 THEN 1 ELSE 0 END) invalid_lines, SUM(CASE WHEN ABS(gross_profit-(net_sales-cogs))>0.011 THEN 1 ELSE 0 END) inconsistent_profit, SUM(CASE WHEN returned=1 AND (net_sales<>0 OR cogs<>0) THEN 1 ELSE 0 END) return_errors, COUNT(DISTINCT substr(order_date,1,7)) months_present FROM sales)').fetchone()
        if issues!=(0,0,0,12):raise ValueError(f'Data quality failure: {issues}')
    print(f'Loaded {count:,} rows; exported {len(outputs)} reports to {REPORTS_DIR}')
if __name__=='__main__': main()
