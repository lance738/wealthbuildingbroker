/* =========================================================
   Wealth Building Broker — Calculators
   Pure-browser math for real estate investing analysis
   ========================================================= */

// ------- Utilities -------
const $ = sel => document.querySelector(sel);
const fmtUSD = n => isFinite(n) ? n.toLocaleString("en-US", { style:"currency", currency:"USD", maximumFractionDigits: 0 }) : "—";
const fmtUSD2 = n => isFinite(n) ? n.toLocaleString("en-US", { style:"currency", currency:"USD", maximumFractionDigits: 2 }) : "—";
const fmtPct = n => isFinite(n) ? (n).toFixed(2) + "%" : "—";
const fmtNum = n => isFinite(n) ? n.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";
const num = id => parseFloat(($(id)?.value || "0").replace(/,/g,"")) || 0;

// ------- 1. Mortgage Calculator -------
function calcMortgage(){
  const price = num("#mort-price");
  const dp    = num("#mort-down");      // percent
  const rate  = num("#mort-rate") / 100;
  const years = num("#mort-years");
  const tax   = num("#mort-tax") / 100; // annual property tax pct
  const ins   = num("#mort-ins");       // annual $
  const hoa   = num("#mort-hoa");       // monthly

  const loan = price * (1 - dp/100);
  const r = rate / 12;
  const n = years * 12;
  const pi = r > 0 ? loan * (r * Math.pow(1+r,n)) / (Math.pow(1+r,n) - 1) : loan/n;
  const monthlyTax = (price * tax) / 12;
  const monthlyIns = ins / 12;
  const total = pi + monthlyTax + monthlyIns + hoa;
  const totalInterest = pi * n - loan;

  $("#mort-loan").textContent = fmtUSD(loan);
  $("#mort-pi").textContent = fmtUSD2(pi);
  $("#mort-piti").textContent = fmtUSD2(total);
  $("#mort-totalint").textContent = fmtUSD(totalInterest);
  $("#mort-totalpaid").textContent = fmtUSD(pi * n);
}

// ------- 2. Rental Cash Flow Calculator -------
function calcRental(){
  const price   = num("#rent-price");
  const dp      = num("#rent-down") / 100;
  const rate    = num("#rent-rate") / 100;
  const years   = num("#rent-years");
  const rent    = num("#rent-monthly");
  const vac     = num("#rent-vac") / 100;
  const tax     = num("#rent-tax") / 100;
  const ins     = num("#rent-ins");
  const mgmt    = num("#rent-mgmt") / 100;
  const maint   = num("#rent-maint") / 100;
  const capex   = num("#rent-capex") / 100;
  const hoa     = num("#rent-hoa");
  const util    = num("#rent-util");

  const loan = price * (1 - dp);
  const r = rate / 12;
  const n = years * 12;
  const piMonth = r > 0 ? loan * (r * Math.pow(1+r,n)) / (Math.pow(1+r,n) - 1) : loan/n;

  const grossIncome = rent * 12;
  const effIncome = grossIncome * (1 - vac);
  const opExp = (price * tax) + ins + (rent * 12 * (mgmt + maint + capex)) + (hoa*12) + (util*12);
  const noi = effIncome - opExp;
  const annualDebt = piMonth * 12;
  const cashFlow = noi - annualDebt;
  const cashInvested = price * dp + (price * 0.03); // est 3% closing
  const coc = (cashFlow / cashInvested) * 100;
  const capRate = (noi / price) * 100;
  const grm = price / grossIncome;
  const onepct = (rent / price) * 100;

  $("#rent-noi").textContent = fmtUSD(noi);
  $("#rent-cashflow").textContent = fmtUSD(cashFlow);
  $("#rent-monthlycf").textContent = fmtUSD(cashFlow/12);
  $("#rent-coc").textContent = fmtPct(coc);
  $("#rent-cap").textContent = fmtPct(capRate);
  $("#rent-grm").textContent = isFinite(grm) ? grm.toFixed(1) : "—";
  $("#rent-1pct").textContent = fmtPct(onepct);

  const row = $("#rent-cashflow").closest(".calc-result-row");
  row.classList.remove("good","bad");
  row.classList.add(cashFlow >= 0 ? "good" : "bad");
}

