/* Interactive dashboard: plain ES2020 JavaScript, no external dependencies.
 * Dataset row indexes: 0 order, 1 month, 2 customer, 3 product, 4 category,
 * 5 region, 6 channel, 7 quantity, 8 gross_sales, 9 discount_amount,
 * 10 net_sales, 11 cogs, 12 gross_profit, 13 returned.
 */
(() => {
  'use strict';
  const source = window.SALES_DATA;
  if (!source || !source.rows) {
    document.body.textContent = 'Dashboard data missing. Keep sales_data.js in the same folder.';
    return;
  }
  const rows = source.rows;
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const fillColors = ['#655df0','#31bbac','#f1b363','#e789b6'];
  const money = n => '$' + Math.round(n).toLocaleString('en-US');
  const count = n => Number(n).toLocaleString('en-US');
  const pct = n => Number.isFinite(n) ? (n*100).toFixed(1) + '%' : '—';
  const safeDiv = (a,b) => b ? a/b : NaN;
  const $ = id => document.getElementById(id);
  const fmt = (n, val) => val === 'money' ? money(n) : val === 'pct' ? pct(n) : count(n);

  for (let m=1;m<=12;m++) {
    const o=document.createElement('option');o.value=String(m);o.textContent=monthNames[m-1]+' 2025';$('month').append(o);
  }
  function isSegmentRow(r, filt) {
    return (filt.region==='all'||r[5]===filt.region) &&
      (filt.category==='all'||r[4]===filt.category) &&
      (filt.channel==='all'||r[6]===filt.channel);
  }
  const emptyAcc = () => ({revenue:0,gross:0,discount:0,profit:0,units:0,lines:0,returned:0,orders:new Set(),customers:new Set()});
  function append(a,r) {
    a.revenue+=r[10];a.gross+=r[8];a.discount+=r[9];a.profit+=r[12];a.lines++;
    a.returned+=r[13];
    if (!r[13]) {a.units+=r[7];a.orders.add(r[0]);a.customers.add(r[2]);}
  }
  function totals(values) {let a=emptyAcc(); for (const r of values)append(a,r);return a;}
  function sumBy(values, index) {
    const obj={};for(const r of values){const k=r[index];obj[k]=(obj[k]||0)+r[10];}
    return Object.entries(obj).sort((a,b)=>b[1]-a[1]);
  }
  function escapeHtml(s) {return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  function renderKpis(a,monthly,referenceMonth) {
    const current=monthly[referenceMonth-1], prior=referenceMonth>1 ? monthly[referenceMonth-2] : null;
    const revMoM=prior?safeDiv(current.revenue-prior.revenue,prior.revenue):NaN;
    const ordMoM=prior?safeDiv(current.orders.size-prior.orders.size,prior.orders.size):NaN;
    const kpis=[
      ['Net revenue',money(a.revenue),'After promotions & returns','↗'],
      ['Gross sales',money(a.gross),'Before refunds & discounts','＄'],
      ['Completed orders',count(a.orders.size),'Unique non-returned orders','▤'],
      ['Units sold',count(a.units),'Excludes returned units','◈'],
      ['Average order value',money(safeDiv(a.revenue,a.orders.size)||0),'Revenue / completed orders','⌑'],
      ['Gross profit',money(a.profit),'Net revenue minus COGS','↗'],
      ['Gross margin',pct(safeDiv(a.profit,a.revenue)),'Profit / net revenue','◉'],
      ['Active customers',count(a.customers.size),'Distinct completed buyers','♙'],
      ['Return rate',pct(safeDiv(a.returned,a.lines)),'Returned order lines','↩'],
      ['Discount rate',pct(safeDiv(a.discount,a.gross)),'Discount / pre-refund sales','％'],
      ['Revenue MoM',pct(revMoM),monthNames[referenceMonth-1]+' vs prior month','↑'],
      ['Orders MoM',pct(ordMoM),monthNames[referenceMonth-1]+' vs prior month','≋'],
    ];
    $('kpis').innerHTML=kpis.map(k=>`<article class="kpi"><div class="kpi-top"><span class="kpi-name">${k[0]}</span><span class="kpi-symbol">${k[3]}</span></div><div class="kpi-value">${k[1]}</div><div class="kpi-foot">${k[2]}</div></article>`).join('');
  }

  function renderTrend(monthly,selected) {
    const width=735,height=236,left=50,right=12,top=20,bottom=30;
    const vals=monthly.map(m=>m.revenue);const max=Math.max(...vals,1)*1.12;
    const sx=i=>left + i*(width-left-right)/11,sy=v=>top+(max-v)*(height-top-bottom)/max;
    const grid=[0,.25,.5,.75,1].map(f=>{let y=sy(max*f);return `<line x1="${left}" y1="${y}" x2="${width-right}" y2="${y}" stroke="#edf0f7"/><text x="${left-10}" y="${y+3}" text-anchor="end" fill="#929eb1" font-size="10">${(max*f/1000).toFixed(0)}k</text>`;}).join('');
    const pts=vals.map((v,i)=>`${sx(i)},${sy(v)}`).join(' ');
    const area=`${left},${height-bottom} ${pts} ${sx(11)},${height-bottom}`;
    const labels=monthNames.map((m,i)=>`<text x="${sx(i)}" y="${height-7}" text-anchor="middle" fill="${selected===i+1?'#504aeb':'#9ba4b4'}" font-size="11" font-weight="${selected===i+1?'700':'500'}">${m}</text>`).join('');
    const markers=vals.map((v,i)=>`<circle cx="${sx(i)}" cy="${sy(v)}" r="${selected===i+1?6:3.5}" fill="${selected===i+1?'#554fed':'#fff'}" stroke="#625af0" stroke-width="2"><title>${monthNames[i]} 2025: ${money(v)}</title></circle>`).join('');
    const selectedGuide=selected?`<line x1="${sx(selected-1)}" x2="${sx(selected-1)}" y1="${top}" y2="${height-bottom}" stroke="#9995ef" stroke-width="1.5" stroke-dasharray="4 4"/>`:'';
    $('trendChart').innerHTML=`<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#746bf2" stop-opacity=".18"/><stop offset="1" stop-color="#746bf2" stop-opacity="0"/></linearGradient></defs>${grid}${selectedGuide}<polygon points="${area}" fill="url(#area-gradient)"/><polyline fill="none" stroke="#635cf0" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round" points="${pts}"/>${markers}${labels}</svg>`;
    $('trendChart').setAttribute('aria-label','Monthly net revenue: '+monthNames.map((m,i)=>m+' '+money(vals[i])).join(', '));
  }
  function renderCategory(selectedRows) {
    const entries=sumBy(selectedRows,4);const max=Math.max(...entries.map(x=>x[1]),1);
    $('categoryChart').innerHTML=entries.map(([name,val],i)=>`<div class="bar-item"><div class="bar-item-head"><span>${escapeHtml(name)}</span><b>${money(val)}</b></div><div class="bar-track"><span style="width:${Math.max(0,val/max*100).toFixed(2)}%;background:${fillColors[i%4]}"></span></div></div>`).join('')||'<p>No data for this selection.</p>';
  }
  function renderRegion(selectedRows) {
    const entries=sumBy(selectedRows,5),total=entries.reduce((s,x)=>s+x[1],0);
    let acc=0;const stops=entries.map(([key,v],i)=>{let start=acc;acc+=safeDiv(v,total)*100||0;return `${fillColors[i%4]} ${start.toFixed(2)}% ${acc.toFixed(2)}%`;});
    $('regionChart').innerHTML=`<div class="donut" style="background:conic-gradient(${stops.join(',')||'#e2e8f0 0% 100%'})"><div class="donut-center">${money(total)}<small>NET REVENUE</small></div></div><div class="legend">`+entries.map(([key,v],i)=>`<div class="legend-row"><span><i style="background:${fillColors[i%4]}"></i>${escapeHtml(key)}</span><b>${pct(safeDiv(v,total))}</b></div>`).join('')+'</div>';
  }
  function renderChannel(selectedRows) {
    const entries=sumBy(selectedRows,6),max=Math.max(...entries.map(v=>v[1]),1);
    $('channelChart').innerHTML=entries.map(([name,val],i)=>`<div class="channel-row"><span>${escapeHtml(name)}</span><div class="bar-track"><span style="background:${fillColors[i%4]};width:${Math.max(0,val/max*100).toFixed(2)}%"></span></div><b>${money(val)}</b></div>`).join('')||'<p>No data for this selection.</p>';
  }
  function renderProducts(selectedRows) {
    const map=new Map();
    for(const r of selectedRows) {
      const id=r[3];if(!map.has(id))map.set(id,{id,name:source.products[id],category:r[4],units:0,revenue:0,profit:0});
      const p=map.get(id);p.revenue+=r[10];p.profit+=r[12];if(!r[13])p.units+=r[7];
    }
    const list=[...map.values()].sort((a,b)=>b.revenue-a.revenue).slice(0,8);
    $('productsBody').innerHTML=list.map((p,i)=>`<tr><td><div class="product-cell"><span class="product-square">${String(i+1).padStart(2,'0')}</span>${escapeHtml(p.name)}</div></td><td><span class="category-tag">${escapeHtml(p.category)}</span></td><td class="number">${count(p.units)}</td><td class="number"><b>${money(p.revenue)}</b></td><td class="number">${money(p.profit)}</td><td class="number">${pct(safeDiv(p.profit,p.revenue))}</td></tr>`).join('')||'<tr><td colspan="6">No matching transactions</td></tr>';
  }
  function renderInsights(selectedRows,months) {
    const byCategory=sumBy(selectedRows,4),byRegion=sumBy(selectedRows,5),best=months.map((v,i)=>({month:i+1,revenue:v.revenue})).sort((a,b)=>b.revenue-a.revenue)[0];
    if(!selectedRows.length){$('insightText').textContent='No matching records for the current filters.';return;}
    $('insightText').textContent=`${byCategory[0][0]} leads category revenue at ${money(byCategory[0][1])}; ${byRegion[0][0]} is the strongest region. For the selected segments, ${monthNames[best.month-1]} has the highest monthly net revenue (${money(best.revenue)}).`;
  }
  function getFilters(){return {month:$('month').value,region:$('region').value,category:$('category').value,channel:$('channel').value};}
  let currentRows=rows;
  function update() {
    const filters=getFilters();const segmentRows=rows.filter(r=>isSegmentRow(r,filters));
    const monthly=Array.from({length:12},emptyAcc);
    for(const r of segmentRows)append(monthly[r[1]-1],r);
    currentRows=filters.month==='all'?segmentRows:segmentRows.filter(r=>r[1]===Number(filters.month));
    const a=totals(currentRows);
    const refMonth=filters.month==='all'?12:Number(filters.month);
    const scope=[filters.month==='all'?'Full year':monthNames[Number(filters.month)-1],filters.region==='all'?'All regions':filters.region,filters.category==='all'?'All categories':filters.category,filters.channel==='all'?'All channels':filters.channel].join(' · ');
    $('scope').textContent=scope;
    renderKpis(a,monthly,refMonth);
    renderTrend(monthly,filters.month==='all'?null:Number(filters.month));
    renderCategory(currentRows);renderRegion(currentRows);renderChannel(currentRows);
    renderProducts(currentRows);renderInsights(currentRows,monthly);
  }
  function csvSafe(value) {const v=String(value);return /[",\n]/.test(v)?'"'+v.replaceAll('"','""')+'"':v;}
  $('export').addEventListener('click',()=>{
    const cols=['order_id','month','customer_id','product_id','category','region','channel','quantity','gross_sales','discount_amount','net_sales','cogs','gross_profit','returned'];
    const content=[cols.join(','),...currentRows.map(r=>r.map(csvSafe).join(','))].join('\n');
    const url=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='filtered_sales_2025.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  $('reset').addEventListener('click',()=>{for(const name of ['month','region','category','channel'])$(name).value='all';update();});
  for(const name of ['month','region','category','channel'])$(name).addEventListener('change',update);
  update();
})();
