"use client";
import { useState, useEffect, useCallback } from "react";
import { RefreshCw, ArrowLeftRight, ChevronDown, Zap } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════ */
const CURRENCIES = [
  { code:"KES", sym:"KES ",  flag:"🇰🇪", name:"Kenyan Shilling"     },
  { code:"USD", sym:"$",     flag:"🇺🇸", name:"US Dollar"           },
  { code:"EUR", sym:"€",     flag:"🇪🇺", name:"Euro"                },
  { code:"GBP", sym:"£",     flag:"🇬🇧", name:"British Pound"       },
  { code:"AED", sym:"AED ",  flag:"🇦🇪", name:"UAE Dirham"          },
  { code:"TZS", sym:"TZS ",  flag:"🇹🇿", name:"Tanzanian Shilling"  },
  { code:"UGX", sym:"UGX ",  flag:"🇺🇬", name:"Ugandan Shilling"    },
  { code:"INR", sym:"₹",     flag:"🇮🇳", name:"Indian Rupee"        },
  { code:"ZAR", sym:"R",     flag:"🇿🇦", name:"South African Rand"  },
  { code:"CNY", sym:"¥",     flag:"🇨🇳", name:"Chinese Yuan"        },
  { code:"RWF", sym:"RWF ",  flag:"🇷🇼", name:"Rwandan Franc"       },
  { code:"ETB", sym:"ETB ",  flag:"🇪🇹", name:"Ethiopian Birr"      },
  { code:"GHS", sym:"₵",     flag:"🇬🇭", name:"Ghanaian Cedi"       },
  { code:"NGN", sym:"₦",     flag:"🇳🇬", name:"Nigerian Naira"      },
];

const ZONES = [
  { city:"Nairobi",       tz:"Africa/Nairobi",        flag:"🇰🇪", utc:"+3"    },
  { city:"Dubai",         tz:"Asia/Dubai",            flag:"🇦🇪", utc:"+4"    },
  { city:"London",        tz:"Europe/London",         flag:"🇬🇧", utc:"±0"    },
  { city:"New York",      tz:"America/New_York",      flag:"🇺🇸", utc:"-5"    },
  { city:"Kampala",       tz:"Africa/Kampala",        flag:"🇺🇬", utc:"+3"    },
  { city:"Dar es Salaam", tz:"Africa/Dar_es_Salaam",  flag:"🇹🇿", utc:"+3"    },
  { city:"Kigali",        tz:"Africa/Kigali",         flag:"🇷🇼", utc:"+2"    },
  { city:"Johannesburg",  tz:"Africa/Johannesburg",   flag:"🇿🇦", utc:"+2"    },
  { city:"Mumbai",        tz:"Asia/Kolkata",          flag:"🇮🇳", utc:"+5:30" },
  { city:"Beijing",       tz:"Asia/Shanghai",         flag:"🇨🇳", utc:"+8"    },
  { city:"Frankfurt",     tz:"Europe/Berlin",         flag:"🇩🇪", utc:"+1"    },
  { city:"Tokyo",         tz:"Asia/Tokyo",            flag:"🇯🇵", utc:"+9"    },
];

const ROUTES = [
  { to:"Mombasa",     km:490  }, { to:"Kisumu",       km:350  },
  { to:"Nakuru",      km:160  }, { to:"Naivasha",     km:90   },
  { to:"Maasai Mara", km:270  }, { to:"Malindi",      km:580  },
  { to:"Eldoret",     km:310  }, { to:"Amboseli",     km:230  },
  { to:"Kampala",     km:680  }, { to:"Arusha",       km:273  },
  { to:"Zanzibar",    km:935  }, { to:"Kigali",       km:880  },
  { to:"JKIA",        km:18   }, { to:"Thika",        km:42   },
  { to:"Machakos",    km:64   },
];

const VEHICLES = [
  { label:"Vitz / Axio",      kpl:13, e:"🚗" },
  { label:"Corolla / Premio", kpl:12, e:"🚗" },
  { label:"RAV4 / Fielder",   kpl:11, e:"🚙" },
  { label:"Prado / Fortuner", kpl:9,  e:"🚙" },
  { label:"Land Cruiser V8",  kpl:7,  e:"🚐" },
  { label:"Hilux / D-Max",    kpl:8,  e:"🛻" },
];