// ------- 3. BRRRR Calculator -------
function calcBRRRR(){
  const purchase = num("#brrrr-purchase");
  const rehab    = num("#brrrr-rehab");
  const closing  = num("#brrrr-closing");
  const arv      = num("#brrrr-arv");
  const refiLTV  = num("#brrrr-ltv") / 100;
  const refiRate = num("#brrrr-rate") / 100;
  const refiYears= num("#brrrr-years");
  const rent     = num("#brrrr-rent");
  const opex     = num("#brrrr-opex") / 100;

  const allIn = purchase + rehab + closing;
  const refiAmount = arv * refiLTV;
  const cashLeftIn = allIn - refiAmount;
  const r = refiRate / 12;
  const n = refiYears * 12;
  const pi = r > 0 ? refiAmount * (r * Math.pow(1+r,n)) / (Math.pow(1+r,n) - 1) : refiAmount/n;
  const monthlyOp = rent * opex;
  const monthlyCF = rent - monthlyOp - pi;
  const annualCF = monthlyCF * 12;
  const coc = cashLeftIn > 0 ? (annualCF / cashLeftIn) * 100 : Infinity;
  const recovery = (refiAmount / allIn) * 100;

  $("#brrrr-allin").textContent = fmtUSD(allIn);
  $("#brrrr-refi").textContent = fmtUSD(refiAmount);
  $("#brrrr-left").textContent = fmtUSD(cashLeftIn);
  $("#brrrr-recovery").textContent = fmtPct(recovery);
  $("#brrrr-cf").textContent = fmtUSD(monthlyCF);
  $("#brrrr-coc").textContent = cashLeftIn <= 0 ? "Infinite ✨" : fmtPct(coc);
}

// ------- 4. Cap Rate Calculator -------
function calcCap(){
  const noi = num("#cap-noi");
  const price = num("#cap-price");
  const cap = (noi / price) * 100;
  $("#cap-rate").textContent = fmtPct(cap);

  let rating = "—";
  if (cap >= 10) rating = "🔥 Strong cash flow (verify quality)";
  else if (cap >= 7) rating = "✅ Healthy cash flow";
  else if (cap >= 5) rating = "🟡 Moderate / appreciation play";
  else if (cap > 0) rating = "🔴 Low — appreciation-dependent";
  $("#cap-rating").textContent = rating;
}

// ------- 5. Cash-on-Cash ROI Calculator -------
function calcCoC(){
  const annualCF = num("#coc-cf");
  const invested = num("#coc-invested");
  const coc = (annualCF / invested) * 100;
  $("#coc-result").textContent = fmtPct(coc);

  let verdict = "—";
  if (coc >= 12) verdict = "🔥 Excellent (12%+)";
  else if (coc >= 8) verdict = "✅ Strong (8-12%)";
  else if (coc >= 6) verdict = "🟢 Good (6-8%)";
  else if (coc >= 4) verdict = "🟡 Modest (4-6%)";
  else if (coc > 0) verdict = "🔴 Low (<4%)";
  $("#coc-verdict").textContent = verdict;
}

// ------- 6. 1031 Exchange Calculator -------
function calc1031(){
  const sale     = num("#ex-sale");
  const basis    = num("#ex-basis");
  const deprec   = num("#ex-deprec");
  const ltcg     = num("#ex-ltcg") / 100;
  const drate    = num("#ex-drate") / 100;
  const stateRate= num("#ex-state") / 100;
  const niit     = 0.038; // 3.8%

  const adjBasis = basis - deprec;
  const gain = sale - adjBasis;
  const taxOnDeprec = deprec * drate;
  const remainingGain = gain - deprec;
  const taxOnGain = Math.max(remainingGain,0) * (ltcg + niit + stateRate);
  const totalTax = taxOnDeprec + taxOnGain;
  const net = sale - basis - totalTax;       // sale minus basis (return of capital) minus tax = cash after tax beyond basis
  const reinvest = sale - totalTax;          // pre-1031 reinvestable amount after tax
  const deferred = totalTax;                 // 1031 defers this entire amount

  $("#ex-gain").textContent = fmtUSD(gain);
  $("#ex-taxsale").textContent = fmtUSD(totalTax);
  $("#ex-net").textContent = fmtUSD(reinvest);
  $("#ex-1031").textContent = fmtUSD(sale);
  $("#ex-deferred").textContent = fmtUSD(deferred);
}

