// bảng kana ↔ romaji, chuẩn hoá câu để chấm (norm)
const K2R_BASE=[["あ","a"],["い","i"],["う","u"],["え","e"],["お","o"],["か","ka"],["き","ki"],["く","ku"],["け","ke"],["こ","ko"],["さ","sa"],["し","shi"],["す","su"],["せ","se"],["そ","so"],["た","ta"],["ち","chi"],["つ","tsu"],["て","te"],["と","to"],["な","na"],["に","ni"],["ぬ","nu"],["ね","ne"],["の","no"],["は","ha"],["ひ","hi"],["ふ","fu"],["へ","he"],["ほ","ho"],["ま","ma"],["み","mi"],["む","mu"],["め","me"],["も","mo"],["や","ya"],["ゆ","yu"],["よ","yo"],["ら","ra"],["り","ri"],["る","ru"],["れ","re"],["ろ","ro"],["わ","wa"],["を","wo"],["ん","n"],["が","ga"],["ぎ","gi"],["ぐ","gu"],["げ","ge"],["ご","go"],["ざ","za"],["じ","ji"],["ず","zu"],["ぜ","ze"],["ぞ","zo"],["だ","da"],["ぢ","ji"],["づ","zu"],["で","de"],["ど","do"],["ば","ba"],["び","bi"],["ぶ","bu"],["べ","be"],["ぼ","bo"],["ぱ","pa"],["ぴ","pi"],["ぷ","pu"],["ぺ","pe"],["ぽ","po"],["ぁ","a"],["ぃ","i"],["ぅ","u"],["ぇ","e"],["ぉ","o"],["ゔ","vu"]];
const K2R:any={}; K2R_BASE.forEach(([k,r])=>K2R[k]=r);
const YOON={"き":"ky","し":"sh","ち":"ch","に":"ny","ひ":"hy","み":"my","り":"ry","ぎ":"gy","じ":"j","び":"by","ぴ":"py"};
Object.entries<any>(YOON).forEach(([k,p])=>{K2R[k+"ゃ"]=p+"a";K2R[k+"ゅ"]=p+"u";K2R[k+"ょ"]=p+"o";});
Object.assign(K2R,{"しぇ":"she","ちぇ":"che","じぇ":"je","ふぁ":"fa","ふぃ":"fi","ふぇ":"fe","ふぉ":"fo","てぃ":"ti","でぃ":"di","うぃ":"wi","うぇ":"we","うぉ":"wo","ゔぁ":"va","ゔぃ":"vi","ゔぇ":"ve","ゔぉ":"vo"});
const R2K:any={};
Object.entries<any>(K2R).forEach(([k,r])=>{ if(!R2K[r]&&!"ぁぃぅぇぉ".includes(k)&&k!=="ん"&&k!=="ぢ"&&k!=="づ"&&k!=="うぉ") R2K[r]=k; });
Object.assign(R2K,{ye:"いぇ",si:"し",ti:"ち",tu:"つ",hu:"ふ",zi:"じ",di:"ぢ",du:"づ",wo:"を",jya:"じゃ",jyu:"じゅ",jyo:"じょ",zya:"じゃ",zyu:"じゅ",zyo:"じょ",sya:"しゃ",syu:"しゅ",syo:"しょ",tya:"ちゃ",tyu:"ちゅ",tyo:"ちょ",cya:"ちゃ",cyu:"ちゅ",cyo:"ちょ",thi:"てぃ",dhi:"でぃ",xa:"ぁ",xi:"ぃ",xu:"ぅ",xe:"ぇ",xo:"ぉ",la:"ぁ",li:"ぃ",lu:"ぅ",le:"ぇ",lo:"ぉ",xya:"ゃ",xyu:"ゅ",xyo:"ょ",lya:"ゃ",lyu:"ゅ",lyo:"ょ",xtu:"っ",ltu:"っ",xtsu:"っ",ltsu:"っ"});
const PUNCT={".":"。",",":"、","?":"？","!":"！","~":"〜"};
const toHira=s=>s.replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60));
const hasLatin=s=>/[a-zA-Z]/.test(s);
function romajiToKana(input){
  const s=input.toLowerCase().replace(/ā/g,"aa").replace(/ī/g,"ii").replace(/ū/g,"uu").replace(/ē/g,"ee").replace(/ō/g,"ou").replace(/[ôâ]/g,m=>m==="ô"?"ou":"aa"); let out="",i=0;
  while(i<s.length){
    const c=s[i], nx=s[i+1];
    if(!/[a-z\-']/.test(c)){out+=PUNCT[c]??c;i++;continue;}
    if(c==="-"){out+="ー";i++;continue;}
    if(c==="'"){i++;continue;}
    if(c==="n"){
      if(nx==="n"){ out+="ん"; i+= /[aiueoy]/.test(s[i+2]||"")?1:2; continue; }
      if(nx===undefined||!/[aiueoy]/.test(nx)){ out+="ん"; i++; continue; }
    }
    if(c==="t"&&nx==="c"&&s[i+2]==="h"){out+="っ";i++;continue;}
    if(c==="m"&&/[bpm]/.test(nx||"")){out+="ん";i++;continue;}
    if(c===nx&&/[bcdfghjkmpqrstvwxz]/.test(c)){out+="っ";i++;continue;}
    let hit=false;
    for(let L=4;L>=1;L--){const k=s.substr(i,L); if(R2K[k]){out+=R2K[k];i+=L;hit=true;break;}}
    if(!hit){out+=c;i++;}
  }
  return out;
}
function kanaToRomaji(jp){
  return jp.split(/[ 　]+/).map(chunk=>{
    const h=toHira(chunk); let out="",dbl=false;
    const core=h.replace(/[。、？！?!,.「」]+$/,"");
    for(let i=0;i<h.length;i++){
      const c=h[i], two=h.substr(i,2);
      if(c==="っ"){dbl=true;continue;}
      if(c==="ー"){const v=out.match(/[aiueo]$/);out+=v?v[0]:"";continue;}
      let r,step=1;
      if(K2R[two]&&two.length===2){r=K2R[two];step=2;}
      else if(K2R[c]!==undefined){r=K2R[c];}
      else {r={"。":".","、":", ","？":"?","！":"!"}[c]??c;}
      if(c==="ん"&&/^[あいうえおやゆよをへ]/.test(h[i+1]||"")) r="n'";
      // particles: は/へ at end of a chunk (or before も), を
      if(c==="は"&&(i===core.length-1)&&core.length>=1&&!/はは$/.test(core)) r="wa";
      if(c==="へ"&&(i===core.length-1||h[i+1]==="も")&&core.length>1) r="e";
      if(c==="を") r="o";
      if(dbl){r=(r.startsWith("ch")?"t":r[0])+r;dbl=false;}
      out+=r; i+=step-1;
    }
    return out;
  }).join(" ");
}
function norm(s){
  let t=s.normalize("NFKC");
  if(hasLatin(t)) t=romajiToKana(t);
  t=toHira(t).replace(/[\s　。、．，.,？?！!「」『』〜~・…‥]/g,"");
  t=t.replace(/[-－‐−―]/g,"ー");
  t=t.replace(/(.)ー/g,(m,c)=>{const v=(K2R[c]||{"ゃ":"a","ゅ":"u","ょ":"o"}[c]||"").slice(-1);return c+({a:"あ",i:"い",u:"う",e:"え",o:"お"}[v]||"ー");});
  t=t.replace(/([おこそとのほもよろごぞどぼぽょ])う/g,"$1お").replace(/([えけせてねへめれげぜでべぺ])い/g,"$1え");
  t=t.replace(/てぃ/g,"ち").replace(/でぃ/g,"ぢ"); // gõ "ti/di" cho ティ/ディ cũng được
  t=t.replace(/は/g,"わ").replace(/を/g,"お").replace(/へ/g,"え").replace(/でわ/g,"じゃ");
  return t;
}
// đổi câu gõ romaji sang kana để lưu/hiển thị: wa/e/o đứng riêng là trợ từ は/へ/を, từ viết HOA → katakana (TESUTO → テスト, PA-TI- → パーティー)
const toKata=s=>s.replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+0x60));
const PART={wa:"は",e:"へ",o:"を",wo:"を"};
const showKana=s=>hasLatin(s)?s.split(/(\s+)/).map(tok=>{
  if(/^\s*$/.test(tok)||!hasLatin(tok)) return tok;
  const m=tok.match(/^([A-Za-z\-']+)(.*)$/); const w=m?m[1]:tok, rest=m?m[2]:"";
  if(PART[w]) return PART[w]+romajiToKana(rest);
  if(w.length>=2&&w===w.toUpperCase()) return toKata(romajiToKana(w.toLowerCase().replace(/ti/g,"thi").replace(/di/g,"dhi"))).replace(/-/g,"ー")+romajiToKana(rest);
  return romajiToKana(tok);
}).join(""):s;
function pvText(v){v=v.normalize("NFKC"); if(/[À-ỹđĐ]/.test(v.replace(/[āīūēō]/g,""))) return "⚠ Hãy tắt bộ gõ tiếng Việt (Telex/VNI) khi gõ romaji"; return hasLatin(v)?"→ "+showKana(v):"";}

export { K2R_BASE, K2R, YOON, R2K, PUNCT, toHira, hasLatin, romajiToKana, kanaToRomaji, norm, showKana, pvText };
