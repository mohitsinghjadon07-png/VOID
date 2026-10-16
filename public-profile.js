(() => {
  'use strict';
  const $ = (s, r=document) => r.querySelector(s);
  const status = $('#publicProfileStatus');
  const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
  const num = (v) => Number(v||0).toLocaleString();
  function text(parent,tag,cls,value){const el=document.createElement(tag);if(cls)el.className=cls;el.textContent=value==null?'':String(value);parent.appendChild(el);return el;}
  function formatDate(date){const d=new Date(date||0);return Number.isFinite(d.getTime())?d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'Unknown';}
  function card(repo,index,featured=false){
    const a=document.createElement('a');a.className=`project-card${featured?' project-featured':''}`;a.href=repo.html_url;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('data-reveal','project-card');
    const top=text(a,'div','project-card-top','');text(top,'span','project-number',`${String(index+1).padStart(2,'0')} / ${(repo.language||'REPOSITORY').toUpperCase()}`);const state=text(top,'span',`project-state${repo.archived?' project-state-muted':''}`,repo.archived?'ARCHIVED':repo.fork?'FORK':'PUBLIC BUILD');if(!repo.archived&&!repo.fork){const dot=document.createElement('i');state.prepend(dot);}
    const art=text(a,'div',`project-art art-dynamic art-tone-${index%4}`,'');art.setAttribute('aria-hidden','true');text(art,'span','dynamic-art-label',(repo.language||'PUBLIC REPOSITORY').toUpperCase());const orbit=document.createElement('div');orbit.className='dynamic-orbit';art.appendChild(orbit);const symbol=text(art,'div','dynamic-symbol','');text(symbol,'span','',String(repo.name||'GH').split(/[-_\s.]+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'GH');const metrics=text(art,'div','dynamic-metrics','');text(metrics,'span','',`★ ${Number(repo.stargazers_count||0)}`);text(metrics,'span','',`⑂ ${Number(repo.forks_count||0)}`);text(art,'span','dynamic-art-index',`REPO / ${String(index+1).padStart(2,'0')}`);const scan=document.createElement('div');scan.className='dynamic-scan';art.appendChild(scan);
    const info=text(a,'div','project-info',''), copy=text(info,'div','','');text(copy,'span','project-type',(repo.language||'PUBLIC REPOSITORY').toUpperCase());text(copy,'h3','',repo.name);text(copy,'p','',repo.description||'No description added yet. Open this repository to explore the code and project history.');const tags=text(copy,'div','tag-row','');if(repo.language)text(tags,'span','',repo.language);(repo.topics||[]).slice(0,3).forEach(x=>text(tags,'span','',x));const meta=text(copy,'div','repo-meta-row','');text(meta,'span','','★ '+Number(repo.stargazers_count||0));text(meta,'span','','⑂ '+Number(repo.forks_count||0));text(meta,'span','',`UPDATED ${formatDate(repo.updated_at)}`);text(info,'span','project-open','↗');return a;
  }
  function archiveRow(repo,index){const a=document.createElement('a');a.href=repo.html_url;a.target='_blank';a.rel='noopener noreferrer';a.className='repo-row';text(a,'span','repo-index',String(index+1).padStart(2,'0'));text(a,'span','repo-name',repo.name);text(a,'span','repo-description',repo.description||`${repo.language||'Public repository'} · UPDATED ${formatDate(repo.updated_at)}`);text(a,'span','repo-arrow','↗');return a;}
  async function init(){
    const voidId=new URLSearchParams(location.search).get('id')||'';
    if(!/^[A-Za-z0-9_-]{3,32}$/.test(voidId)){status.textContent='This profile link is incomplete. Use profile.html?id=VOID_ID.';return;}
    const config=window.VOID_CONFIG||{};
    if(!config.supabaseUrl||!config.supabasePublishableKey||config.supabaseUrl.includes('PASTE_')||!window.supabase?.createClient){status.textContent='Profile lookup needs the Supabase URL and public key in supabase-config.js.';return;}
    try{
      const client=window.supabase.createClient(config.supabaseUrl,config.supabasePublishableKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
      const {data,error}=await client.rpc('void_public_profile_by_username',{input_username:voidId});
      if(error)throw new Error('Profile lookup is not configured yet. Run supabase-setup/void-multiuser-upgrade.sql in Supabase.');
      const profile=Array.isArray(data)?data[0]:data;
      if(!profile){status.textContent='No public VOID profile was found for this ID. The user may have disabled profile discovery.';return;}
      const cover=$('#publicProfileCover');cover.hidden=false;status.hidden=true;
      $('#publicDisplayName').textContent=profile.display_name||profile.void_id;$('#publicVoidId').textContent='VOID ID / '+profile.void_id;
      $('#publicBio').textContent=profile.bio||'A VOID builder. No bio added yet.';
      if(!profile.github_username){$('#publicGithubId').textContent='GitHub / NOT LINKED';$('#publicGithubLink').hidden=true;$('#publicProjects').hidden=true;$('#publicBio').textContent=(profile.bio||'')+' This user has not connected a GitHub username yet.';return;}
      $('#publicGithubId').textContent='GITHUB / @'+profile.github_username;
      const ghLink=`https://github.com/${encodeURIComponent(profile.github_username)}`;$('#publicGithubLink').href=ghLink;$('#publicFooterGithub').href=ghLink;
      try {
        const bundle=await window.VOIDGitHub.getBundle(profile.github_username);
        $('#publicAvatar').src=bundle.profile.avatar_url||'';$('#publicAvatar').alt=`${bundle.profile.login} GitHub avatar`;
        const stats=$('#publicStats');stats.replaceChildren();
        [[num(bundle.profile.public_repos),'PUBLIC REPOS'],[num(bundle.profile.followers),'FOLLOWERS'],[num(bundle.profile.following),'FOLLOWING'],[formatDate(bundle.profile.created_at),'ON GITHUB SINCE']].forEach(([v,k])=>text(stats,'span','',`${v} / ${k}`));
        const projects=$('#publicProjects');projects.hidden=false;
        $('#publicProjectsTitle').textContent=`${bundle.profile.name||bundle.profile.login} — public work.`;
        const note=$('#publicProjectsNote');note.textContent=`Sorted by latest repository activity · updated ${new Date(bundle.fetchedAt||Date.now()).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}${bundle.stale?' · showing cached data':''}${bundle.truncated?' · latest '+bundle.repositories.length+' repositories shown':''}.`;
        const grid=$('#publicProjectGrid'),list=$('#publicRepoList');grid.replaceChildren();list.replaceChildren();
        bundle.repositories.slice(0,6).forEach((repo,i)=>grid.appendChild(card(repo,i,i===0)));
        bundle.repositories.slice(6).forEach((repo,i)=>list.appendChild(archiveRow(repo,i+6)));
        if(!bundle.repositories.length)grid.appendChild(text(grid,'div','empty-state','No public repositories were found for this GitHub account.'));
      }catch(error){$('#publicProjects').hidden=false;$('#publicProjectsNote').textContent=error.message||'GitHub could not be reached.';}
    }catch(error){status.textContent=error.message||'Could not load this VOID profile.';}
  }
  // Small canvas constellation, matching VOID's existing motion language.
  function startAmbient(){
    const canvas=$('#constellation');if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let w=0,h=0,nodes=[],raf=0;
    function resize(){w=innerWidth;h=innerHeight;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);nodes=Array.from({length:Math.max(16,Math.min(48,Math.round(w*h*.000025)))},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.14,vy:(Math.random()-.5)*.14}));draw();}
    function draw(){ctx.clearRect(0,0,w,h);nodes.forEach((p,i)=>{if(!reduced){p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=w;if(p.x>w)p.x=0;if(p.y<0)p.y=h;if(p.y>h)p.y=0;}for(let j=i+1;j<nodes.length;j++){const q=nodes[j],d=Math.hypot(p.x-q.x,p.y-q.y);if(d<125){ctx.strokeStyle=`rgba(177,126,255,${(1-d/125)*.16})`;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}}ctx.fillStyle='rgba(204,173,255,.65)';ctx.beginPath();ctx.arc(p.x,p.y,1,0,Math.PI*2);ctx.fill();});if(!reduced)raf=requestAnimationFrame(draw);}
    addEventListener('resize',()=>{cancelAnimationFrame(raf);resize();});resize();
    const aura=$('#cursorAura');if(!matchMedia('(pointer:coarse)').matches&&aura)addEventListener('pointermove',e=>{aura.style.left=e.clientX+'px';aura.style.top=e.clientY+'px';aura.style.opacity='.68';},{passive:true});
    addEventListener('scroll',()=>{const max=Math.max(1,document.documentElement.scrollHeight-innerHeight),v=scrollY/max;$('#scrollProgress span').style.transform=`scaleX(${clamp(v,0,1)})`;},{passive:true});
  }
  startAmbient();init();
})();
