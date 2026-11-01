

// tiện ích chung (DOM, ngày, xáo trộn…)
const $=(s:string):any=>document.querySelector(s);
const $$=(s:string,root:any=document):any[]=>[...root.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const dayStr=(d=new Date())=>{const z=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate());};
const addDays=(s,n)=>{const d=new Date(s+"T12:00:00");d.setDate(d.getDate()+n);return dayStr(d);};
let toastT; function toast(m:string){const t=$("#toast");t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,2600);}
const GOAL=40;
const clone=o=>JSON.parse(JSON.stringify(o??null));
function pick(arr,n){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a.slice(0,n);}
const segBtns=(attr,cur,opts)=>opts.map(([v,t])=>`<button class="chip" data-${attr}="${v}" aria-pressed="${String(v)===String(cur)}">${t}</button>`).join("");
const tbl=rows=>`<div class="tw"><table>${rows.map(r=>`<tr>${r.map((c,i)=>`<td class="${i===0?"jp c0":i===2?"jp c2":""}">${esc(c)}</td>`).join("")}</tr>`).join("")}</table></div>`;
const fold=s=>String(s).normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/đ/g,"d").replace(/Đ/g,"D").toLowerCase();
function seeded(seed){let s=seed>>>0||1;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function shuffleWith(arr,rnd){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const hashStr=s=>[...s].reduce((h,c)=>(h*31+c.codePointAt(0))>>>0,7);

export { $, $$, esc, dayStr, addDays, toast, GOAL, clone, pick, segBtns, tbl, fold, seeded, shuffleWith, hashStr };
