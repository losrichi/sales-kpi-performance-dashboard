"""Build offline dashboard data from the same cleaned transactions CSV."""
from __future__ import annotations
import csv
import json
from pathlib import Path
try:
    from .generate_data import ROOT
except ImportError:
    from generate_data import ROOT

# Stored row layout is documented in dashboard/app.js and docs/DATA_DICTIONARY.md.
INDEX = ['order_id','month','customer_id','product_id','category','region','channel',
         'quantity','gross_sales','discount_amount','net_sales','cogs','gross_profit','returned']

def build(source:Path=ROOT/'data'/'sales_transactions.csv',output:Path=ROOT/'dashboard'/'sales_data.js'):
    products={};records=[]
    with source.open(newline='',encoding='utf-8') as f:
        for row in csv.DictReader(f):
            products[row['product_id']]=row['product_name']
            records.append([row['order_id'],int(row['order_date'][5:7]),row['customer_id'],
               row['product_id'],row['category'],row['region'],row['channel'],int(row['quantity']),
               float(row['gross_sales']),float(row['discount_amount']),float(row['net_sales']),
               float(row['cogs']),float(row['gross_profit']),int(row['returned'])])
    payload={'year':2025,'currency':'USD','synthetic':True,'fields':INDEX,'products':products,'rows':records}
    output.parent.mkdir(parents=True,exist_ok=True)
    output.write_text('/* Generated from synthetic CSV: python -m src.build_dashboard_data */\nwindow.SALES_DATA='+json.dumps(payload,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
    return len(records)

if __name__=='__main__':print(f'Dashboard data built from {build():,} lines.')
