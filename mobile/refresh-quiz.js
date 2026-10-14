// Mobile practice enhancer: real score history, active review flow.
const revGet=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const revSet=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
const revSafe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let revShown={};
function continueLastQuiz(){navigateTo('quiz.html?mode=random')}
function startReview(){navigateTo('quiz.html?mode=wrong')}
function initQuizPage(){
 if(!document.getElementById('quiz-container'))return;
 const mode=new URLSearchParams(location.search).get('mode');
 currentQuizQuestions=mode==='wrong'?revGet('rev_wrong_questions',[]):mockQuizData.slice();
 currentQuestionIndex=0;userAnswers={};revShown={};
 const title=document.getElementById('quiz-title');
 if(title)title.textContent=mode==='wrong'?'错题巩固':'知识练习';
 renderQuizQuestion();updateQuizProgress();
}
function renderQuizQuestion(){
 const el=document.getElementById('quiz-container');if(!el)return;
 const q=currentQuizQuestions[currentQuestionIndex];
 if(!q){
  el.innerHTML='<div class="rev-empty bg-white"><i class="fas fa-circle-check"></i><h3>错题已经清空</h3><p>现在没有需要巩固的题目，来开启新练习吧。</p><button class="rev-btn rev-btn-primary" onclick="navigateTo(&quot;quiz.html?mode=random&quot;)">开始练习</button></div>';
  document.getElementById('quiz-action-bar')?.classList.add('hidden');return;
 }
 const selected=userAnswers[q.id],shown=revShown[q.id]&&quizMode==='immediate';
 const opts=(q.options||[]).map((option,index)=>{
  const key=String.fromCharCode(65+index);
  const correct=shown&&key===q.correct,bad=shown&&selected===key&&key!==q.correct;
  const cls=correct?'bg-green-50 border-green-300':bad?'bg-red-50 border-red-300':selected===key?'bg-blue-50 border-indigo-300':'bg-white border-gray-100';
  return '<button class="w-full text-left p-4 rounded-xl border flex items-center gap-3 '+cls+'" onclick="selectOption('+Number(q.id)+',&quot;'+key+'&quot;)"><span class="w-8 h-8 rounded-lg bg-white border border-gray-100 shrink-0 grid place-items-center font-bold text-xs">'+key+'</span><span class="text-sm text-gray-700">'+revSafe(option)+'</span></button>';
 }).join('');
 const explain=shown?'<div class="rev-answer-explain" role="status"><strong>'+(selected===q.correct?'回答正确':'正确答案：'+revSafe(q.correct))+'</strong><p>'+revSafe(q.explain||'请重新回顾这一知识点。')+'</p></div>':'';
 el.innerHTML='<div class="bg-white rounded-xl shadow-sm"><div class="flex justify-between items-center"><span class="rev-pill">'+revSafe(q.type)+'</span><span class="rev-muted">'+(currentQuestionIndex+1)+' / '+currentQuizQuestions.length+'</span></div><h3>'+revSafe(q.title)+'</h3><div class="space-y-3">'+opts+'</div>'+explain+'</div>';
 const prev=document.getElementById('prev-btn'),action=document.getElementById('action-btn');
 if(prev)prev.disabled=currentQuestionIndex===0;
 if(action){action.disabled=!selected;action.classList.toggle('opacity-50',!selected);action.textContent=selected&&!shown&&quizMode==='immediate'?'查看解析':currentQuestionIndex===currentQuizQuestions.length-1?'完成练习':'下一题'}
}
function selectOption(id,value){if(revShown[id]&&quizMode==='immediate')return;userAnswers[id]=value;renderQuizQuestion()}
function handleAction(){
 const q=currentQuizQuestions[currentQuestionIndex];if(!q||!userAnswers[q.id])return;
 if(quizMode==='immediate'&&!revShown[q.id]){revShown[q.id]=true;renderQuizQuestion();return}
 if(currentQuestionIndex===currentQuizQuestions.length-1){submitQuiz();return}
 currentQuestionIndex++;renderQuizQuestion();updateQuizProgress()
}
function updateQuizProgress(){
 const total=currentQuizQuestions.length,i=currentQuestionIndex+1;
 const el=document.getElementById('quiz-progress');if(el)el.textContent=total?i+'/'+total:'0/0';
 const track=document.getElementById('rev-quiz-progress-bar');if(track)track.style.width=(total?i/total*100:0)+'%'
}
function submitQuiz(){
 const answered=currentQuizQuestions.filter(q=>userAnswers[q.id]);if(!answered.length)return;
 const correct=answered.filter(q=>userAnswers[q.id]===q.correct).length;
 const misses=new Map(revGet('rev_wrong_questions',[]).map(q=>[String(q.id),q]));
 answered.forEach(q=>userAnswers[q.id]===q.correct?misses.delete(String(q.id)):misses.set(String(q.id),q));
 revSet('rev_wrong_questions',[...misses.values()]);
 const records=revGet('rev_practice_history',[]);
 records.push({date:new Date().toLocaleDateString('en-CA'),total:answered.length,correct});
 revSet('rev_practice_history',records);
 document.getElementById('quiz-container').classList.add('hidden');
 document.getElementById('quiz-action-bar').classList.add('hidden');
 document.getElementById('quiz-overview').classList.remove('hidden');
 document.getElementById('score-display').textContent=Math.round(correct/answered.length*100);
 document.getElementById('total-count').textContent=answered.length;
 document.getElementById('correct-count').textContent=correct;
 document.getElementById('overview-grid').innerHTML=answered.map((q,i)=>'<div class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold '+(userAnswers[q.id]===q.correct?'bg-green-100 text-green-700':'bg-red-100 text-red-700')+'">'+(i+1)+'</div>').join('')
}
function restartQuiz(){
 const mode=new URLSearchParams(location.search).get('mode');
 currentQuizQuestions=mode==='wrong'?revGet('rev_wrong_questions',[]):mockQuizData.slice();
 userAnswers={};currentQuestionIndex=0;revShown={};
 document.getElementById('quiz-overview').classList.add('hidden');
 document.getElementById('quiz-container').classList.remove('hidden');
 document.getElementById('quiz-action-bar').classList.remove('hidden');
 renderQuizQuestion();updateQuizProgress();
}
function changeQuizMode(mode){quizMode=mode;revShown={};renderQuizQuestion()}
function prevQuestion(){if(currentQuestionIndex>0){currentQuestionIndex--;renderQuizQuestion();updateQuizProgress()}}
