// State and Data
let currentStep = 1;
const totalSteps = 8;

let state = {
  profile: 'fresher-tech',
  template: 'tpl-executive',
  theme: 'theme-emerald',
  personal: { name: '', email: '', phone: '', location: '', link: '', github: '', title: '', summary: '' },
  experience: [],
  internships: [],
  education: [],
  projects: [],
  skills: [],
  extras: { certs: '', achievements: '', languages: '', hobbies: '' }
};

// Default setup
let GROQ_API_KEY = localStorage.getItem('groq_key') || '';
if(GROQ_API_KEY && !localStorage.getItem('groq_key')) { localStorage.setItem('groq_key', GROQ_API_KEY); }

document.addEventListener('DOMContentLoaded', () => {
  initApp();
  bindEvents();
});

function initApp() {
  document.getElementById('input-api-key').value = GROQ_API_KEY;
  
  // Build Progress Dots
  const pBar = document.getElementById('progress-bar-container');
  let dotsHTML = '';
  for(let i=1; i<=totalSteps; i++) {
    dotsHTML += `<div class="progress-dot ${i===1?'active':''}" data-step="${i}"></div>`;
    if(i < totalSteps) dotsHTML += `<div class="progress-line"></div>`;
  }
  pBar.innerHTML = dotsHTML;

  applyProfileLogic();
  updatePreview();
}

function bindEvents() {
  document.getElementById('next-btn').addEventListener('click', () => changeStep(1));
  document.getElementById('prev-btn').addEventListener('click', () => changeStep(-1));

  // Personal inputs binding
  ['name', 'email', 'phone', 'location', 'link', 'github', 'title', 'summary'].forEach(key => {
    const el = document.getElementById(`input-${key}`);
    if(el) el.addEventListener('input', (e) => { state.personal[key] = e.target.value; updatePreview(); });
  });

  // Extras inputs binding
  ['certs', 'achievements', 'languages', 'hobbies'].forEach(key => {
    const el = document.getElementById(`input-${key}`);
    if(el) el.addEventListener('input', (e) => { state.extras[key] = e.target.value; updatePreview(); });
  });

  // Dynamic Add Buttons
  document.getElementById('add-experience-btn').addEventListener('click', () => addDynamicItem('experience'));
  document.getElementById('add-internship-btn').addEventListener('click', () => addDynamicItem('internships'));
  document.getElementById('add-education-btn').addEventListener('click', () => addDynamicItem('education'));
  document.getElementById('add-project-btn').addEventListener('click', () => addDynamicItem('projects'));

  // Skills input
  const skillInput = document.getElementById('skill-input');
  skillInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && skillInput.value.trim() !== '') {
      e.preventDefault(); addSkill(skillInput.value.trim()); skillInput.value = '';
    }
  });

  // Color Theme
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', (e) => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      e.target.classList.add('active');
      const doc = document.getElementById('resume-document');
      doc.className = doc.className.replace(/theme-\w+/g, '');
      const colorMap = {
        '#10b981': 'theme-emerald', '#2c3e50': 'theme-slate', '#3b82f6': 'theme-blue',
        '#ec4899': 'theme-pink', '#f59e0b': 'theme-orange'
      };
      state.theme = colorMap[e.target.dataset.color];
      doc.classList.add(state.theme);
    });
  });

  // Modals
  document.getElementById('api-settings-btn').addEventListener('click', () => document.getElementById('settings-modal').classList.add('active'));
  document.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', (e) => e.target.closest('.modal-overlay').classList.remove('active')));
  document.getElementById('save-settings-btn').addEventListener('click', () => {
    const key = document.getElementById('input-api-key').value.trim();
    if (key) { GROQ_API_KEY = key; localStorage.setItem('groq_key', key); showToast('Settings Saved!'); document.getElementById('settings-modal').classList.remove('active'); }
  });

  document.getElementById('ats-check-btn').addEventListener('click', () => document.getElementById('ats-modal').classList.add('active'));
  document.getElementById('calculate-ats-btn').addEventListener('click', evaluateATS);
  document.getElementById('ats-back-btn').addEventListener('click', () => {
    document.getElementById('ats-results').style.display='none';
    document.getElementById('ats-inputs').style.display='block';
  });

  document.getElementById('download-btn').addEventListener('click', downloadPDF);

  // AI Buttons
  document.getElementById('ai-summary-btn').addEventListener('click', generateSummary);
  document.getElementById('ai-skills-btn').addEventListener('click', suggestSkills);
  document.body.addEventListener('click', (e) => {
    if (e.target.closest('.ai-improve-btn')) { improveText(e.target.closest('.ai-improve-btn')); }
  });
}

