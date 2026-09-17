(function(){
  'use strict';
  const URL='https://vvduewatugzqlktxbeli.supabase.co';
  const KEY='sb_publishable_eIbk_uxhM4qEofQKoAA3Tw_nqK9yBAd';
  const BUCKET='templates';
  const MANIFEST='manifest.json';
  const db=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,detectSessionInUrl:true,autoRefreshToken:true}});
  const $=id=>document.getElementById(id);
  let selected=null,thumbSelected=null,items=[];

  function msg(s,c=''){const el=$('status');el.className='status '+c;el.textContent=s}
  function loginMsg(s,c=''){const el=$('loginStatus');el.className='status '+c;el.textContent=s}
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function publicUrl(path){return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl}
  function safeName(name){return name.normalize('NFC').replace(/[^a-zA-Z0-9가-힣._-]/g,'_')}
  function isSignedIn(session){return Boolean(session&&session.user)}

  async function getManifest(){
    const {data,error}=await db.storage.from(BUCKET).download(MANIFEST);
    if(error){if(/not found/i.test(error.message||''))return[];throw error}
    const parsed=JSON.parse(await data.text());
    return Array.isArray(parsed)?parsed:[];
  }
  async function saveManifest(next){
    const blob=new Blob([JSON.stringify(next,null,2)],{type:'application/json'});
    const {error}=await db.storage.from(BUCKET).upload(MANIFEST,blob,{contentType:'application/json',upsert:true,cacheControl:'0'});
    if(error)throw error;
  }
  async function uploadBlob(path,blob){
    const {error}=await db.storage.from(BUCKET).upload(path,blob,{contentType:blob.type||'application/octet-stream',upsert:false});
    if(error)throw error;
  }
  function render(){
    $('list').innerHTML=items.length?items.map(x=>`<div class="item" data-id="${esc(x.id)}"><div class="ico">${esc((x.file_type||'O')[0])}</div><div><b>${esc(x.title||x.file_name)}</b><small>${esc(x.file_type||'')} · ${esc(x.category||'미분류')} · v${esc(x.version||'1.0')}</small></div><div class="actions"><a href="${esc(publicUrl(x.file_path))}" target="_blank" rel="noopener">받기</a><button class="del" type="button">삭제</button></div></div>`).join(''):'<div class="empty">등록된 템플릿이 없습니다.</div>';
    document.querySelectorAll('.item .del').forEach(button=>button.addEventListener('click',()=>removeItem(button.closest('.item').dataset.id)));
  }
  async function load(){items=await getManifest();render()}

  $('login').addEventListener('click',async()=>{
    const email=$('email').value.trim().toLowerCase();
    if(!email)return loginMsg('관리자 이메일을 입력하세요.','err');
    $('login').disabled=true;loginMsg('로그인 링크를 보내는 중입니다...');
    const {error}=await db.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+'/admin/',shouldCreateUser:true}});
    if(error)loginMsg('로그인 링크 발송 실패: '+error.message,'err');
    else loginMsg(email+'로 로그인 링크를 보냈습니다. 메일의 링크를 눌러주세요.','ok');
    $('login').disabled=false;
  });
  $('logout').addEventListener('click',async()=>{await db.auth.signOut();location.replace('/admin/')});
  $('file').addEventListener('change',()=>{
    selected=$('file').files&&$('file').files[0];if(!selected)return;
    $('filename').textContent=selected.name;msg('파일 선택됨: '+selected.name,'ok');
    if(!$('title').value)$('title').value=selected.name.replace(/\.[^.]+$/,'');
    const ext=selected.name.split('.').pop().toLowerCase();
    $('type').value=['ppt','pptx'].includes(ext)?'PPT':['doc','docx'].includes(ext)?'WORD':['xls','xlsx'].includes(ext)?'EXCEL':'OTHER';
  });
  $('thumbFile').addEventListener('change',()=>{
    thumbSelected=$('thumbFile').files&&$('thumbFile').files[0];if(!thumbSelected)return;
    $('thumbImg').src=window.URL.createObjectURL(thumbSelected);$('thumbPreview').style.display='block';msg('대표 이미지 선택됨: '+thumbSelected.name,'ok');
  });
  $('upload').addEventListener('click',async()=>{
    if(!selected)return msg('업로드할 파일을 먼저 선택하세요.','err');
    if(!$('title').value.trim())return msg('템플릿명을 입력하세요.','err');
    if(selected.size>52428800)return msg('파일은 50MB 이하만 등록할 수 있습니다.','err');
    $('upload').disabled=true;msg('업로드 중입니다...');
    const stamp=Date.now(),filePath='files/'+stamp+'_'+safeName(selected.name);let thumbPath=null;
    try{
      await uploadBlob(filePath,selected);
      if(thumbSelected){thumbPath='thumbs/'+stamp+'_'+safeName(thumbSelected.name);await uploadBlob(thumbPath,thumbSelected)}
      const entry={id:String(stamp),title:$('title').value.trim(),description:$('description').value.trim(),file_type:$('type').value,category:$('category').value.trim(),version:$('version').value.trim()||'1.0',file_name:selected.name,file_path:filePath,file_size:selected.size,thumbnail_path:thumbPath,created_at:new Date().toISOString()};
      const next=[entry,...await getManifest()];await saveManifest(next);items=next;render();
      msg('등록 완료. 홈페이지에 반영되었습니다.','ok');
      selected=null;thumbSelected=null;$('file').value='';$('thumbFile').value='';$('filename').textContent='파일 선택';$('title').value='';$('description').value='';$('thumbPreview').style.display='none';
    }catch(error){
      const cleanup=[filePath,thumbPath].filter(Boolean);if(cleanup.length)await db.storage.from(BUCKET).remove(cleanup);
      msg('업로드 실패: '+(error.message||error),'err');
    }finally{$('upload').disabled=false}
  });
  async function removeItem(id){
    const item=items.find(x=>String(x.id)===String(id));if(!item||!confirm('"'+item.title+'" 템플릿과 실제 파일을 삭제할까요?'))return;
    try{
      const next=items.filter(x=>String(x.id)!==String(id));await saveManifest(next);
      const paths=[item.file_path,item.thumbnail_path].filter(Boolean);if(paths.length){const {error}=await db.storage.from(BUCKET).remove(paths);if(error)throw error}
      items=next;render();msg('템플릿과 실제 파일을 삭제했습니다.','ok');
    }catch(error){msg('삭제 처리 실패: '+(error.message||error),'err');await load()}
  }
  async function init(){
    const {data:{session}}=await db.auth.getSession();
    if(!isSignedIn(session)){$('loginView').hidden=false;$('adminView').hidden=true;return}
    $('loginView').hidden=true;$('adminView').hidden=false;
    try{await load()}catch(error){msg('목록을 불러오지 못했습니다: '+error.message,'err')}
  }
  db.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_IN'&&isSignedIn(session))init()});
  init();
})();
