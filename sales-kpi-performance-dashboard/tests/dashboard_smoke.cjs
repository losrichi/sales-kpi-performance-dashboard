// Optional Node.js smoke test: node tests/dashboard_smoke.cjs
const assert = require('node:assert/strict');
const path = require('node:path');
const ids = {};
function element(id) {
  return ids[id] ||= {
    value: 'all', innerHTML:'',textContent:'',listeners:{},children:[],
    append(child){this.children.push(child)},
    addEventListener(event,fn){this.listeners[event]=fn},
    setAttribute(){},
  };
}
global.document = {
  getElementById: element,
  createElement: () => ({textContent:'',value:'',setAttribute(){}}),
  body: {textContent:''},
};
global.window = {};
require(path.resolve(__dirname,'../dashboard/sales_data.js'));
require(path.resolve(__dirname,'../dashboard/app.js'));
assert.equal((ids.kpis.innerHTML.match(/class="kpi"/g) || []).length,12);
assert.ok(ids.kpis.innerHTML.includes('$2,023,860'), 'Revenue should match SQL revenue');
assert.ok(ids.trendChart.innerHTML.includes('<svg'));
assert.ok(ids.categoryChart.innerHTML.includes('Electronics'));
assert.ok(ids.productsBody.innerHTML.includes('Portable Speaker'));
ids.region.value='West';
ids.region.listeners.change();
assert.ok(ids.scope.textContent.includes('West'));
assert.ok(!ids.kpis.innerHTML.includes('$2,023,860'));
ids.month.value='12';ids.month.listeners.change();
assert.ok(ids.scope.textContent.includes('Dec'));
ids.reset.listeners.click();
assert.equal(ids.month.value,'all');
assert.ok(ids.kpis.innerHTML.includes('$2,023,860'));
console.log('PASS: dashboard metrics, charts, category ranking, filter updates and reset');