function setProfile(prof) {
  state.profile = prof;
  document.querySelectorAll('#step-1 .select-card').forEach(c => c.classList.remove('active'));
  document.querySelector(`#step-1 .select-card[data-val="${prof}"]`).classList.add('active');
  applyProfileLogic();
  updatePreview();
}

function setTemplate(tpl) {
  state.template = tpl;
  document.querySelectorAll('#step-2 .select-card').forEach(c => c.classList.remove('active'));
  document.querySelector(`#step-2 .select-card[data-val="${tpl}"]`).classList.add('active');
  const doc = document.getElementById('resume-document');
  doc.className = `resume-document ${state.template} ${state.theme}`;
  updatePreview();
}

function applyProfileLogic() {
  const lblSummary = document.getElementById('label-summary');
  const expWrap = document.getElementById('experience-section-wrapper');
  const intWrap = document.getElementById('internship-section-wrapper');
  const titleExp = document.getElementById('title-exp');
  const grpHob = document.getElementById('group-hobbies');
  const grpAch = document.getElementById('group-achieve');

  if(state.profile === 'experienced') {
    lblSummary.innerText = "Professional Summary";
    expWrap.style.display = 'block';
    intWrap.style.display = 'none';
    titleExp.innerText = "Work Experience";
    grpHob.style.display = 'none';
    grpAch.style.display = 'flex';
  } else if(state.profile === 'fresher-nontech') {
    lblSummary.innerText = "Career Objective";
    expWrap.style.display = 'none';
    intWrap.style.display = 'block';
    titleExp.innerText = "Internships & Volunteering";
    grpHob.style.display = 'flex';
    grpAch.style.display = 'flex';
  } else { // fresher-tech
    lblSummary.innerText = "Career Objective";
    expWrap.style.display = 'none';
    intWrap.style.display = 'block';
    titleExp.innerText = "Internships";
    grpHob.style.display = 'none';
    grpAch.style.display = 'flex';
  }
}

function changeStep(dir) {
  currentStep += dir;
  if(currentStep < 1) currentStep = 1;
  if(currentStep > totalSteps) currentStep = totalSteps;

  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`step-${currentStep}`).classList.add('active');

  document.getElementById('prev-btn').disabled = (currentStep === 1);
  document.getElementById('next-btn').style.display = (currentStep === totalSteps) ? 'none' : 'inline-block';

  document.querySelectorAll('.progress-dot').forEach((dot, idx) => {
    dot.classList.remove('active', 'completed');
    if (idx + 1 === currentStep) dot.classList.add('active');
    else if (idx + 1 < currentStep) dot.classList.add('completed');
  });
  document.querySelectorAll('.progress-line').forEach((line, idx) => {
    if (idx + 1 < currentStep) line.classList.add('completed');
    else line.classList.remove('completed');
  });
}

function generateId() { return Math.random().toString(36).substr(2, 9); }

window.removeItem = function(btn, type) {
  const itemDiv = btn.closest('.dynamic-item');
  const id = itemDiv.dataset.id;
  state[type] = state[type].filter(item => item.id !== id);
  itemDiv.remove();
  updatePreview();
};

function addDynamicItem(type) {
  const id = generateId();
  let tplName = type;
  if(type === 'projects') tplName = 'project';
  if(type === 'internships') tplName = 'internship';
  
  const template = document.getElementById(`tpl-${tplName}`).content.cloneNode(true);
  const itemDiv = template.querySelector('.dynamic-item');
  itemDiv.dataset.id = id;

  const newItem = { id };

  // Bind inputs locally
  const bind = (selector, field) => {
    const el = itemDiv.querySelector(selector);
    if(el) el.addEventListener('input', e => {
      const itm = state[type].find(i => i.id === id);
      if(itm) { itm[field] = e.target.value; updatePreview(); }
    });
  };

  if (type === 'experience') {
    newItem.title=''; newItem.company=''; newItem.dates=''; newItem.desc='';
    bind('.exp-title','title'); bind('.exp-company','company'); bind('.exp-dates','dates'); bind('.exp-desc','desc');
  } else if (type === 'internships') {
    newItem.title=''; newItem.company=''; newItem.dates=''; newItem.desc='';
    bind('.exp-title','title'); bind('.exp-company','company'); bind('.exp-dates','dates'); bind('.exp-desc','desc');
  } else if (type === 'education') {
    newItem.degree=''; newItem.school=''; newItem.year=''; newItem.grade='';
    bind('.edu-degree','degree'); bind('.edu-school','school'); bind('.edu-year','year'); bind('.edu-grade','grade');
  } else if (type === 'projects') {
    newItem.name=''; newItem.tech=''; newItem.link=''; newItem.desc='';
    bind('.proj-name','name'); bind('.proj-tech','tech'); bind('.proj-link','link'); bind('.proj-desc','desc');
  }

  state[type].push(newItem);
  document.getElementById(`${type === 'experience' ? 'experience-list' : type === 'internships' ? 'internship-list' : type === 'projects' ? 'project-list' : 'education-list'}`).appendChild(itemDiv);
  updatePreview();
}

