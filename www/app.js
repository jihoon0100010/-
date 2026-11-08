const ADMIN='admin-master-key',$=id=>document.getElementById(id),app=$('app');
const st=(k,v)=>{try{if(v===undefined){const s=localStorage.getItem(k);return s?JSON.parse(s):null}v===null?localStorage.removeItem(k):localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}};
const keys=()=>st('ism_keys')||['ismarter-2026'];
let prog=st('ism_prog')||{learned:{},box:{}};
const save=()=>st('ism_prog',prog);
const CATS=[['idiom','사자성어'],['proverb','속담'],['school','교과서'],['box','보관함']];
let S={cat:'idiom',grade:3},CS={},Q={};
const all=c=>DATA[c].map(a=>({id:c+':'+a[0],cat:c,w:a[0],h:a[1],m:a[2],g:a[3],s:a[4]}));
const pool=()=>{
  if(S.cat==='box')return ['idiom','proverb','school'].flatMap(all).filter(x=>prog.box[x.id]);
  return all(S.cat).filter(x=>x.g===S.grade);
};
const shuffle=a=>a.map(v=>[Math.random(),v]).sort((p,q)=>p[0]-q[0]).map(p=>p[1]);

function login(){
  app.innerHTML=`<div class="wrap"><div class="card c"><h2>아이스마터</h2><p>발급받은 라이선스 키를 입력하세요.</p><input id="k" placeholder="라이선스 키 입력" autocomplete="off"><button id="go">입력하고 시작하기</button></div></div>`;
  $('go').onclick=()=>{
    const k=$('k').value.trim();
    if(!k)return alert('라이선스 키를 입력하세요.');
    if(k===ADMIN){st('ism_role','admin');admin()}
    else if(keys().includes(k)){st('ism_role','user');home()}
    else alert('유효하지 않은 키입니다. 키를 다시 확인하세요.');
  };
}
function logout(){st('ism_role',null);login()}
function admin(){
  app.innerHTML=`<div class="wrap"><div class="card"><h2 class="ac">관리자 모드</h2><p>키 발급 및 관리 패널</p><button onclick="mk()">새 키 발급</button><button class="g" onclick="home()">학습 화면 보기</button></div><div class="card"><h3>발급된 키</h3>${keys().map((k,i)=>`<div class="kr"><span>${k}</span><button class="g s" onclick="dk(${i})">삭제</button></div>`).join('')}</div><button class="g" onclick="logout()">로그아웃</button></div>`;
}
function mk(){
  const c='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';
  for(let i=0;i<8;i++){s+=c[Math.floor(Math.random()*c.length)];if(i===3)s+='-'}
  st('ism_keys',[...keys(),'ISM-'+s]);admin();
}
function dk(i){const a=keys();a.splice(i,1);st('ism_keys',a);admin()}

function home(){
  const l=pool(),done=l.filter(x=>prog.learned[x.id]).length,box=Object.keys(prog.box).length;
  app.innerHTML=`<div class="wrap"><div class="tabs">${CATS.map(c=>`<button class="${S.cat===c[0]?'on':''}" onclick="S.cat='${c[0]}';home()">${c[1]}${c[0]==='box'?' '+box:''}</button>`).join('')}</div>
  ${S.cat==='box'?'':`<div class="chips">${[3,4,5,6].map(g=>`<button class="${S.grade===g?'on':''}" onclick="S.grade=${g};home()">${g}학년</button>`).join('')}</div>`}
  <p class="pg">학습 ${done} / ${l.length}</p>
  ${l.length?`<button class="q" onclick="startQuiz()">퀴즈 풀기 (${Math.min(20,l.length)}문제)</button><div class="grid">${l.map((x,i)=>`<div class="it" onclick="study(${i})">${prog.learned[x.id]?'<b class="bd">학습함</b>':''}<div class="iw">${x.w}</div><div class="ih">${x.h||x.s||''}</div></div>`).join('')}</div>`:`<p class="em">${S.cat==='box'?'몰라요를 누르거나 퀴즈에서 틀린 낱말이 여기에 모여요.':'아직 낱말이 없어요.'}</p>`}
  ${st('ism_role')==='admin'?'<button class="g" onclick="admin()">관리자 화면으로</button>':''}<button class="g" onclick="logout()">로그아웃</button></div>`;
}

