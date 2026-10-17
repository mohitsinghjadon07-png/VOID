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
    const voidId = new URLSearchParams(location.search).get('id') || '';
    if (!/^[A-Za-z0-9_-]{3,39}$/.test(voidId)) {
      status.textContent = 'Enter a valid VOID ID or GitHub username in the profile link.';
      return;
    }

    const config = window.VOID_CONFIG || {};
    let profile = null;
    let bundle = null;
    let lookupProblem = '';

    // Try a registered VOID profile first. If this ID is a GitHub username,
    // or the profile RPC is unavailable, fall back to GitHub's public API.
    if (config.supabaseUrl && config.supabasePublishableKey &&
        !config.supabaseUrl.includes('PASTE_') && window.supabase?.createClient) {
      try {
        const client = window.supabase.createClient(
          config.supabaseUrl, config.supabasePublishableKey,
          {auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}
        );
        const {data,error} = await client.rpc('void_public_profile_by_username', {input_username:voidId});
        if (error) lookupProblem = error.message || 'VOID profile lookup is unavailable.';
        else profile = Array.isArray(data) ? data[0] : data;
      } catch (error) {
        lookupProblem = error?.message || 'VOID profile lookup is unavailable.';
      }
    } else {
      lookupProblem = 'VOID profile lookup is not configured; trying the public GitHub profile instead.';
    }

    if (!profile) {
      try {
        bundle = await window.VOIDGitHub.getBundle(voidId);
        profile = {
          void_id: bundle.profile.login,
          display_name: bundle.profile.name || bundle.profile.login,
          bio: bundle.profile.bio || '',
          github_username: bundle.profile.login
        };
      } catch (error) {
        status.textContent = 'No public VOID profile or GitHub account was found for "' + voidId + '". Check the ID and make sure public profile discovery is enabled.';
        return;
      }
    }

    const cover = $('#publicProfileCover');
    cover.hidden = false;
    status.hidden = true;
    $('#publicDisplayName').textContent = profile.display_name || profile.void_id || voidId;
    $('#publicVoidId').textContent = 'VOID ID / ' + (profile.void_id || voidId);
    $('#publicBio').textContent = profile.bio || 'A builder on the internet. No bio added yet.';

    let githubUsername = profile.github_username || '';
    if (!bundle && githubUsername) {
      try {
        bundle = await window.VOIDGitHub.getBundle(githubUsername);
      } catch (error) {
        lookupProblem = error?.message || 'GitHub profile data could not be loaded.';
      }
    }
    // If the VOID account has no GitHub username saved, try the searched ID.
    if (!bundle && !githubUsername) {
      try {
        bundle = await window.VOIDGitHub.getBundle(voidId);
        githubUsername = bundle.profile.login;
      } catch (error) {
        lookupProblem = error?.message || lookupProblem;
      }
    }

    const githubLink = $('#publicGithubLink');
    const footerGithub = $('#publicFooterGithub');
    const projects = $('#publicProjects');
    projects.hidden = false;

    if (bundle) {
      githubUsername = bundle.profile.login || githubUsername;
      $('#publicDisplayName').textContent = profile.display_name || bundle.profile.name || bundle.profile.login;
      $('#publicGithubId').textContent = 'GITHUB / @' + githubUsername;
      const ghLink = 'https://github.com/' + encodeURIComponent(githubUsername);
      githubLink.href = ghLink;
      footerGithub.href = ghLink;
      githubLink.hidden = false;
      $('#publicAvatar').src = bundle.profile.avatar_url || '';
      $('#publicAvatar').alt = (bundle.profile.name || bundle.profile.login) + ' GitHub avatar';

      const stats = $('#publicStats');
      stats.replaceChildren();
      [
        [num(bundle.profile.public_repos), 'PUBLIC REPOS'],
        [num(bundle.profile.followers), 'FOLLOWERS'],
        [num(bundle.profile.following), 'FOLLOWING'],
        [formatDate(bundle.profile.created_at), 'ON GITHUB SINCE']
      ].forEach(([value,label]) => text(stats,'span','',value + ' / ' + label));

      $('#publicProjectsTitle').textContent = (bundle.profile.name || bundle.profile.login) + ' — public work.';
      const note = $('#publicProjectsNote');
      note.textContent = 'Sorted by latest repository activity' +
        (bundle.stale ? ' · showing cached data' : '') +
        (bundle.truncated ? ' · latest ' + bundle.repositories.length + ' repositories shown' : '') + '.';
      const grid = $('#publicProjectGrid');
      const list = $('#publicRepoList');
      grid.replaceChildren();
      list.replaceChildren();
      bundle.repositories.slice(0,6).forEach((repo,index) => grid.appendChild(card(repo,index,index===0)));
      bundle.repositories.slice(6).forEach((repo,index) => list.appendChild(archiveRow(repo,index+6)));
      if (!bundle.repositories.length) {
        grid.appendChild(text(grid,'div','empty-state','This GitHub account has no public repositories yet.'));
      }
    } else {
      $('#publicGithubId').textContent = 'GITHUB / NOT LINKED';
      githubLink.hidden = true;
      footerGithub.href = 'https://github.com';
      $('#publicProjectsTitle').textContent = 'Projects are not available yet.';
      $('#publicProjectsNote').textContent = lookupProblem || 'This VOID profile has not connected a public GitHub username yet.';
      const grid = $('#publicProjectGrid');
      grid.replaceChildren();
      grid.appendChild(text(grid,'div','empty-state','No repositories to show for this profile yet.'));
      $('#publicRepoList').replaceChildren();
    }
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