function addSkill(skill) {
  if (!state.skills.includes(skill)) { state.skills.push(skill); renderSkillsForm(); updatePreview(); }
}
window.removeSkill = function(skill) {
  state.skills = state.skills.filter(s => s !== skill); renderSkillsForm(); updatePreview();
};
function renderSkillsForm() {
  document.getElementById('skills-chips').innerHTML = state.skills.map(s => `<div class="skill-chip">${s} <span onclick="removeSkill('${s}')"><i class="fa-solid fa-xmark"></i></span></div>`).join('');
}


// --- PREVIEW ENGINE ---
function buildSectionHTML(title, content) {
  if(!content) return '';
  return `<div class="r-section"><h2 class="r-section-title">${title}</h2>${content}</div>`;
}

function renderItems(arr, titleKey, subtitleKey, dateKey, descKey, detailKey) {
  if(!arr || arr.length === 0) return '';
  return arr.map(i => `
    <div class="r-item">
      <div class="r-item-header">
        <span class="r-item-title">${i[titleKey]||''} ${i[detailKey] ? `<span class="r-item-detail">| ${i[detailKey]}</span>` : ''}</span>
        <span class="r-item-date">${i[dateKey]||''}</span>
      </div>
      <div class="r-item-subtitle">${i[subtitleKey]||''}</div>
      ${i[descKey] ? `<div class="r-item-desc">${i[descKey]}</div>` : ''}
    </div>
  `).join('');
}

