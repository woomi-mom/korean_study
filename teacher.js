const SB='https://kkvrthngjbmkkwsqcmbx.supabase.co';
const KEY='sb_publishable_oPqCSUdt9cCNQJYhbAyUzw__4LMAOAX';
const TEACHER='w.mihyeon@gmail.com';
const TEACHER_URL='https://korean-study-lc26.vercel.app/teacher.html';
const client=window.supabase.createClient(SB,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const loginPanel=document.getElementById('loginPanel');
const dashboard=document.getElementById('dashboard');
const googleLogin=document.getElementById('googleLogin');
const signOut=document.getElementById('signOut');
const authMsg=document.getElementById('authMsg');
const sessions=document.getElementById('sessions');

googleLogin.addEventListener('click',async()=>{authMsg.textContent='';const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:TEACHER_URL}});if(error)authMsg.textContent=`Google 로그인 시작 오류: ${error.message}`;});
signOut.addEventListener('click',async()=>{await client.auth.signOut();location.replace(TEACHER_URL);});
async function boot(){const {data:{session},error}=await client.auth.getSession();if(error){authMsg.textContent=`인증 확인 오류: ${error.message}`;return}if(!session)return;const {data:{user},error:userError}=await client.auth.getUser();if(userError||!user){authMsg.textContent='Google 로그인 정보를 확인하지 못했습니다.';return}if((user.email||'').toLowerCase()!==TEACHER){authMsg.textContent=`이 계정(${user.email||'알 수 없음'})은 교사용 대시보드 접근 권한이 없습니다. ${TEACHER} 계정으로 로그인해 주세요.`;await client.auth.signOut();return}loginPanel.hidden=true;dashboard.hidden=false;await load()}
async function load(){const {data:rows,error}=await client.rpc('get_korean_dashboard_web_v2');if(error){sessions.innerHTML=`<section class="panel"><b>결과를 불러오지 못했습니다.</b><p class="help">${esc(error.message)}</p></section>`;return}sessions.innerHTML=rows?.length?rows.map(x=>{const resp=Array.isArray(x.responses)?x.responses:[];return `<section class="panel"><div class="taskhead"><b>${esc(x.family_name||'')}${esc(x.given_name||'')}</b><span>${esc(x.birth_year||'')} · ${esc(x.residence_country||'')} · ${x.completed_at?new Date(x.completed_at).toLocaleString('ko-KR'):''}</span></div>${resp.map(a=>`<div class="teacher-response"><span class="tag">${esc(a.domain||'')}</span><b>${esc(a.prompt||'')}</b><p>${a.paper?'✍️ 종이 작성 — Meet 화면에서 교사가 확인':esc(String(a.response??''))}</p>${a.type==='speech'?'<small>🎙️ 음성 인식문 · 실제 발음/유창성은 교사가 발화를 함께 검토</small>':''}</div>`).join('')}</section>`}).join(''):'<section class="panel">아직 제출된 진단이 없습니다.</section>'}
function esc(v){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}client.auth.onAuthStateChange(event=>{if(event==='SIGNED_IN')setTimeout(boot,0)});boot();