/* ═══════════════════════════════════════════════════════════════
   UTILS
═══════════════════════════════════════════════════════════════ */
const fmtN  = (n:number, d=0) => new Intl.NumberFormat("en-KE",{minimumFractionDigits:d,maximumFractionDigits:d}).format(n);
const fmtK  = (n:number) => `KES ${fmtN(Math.round(n))}`;
const tzTime = (tz:string,sec=false) => {
  try { return new Date().toLocaleTimeString("en-US",{timeZone:tz,hour12:false,hour:"2-digit",minute:"2-digit",...(sec?{second:"2-digit"}:{})}); }
  catch { return "--:--"; }
};
const tzHour = (tz:string) => {
  try { return parseInt(new Date().toLocaleString("en-US",{timeZone:tz,hour:"numeric",hour12:false})); }
  catch { return 12; }
};
const tzDate = (tz:string) => {
  try { return new Date().toLocaleDateString("en-US",{timeZone:tz,weekday:"short",month:"short",day:"numeric"}); }
  catch { return ""; }
};

/* ═══════════════════════════════════════════════════════════════
   SHARED ATOMS
═══════════════════════════════════════════════════════════════ */
const C = {
  bg:     "#03080f",
  panel:  "#07111e",
  card:   "#091828",
  rim:    "rgba(255,255,255,.07)",
  muted:  "#2a3a50",
  dim:    "#4a6278",
  soft:   "#8ba3b8",
  text:   "#c8dae8",
  white:  "#e8f0f8",
};

function Label({children}:{children:React.ReactNode}) {
  return <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase" as const,letterSpacing:".1em",color:C.dim,marginBottom:5}}>{children}</div>;
}

function NumInput({label,value,onChange,prefix,suffix,placeholder,wide}:{
  label?:string;value:string;onChange:(v:string)=>void;
  prefix?:string;suffix?:string;placeholder?:string;wide?:boolean;
}) {
  return (
    <div style={{flex:wide?2:1,minWidth:0}}>
      {label && <Label>{label}</Label>}
      <div style={{position:"relative",display:"flex",alignItems:"center"}}>
        {prefix && <span style={{position:"absolute",left:10,fontSize:11,color:C.dim,pointerEvents:"none",fontFamily:"'JetBrains Mono',monospace"}}>{prefix}</span>}
        <input type="number" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
          style={{
            width:"100%",background:C.bg,border:"1px solid "+C.muted,borderRadius:8,
            padding:`8px ${suffix?"30px":10}px 8px ${prefix?"32px":10}px`,
            color:C.white,fontSize:13,outline:"none",fontFamily:"'JetBrains Mono',monospace",
            transition:"border-color .15s",
          }}
          onFocus={e=>e.target.style.borderColor="rgba(249,115,22,.6)"}
          onBlur={e=>e.target.style.borderColor=C.muted}/>
        {suffix && <span style={{position:"absolute",right:9,fontSize:10,color:C.dim,pointerEvents:"none"}}>{suffix}</span>}
      </div>
    </div>
  );
}

function Dropdown({label,value,onChange,options}:{
  label?:string;value:string;onChange:(v:string)=>void;options:{value:string;label:string}[];
}) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <div style={{position:"relative"}}>
        <select value={value} onChange={e=>onChange(e.target.value)} style={{
          width:"100%",background:C.bg,border:"1px solid "+C.muted,borderRadius:8,
          padding:"8px 28px 8px 10px",color:C.white,fontSize:12,appearance:"none",
          outline:"none",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",
          transition:"border-color .15s",
        }}
        onFocus={e=>e.target.style.borderColor="rgba(249,115,22,.6)"}
        onBlur={e=>e.target.style.borderColor=C.muted}>
          {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",width:12,height:12,color:C.dim,pointerEvents:"none"}}/>
      </div>
    </div>
  );
}