function updatePreview() {
  const p = state.personal;
  
  // Header HTML
  let headerHtml = `
    <div class="r-header">
      <h1 class="r-name">${p.name || 'Your Name'}</h1>
      <h3 class="r-title">${p.title || 'Professional Title'}</h3>
      <div class="r-contact">
        ${p.email ? `<span><i class="fa-solid fa-envelope"></i> ${p.email}</span>` : ''}
        ${p.phone ? `<span><i class="fa-solid fa-phone"></i> ${p.phone}</span>` : ''}
        ${p.location ? `<span><i class="fa-solid fa-location-dot"></i> ${p.location}</span>` : ''}
        ${p.link ? `<span><i class="fa-brands fa-linkedin"></i> <a href="${p.link}">${p.link.replace(/^https?:\/\//,'')}</a></span>` : ''}
        ${p.github ? `<span><i class="fa-brands fa-github"></i> <a href="${p.github}">${p.github.replace(/^https?:\/\//,'')}</a></span>` : ''}
      </div>
    </div>
  `;

  // Build Sections
  let summaryTitle = state.profile === 'experienced' ? "Professional Summary" : "Career Objective";
  const secSummary = buildSectionHTML(summaryTitle, p.summary ? `<div class="r-text">${p.summary}</div>` : null);
  const secExp = buildSectionHTML("Experience", renderItems(state.experience, 'title', 'company', 'dates', 'desc'));
  const secInt = buildSectionHTML("Internships", renderItems(state.internships, 'title', 'company', 'dates', 'desc'));
  const secProj = buildSectionHTML("Projects", renderItems(state.projects, 'name', 'link', '', 'desc', 'tech'));
  const secEdu = buildSectionHTML("Education", state.education.map(e => `
    <div class="r-item" style="margin-bottom:0.5rem;">
      <div class="r-item-header">
        <span class="r-item-title">${e.degree||''}</span>
        <span class="r-item-date">${e.year||''}</span>
      </div>
      <div class="r-item-subtitle" style="display:flex; justify-content:space-between;">
        <span>${e.school||''}</span>
        <span>${e.grade ? `Grade: ${e.grade}` : ''}</span>
      </div>
    </div>`).join(''));
  
  const secSkills = buildSectionHTML("Skills", state.skills.length > 0 ? `<div class="r-skills-list">${state.skills.map(s => `<span class="r-skill-tag">${s}</span>`).join('')}</div>` : null);
  
  const secCerts = buildSectionHTML("Certifications", state.extras.certs ? `<div class="r-text" style="white-space:pre-wrap;">${state.extras.certs}</div>` : null);
  const secAch = buildSectionHTML(state.profile === 'experienced' ? "Key Achievements" : "Achievements & Extras", state.extras.achievements ? `<div class="r-text" style="white-space:pre-wrap;">${state.extras.achievements}</div>` : null);
  const secLang = buildSectionHTML("Languages", state.extras.languages ? `<div class="r-text">${state.extras.languages}</div>` : null);
  const secHob = state.profile !== 'experienced' ? buildSectionHTML("Hobbies", state.extras.hobbies ? `<div class="r-text">${state.extras.hobbies}</div>` : null) : null;

  // Order logic based on profile
  let layoutOrder = [];
  if(state.profile === 'fresher-tech') {
    layoutOrder = [secSummary, secEdu, secSkills, secProj, secInt, secCerts, secAch, secLang];
  } else if (state.profile === 'fresher-nontech') {
    layoutOrder = [secSummary, secEdu, secSkills, secInt, secProj, secAch, secCerts, secLang, secHob];
  } else {
    // Experienced
    layoutOrder = [secSummary, secExp, secAch, secSkills, secEdu, secCerts, secLang];
  }

  // Filter out empty sections
  layoutOrder = layoutOrder.filter(Boolean);

  let target = document.getElementById('render-target');

  if(state.template === 'tpl-executive') {
    target.innerHTML = headerHtml + `<div class="r-body">${layoutOrder.join('')}</div>`;
  } else if (state.template === 'tpl-modern-left') {
    // Left Sidebar usually gets Contact, Skills, Education, Languages.
    // Body gets Summary, Experience/Projects
    let sideKeys = ["Skills", "Education", "Languages"];
    let sidebarHtml = `
      <div class="r-name" style="font-size:2rem; margin-bottom:1rem;">${p.name}</div>
      <div class="r-title" style="margin-bottom:2rem; color:var(--text-muted);">${p.title}</div>
      <div class="r-contact" style="margin-bottom:2rem;">
        ${p.email ? `<div><i class="fa-solid fa-envelope"></i> ${p.email}</div>` : ''}
        ${p.phone ? `<div><i class="fa-solid fa-phone"></i> ${p.phone}</div>` : ''}
        ${p.location ? `<div><i class="fa-solid fa-location-dot"></i> ${p.location}</div>` : ''}
        ${p.link ? `<div><i class="fa-brands fa-linkedin"></i> <a href="${p.link}">LinkedIn</a></div>` : ''}
      </div>
      ${secSkills} ${secEdu} ${secLang}
    `;
    let mainHtml = `
      ${secSummary}
      ${state.profile === 'experienced' ? secExp : secInt}
      ${secProj}
      ${secAch}
      ${secCerts}
      ${secHob || ''}
    `;
    target.innerHTML = `<div class="r-sidebar">${sidebarHtml}</div><div class="r-body">${mainHtml}</div>`;
  } else {
    // Right sidebar. Body gets Summary, Exp, Proj. Sidebar gets Skills, Education
    let mainHtml = `
      ${secSummary}
      ${state.profile === 'experienced' ? secExp : secInt}
      ${secProj}
      ${secAch}
    `;
    let sideHtml = `
      ${secSkills}
      ${secEdu}
      ${secCerts}
      ${secLang}
      ${secHob || ''}
    `;
    target.innerHTML = `
      ${headerHtml}
      <div class="content-wrapper">
        <div class="r-body">${mainHtml}</div>
        <div class="r-sidebar">${sideHtml}</div>
      </div>
    `;
  }
}


// --- GROQ API INTEGRATION ---
async function callGroqAPI(prompt, systemPrompt) {
  if (!GROQ_API_KEY) { showToast('Please set your Groq API Key first.'); return null; }
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [ { role: 'system', content: systemPrompt }, { role: 'user', content: prompt } ],
        temperature: 0.7, max_tokens: 1000
      })
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) { console.error(error); showToast('AI request failed. Check API key.'); return null; }
}

async function generateSummary() {
  const reqInfo = `Name: ${state.personal.name}, Title: ${state.personal.title}, Exp: ${JSON.stringify(state.experience)}`;
  document.getElementById('summary-shimmer').classList.add('active');
  const result = await callGroqAPI(reqInfo, "You are an expert resume writer. Write a concise, professional summary/objective (3-4 sentences) highlighting strengths. Output only text.");
  document.getElementById('summary-shimmer').classList.remove('active');
  if (result) {
    const el = document.getElementById('input-summary'); el.value = result;
    el.dispatchEvent(new Event('input')); showToast('Generated!');
  }
}

async function suggestSkills() {
  document.getElementById('skills-shimmer').classList.add('active');
  const result = await callGroqAPI(`Job Title: ${state.personal.title}`, "Suggest a comma-separated list of 8-12 hard and soft skills. ONLY output the comma-separated list.");
  document.getElementById('skills-shimmer').classList.remove('active');
  if (result) {
    result.split(',').map(s=>s.trim().replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g,'')).filter(Boolean).forEach(addSkill);
    showToast('Skills Suggested!');
  }
}

async function improveText(btn) {
  const container = btn.closest('.input-group');
  const textarea = container.querySelector('textarea');
  if(!textarea.value.trim()) return showToast("Please write something first.");
  
  container.querySelector('.shimmer-overlay').classList.add('active');
  const result = await callGroqAPI(textarea.value, "Improve the bullet points to sound professional, impactful, action-oriented. Keep it concise. Return only improved text.");
  container.querySelector('.shimmer-overlay').classList.remove('active');
  if(result) { textarea.value = result; textarea.dispatchEvent(new Event('input')); showToast('Improved!'); }
}

async function evaluateATS() {
  const jd = document.getElementById('input-jd').value.trim();
  if(!jd) return showToast("Please paste a Job Description first.");

  document.getElementById('ats-shimmer').classList.add('active');

  const resumeDataString = JSON.stringify(state);
  const prompt = `Job Description: ${jd}\n\nCandidate Resume: ${resumeDataString}`;
  const system = `You are a strict ATS (Applicant Tracking System). Evaluate the candidate's resume against the Job Description.
Respond ONLY with a valid JSON file detailing the evaluation. Do not include markdown codeblocks or other formatting.
Schema:
{
  "score": <integer between 0 and 100>,
  "missing_keywords": ["keyword1", "keyword2", "keyword3"],
  "feedback": "<A few sentences of constructive feedback>",
  "suggestions": ["<Specific actionable change 1 (e.g. Add XYZ framework to Projects)>", "<Specific actionable change 2>"]
}`;

  const resStr = await callGroqAPI(prompt, system);
  document.getElementById('ats-shimmer').classList.remove('active');

  if(resStr) {
    try {
      // Remove any trailing markdown if the model hallucinated it
      let cleanJson = resStr.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      document.getElementById('ats-score-val').innerText = parsed.score;
      document.getElementById('ats-score-title').innerText = parsed.score >= 80 ? "Great Match!" : parsed.score >= 60 ? "Good Potential" : "Needs Work";
      
      const circ = document.getElementById('ats-score-display');
      circ.style.borderColor = parsed.score >= 80 ? '#10b981' : parsed.score >= 60 ? '#f59e0b' : '#ef4444';

      document.getElementById('ats-keywords').innerHTML = parsed.missing_keywords.map(k => `<span class="skill-chip">${k}</span>`).join('');
      document.getElementById('ats-feedback').innerText = parsed.feedback;

      const suggContainer = document.getElementById('ats-suggestions-container');
      const suggList = document.getElementById('ats-suggestions-list');
      
      if (parsed.score < 80 && parsed.suggestions && parsed.suggestions.length > 0) {
        suggContainer.style.display = 'block';
        suggList.innerHTML = parsed.suggestions.map(s => `<li style="margin-bottom:0.4rem;">${s}</li>`).join('');
      } else {
        suggContainer.style.display = 'none';
      }

      document.getElementById('ats-inputs').style.display = 'none';
      document.getElementById('ats-results').style.display = 'block';
    } catch(e) {
      console.error(e);
      showToast("Could not parse AI response.");
    }
  }
}

// --- EXPORT ---
function showToast(msg) {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div'); t.className = 'toast';
  t.innerHTML = `<i class="fa-solid fa-circle-info" style="color:var(--accent-primary)"></i> ${msg}`;
  c.appendChild(t); setTimeout(() => { t.style.opacity = '0'; setTimeout(()=>t.remove(),300); }, 3000);
}

function downloadPDF() {
  const element = document.getElementById('resume-document');
  showToast("Generating PDF...");
  html2pdf().set({
    margin: 0, filename: `${state.personal.name || 'resume'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }).from(element).save().then(() => {
    showToast("Downloaded!");
    if(window.confetti) confetti({ particleCount: 150, spread: 180, origin: { y: 0.6 } });
  });
}
