(() => {
  'use strict';
  const {profile,projects,categories,services,process:steps}=window.PORTFOLIO;
  const main=document.getElementById('main'),dialog=document.getElementById('brief-dialog');
  const menu=document.getElementById('mobile-menu'),menuToggle=document.getElementById('menu-toggle');
  let draft={},briefRows=[],activeCategory='All Projects',revealObserver;
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const arrow='<span aria-hidden="true">↗</span>';
  function asset(value){if(!value)return '';const v=String(value).trim();return /^(https?:\/\/|\.\.?\/|[a-z0-9_-]+\/)/i.test(v)||/^[a-z0-9_.-]+\.(png|jpe?g|webp|svg|mp4|webm)$/i.test(v)?esc(v):''}
  function external(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?esc(u.href):''}catch{return ''}}
  function icon(name){
    const paths={
      mail:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
      phone:'<path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 2a15 15 0 0 1-7-7l2-2-2-5Z"/>',
      line:'<path d="M21 11c0 4.4-4 8-9 8l-4 3v-4c-3-1.2-5-3.8-5-7 0-4.4 4-8 9-8s9 3.6 9 8Z"/><path d="M7 11h.01M12 11h.01M17 11h.01" stroke-width="2.8"/>',
      layout:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>',
      brand:'<path d="m12 3 9 9-9 9-9-9 9-9Z"/><path d="m8 12 4-4 4 4-4 4-4-4Z"/>',
      spark:'<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3Z"/>',
      play:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m10 8 6 4-6 4V8Z"/>',
      search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
      refine:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/>',
      send:'<path d="m3 3 18 9-18 9 4-9-4-9Zm4 9h14"/>',
      education:'<path d="m2 9 10-5 10 5-10 5L2 9Zm4 2v6l6 3 6-3v-6M22 9v8"/>',
      image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="2"/><path d="m3 17 6-5 4 3 4-5 4 7"/>'
    };
    return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">'+(paths[name]||paths.spark)+'</svg>';
  }
  const btn=(label,href='#/contact',secondary=false)=>'<a class="button'+(secondary?' button-secondary':'')+'" href="'+href+'">'+label+arrow+'</a>';
  const heading=(eyebrow,title,description='')=>'<section class="page-heading container"><span class="eyebrow accent">'+eyebrow+'</span><h1>'+title+'</h1>'+(description?'<p>'+description+'</p>':'')+'</section>';
  function portrait(){
    const src=asset(profile.portrait);
    if(src)return '<img class="portrait-image" src="'+src+'" alt="'+esc(profile.portraitAlt)+'" fetchpriority="high">';
    return `<div class="portrait-placeholder"><svg class="portrait-shape" viewBox="0 0 420 520" aria-hidden="true"><defs><linearGradient id="person-fill" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#151447"/><stop offset=".55" stop-color="#08051D"/><stop offset="1" stop-color="#151447"/></linearGradient></defs><path d="M210 34c-62 0-89 45-87 104 1 34 11 62 26 80v37c-13 18-30 28-59 39C32 316 10 361 4 520h412c-6-159-28-204-86-226-29-11-46-21-59-39v-37c15-18 25-46 26-80 2-59-25-104-87-104Z" fill="url(#person-fill)" stroke="#743BE8" stroke-opacity=".35"/><path d="M149 255c17 17 36 27 61 27s44-10 61-27M90 294l55 226M330 294l-55 226" fill="none" stroke="#22B8F5" stroke-opacity=".13"/></svg><span class="portrait-label">PERSONAL PORTRAIT<small>Photo to be added · รอเพิ่มรูปจริง</small></span></div>`;
  }
  function thumbnail(p,caption=true){
    const src=asset(p.image);
    if(!src&&asset(p.videoUrl))return `<div class="thumbnail video"><div class="thumbnail-content"><video class="thumbnail-video" src="${asset(p.videoUrl)}#t=1" preload="metadata" muted playsinline aria-hidden="true" tabindex="-1"></video><span class="video-card-play">${icon('play')}</span></div></div>`;
    return `<div class="thumbnail ${p.visual}">${src?'<div class="thumbnail-content"><img class="thumbnail-image" src="'+src+'" alt="'+esc(p.title)+'" loading="lazy"></div>':'<span class="placeholder-pill">VISUAL PLACEHOLDER</span><div class="thumbnail-content" aria-hidden="true"><div class="visual-object"></div><span class="visual-mark">'+esc(p.mark)+'</span><span class="visual-caption">PROJECT IMAGERY TO BE ADDED</span></div>'}</div>`;
  }
  function card(p){return `<a class="project-card reveal" href="#/project/${p.id}" aria-label="View ${esc(p.title)} case study">${thumbnail(p)}<div class="project-meta"><div><p class="category">${esc(p.category)}</p><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p></div><span class="project-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M7 7h10v10"/></svg></span></div></a>`}
  function gallery(){return `<div class="filter-bar" role="group" aria-label="Project categories">${categories.map(c=>'<button class="filter" data-category="'+esc(c)+'" aria-pressed="'+(c===activeCategory)+'">'+esc(c)+'</button>').join('')}</div><div class="work-grid" id="project-grid">${filtered().map(card).join('')}</div><p class="result-count" id="result-count" role="status" aria-live="polite">${filtered().length} projects · ${esc(activeCategory)}</p>`}
  function filtered(){return activeCategory==='All Projects'?projects:projects.filter(p=>p.category===activeCategory)}
  function serviceList(){return `<div class="service-list">${services.map(s=>`<a class="service-item" href="#/services?focus=${s.id}"><span class="service-number">${s.number}</span><span class="service-icon">${icon(s.icon)}</span><h3>${s.title}</h3><p>${s.description}</p><span class="service-arrow" aria-hidden="true">↗</span></a>`).join('')}</div>`}
  function softwareTag(name) {
    const logos = {
      Figma: '<svg viewBox="0 0 18 24"><path fill="#f24e1e" d="M0 4a4 4 0 014-4h5v8H4a4 4 0 01-4-4"/><path fill="#ff7262" d="M9 0h5a4 4 0 010 8H9z"/><path fill="#a259ff" d="M0 12a4 4 0 014-4h5v8H4a4 4 0 01-4-4"/><ellipse fill="#1abcfe" cx="13.5" cy="12" rx="4.5" ry="4"/><path fill="#0acf83" d="M4 16h5v4a4.5 4 0 11-5-4"/></svg>',
      Photoshop: '<b class="software-ps">Ps</b>',
      Illustrator: '<b class="software-ai">Ai</b>',
      'Premiere Pro': '<b class="software-pr">Pr</b>',
      'After Effects': '<b class="software-pr">Ae</b>',
      Lightroom: '<b class="software-ps">Lr</b>',
      Canva: '<b style="background:linear-gradient(135deg,#00c4cc,#7639ef);color:white">C</b>',
      ChatGPT: '<b style="background:white;color:#111">◎</b>',
      Gemini: '<b style="color:#8ab4f8;font-size:18px">✦</b>',
      Trello: '<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#008bde"/><path fill="#fff" d="M5 5h5v14H5zm9 0h5v9h-5z"/></svg>',
      Notion: '<b style="background:white;color:#111;font-family:Georgia">N</b>'
    };
    return '<span class="tag software-tag">' +
      (Object.hasOwn(logos, name) ? '<span class="software-logo" aria-hidden="true">' + logos[name] + '</span>' : '') +
      esc(name) + '</span>';
  }
  function professionalExperience() {
    if (!profile.experience?.length) {
      return '<p>' + esc(profile.background || 'Independent Creative Designer & Digital Creator.') + '</p>';
    }
    return '<div class="experience-list">' + profile.experience.map(job =>
      '<article class="experience-item">' +
        '<h4>' + esc(job.company) + '</h4>' +
        '<p class="experience-period" lang="th">' + esc(job.period) + '</p>' +
        '<p>' + esc(job.role) + '</p>' +
      '</article>'
    ).join('') + '</div>';
  }
  function education(){return `<section class="section container"><div class="background-grid"><div class="background-intro"><span class="eyebrow accent">EDUCATION & SKILLS</span><h2>My Background</h2><p>A thoughtful mix of visual communication, digital design and creative problem-solving.</p><div class="info-block"><div class="info-label">${icon('education')}<h3>Education</h3></div><p>${esc(profile.education||'Education details to be added.')} ${profile.education?'':'<span lang="th">รอเพิ่มข้อมูลการศึกษาที่ตรวจสอบแล้ว</span>'}</p></div><div class="info-block"><div class="info-label">${icon('brand')}<h3>Professional background</h3></div>${professionalExperience()}</div></div><div><div class="info-block"><h3>Design skills</h3><div class="tag-list">${profile.skills.map(x=>'<span class="tag">'+esc(x)+'</span>').join('')}</div></div><div class="info-block"><h3>Software & tools</h3><div class="tag-list">${profile.tools.map(softwareTag).join('')}</div></div><p class="muted" style="font-size:11px;margin-top:22px">From the first idea to the last detail.<br><span lang="th">เชื่อมไอเดีย งานออกแบบ และการสื่อสารเข้าด้วยกัน</span></p></div></div></section>`}
  function processSection(){return `<section class="section process-section"><div class="container process-grid"><div class="process-intro"><span class="eyebrow accent">HOW I WORK</span><h2>My Creative Process</h2><p>Good work is a conversation. Here is how we move from an open question to a considered outcome.</p><a class="text-link" href="#/contact" style="margin-top:24px">Start a Project ${arrow}</a></div><div class="timeline">${steps.map((s,i)=>`<details name="process" ${i===0?'open':''}><summary><span class="step-icon">${icon(s.icon)}</span><span class="step-number">${String(i+1).padStart(2,'0')}</span><h3>${s.title}</h3></summary><div class="step-copy"><p>${s.description}</p><p lang="th">${s.thai}</p></div></details>`).join('')}</div></div></section>`}
  function philosophy(){return `<section class="philosophy"><span class="eyebrow accent">A CREATIVE POINT OF VIEW</span><h2>Creative by Design.<br><span class="gradient-text">Driven by Ideas.</span></h2><p>Design starts with a question. The right idea gives it direction.<br><span lang="th">งานที่มีความหมาย เริ่มจากความเข้าใจที่ชัดเจน</span></p><span class="signature" aria-label="AKE signature-inspired mark">AKE.</span></section>`}
  function contactDetails(){
    const mail=profile.email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)?profile.email:null;
    const line=external(profile.line),phone=String(profile.phone||'').replace(/[^+\d]/g,'');
    function channel(type,label,value,href){
      const tag=href?'a':'div';
      const attrs=href?' href="'+href+'"'+(type==='line'?' target="_blank" rel="noopener noreferrer"':''):'';
      return '<'+tag+' class="contact-channel contact-channel-'+type+(href?'':' is-pending')+'"'+attrs+'><span class="contact-channel-icon">'+icon(type)+'</span><span class="contact-channel-copy"><span class="contact-channel-label">'+label+'</span><span class="contact-channel-value">'+esc(value)+'</span></span>'+(href?'<span class="contact-channel-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M7 7h10v10"/></svg></span>':'<span class="contact-channel-status">รอเพิ่มข้อมูล</span>')+'</'+tag+'>';
    }
    return `<div class="contact-details"><span class="eyebrow accent">GET IN TOUCH</span><h3>เริ่มต้นด้วยการพูดคุย</h3><p>มีโปรเจกต์หรือไอเดียที่อยากทำร่วมกัน?<br>ติดต่อผมได้โดยตรงผ่านช่องทางด้านล่าง</p><div class="contact-channels">${channel('phone','PHONE / โทรศัพท์',profile.phone||'ยังไม่ได้ระบุเบอร์โทรศัพท์',phone?'tel:'+phone:'')}${channel('mail','EMAIL / อีเมล',mail||'ยังไม่ได้ระบุอีเมล',mail?'mailto:'+esc(mail):'')}${channel('line','LINE',line?(profile.lineId||'พูดคุยผ่าน LINE'):'ยังไม่ได้ระบุ LINE ID',line)}</div><p class="contact-direct-note">โทรหรือส่งอีเมลได้จากปุ่มด้านบน</p></div>`;
  }
  function inquiryForm(){
    return `<form id="inquiry-form" class="inquiry-form"><h3 class="form-heading">Start a Project</h3><p class="form-caption">Fields marked * are required. English or Thai is welcome.<br>DEMO · Preview and download your brief. Messages are not sent.</p><div class="form-grid">
    <div class="field"><label for="name">Name / ชื่อ *</label><input id="name" name="name" autocomplete="name" required maxlength="100" placeholder="Your name"></div>
    <div class="field"><label for="email">Email / อีเมล *</label><input id="email" name="email" type="email" autocomplete="email" required maxlength="180" placeholder="you@example.com"></div>
    <div class="field field-wide"><label for="service">Service needed / บริการ *</label><select id="service" name="service" required><option value="">Choose a service</option>${services.map(s=>'<option value="'+s.id+'">'+s.title+'</option>').join('')}<option value="other">A few things / Let's discuss</option></select></div>
    <div class="field field-wide"><label for="description">Project description / รายละเอียด *</label><textarea id="description" name="description" required minlength="20" maxlength="5000" placeholder="What would you like to create? (At least 20 characters)"></textarea></div>
    <div class="field"><label for="budget">Estimated budget / งบประมาณ *</label><select id="budget" name="budget" required><option value="">Select a range</option><option>Under ฿10,000</option><option>฿10,000–30,000</option><option>฿30,000–50,000</option><option>฿50,000+</option><option>Let's discuss</option></select></div>
    <div class="field"><label for="timeline">Timeline / ระยะเวลา *</label><select id="timeline" name="timeline" required><option value="">Select a timeline</option><option>Within 2 weeks</option><option>2–4 weeks</option><option>1–3 months</option><option>Flexible / Let's discuss</option></select></div></div>
    <label class="consent"><input type="checkbox" name="consent" required><span>I understand this is a demo. My brief stays in this browser and is not sent to AKE.<br><span lang="th">ฉันเข้าใจว่าข้อมูลยังไม่ถูกส่งถึงเจ้าของเว็บไซต์</span></span></label><button class="button form-submit" type="submit" id="preview-brief">Preview My Brief <span aria-hidden="true">↗</span></button><p class="form-status" id="form-status" role="status" aria-live="polite"></p><details class="privacy-note"><summary>How this demo handles your information</summary><p>Your entries are held in page memory while browsing and cleared on reload or closing this page. There is no server submission, analytics or tracking cookie in this demo. Downloading creates a text file on your device. Google Fonts is used for typography; hosting providers may maintain access logs. Timelines and budgets are inquiry preferences, not an accepted quote.</p></details></form>`;
  }
  function contactSection(standalone=false){return `<section class="${standalone?'page-body':'section'} contact-section"><div class="container"><div class="contact-heading">${standalone?'':'<span class="eyebrow accent">HAVE SOMETHING IN MIND?</span><h2>LET’S WORK<br><span class="gradient-text">TOGETHER.</span></h2><p>Have a project in mind? Let’s turn your ideas into something meaningful.</p>'}</div><div class="contact-grid contact-grid-direct">${contactDetails()}</div></div></section>`}
  function cta(){return `<div class="page-cta"><div><h2>Something in mind?</h2><p>Let's turn it into something meaningful.</p></div>${btn('Start a Project')}</div>`}
  function home(){return `<section class="hero container"><div class="hero-top"><span class="eyebrow">INDEPENDENT DESIGNER · DIGITAL CREATOR</span><span class="availability">${profile.available?'Available for Projects':'Project inquiries welcome'}</span></div><div class="hero-stage"><div class="portfolio-word" aria-hidden="true">PORTFOLIO</div><div class="portrait-stage">${portrait()}</div><div class="hero-copy"><p class="greeting">Hello, I'm</p><h1>AKE <span>EKKARAT</span></h1><p class="role" lang="th">งานออกแบบที่ตอบโจทย์ธุรกิจ</p><p class="description" lang="th">เราสร้างสรรค์งานดีไซน์ คอนเทนต์ และสื่อดิจิทัล ด้วยประสบการณ์ในสาย Creative กว่า 5 ปี ตั้งแต่การพัฒนาแนวคิด วางแผน ไปจนถึงการผลิตผลงานที่สื่อสารตัวตนของแบรนด์ได้อย่างชัดเจน</p><div class="hero-buttons">${btn('View Our Work','#/work')}${btn("Let's Work Together",'#/contact',true)}</div></div></div><div class="hero-baseline"><div class="disciplines"><span>DIGITAL DESIGN</span><span>BRAND IDENTITY</span><span>CREATIVE DIRECTION</span></div><a href="#selected-work" data-scroll="selected-work">SCROLL TO EXPLORE ↓</a></div></section>
    <section id="selected-work" class="section container"><div class="section-heading"><div><span class="eyebrow accent">SELECTED WORK</span><h2>Featured Projects</h2></div></div>${gallery()}<div class="work-bottom"><a href="#/work" class="text-link">View All Work ${arrow}</a></div></section>
    <section class="collaborators container" aria-labelledby="collaborators-title"><span class="eyebrow accent">COLLABORATIONS</span><h2 id="collaborators-title" lang="th">แบรนด์ที่เคยร่วมสร้างสรรค์ผลงาน</h2><p lang="th">แบรนด์และองค์กรที่เคยร่วมสร้างสรรค์ผลงาน</p><div class="collaborator-logos" aria-label="แบรนด์ที่เคยมีส่วนร่วมสร้างสรรค์ผลงาน"><div class="brand-logo-tile"><img class="brand-logo-image" src="media-0e9941657cfe.png" alt="MedUMORE" loading="lazy"></div><div class="brand-logo-tile"><img class="brand-logo-image" src="media-bdcb7975492d.png" alt="สสส." loading="lazy"></div><div class="brand-logo-tile" title="The Mall Lifestore"><img class="brand-logo-image" src="media-231824152e9d.svg" alt="The Mall Lifestore" loading="lazy"></div><div class="brand-logo-tile" title="Sufcreate"><img class="brand-logo-image" src="media-9cfba6646bc8.webp" alt="Sufcreate" loading="lazy"></div><div class="brand-logo-tile" title="Telescope &amp; Astronomy Thailand"><img class="brand-logo-image" src="media-3e72d43206c1.png" alt="Telescope &amp; Astronomy Thailand" loading="lazy"></div><div class="brand-logo-tile" title="King Long"><img class="brand-logo-image" src="media-19a5dfff2100.png" alt="King Long" loading="lazy"></div><div class="brand-logo-tile" title="KFC"><img class="brand-logo-image" src="media-e8d6d9d2bc02.webp" alt="KFC" loading="lazy"></div><div class="brand-logo-tile" title="Neofusion"><img class="brand-logo-image" src="media-93a786323555.jpg" alt="Neofusion" loading="lazy"></div><div class="brand-logo-tile" title="Earth&#39;s Pearl"><img class="brand-logo-image" src="media-f9568a9d7575.jpg" alt="Earth&#39;s Pearl" loading="lazy"></div><div class="brand-logo-tile brand-logo-event" title="FIVB Volleyball Women&#39;s World Championship Thailand 2025"><img class="brand-logo-image" src="media-7853cb7ad989.png" alt="FIVB Volleyball Women&#39;s World Championship Thailand 2025" loading="lazy"></div><div class="brand-logo-tile" title="Sena Development"><img class="brand-logo-image" src="media-45794aa18eb0.svg" alt="Sena Development" loading="lazy"></div><div class="brand-logo-tile" title="Land &amp; Houses"><img class="brand-logo-image" src="media-f344b074eb80.webp" alt="Land &amp; Houses" loading="lazy"></div><div class="brand-logo-tile" title="True 5G"><img class="brand-logo-image" src="media-5b8f9dd2c060.jpg" alt="True 5G" loading="lazy"></div><div class="brand-logo-tile" title="การตลาดวันละตอน"><img class="brand-logo-image" src="media-fa2652d4bc55.jpg" alt="การตลาดวันละตอน" loading="lazy"></div><div class="brand-logo-tile" title="ISU"><img class="brand-logo-image" src="media-b0cbb728f0dc.webp" alt="ISU" loading="lazy"></div><div class="brand-logo-tile" title="OCS"><img class="brand-logo-image" src="media-99c179e427a9.png" alt="OCS สำนักงานคณะกรรมการกฤษฎีกา" loading="lazy"></div><div class="brand-logo-tile" title="KMGC"><img class="brand-logo-image" src="media-c91d456a6d50.webp" alt="KMGC K.M. Group Company" loading="lazy"></div><div class="brand-logo-tile" title="สาธิตเกษตร — Wonder Fun Run &amp; Fit"><img class="brand-logo-image" src="media-eb66faa18b15.jpg" alt="โรงเรียนสาธิตเกษตร — Wonder Fun Run &amp; Fit" loading="lazy"></div></div></section><section class="section services-section"><div class="container"><div class="section-heading"><div><span class="eyebrow accent">WHAT I CAN HELP WITH</span><h2>What I Do</h2></div><p>Four connected disciplines.<br>One considered creative direction.</p></div>${serviceList()}<div class="service-foot"><p>Every project starts with a conversation about your needs.</p>${btn('Request a Quote')}</div></div></section>
    ${education()}${processSection()}${philosophy()}${contactSection()}`}
  function workPage(){return heading('WORK / SELECTED PROJECTS','Different disciplines.<br><span class="gradient-text">The same curiosity.</span>','Explore the project structure across marketing, branding, campaigns, digital and motion. Images and project narratives are ready to be replaced with approved work.')+'<section class="page-body container">'+gallery()+cta()+'</section>'}
  function caseStudy(id){
    const p=projects.find(x=>x.id===id);if(!p)return notFound();
    const next=projects[(projects.indexOf(p)+1)%projects.length];
    const blocks=[['Project overview',p.overview,'An approved overview of this project has not been added yet.'],['Context & goals',p.context,'Client context and project goals will be added with permission.'],['The challenge',p.challenge,'The design challenge and constraints will be documented here.'],['My role',p.role,'Responsibilities and collaborators will be confirmed before publication.'],['Design approach',p.approach,'Research, creative decisions and iterations will be shared here.']];
    const galleryImages=p.gallery.filter(x=>asset(x.src));
    return heading('CASE STUDY / '+esc(p.category),esc(p.title),esc(p.subtitle))+`<section class="page-body container">${p.hideHero?'':'<div class="case-hero">'+thumbnail(p)+'</div>'}<dl class="case-meta"><div><dt>DISCIPLINE</dt><dd>${esc(p.category)}</dd></div><div><dt>PROJECT</dt><dd>${esc(p.subtitle)}</dd></div><div><dt>CONTENT STATUS</dt><dd>${p.overview?'Project details supplied':'Placeholder · awaiting approved content'}</dd></div></dl>${!p.overview?'<p class="notice">This is an editable case study placeholder. The display graphics are not client deliverables, and no project results or client relationship are being claimed.</p>':''}${blocks.map(([title,value,fallback])=>'<div class="case-section"><h2>'+title+'</h2><p>'+esc(value||fallback)+'</p></div>').join('')}<div class="case-section"><h2>Visual gallery</h2><p>Selected details, applications and process images.</p></div><div class="case-gallery">${galleryImages.length?galleryImages.map(x=>'<figure><img src="'+asset(x.src)+'" alt="'+esc(x.alt||p.title)+'" loading="lazy"><figcaption>'+esc(x.caption||'')+'</figcaption></figure>').join(''):[1,2].map(i=>'<div class="gallery-placeholder">'+icon('image')+'<span>PROJECT IMAGE '+String(i).padStart(2,'0')+' · TO BE ADDED</span></div>').join('')}</div>${p.category==='Video & Motion'?(asset(p.videoUrl)?'<video class="case-video" controls preload="metadata" src="'+asset(p.videoUrl)+'">Your browser does not support this video.</video>':'<div class="video-placeholder">Video preview will appear here when an approved video is added.<br><span lang="th">ยังไม่ได้เพิ่มวิดีโอผลงานจริง</span></div>'):''}<div class="case-section"><h2>Deliverables</h2>${p.deliverables.length?'<ul>'+p.deliverables.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'<p>Final deliverables will be listed after the project scope is confirmed.</p>'}</div>${p.results?'<div class="case-section"><h2>Verified results</h2><p>'+esc(p.results)+'</p></div>':''}<a class="next-project" href="#/project/${next.id}"><div><span class="eyebrow">NEXT PROJECT</span><h2>${esc(next.title)}</h2></div><span aria-hidden="true">↗</span></a><a class="text-link" href="#/work" style="margin-top:25px">Back to All Work ${arrow}</a></section>`;
  }
  function servicesPage(){return heading('SERVICES','Thoughtful design.<br><span class="gradient-text">Built around your goals.</span>','Choose a focused service or bring several disciplines together. Scope, timing and pricing are agreed after discussing your project.')+`<section class="page-body container">${services.map(s=>`<article class="service-detail" id="service-${s.id}"><div><span class="eyebrow accent">${s.number} / SERVICE</span><h2>${s.title}</h2><p lang="th">${s.thai}</p></div><div><p>${s.detail}</p><ul>${s.deliverables.map(x=>'<li>'+x+'</li>').join('')}</ul>${btn('Discuss This Service','#/contact?service='+s.id,true)}</div></article>`).join('')}</section>${processSection()}<div class="container page-body">${cta()}</div>`}
  function aboutPage(){return heading('ABOUT / AKE EKKARAT','A curious mind.<br><span class="gradient-text">A considered approach.</span>','Independent Creative Designer & Digital Creator.')+`<section class="page-body container"><div class="about-grid"><div class="about-portrait"><img class="about-profile-image" src="media-f9b3d51d74e8.png" alt="เอกราช รูปงาม" width="1254" height="1254"></div><div class="about-copy"><span class="eyebrow accent">HELLO, I'M</span><h2>AKE EKKARAT</h2><p class="thai-name" lang="th">เอกราช รูปงาม · Ekkarat Rupngam</p><h3 class="about-professional-title">Creative Design &amp; Marketing Professional | 5+ Years of Experience</h3><p lang="th">ผู้มีประสบการณ์ทำงานกว่า 5 ปีในสาย Creative Design, Graphic Design และ Content Production จากธุรกิจเอเจนซี มีความสามารถด้านการคิดคอนเซปต์ การวางแผนคอนเทนต์ การออกแบบสื่อ การผลิต Motion Graphic การตัดต่อวิดีโอ และการจัดทำ Storyboard รวมถึงการประสานงานและบรีฟทีมผลิตสื่อให้สอดคล้องกับเป้าหมายของแต่ละโครงการ</p><p lang="th">ปัจจุบันต่อยอดประสบการณ์สู่สายงาน Marketing และ Online Marketing ในธุรกิจเทคโนโลยีและโซลูชัน EV Charger โดยมุ่งพัฒนาความเชี่ยวชาญด้าน Creative Marketing, Content Strategy และ Marketing Communication เพื่อเชื่อมโยงงานสร้างสรรค์เข้ากับเป้าหมายทางธุรกิจ</p>${btn("Let's Work Together",'#/contact',true)}<p class="about-note" style="margin-top:20px">This portfolio represents AKE EKKARAT as an independent professional.</p></div></div></section>${education()}<section class="section container soft-skills-section" aria-labelledby="soft-skills-title"><span class="eyebrow accent">HOW I WORK WITH PEOPLE</span><h2 id="soft-skills-title">Soft Skills</h2><p class="soft-skills-intro" lang="th">ทักษะที่ช่วยให้ทำงานร่วมกันได้อย่างราบรื่น และพัฒนาผลงานอย่างต่อเนื่อง</p><ul class="soft-skills-list" lang="th"><li>มีความรับผิดชอบ</li><li>มีความคิดสร้างสรรค์</li><li>วางแผนงานและจัดเวลาได้เป็นอย่างดี</li><li>ปรับตัวให้เข้ากับสถานการณ์ในการทำงาน</li><li>มีความตั้งใจและพร้อมเรียนรู้อยู่ตลอดเวลา</li><li>สามารถทำงานเป็นทีมได้อย่างดี</li><li>กระตือรือร้นในการทำงานอยู่ตลอดเวลา</li><li>พัฒนาตัวเองอยู่เสมอ</li><li>มีทักษะการสื่อสารเป็นอย่างดี</li></ul></section><section class="section container personal-interests" aria-labelledby="interests-title"><span class="eyebrow accent">BEYOND CLIENT WORK</span><h2 id="interests-title">Personal Projects &amp; Interests</h2><p class="interests-intro" lang="th">พื้นที่ทดลองไอเดียและต่อยอดทักษะ ผ่านแบรนด์ส่วนตัว การท่องเที่ยว และคอนเทนต์เกม</p><div class="interests-grid"><article class="interest-card"><span class="eyebrow accent">BRAND &amp; COMMERCE</span><h3>Renger Club</h3><p lang="th">สร้างแบรนด์เสื้อผ้า ออกแบบอัตลักษณ์และสื่อโฆษณา ดูแลการผลิตและคัดเลือกสินค้า พร้อมวางแผนกลยุทธ์ Social Media Marketing ผ่าน Facebook, Instagram, TikTok และ Shopee รวมถึงพัฒนาเว็บไซต์เพื่อเก็บข้อมูลลูกค้าและรองรับระบบแบรนด์</p><div class="tag-list"><span class="tag">CI Design</span><span class="tag">Product Sourcing</span><span class="tag">Social Media Marketing</span></div></article><article class="interest-card"><span class="eyebrow accent">TRAVEL &amp; STORYTELLING</span><h3>Toget meet</h3><p lang="th">สร้างแบรนด์และคอนเทนต์ท่องเที่ยว ออกแบบอัตลักษณ์ วางกลยุทธ์การเล่าเรื่องและรูปแบบโพสต์บน Facebook, Instagram และ TikTok พร้อมเชื่อมประสบการณ์ท่องเที่ยวกับสินค้าและเสื้อผ้า Renger Club</p><div class="tag-list"><span class="tag">Travel Media</span><span class="tag">Brand Identity</span><span class="tag">Content Planning</span></div></article><article class="interest-card"><span class="eyebrow accent">GAMING &amp; COMMUNITY</span><h3>Play With Friend</h3><p lang="th">สร้างแบรนด์สื่อเกม ออกแบบอัตลักษณ์และวางแนวทางคอนเทนต์สำหรับ YouTube และ Facebook เพื่อพูดคุยกับคนที่ชอบเกมและสร้างคอมมูนิตี้ พร้อมเชื่อมโยงกับแบรนด์ Renger Club</p><div class="tag-list"><span class="tag">Gaming Media</span><span class="tag">Video Content</span><span class="tag">Community</span></div></article></div><div class="podcast-interests"><span class="eyebrow accent">WHAT I LISTEN TO</span><h3>Podcasts I Follow</h3><p lang="th">รายการที่ติดตามในเวลาว่าง</p><ul class="podcast-list"><li>Mission To The Moon</li><li>The Money Coach</li><li>The Standard</li></ul></div></section>${philosophy()}<div class="container page-body" style="padding-top:20px">${cta()}</div>`}
  function contactPage(){return heading('CONTACT / PROJECT INQUIRIES',"LET'S WORK<br><span class=\"gradient-text\">TOGETHER.</span>","Have a project in mind? Let's turn your ideas into something meaningful.")+contactSection(true)}
  function notFound(){return heading('404 / PAGE NOT FOUND','A different direction.','This page could not be found.')+'<div class="container page-body">'+btn('Back to Home','#/')+'</div>'}
  function rememberDraft(){const form=document.getElementById('inquiry-form');if(form)draft=Object.fromEntries(new FormData(form).entries())}
  function closeMenu(focus=false){menu.hidden=true;menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Open menu');if(focus)menuToggle.focus()}
  function reveal(){
    revealObserver?.disconnect();
    if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
    revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('reveal-pending');revealObserver.unobserve(e.target)}}),{threshold:.05});
    document.querySelectorAll('.reveal').forEach(el=>{if(el.getBoundingClientRect().top>innerHeight){el.classList.add('reveal-pending');revealObserver.observe(el)}});
  }
  function render(){
    const raw=location.hash.slice(1)||'/';
    if(!raw.startsWith('/'))return;
    rememberDraft();closeMenu();if(dialog.open)dialog.close();
    const [path,query='']=raw.split('?'),parts=path.split('/').filter(Boolean),params=new URLSearchParams(query);
    const route=parts[0]||'home';
    activeCategory=categories.includes(params.get('category'))?params.get('category'):'All Projects';
    const views={home,work:workPage,services:servicesPage,about:aboutPage,contact:contactPage,project:()=>caseStudy(parts[1])};
    main.innerHTML=(views[route]||notFound)();
    document.querySelectorAll('[data-nav]').forEach(a=>{const current=a.dataset.nav===route||(route==='project'&&a.dataset.nav==='work');if(current)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
    const title=route==='project'?(projects.find(p=>p.id===parts[1])?.title||'Project'):({home:'Creative Designer & Digital Creator',work:'Work',services:'Services',about:'About',contact:'Contact'}[route]||'Page not found');
    document.title='AKE EKKARAT — '+title;
    setupForm(params.get('service'));
    window.scrollTo({top:0,behavior:'instant'});main.focus({preventScroll:true});
    if(route==='services'&&params.get('focus'))requestAnimationFrame(()=>document.getElementById('service-'+params.get('focus'))?.scrollIntoView({block:'start'}));
    reveal();
  }
  function setupForm(selected){
    const form=document.getElementById('inquiry-form');if(!form)return;
    for(const [name,value]of Object.entries(draft)){const el=form.elements.namedItem(name);if(!el)continue;if(el.type==='checkbox')el.checked=value==='on';else el.value=value}
    if(services.some(s=>s.id===selected))form.elements.service.value=selected;
    form.addEventListener('input',e=>e.target.setCustomValidity?.(''));
    form.addEventListener('submit',async e=>{
      e.preventDefault();
      for(const name of ['name','email','description']){const input=form.elements.namedItem(name);input.value=input.value.trim();input.setCustomValidity(input.value?'':'Please complete this field / กรุณากรอกข้อมูล')}
      if(form.elements.description.value.length<20)form.elements.description.setCustomValidity('Please add at least 20 characters / อย่างน้อย 20 ตัวอักษร');
      if(!form.reportValidity())return;
      const submit=form.querySelector('[type=submit]'),status=document.getElementById('form-status');
      submit.disabled=true;submit.textContent='Preparing your brief…';form.setAttribute('aria-busy','true');status.textContent='';
      try{
        await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
        rememberDraft();
        briefRows=[['Name',draft.name],['Email',draft.email],['Service',services.find(s=>s.id===draft.service)?.title||'A few things / Let’s discuss'],['Description',draft.description],['Estimated budget',draft.budget],['Timeline',draft.timeline]];
        document.getElementById('brief-summary').replaceChildren(...briefRows.flatMap(([label,value])=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;return [dt,dd]}));
        document.getElementById('download-status').textContent='';
        dialog.showModal();status.textContent='Brief preview ready. No message has been sent.';
      }catch{status.textContent='Could not prepare the preview. Your entries are still here; please try again.'}
      finally{submit.disabled=false;submit.innerHTML='Preview My Brief '+arrow;form.removeAttribute('aria-busy')}
    });
  }
  menuToggle.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Close menu':'Open menu');if(open)menu.querySelector('a').focus()});
  menu.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden)closeMenu(true)});
  document.getElementById('back-top').addEventListener('click',()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
  main.addEventListener('click',e=>{
    const scroll=e.target.closest('[data-scroll]');if(scroll){e.preventDefault();document.getElementById(scroll.dataset.scroll)?.scrollIntoView({block:'start'});return}
    const filter=e.target.closest('[data-category]');
    if(filter){
      activeCategory=filter.dataset.category;
      const current=(location.hash.slice(1)||'/').split('?')[0];
      history.replaceState(null,'','#'+current+(activeCategory==='All Projects'?'':'?category='+encodeURIComponent(activeCategory)));
      document.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===activeCategory)));
      document.getElementById('project-grid').innerHTML=filtered().map(card).join('');
      document.getElementById('result-count').textContent=filtered().length+' projects · '+activeCategory;
      reveal();
    }
  });
  document.getElementById('close-dialog').addEventListener('click',()=>dialog.close());
  document.getElementById('download-brief').addEventListener('click',()=>{
    const status=document.getElementById('download-status');
    try{
      const text='AKE EKKARAT — PROJECT BRIEF\nDEMO: This inquiry has NOT been sent.\n\n'+briefRows.map(([k,v])=>k+'\n'+v).join('\n\n');
      const url=URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/plain;charset=utf-8'}));
      const a=document.createElement('a');a.href=url;a.download='ake-ekkarat-project-brief.txt';document.body.append(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),10000);
      status.textContent='Download started. Check your browser downloads. Your message has not been sent.';
    }catch{status.textContent='The download could not start. Copy the details above or try again.'}
  });
  document.getElementById('year').textContent=new Date().getFullYear();
  window.addEventListener('hashchange',render);
  render();
})();












