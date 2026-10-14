/* Learning dashboard with real, local prototype state. */
(function(){
const get=(k,f)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch{return f}};
const set=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>new Date().toLocaleDateString('en-CA');
const history=()=>get('rev_practice_history',[]);
const plan=()=>get('rev_daily_goal',10);
const flatten=(nodes,out=[])=>{(nodes||[]).forEach(n=>{out.push(n);flatten(n.children,out)});return out};
const topics=()=>flatten(typeof knowledgeTreeData!=='undefined'?knowledgeTreeData:[]);
const records=()=>history();
const doneToday=()=>history().filter(h=>h.date===today()).reduce((n,h)=>n+h.total,0);
const accuracy=()=>{const h=history(),total=h.reduce((n,v)=>n+v.total,0);return total?Math.round(h.reduce((n,v)=>n+v.correct,0)*100/total):0};
function reviewCount(){return get('rev_wrong_questions',[]).length}
function renderHome(){
const mount=document.getElementById('rev-dashboard');
if(!mount)return;
const all=topics(),total=all.reduce((n,t)=>n+(t.children?.length?0:(t.total||0)),0);
const practiced=all.reduce((n,t)=>n+(t.children?.length?0:(t.practice||0)),0);
const done=doneToday(),goal=plan(),remaining=Math.max(0,goal-done),wrong=reviewCount();
const notes=typeof mockNotes!=='undefined'?mockNotes:[];
const todayLabel=new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric',weekday:'long'}).format(new Date());
const preferred=['Vue.js','JavaScript','前端基础'];
const top=all.filter(t=>t.children?.length&&t.level===1).sort((a,b)=>preferred.indexOf(a.title)-preferred.indexOf(b.title)).slice(0,3);
const next=history().slice(-1)[0];
mount.innerHTML=`
 <div class="rev-greeting" style="margin-bottom:22px">
  <div><div class="rev-eyebrow">YOUR LEARNING SPACE</div><h2 style="margin-top:6px">专注一点，每天进步一点 ✨</h2>
  <p class="rev-muted" style="margin-top:5px">把知识变成自己的能力，从今天的练习开始。</p></div>
  <div class="rev-logo" aria-hidden="true"><i class="fas fa-sparkles"></i></div>
 </div>
 <div class="rev-layout"><div class="rev-maincol">
  <section class="rev-plan" aria-label="今日学习计划">
   <div class="rev-plan-top"><div><div class="rev-eyebrow">TODAY'S PLAN · ${esc(todayLabel)}</div>
    <h2>${remaining===0?'今日目标已达成！':'今天，来完成 '+remaining+' 道题'}</h2>
    <p class="rev-plan-sub">小步积累，稳定复习，让知识记得更牢。</p></div>
    <span style="font-size:32px;opacity:.85"><i class="fas fa-bolt"></i></span></div>
   <div class="rev-plan-stats"><div class="rev-plan-stat"><strong>${done}</strong><small>今日已练</small></div>
    <div class="rev-plan-stat"><strong>${goal}</strong><small>每日目标 <button onclick="RevLearning.changeGoal()" aria-label="调整每日目标" style="background:none;border:none;color:white;cursor:pointer">✎</button></small></div>
    <div class="rev-plan-stat"><strong>${wrong}</strong><small>待巩固错题</small></div></div>
   <div class="rev-progress" role="progressbar" aria-valuenow="${Math.min(done,goal)}" aria-valuemin="0" aria-valuemax="${goal}" aria-label="今日目标进度"><span style="width:${Math.min(100,done/goal*100)}%"></span></div>
   <div class="rev-plan-action"><button class="rev-btn rev-btn-primary" onclick="RevLearning.go('random')"><i class="fas fa-play"></i> 开始今日练习</button>
    <button class="rev-btn rev-btn-soft" onclick="RevLearning.go('wrong')"><i class="fas fa-redo"></i> 巩固错题</button></div>
  </section>
  <section class="rev-card"><div class="rev-card-head"><h3>选择学习方式</h3><span class="rev-pill">自由练习</span></div>
   <div class="rev-modes">
    <button class="rev-mode" onclick="RevLearning.go('random')"><span class="rev-icon lilac"><i class="fas fa-shuffle"></i></span><span><strong>随机刷题</strong><small>随时检测知识点</small></span></button>
    <button class="rev-mode" onclick="RevLearning.go('wrong')"><span class="rev-icon orange"><i class="fas fa-rotate"></i></span><span><strong>错题巩固</strong><small>${wrong} 道需要回顾</small></span></button>
    <button class="rev-mode" onclick="navigateTo('knowledge.html')"><span class="rev-icon mint"><i class="fas fa-layer-group"></i></span><span><strong>专项练习</strong><small>按知识点精准训练</small></span></button>
    <button class="rev-mode" onclick="navigateTo('note.html?action=create')"><span class="rev-icon blue"><i class="fas fa-wand-magic-sparkles"></i></span><span><strong>笔记出题</strong><small>从笔记到主动记忆</small></span></button>
   </div>
  </section>
  <section class="rev-card"><div class="rev-card-head"><h3>你的知识地图</h3><button class="rev-link" onclick="navigateTo('knowledge.html')">查看知识体系 <i class="fas fa-arrow-right"></i></button></div>
   ${top.map(t=>{const leaves=flatten([t]).filter(v=>!v.children?.length),sum=leaves.reduce((n,v)=>n+(v.total||0),0),num=leaves.reduce((n,v)=>n+(v.practice||0),0),pct=sum?Math.min(100,Math.round(num/sum*100)):0;return `<div class="rev-topic" onclick="navigateTo('knowledge.html')"><div class="rev-topic-icon"><i class="fas fa-book-open"></i></div><div class="rev-topic-text"><div class="rev-topic-title">${esc(t.title)}</div><div class="rev-topic-sub">${num}/${sum} 道已练 · ${pct}%</div><div class="rev-mini-progress"><span style="width:${pct}%"></span></div></div><i class="fas fa-chevron-right rev-next"></i></div>`}).join('')||'<p class="rev-muted">还没有知识分类，可以先创建一棵知识树。</p>'}
  </section>
 </div><div class="rev-sidecol">
  <section class="rev-card"><div class="rev-card-head"><h3>学习数据</h3><span class="rev-pill">累计统计</span></div>
   <div class="rev-kpi"><div><strong>${records().reduce((n,h)=>n+h.total,0)}</strong><small>累计答题</small></div>
    <div><strong>${accuracy()}%</strong><small>正确率</small></div><div><strong>${notes.length}</strong><small>学习笔记</small></div></div>
   <p class="rev-muted" style="margin-top:14px">${records().length?'每次练习都会计入数据，继续保持！':'完成第一组练习后，这里会显示你的真实学习结果。'}</p>
  </section>
  ${next?`<section class="rev-highlight" onclick="RevLearning.go('random')"><div class="rev-icon mint"><i class="fas fa-arrow-rotate-right"></i></div><div style="flex:1"><strong>再来一组，巩固记忆</strong><small>上次 ${next.total} 道 · 答对 ${next.correct} 道</small></div><i class="fas fa-chevron-right" style="color:#9db8ad"></i></section>`:
  `<section class="rev-highlight" onclick="RevLearning.go('random')"><div class="rev-icon mint"><i class="fas fa-seedling"></i></div><div style="flex:1"><strong>开始你的第一组练习</strong><small>从 3 道入门题开始，轻松进入学习状态</small></div><i class="fas fa-chevron-right" style="color:#9db8ad"></i></section>`}
  <section class="rev-card"><div class="rev-card-head"><h3>最近的笔记</h3><button class="rev-link" onclick="navigateTo('note.html')">全部笔记 <i class="fas fa-arrow-right"></i></button></div>
   ${notes.slice(0,3).map(n=>`<div class="rev-note" onclick="navigateTo('note.html')"><strong>${esc(n.title)}</strong><small>${esc(n.tag||'未分类')} · ${esc(n.date||'')}</small></div>`).join('')||'<p class="rev-muted">新建一篇笔记，开始积累知识。</p>'}
   <button class="rev-btn rev-btn-soft" style="width:100%;margin-top:15px" onclick="navigateTo('note.html?action=create')"><i class="fas fa-plus"></i> 写一篇笔记</button>
  </section>
  <section class="rev-card"><div class="rev-card-head"><h3>学习小提示</h3><i class="fas fa-lightbulb" style="color:#eab66a"></i></div>
   <p class="rev-muted">练习后优先回顾做错的题目，再尝试不看解析独立作答，记忆会更加牢固。</p>
  </section>
 </div></div>`;
}
function go(mode){window.location.href='quiz.html?mode='+encodeURIComponent(mode)}
function changeGoal(){const value=prompt('设置每天要完成多少道题（1–200）',plan());if(value===null)return;const n=Number(value);if(!Number.isInteger(n)||n<1||n>200){alert('请输入 1 到 200 的整数');return}set('rev_daily_goal',n);renderHome()}
window.RevLearning={renderHome,go,changeGoal,history,reviewCount,esc};
document.addEventListener('DOMContentLoaded',()=>{if(document.getElementById('rev-dashboard'))renderHome();
if(document.getElementById('quizCurveChart')){const node=document.getElementById('rev-profile-counts');if(node)node.innerHTML=`<span>${records().reduce((a,b)=>a+b.total,0)} 道累计答题</span> · <span>${accuracy()}% 正确率</span> · <span>${reviewCount()} 道待巩固</span>`}});
})();
