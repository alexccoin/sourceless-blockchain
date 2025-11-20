/* Simulated live refresh overlay for placeholder metrics.
   Non-destructive: overrides text content after load.
   Replace fetchSim* functions with real API calls when backend ready.
*/
(function(){
  const randRange=(min,max,dec=2)=> (min + Math.random()*(max-min)).toFixed(dec);
  function fetchSimTPMS(){
    // Base dynamic formula approximate
    const nodesEl=document.getElementById('activeNodesCount');
    const nodes = nodesEl? parseInt(nodesEl.textContent.replace(/,/g,''),10) || 1000 : 1000;
    return 100000 + nodes*75 + Math.floor(Math.random()*4000);
  }
  function fetchSimPrice(){return randRange(0.019,0.025,5);} // STR price simulated
  function fetchSimChange(){return (Math.random()>0.5?'+':'-') + randRange(0.10,5.50,2) + '%';}
  function fetchSimMarketCap(){return '$' + (400 + Math.random()*80).toFixed(2) + 'M';}
  function fetchSimPortfolio(){return '$' + (9000000 + Math.random()*800000).toLocaleString(undefined,{maximumFractionDigits:2});}

  function applyTPMS(){const el=document.getElementById('tpmsCount'); if(el) el.textContent=fetchSimTPMS().toLocaleString();}
  function applyPrice(){document.querySelectorAll('.str-price').forEach(el=>el.textContent=fetchSimPrice());}
  function applyChange(){document.querySelectorAll('.str-change').forEach(el=>el.textContent=fetchSimChange());}
  function applyMarketCap(){document.querySelectorAll('.str-market-cap').forEach(el=>el.textContent=fetchSimMarketCap());}
  function applyPortfolio(){const el=document.getElementById('totalBalance'); if(el){el.textContent = randRange(45000,49000,2) + ' STR'; const usdEl = el.parentElement.querySelector('.balance-usd'); if(usdEl) usdEl.textContent = '≈ ' + fetchSimPortfolio() + ' USD';}}

  function tick(){applyTPMS(); applyPrice(); applyChange(); applyMarketCap(); applyPortfolio();}
  document.addEventListener('DOMContentLoaded',()=>{
    tick();
    setInterval(tick, 5000); // refresh every 5s
    console.log('%c[LiveRefresh] Simulated dynamic updates active.', 'color:#00ff41');
  });
})();