function Toggle({on,onChange,label}:{on:boolean;onChange:(v:boolean)=>void;label:string}) {
  return (
    <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",userSelect:"none" as const}}>
      <div onClick={()=>onChange(!on)} style={{
        width:34,height:18,borderRadius:9,background:on?"#F97316":C.muted,
        position:"relative",transition:"background .2s",cursor:"pointer",flexShrink:0,
      }}>
        <div style={{position:"absolute",top:2,left:on?16:2,width:14,height:14,borderRadius:"50%",background:"white",transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.4)"}}/>
      </div>
      <span style={{fontSize:11,color:C.soft,lineHeight:1}}>{label}</span>
    </label>
  );
}

function Chip({label,active,onClick,color}:{label:string;active:boolean;onClick:()=>void;color:string}) {
  return (
    <button onClick={onClick} style={{
      padding:"4px 10px",borderRadius:6,border:`1px solid ${active?color:C.muted}`,
      background:active?`${color}18`:"transparent",color:active?color:C.dim,
      fontSize:11,cursor:"pointer",transition:"all .12s",fontFamily:"'Space Grotesk',sans-serif",
    }}>{label}</button>
  );
}

function ResultLine({label,value,color,size,top}:{label:string;value:string;color?:string;size?:number;top?:boolean}) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"6px 0",borderTop:top?"1px solid "+C.rim:"none"}}>
      <span style={{fontSize:11,color:C.dim}}>{label}</span>
      <span style={{fontSize:size||12,fontWeight:size&&size>14?800:600,color:color||C.text,fontFamily:"'JetBrains Mono',monospace"}}>{value}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INSTRUMENT CARD WRAPPER
