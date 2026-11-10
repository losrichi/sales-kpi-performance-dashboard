"""End-to-end regression checks; run: python -m unittest discover -s tests -v."""
import csv
from pathlib import Path
import sqlite3
import tempfile
import unittest
from src.generate_data import ROOT, generate, HEADERS
from src.run_analysis import load_sales, parse_named_queries

class TestPipeline(unittest.TestCase):
    def test_generator_is_deterministic(self):
        with tempfile.TemporaryDirectory() as temp:
            a=Path(temp)/'a.csv';b=Path(temp)/'b.csv'
            self.assertEqual(generate(a,lines=300,seed=42),300)
            generate(b,lines=300,seed=42)
            self.assertEqual(a.read_bytes(),b.read_bytes())

    def test_committed_data_and_sql(self):
        with sqlite3.connect(':memory:') as con:
            total=load_sales(con)
            self.assertEqual(total,24000)
            row=con.execute('SELECT COUNT(*),COUNT(DISTINCT substr(order_date,1,7)),MIN(order_date),MAX(order_date) FROM sales').fetchone()
            self.assertEqual(row[:2],(24000,12))
            self.assertTrue(row[2].startswith('2025-'))
            self.assertTrue(row[3].startswith('2025-'))
            self.assertEqual(con.execute('SELECT COUNT(*) FROM sales WHERE ABS(net_sales-cogs-gross_profit)>0.011').fetchone()[0],0)
            self.assertEqual(con.execute('SELECT COUNT(*) FROM sales WHERE returned=1 AND (net_sales<>0 OR cogs<>0)').fetchone()[0],0)
            self.assertGreater(con.execute('SELECT SUM(net_sales) FROM sales').fetchone()[0],0)
            kpi_sql=(ROOT/'sql'/'kpi_queries.sql').read_text()
            kpis=list(parse_named_queries(kpi_sql))
            self.assertEqual(len(kpis),12)
            for name,query in kpis:
                self.assertTrue(con.execute(query).fetchall(),name)
            monthly=con.execute('SELECT COUNT(*) FROM v_monthly_kpis').fetchone()[0]
            self.assertEqual(monthly,12)

    def test_dataset_has_exact_columns(self):
        with (ROOT/'data'/'sales_transactions.csv').open(newline='',encoding='utf-8') as fh:
            self.assertEqual(next(csv.reader(fh)),HEADERS)

if __name__=='__main__':unittest.main()
