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

/* 是否东四命（坎1 离9 震3 巽4） */
function isEast(n){return EAST.indexOf(n)>=0;}