═══════════════════════════════════════════════════════════════ */
function Instrument({title,subtitle,accent,children,span2}:{
  title:string;subtitle:string;accent:string;children:React.ReactNode;span2?:boolean;
}) {
  return (
    <div style={{
      background:C.card,borderRadius:16,overflow:"hidden",
      border:"1px solid "+C.rim,
      boxShadow:`0 0 0 1px ${accent}18, 0 12px 40px rgba(0,0,0,.6)`,
      gridColumn:span2?"span 2":undefined,
    }}>
      {/* Instrument top strip */}
      <div style={{height:2,background:`linear-gradient(90deg, ${accent}, ${accent}60 60%, transparent)`}}/>
      <div style={{
        padding:"12px 18px",borderBottom:"1px solid "+C.rim,
        background:`linear-gradient(180deg, ${accent}0c 0%, transparent 100%)`,
        display:"flex",alignItems:"center",justifyContent:"space-between",
      }}>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:accent,textTransform:"uppercase" as const,letterSpacing:".1em"}}>{title}</div>
          <div style={{fontSize:10,color:C.dim,marginTop:1}}>{subtitle}</div>
        </div>
        {/* Corner indicator light */}
        <div style={{width:6,height:6,borderRadius:"50%",background:accent,boxShadow:`0 0 8px ${accent}`,opacity:.7}}/>
      </div>
      <div style={{padding:"16px 18px"}}>{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   1. CURRENCY CONVERTER
═══════════════════════════════════════════════════════════════ */
function CurrencyTool() {
  const [amt,  setAmt]  = useState("10000");
  const [from, setFrom] = useState("USD");
  const [to,   setTo]   = useState("KES");
  const [rates,setRates]= useState<Record<string,number>>({KES:130,USD:1,EUR:.92,GBP:.79,AED:3.67,TZS:2600,UGX:3800,INR:83.5,ZAR:18.7,CNY:7.24,RWF:1310,ETB:110,GHS:12.5,NGN:1550});
  const [spin, setSpin] = useState(false);
  const [ts,   setTs]   = useState("approx.");

  const load = useCallback(async()=>{
    setSpin(true);
    try {
      const r = await fetch("https://open.er-api.com/v6/latest/USD");
      const d = await r.json();
      if(d.rates){setRates(d.rates);setTs(new Date().toLocaleTimeString("en-KE",{hour:"2-digit",minute:"2-digit"}));}
    } catch {}
    setSpin(false);
  },[]);

  useEffect(()=>{load();},[load]);

  const fr = rates[from]||1, tr = rates[to]||1;
  const res = (parseFloat(amt)||0)*(tr/fr);
  const fSym = CURRENCIES.find(c=>c.code===from)?.sym||"";
  const tSym = CURRENCIES.find(c=>c.code===to)?.sym||"";
  const opts = CURRENCIES.map(c=>({value:c.code,label:`${c.flag} ${c.code} — ${c.name}`}));
  const pairs:[string,string][] = [["USD","KES"],["EUR","KES"],["GBP","KES"],["AED","KES"],["TZS","KES"],["UGX","KES"]];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <NumInput label="Amount" value={amt} onChange={setAmt} placeholder="10 000" prefix={fSym} wide/>

      <div style={{display:"grid",gridTemplateColumns:"1fr 32px 1fr",gap:8,alignItems:"end"}}>
        <Dropdown label="From" value={from} onChange={setFrom} options={opts}/>
        <button onClick={()=>{const t=from;setFrom(to);setTo(t);}} style={{
          width:32,height:34,borderRadius:8,background:C.bg,border:"1px solid "+C.muted,
          cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",marginTop:14,
        }}>
          <ArrowLeftRight style={{width:13,height:13,color:"#F97316"}}/>
        </button>
        <Dropdown label="To" value={to} onChange={setTo} options={opts}/>
      </div>

      {/* Big readout */}
      <div style={{background:C.bg,border:"1px solid rgba(56,189,248,.2)",borderRadius:12,padding:"16px 18px",textAlign:"center"}}>
        <div style={{fontSize:10,color:C.dim,fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>
          {fSym}{fmtN(parseFloat(amt)||0,2)} {from} =
        </div>
        <div style={{fontSize:34,fontWeight:800,color:"#38BDF8",fontFamily:"'JetBrains Mono',monospace",letterSpacing:"-.03em",lineHeight:1}}>
          {spin?"···":`${tSym}${fmtN(res,2)}`}
        </div>
        <div style={{fontSize:10,color:C.muted,marginTop:6,fontFamily:"'JetBrains Mono',monospace"}}>
          rate: 1 {from} = {tSym}{(tr/fr).toFixed(4)} {to}
        </div>
      </div>

      {/* Quick grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5}}>
        {pairs.map(([f,t])=>{
          const r=(rates[t]||1)/(rates[f]||1);
          const fc=CURRENCIES.find(c=>c.code===f);
          const tc=CURRENCIES.find(c=>c.code===t);
          return (
            <button key={f+t} onClick={()=>{setFrom(f);setTo(t);}} style={{
              background:C.bg,border:"1px solid "+C.muted,borderRadius:8,
              padding:"8px 10px",cursor:"pointer",textAlign:"left",transition:"border-color .12s",
            }}
            onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(56,189,248,.4)"}
            onMouseLeave={e=>e.currentTarget.style.borderColor=C.muted}>
              <div style={{fontSize:9,color:C.dim,marginBottom:2}}>{fc?.flag} 1 {f}</div>
              <div style={{fontSize:13,fontWeight:700,color:C.white,fontFamily:"'JetBrains Mono',monospace"}}>{tc?.sym}{fmtN(r,0)}</div>
            </button>
          );
        })}
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:10,color:C.muted}}>Updated {ts}</span>
        <button onClick={load} style={{background:"none",border:"none",cursor:"pointer",color:"#38BDF8",fontSize:11,display:"flex",alignItems:"center",gap:4}}>
          <RefreshCw style={{width:10,height:10,animation:spin?"spin 1s linear infinite":"none"}}/> refresh
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. RENTAL CALCULATOR
═══════════════════════════════════════════════════════════════ */
function RentalTool() {
  const [days,  setDays]  = useState("3");
  const [rate,  setRate]  = useState("8000");
  const [ch,    setCh]    = useState(false);
  const [vat,   setVat]   = useState(false);
  const [ekm,   setEkm]   = useState("0");
  const [kmr,   setKmr]   = useState("50");
  const [dep,   setDep]   = useState(50);

  const d=parseInt(days)||0, r=parseFloat(rate)||0;
  const base=d*r, chg=ch?d*2000:0, ext=(parseFloat(ekm)||0)*(parseFloat(kmr)||0);
  const sub=base+chg+ext, tax=vat?sub*.16:0, tot=sub+tax;
  const depAmt=tot*(dep/100), bal=tot-depAmt;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",gap:10}}>
        <NumInput label="Days"       value={days} onChange={setDays} suffix="d"   placeholder="3"/>
        <NumInput label="Daily Rate" value={rate} onChange={setRate} prefix="KES" placeholder="8000" wide/>
      </div>

      <div style={{display:"flex",gap:10,flexWrap:"wrap" as const}}>
        <Toggle on={ch}  onChange={setCh}  label="Chauffeured +KES 2,000/day"/>
        <Toggle on={vat} onChange={setVat} label="Include VAT 16%"/>
      </div>

      <div style={{display:"flex",gap:10}}>
        <NumInput label="Extra KM"  value={ekm} onChange={setEkm} suffix="km"/>
        <NumInput label="Rate / KM" value={kmr} onChange={setKmr} prefix="KES"/>
      </div>

      {/* Breakdown panel */}
      <div style={{background:C.bg,border:"1px solid rgba(249,115,22,.18)",borderRadius:12,padding:"12px 14px"}}>
        <ResultLine label={`${d}d × ${fmtK(r)}`} value={fmtK(base)}/>
        {ch  && <ResultLine label={`Chauffeur ${d}d × KES 2,000`} value={fmtK(chg)} color="#FBBF24"/>}
        {(parseFloat(ekm)||0)>0 && <ResultLine label={`Extra ${ekm} km × KES ${kmr}`} value={fmtK(ext)}/>}
        {vat && <ResultLine label="VAT 16%" value={fmtK(tax)}/>}
        <ResultLine label="TOTAL" value={fmtK(tot)} color="#F97316" size={18} top/>
      </div>

      {/* Deposit */}
      <div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <Label>Deposit</Label>
          <span style={{fontSize:12,color:"#F97316",fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>{dep}%</span>
        </div>
        <input type="range" min={0} max={100} value={dep} onChange={e=>setDep(+e.target.value)}
          style={{width:"100%",accentColor:"#F97316"}}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {[{l:"Deposit Due",v:fmtK(depAmt),c:"#34D399"},{l:"Balance",v:fmtK(bal),c:"#FBBF24"}].map(({l,v,c})=>(
          <div key={l} style={{background:C.bg,border:`1px solid ${c}22`,borderRadius:10,padding:"10px 12px"}}>
            <div style={{fontSize:9,color:c,textTransform:"uppercase" as const,letterSpacing:".08em",marginBottom:4}}>{l}</div>
            <div style={{fontSize:15,fontWeight:800,color:c,fontFamily:"'JetBrains Mono',monospace"}}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. WORLD TIME
═══════════════════════════════════════════════════════════════ */
function WorldTimeTool() {
  const [, setTick] = useState(0);
  const [focus, setFocus] = useState("Africa/Nairobi");
  useEffect(()=>{const t=setInterval(()=>setTick(n=>n+1),1000);return()=>clearInterval(t);},[]);

  const fz = ZONES.find(z=>z.tz===focus)||ZONES[0];
  const isDay = (tz:string) => { const h=tzHour(tz); return h>=6&&h<20; };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {/* Hero display */}
      <div style={{background:C.bg,border:"1px solid rgba(167,139,250,.22)",borderRadius:14,padding:"16px 20px",textAlign:"center"}}>
        <div style={{fontSize:18,marginBottom:4}}>{fz.flag}</div>
        <div style={{fontSize:10,color:C.dim,fontWeight:600,marginBottom:6,textTransform:"uppercase" as const,letterSpacing:".08em"}}>{fz.city} · UTC{fz.utc}</div>
        <div style={{fontSize:42,fontWeight:800,color:"#A78BFA",fontFamily:"'JetBrains Mono',monospace",letterSpacing:"-.04em",lineHeight:1}}>
          {tzTime(fz.tz,true)}
        </div>
        <div style={{fontSize:11,color:C.dim,marginTop:8}}>{tzDate(fz.tz)} · {isDay(fz.tz)?"☀️ Daytime":"🌙 Night"}</div>
      </div>

      {/* Grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
        {ZONES.map(z=>{
          const active=focus===z.tz, day=isDay(z.tz);
          return (
            <button key={z.tz} onClick={()=>setFocus(z.tz)} style={{
              display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:9,
              background:active?"rgba(167,139,250,.1)":C.bg,
              border:`1px solid ${active?"rgba(167,139,250,.35)":C.muted}`,
              cursor:"pointer",textAlign:"left",transition:"all .12s",
            }}>
              <span style={{fontSize:15,flexShrink:0}}>{z.flag}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:10,color:C.dim,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{z.city}</div>
                <div style={{fontSize:13,fontWeight:700,color:active?"#A78BFA":C.text,fontFamily:"'JetBrains Mono',monospace"}}>{tzTime(z.tz)}</div>
              </div>
              <span style={{fontSize:11}}>{day?"☀️":"🌙"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. FUEL ESTIMATOR
═══════════════════════════════════════════════════════════════ */
function FuelTool() {
  const [dist, setDist]  = useState("270");
  const [kpl,  setKpl]   = useState("9");
  const [ppl,  setPpl]   = useState("205");
  const [rt,   setRt]    = useState(false);
  const [selV, setSelV]  = useState("");

  const km   = (parseFloat(dist)||0)*(rt?2:1);
  const L    = km/(parseFloat(kpl)||1);
  const cost = L*(parseFloat(ppl)||0);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <Dropdown label="Quick Route"
        value={selV}
        onChange={v=>{setSelV(v);if(v)setDist(v);}}
        options={[{value:"",label:"Select a route (Nairobi →)"},...ROUTES.map(r=>({value:String(r.km),label:`→ ${r.to}  (${r.km} km)`}))]}/>

      <div style={{display:"flex",gap:10}}>
        <NumInput label="Distance" value={dist} onChange={setDist} suffix="km"/>
        <NumInput label="Fuel Use"  value={kpl}  onChange={setKpl}  suffix="km/L"/>
        <NumInput label="Price/L"   value={ppl}  onChange={setPpl}  prefix="KES"/>
      </div>

      {/* Vehicle presets */}
      <div>
        <Label>Vehicle Type</Label>
        <div style={{display:"flex",flexWrap:"wrap" as const,gap:5}}>
          {VEHICLES.map(v=>(
            <Chip key={v.label} label={`${v.e} ${v.label}`} active={kpl===String(v.kpl)} onClick={()=>setKpl(String(v.kpl))} color="#34D399"/>
          ))}
        </div>
      </div>

      <Toggle on={rt} onChange={setRt} label={`Round trip${rt?` — ${fmtN((parseFloat(dist)||0)*2)} km total`:""}`}/>

      {/* Result strip */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
        {[
          {l:"Distance", v:`${fmtN(km)} km`, c:C.text},
          {l:"Litres",   v:`${fmtN(L,1)} L`, c:"#FBBF24"},
          {l:"Cost",     v:fmtK(cost),        c:"#34D399"},
        ].map(({l,v,c})=>(
          <div key={l} style={{background:C.bg,border:"1px solid "+C.muted,borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
            <div style={{fontSize:9,color:C.dim,textTransform:"uppercase" as const,letterSpacing:".07em",marginBottom:4}}>{l}</div>
            <div style={{fontSize:14,fontWeight:800,color:c,fontFamily:"'JetBrains Mono',monospace"}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{fontSize:10,color:C.muted,fontFamily:"'JetBrains Mono',monospace"}}>
        +13% buffer: <span style={{color:"#34D399"}}>{fmtK(cost*1.13)}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. VAT CALCULATOR
═══════════════════════════════════════════════════════════════ */
function VatTool() {
  const [amt,  setAmt]  = useState("50000");
  const [pct,  setPct]  = useState("16");
  const [mode, setMode] = useState<"add"|"ext">("add");
  const [cur,  setCur]  = useState("KES");

  const a=parseFloat(amt)||0, p=parseFloat(pct)||0;
  let excl=0, tax=0, incl=0;
  if(mode==="add") { excl=a; tax=a*p/100; incl=a+tax; }
  else             { incl=a; excl=a/(1+p/100); tax=a-excl; }

  const sym = CURRENCIES.find(c=>c.code===cur)?.sym||"";
  const fmt = (n:number) => `${sym}${fmtN(Math.round(n))}`;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Mode tabs */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        {(["add","ext"] as const).map(m=>(
          <button key={m} onClick={()=>setMode(m)} style={{
            padding:"9px",borderRadius:9,border:`1px solid ${mode===m?"#FB923C":C.muted}`,
            background:mode===m?"rgba(251,146,60,.12)":"transparent",
            color:mode===m?"#FB923C":C.dim,fontSize:12,cursor:"pointer",fontWeight:600,
            fontFamily:"'Space Grotesk',sans-serif",
          }}>{m==="add"?"➕ Add VAT":"➖ Extract VAT"}</button>
        ))}
      </div>

      <div style={{display:"flex",gap:10,alignItems:"end"}}>
        <NumInput label={mode==="add"?"Amount (excl. VAT)":"Amount (incl. VAT)"} value={amt} onChange={setAmt} prefix={sym} wide/>
        <NumInput label="VAT %" value={pct} onChange={setPct} suffix="%"/>
        <div style={{minWidth:80}}>
          <Label>Currency</Label>
          <Dropdown value={cur} onChange={setCur} options={CURRENCIES.map(c=>({value:c.code,label:c.code}))}/>
        </div>
      </div>

      {/* Preset rates */}
      <div style={{display:"flex",gap:5,flexWrap:"wrap" as const}}>
        {[{l:"Kenya 16%",v:"16"},{l:"Uganda 18%",v:"18"},{l:"Tanzania 18%",v:"18"},{l:"No Tax",v:"0"}].map(({l,v})=>(
          <Chip key={l} label={l} active={pct===v} onClick={()=>setPct(v)} color="#FB923C"/>
        ))}
      </div>

      {/* Result */}
      <div style={{background:C.bg,border:"1px solid rgba(251,146,60,.2)",borderRadius:12,padding:"12px 14px"}}>
        <ResultLine label="Excl. VAT"      value={fmt(excl)}/>
        <ResultLine label={`VAT (${pct}%)`} value={fmt(tax)} color="#FB923C"/>
        <ResultLine label="Incl. VAT"      value={fmt(incl)} color="#FB923C" size={18} top/>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. ROUTE PLANNER
═══════════════════════════════════════════════════════════════ */
function RouteTool() {
  const [dest, setDest] = useState("");
  const [days, setDays] = useState("2");
  const [rate, setRate] = useState("12000");

  const route = ROUTES.find(r=>r.to===dest);
  const km    = route?.km||0;
  const fuel  = km>0?km/9*205:0;
  const rental= (parseInt(days)||0)*(parseFloat(rate)||0);
  const total = rental+fuel*1.13;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <Dropdown label="Destination (from Nairobi)"
        value={dest} onChange={setDest}
        options={[{value:"",label:"Select destination..."},...ROUTES.map(r=>({value:r.to,label:`${r.to} — ${r.km} km`}))]}/>

      {/* Quick tiles */}
      <div style={{display:"flex",flexWrap:"wrap" as const,gap:5}}>
        {ROUTES.slice(0,10).map(r=>(
          <Chip key={r.to} label={`${r.to} ${r.km}km`} active={dest===r.to} onClick={()=>setDest(r.to)} color="#C084FC"/>
        ))}
      </div>

      <div style={{display:"flex",gap:10}}>
        <NumInput label="Hire Days"  value={days} onChange={setDays} suffix="d"/>
        <NumInput label="Daily Rate" value={rate} onChange={setRate} prefix="KES" wide/>
      </div>

      {km>0 ? (
        <div style={{background:C.bg,border:"1px solid rgba(192,132,252,.2)",borderRadius:12,padding:"12px 14px"}}>
          <ResultLine label="One way"         value={`${km} km`}/>
          <ResultLine label="Round trip"      value={`${km*2} km`} color={C.soft}/>
          <ResultLine label="Fuel (Prado)"   value={fmtK(fuel)} color="#FBBF24"/>
          <ResultLine label={`Rental (${days}d)`} value={fmtK(rental)} color="#34D399"/>
          <ResultLine label="Trip Total"      value={fmtK(total)} color="#C084FC" size={18} top/>
        </div>
      ) : (
        <div style={{textAlign:"center",padding:"28px 0",color:C.muted,fontSize:13}}>
          Pick a destination above
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */
export default function ToolsPage() {
  const [nbi,  setNbi]  = useState("--:--:--");
  const [filt, setFilt] = useState("all");

  useEffect(()=>{
    const up=()=>setNbi(tzTime("Africa/Nairobi",true));
    up(); const t=setInterval(up,1000); return()=>clearInterval(t);
  },[]);

  const tools = [
    { id:"currency", label:"Currency",    short:"FX",      accent:"#38BDF8", sub:"Live exchange rates",      Widget:CurrencyTool  },
    { id:"rental",   label:"Rental Calc", short:"RENTAL",  accent:"#F97316", sub:"Days × rate breakdown",    Widget:RentalTool    },
    { id:"time",     label:"World Time",  short:"TIME",    accent:"#A78BFA", sub:"12 cities, live clock",    Widget:WorldTimeTool },
    { id:"fuel",     label:"Fuel Cost",   short:"FUEL",    accent:"#34D399", sub:"Distance & consumption",   Widget:FuelTool      },
    { id:"vat",      label:"VAT / Tax",   short:"TAX",     accent:"#FB923C", sub:"Add or extract tax",       Widget:VatTool       },
    { id:"routes",   label:"Route Plan",  short:"ROUTE",   accent:"#C084FC", sub:"Kenya trip cost planner",  Widget:RouteTool     },
  ];

  const visible = filt==="all" ? tools : tools.filter(t=>t.id===filt);

  return (
    <div style={{fontFamily:"'Space Grotesk', system-ui, sans-serif",color:C.text,minHeight:"100vh"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ticker  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        *{box-sizing:border-box}
        input,select,button{font-family:'Space Grotesk',system-ui,sans-serif}
        input[type=number]::-webkit-inner-spin-button{opacity:.3}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:${C.muted};border-radius:99px}
      `}</style>

      {/* ── PAGE HEADER ── */}
      <div style={{marginBottom:24}}>
        {/* Ticker bar */}
        <div style={{
          background:C.panel,borderRadius:10,overflow:"hidden",marginBottom:16,
          border:"1px solid "+C.rim,height:32,display:"flex",alignItems:"center",
          position:"relative",
        }}>
          <div style={{flexShrink:0,padding:"0 14px",fontSize:9,fontWeight:700,color:"#F97316",
            textTransform:"uppercase",letterSpacing:".1em",borderRight:"1px solid "+C.rim,height:"100%",
            display:"flex",alignItems:"center",gap:6,background:C.bg,whiteSpace:"nowrap"}}>
            <Zap style={{width:10,height:10}}/> LIVE
          </div>
          <div style={{overflow:"hidden",flex:1,height:"100%",display:"flex",alignItems:"center"}}>
            <div style={{display:"flex",gap:0,animation:"ticker 30s linear infinite",whiteSpace:"nowrap"}}>
              {[...tools,...tools].map((t,i)=>(
                <span key={i} style={{padding:"0 20px",fontSize:10,color:C.dim,fontFamily:"'JetBrains Mono',monospace",borderRight:"1px solid "+C.rim,height:32,display:"inline-flex",alignItems:"center",gap:8}}>
                  <span style={{color:t.accent,fontWeight:700}}>{t.short}</span> {t.sub}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Title row */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:16}}>
          <div>
            <h1 style={{fontSize:28,fontWeight:800,color:C.white,margin:"0 0 4px",letterSpacing:"-.02em",fontFamily:"'Space Grotesk',sans-serif"}}>
              Business Tools
            </h1>
            <p style={{fontSize:13,color:C.dim,margin:0}}>
              Six precision instruments for Moventra operations
            </p>
          </div>
          {/* Live Nairobi clock */}
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",
            background:C.panel,border:"1px solid "+C.rim,borderRadius:12}}>
            <div>
              <div style={{fontSize:9,color:C.dim,textTransform:"uppercase",letterSpacing:".1em",marginBottom:2}}>Nairobi</div>
              <div style={{fontSize:20,fontWeight:800,color:"#34D399",fontFamily:"'JetBrains Mono',monospace",lineHeight:1,letterSpacing:".02em"}}>{nbi}</div>
            </div>
            <div style={{width:8,height:8,borderRadius:"50%",background:"#34D399",boxShadow:"0 0 10px #34D399",flexShrink:0}}/>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          <button onClick={()=>setFilt("all")} style={{
            padding:"7px 16px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:600,
            background:filt==="all"?"rgba(249,115,22,.15)":"transparent",
            color:filt==="all"?"#F97316":C.dim,fontSize:12,
            outline:filt==="all"?"1px solid rgba(249,115,22,.3)":"none",transition:"all .15s",
          }}>All Tools</button>
          {tools.map(t=>(
            <button key={t.id} onClick={()=>setFilt(filt===t.id?"all":t.id)} style={{
              padding:"7px 16px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:600,
              background:filt===t.id?`${t.accent}18`:"transparent",
              color:filt===t.id?t.accent:C.dim,fontSize:12,
              outline:filt===t.id?`1px solid ${t.accent}35`:"none",transition:"all .15s",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ── INSTRUMENT GRID ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16}}>
        {visible.map((t,i)=>(
          <div key={t.id} style={{animation:`fadeUp .3s ease ${i*.07}s both`}}>
            <Instrument title={t.label} subtitle={t.sub} accent={t.accent}>
              <t.Widget/>
            </Instrument>
          </div>
        ))}
      </div>

      {/* ── FOOTER ── */}
      <div style={{marginTop:24,padding:"12px 18px",background:C.panel,border:"1px solid "+C.rim,
        borderRadius:12,display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:5,height:5,borderRadius:"50%",background:"#F97316",flexShrink:0}}/>
        <span style={{fontSize:11,color:C.muted,fontFamily:"'JetBrains Mono',monospace"}}>
          FX: open.er-api.com · Fuel: KES 205/L default · Consumption: Prado avg 9 km/L · Distances: approximate
        </span>
      </div>
    </div>
  );
}