function study(i){CS={l:pool(),i,f:false};card()}
function card(){
  const x=CS.l[CS.i];if(!x)return home();
  app.innerHTML=`<div class="wrap"><div class="top"><button class="g s" onclick="home()">닫기</button><span>${CS.i+1} / ${CS.l.length}</span></div><div class="card fl" onclick="CS.f=!CS.f;card()">${CS.f?`<div class="m">${x.m}</div>`:`<div class="w">${x.w}</div><div class="h">${x.h||''}</div>`}<div class="ht">카드를 누르면 ${CS.f?'낱말이':'뜻이'} 보여요</div></div><div class="row"><button class="no" onclick="mark(0)">몰라요</button><button class="ok" onclick="mark(1)">알아요</button></div></div>`;
}
function mark(k){
  const x=CS.l[CS.i];
  if(k){prog.learned[x.id]=1;delete prog.box[x.id]}else prog.box[x.id]=1;
  save();CS.i++;CS.f=false;CS.i>=CS.l.length?home():card();
}

const CHO='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const cho=w=>[...w].map(c=>{const n=c.charCodeAt(0)-44032;return n>=0&&n<11172?CHO[Math.floor(n/588)]:c}).join('');
function startQuiz(){Q={l:shuffle(pool()).slice(0,20),i:0,s:0};ask()}
function ask(){
  if(Q.i>=Q.l.length)return result();
  const x=Q.l[Q.i],short=x.w.length<=6&&!x.w.includes(' '),t=short?['c','b','t'][Q.i%3]:'c';
  const others=shuffle(all(x.cat).filter(y=>y.w!==x.w)).slice(0,3);
  Q.x=x;Q.done=0;let head='',body='';
  if(t==='c'){Q.ans=x.w;Q.opts=shuffle([x.w,...others.map(y=>y.w)]);head='뜻풀이에 알맞은 낱말을 고르세요';body=`<h3>${x.m}</h3>`}
  if(t==='b'){
    const p=Math.floor(Math.random()*x.w.length);Q.ans=x.w[p];
    const ch=[...new Set(others.map(y=>y.w[Math.floor(Math.random()*y.w.length)]))].filter(c=>c!==Q.ans);
    Q.opts=shuffle([Q.ans,...ch]);head='빈칸에 들어갈 글자를 고르세요';
    body=`<h3>${x.w.slice(0,p)}<u>＿</u>${x.w.slice(p+1)}</h3><p>${x.m}</p>`;
  }
  if(t==='t'){Q.ans=x.w;head='초성을 보고 낱말을 쓰세요';body=`<h3>${x.m}</h3><div class="ch">${cho(x.w)}</div><input id="ti" autocomplete="off" placeholder="정답 입력"><button onclick="sub()">확인</button>`}
  app.innerHTML=`<div class="wrap"><div class="top"><span>${Q.i+1} / ${Q.l.length}</span><span>⭐ ${Q.s}점</span></div><div class="card"><p>${head}</p>${body}</div>${t==='t'?'':Q.opts.map((o,n)=>`<button class="op" id="o${n}" onclick="pick(${n})">${o}</button>`).join('')}<button class="g" onclick="home()">그만하기</button></div>`;
}
function fin(ok){
  if(Q.done)return;Q.done=1;
  if(ok)Q.s++;else prog.box[Q.x.id]=1;
  save();setTimeout(()=>{Q.i++;ask()},1000);
}
function pick(n){
  if(Q.done)return;
  document.querySelectorAll('.op').forEach((b,m)=>{if(Q.opts[m]===Q.ans)b.classList.add('right')});
  const ok=Q.opts[n]===Q.ans;if(!ok)$('o'+n).classList.add('wrong');fin(ok);
}
function sub(){
  if(Q.done)return;
  const ok=$('ti').value.replace(/\s/g,'')===Q.ans.replace(/\s/g,'');
  app.querySelector('.card').insertAdjacentHTML('beforeend',`<p class="${ok?'rt':'wr'}">${ok?'정답!':'정답: '+Q.ans}</p>`);fin(ok);
}
function result(){
  app.innerHTML=`<div class="wrap"><div class="card c"><p>퀴즈 결과</p><div class="sc">${Q.s} / ${Q.l.length}</div><p>틀린 낱말은 보관함에 저장됐어요.</p><button onclick="startQuiz()">다시 풀기</button><button class="g" onclick="home()">목록으로</button></div></div>`;
}
const r=st('ism_role');r==='admin'?admin():r?home():login();