// ------- 7. Fix & Flip Calculator -------
function calcFlip(){
  const arv      = num("#flip-arv");
  const purchase = num("#flip-purchase");
  const rehab    = num("#flip-rehab");
  const hold     = num("#flip-hold");
  const sellPct  = num("#flip-sell") / 100;
  const fin      = num("#flip-fin");

  const sellCosts = arv * sellPct;
  const total = purchase + rehab + hold + sellCosts + fin;
  const profit = arv - total;
  const margin = (profit / arv) * 100;
  const roi = total > 0 ? (profit / total) * 100 : 0;
  const seventyRule = arv * 0.7 - rehab; // 70% rule max purchase

  $("#flip-profit").textContent = fmtUSD(profit);
  $("#flip-margin").textContent = fmtPct(margin);
  $("#flip-roi").textContent = fmtPct(roi);
  $("#flip-70").textContent = fmtUSD(seventyRule);

  const row = $("#flip-profit").closest(".calc-result-row");
  row.classList.remove("good","bad");
  row.classList.add(profit >= 0 ? "good" : "bad");
}

// ------- 8. Rule of 72 (Wealth Doubling) -------
function calc72(){
  const rate = num("#r72-rate");
  const start = num("#r72-start");
  const years = num("#r72-years");
  const doubling = rate > 0 ? 72 / rate : 0;
  const fv = start * Math.pow(1 + rate/100, years);
  $("#r72-double").textContent = doubling.toFixed(1) + " years";
  $("#r72-fv").textContent = fmtUSD(fv);
  $("#r72-gain").textContent = fmtUSD(fv - start);
}

// ------- 9. Rent vs Buy Calculator -------
function calcRentBuy(){
  const price   = num("#rb-price");
  const dp      = num("#rb-down") / 100;
  const rate    = num("#rb-rate") / 100;
  const years   = num("#rb-years");
  const appr    = num("#rb-appr") / 100;
  const propTax = num("#rb-tax") / 100;
  const maint   = num("#rb-maint") / 100;
  const rent    = num("#rb-rent");
  const rentInc = num("#rb-rentinc") / 100;

  const loan = price * (1 - dp);
  const r = rate / 12;
  const n = years * 12;
  const pi = r > 0 ? loan * (r * Math.pow(1+r,n)) / (Math.pow(1+r,n) - 1) : loan/n;

  // Total ownership cost over period (P&I + tax + maint - appreciation gain)
  let homeValue = price;
  let totalOwn = price * dp; // initial outlay (down)
  let totalRent = 0;
  let currentRent = rent;
  for (let y = 1; y <= years; y++){
    totalOwn += pi*12 + homeValue*propTax + homeValue*maint;
    totalRent += currentRent * 12;
    homeValue *= (1+appr);
    currentRent *= (1+rentInc);
  }
  const finalEquity = homeValue; // simplified — owns the home
  const netOwnership = totalOwn - finalEquity + loan; // crude net cost
  const savings = totalRent - netOwnership;

  $("#rb-totalrent").textContent = fmtUSD(totalRent);
  $("#rb-totalown").textContent = fmtUSD(netOwnership);
  $("#rb-equity").textContent = fmtUSD(finalEquity);
  $("#rb-verdict").textContent = savings > 0 ? `Buying saves ~${fmtUSD(savings)}` : `Renting saves ~${fmtUSD(-savings)}`;
}

// ------- Bind on load -------
document.addEventListener("DOMContentLoaded", () => {
  // Each calculator: find inputs inside its container, attach listener
  const calcs = [
    { id: "calc-mortgage", fn: calcMortgage },
    { id: "calc-rental",   fn: calcRental },
    { id: "calc-brrrr",    fn: calcBRRRR },
    { id: "calc-cap",      fn: calcCap },
    { id: "calc-coc",      fn: calcCoC },
    { id: "calc-1031",     fn: calc1031 },
    { id: "calc-flip",     fn: calcFlip },
    { id: "calc-72",       fn: calc72 },
    { id: "calc-rentbuy",  fn: calcRentBuy },
  ];
  calcs.forEach(({id, fn}) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.querySelectorAll("input, select").forEach(inp => {
      inp.addEventListener("input", fn);
    });
    fn(); // initial compute
  });

  // Nav toggle (mobile)
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks  = document.querySelector(".nav-links");
  if (navToggle && navLinks){
    navToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
  }

  // Footer current year
  document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());
});
