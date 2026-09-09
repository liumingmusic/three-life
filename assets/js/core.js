/* ==========================================================
   core.js —— 算法核心（纯函数，无 DOM 依赖）
   ========================================================== */

/* 数字根：各位反复相加至个位。1–9 循环，0 视作 9。 */
function digitRoot(n){
  n=Math.abs(Math.floor(n));
  return n===0?9:((n-1)%9)+1;
}

/* 三元命通用公式（v4 定稿）
   ─────────────────────────────────────────────
   取公元年份数字根 d：
     男命 = 11 − d
     女命 = 4  + d
   结果归一到 1–9；遇 5（中宫无卦）男寄坤 2、女寄艮 8。

   ⚠️ 不要用「年后两位」的写法（100 − YY / YY − 4）：
      那只等价于 1900 年代（因 dr(1900)=1），跨 1999→2000 会断裂
      ——1999 与 2000 会算出同一个卦，而正确结果应连续递减。
      本式对 1900 / 2000 年代一律通用，跨世纪不重置。

   流年卦与本命卦同用此式：把流年当作「另一个人」起卦，故依本人性别而分。 */
function calc(y,sex){
  const d=digitRoot(y);
  let n=sex==='male'?(11-d):(4+d);
  n=((n-1)%9+9)%9+1;
  if(n===5)n=sex==='male'?2:8;
  return n;
}

/* 年份 → 命卦 */
function guaOf(y,sex){return GUA[calc(y,sex)];}

/* 玄空年飞星入中星 = 11 − 年份数字根（≡ 男命原值），逐年逆行 */
function yearStar(y){return ((10-digitRoot(y))%9)+1;}

/* 两卦之间的磁场关系；同卦为伏位 */
function relation(a,b){
  if(a===b)return '伏位';
  const r=REL[a];
  for(const k in r)if(r[k]===b)return k;
  return null;
}

/* 两卦之间的变爻位（自下而上 1 初爻 / 2 二爻 / 3 三爻），返回如 '13'。
   用于解释磁场关系的生成之理，与 YAO_REL 歌诀表互为校验。 */
function changedYao(a,b){
  const ya=YAO[a],yb=YAO[b];
  if(!ya||!yb)return '';
  let s='';
  for(let k=0;k<3;k++) if(ya[k]!==yb[k]) s+=(k+1);
  return s;
}

/* 变爻位 → 关系（歌诀）。与 relation() 结果应恒等 */
function relByYao(a,b){return YAO_REL[changedYao(a,b)];}

/* 变爻的文字表述，如「初爻、三爻变（上下）」 */
function yaoDesc(a,b){
  const c=changedYao(a,b);
  if(!c)return '三爻皆同，无所变化';
  const names=[];
  for(const ch of c)names.push(YAO_POS[ch]);
  const tail=(c==='13')?'（上下）':(c==='12')?'（初二）':(c==='23')?'（二三）':(c==='123')?'（全变）':'';
  return names.join('、')+'变'+tail;
}

/* 是否东四命（坎1 离9 震3 巽4） */
function isEast(n){return EAST.indexOf(n)>=0;}
