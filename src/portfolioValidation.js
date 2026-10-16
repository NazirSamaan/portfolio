export function safeUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : '';
  } catch { return ''; }
}

export function safeImageUrl(value) {
  if (typeof value === 'string' && /^\/(?!\/)[a-zA-Z0-9/_-]+\.(?:jpe?g|png|webp)$/.test(value)) return value;
  return safeUrl(value);
}

export const sections = {
  profile: {
    label: 'Personal information', singular: 'Profile',
    fields: [['name','Full name'],['firstName','First name'],['lastName','Last name'],['role','Professional title'],['availability','Availability'],['tagline','Introduction','textarea'],['aboutTitle','About heading'],['bio','Biography','textarea'],['bioExtra','Additional biography','textarea'],['location','Location'],['focus','Focus'],['github','GitHub URL','url'],['email','Public email','email'],['phone','Public phone'],['portrait','Portrait','image'],['aboutImage','About image','image']]
  },
  projects: { label:'Projects', singular:'Project', fields:[['title','Project title'],['category','Category'],['description','Description','textarea'],['tags','Technologies (one per line)','list'],['features','Features (one per line)','list'],['image','Project image','image'],['sourceUrl','Source code URL','url'],['liveUrl','Live demo URL','url'],['isConcept','This project is a concept','checkbox']] },
  skills: { label:'Skills', singular:'Skill', fields:[['name','Skill name'],['symbol','Symbol or initials'],['category','Category'],['color','Icon color','color']] },
  experience: { label:'Experience', singular:'Experience', fields:[['title','Role / title'],['organization','Organization'],['period','Dates'],['description','Description','textarea'],['tags','Skills (one per line)','list']] },
  education: { label:'Education', singular:'Education', fields:[['title','Qualification'],['institution','Institution'],['period','Dates'],['description','Description','textarea'],['tags','Subjects (one per line)','list']] },
  certifications: { label:'Certifications', singular:'Certification', fields:[['title','Certification name'],['issuer','Issuing organization'],['year','Year'],['description','Description','textarea'],['url','Credential URL','url'],['image','Certificate image','image']] },
  gallery: { label:'Images', singular:'Image', fields:[['title','Caption'],['alt','Image description for accessibility'],['url','Image','image']] },
  cv: { label:'CV / Résumé', singular:'CV', fields:[['label','Download button label'],['url','CV PDF','pdf']] }
};

export function emptyItem(section) {
  const item = { id: crypto.randomUUID() };
  sections[section].fields.forEach(([key,,type]) => { item[key] = type === 'list' ? [] : type === 'checkbox' ? false : type === 'color' ? '#2dd1f4' : ''; });
  if (section === 'projects') { item.visual = 'dashboard'; item.number = ''; }
  return item;
}

export function validateItem(section, item) {
  const fields = sections[section].fields;
  for (const [key,label,type] of fields) {
    const value = item[key];
    if (['url','image','pdf'].includes(type) && value && !(type === 'image' ? safeImageUrl(value) : safeUrl(value))) return `${label} must be a complete HTTPS URL.`;
    if (type === 'list' && (!Array.isArray(value) || value.length > 50 || value.some(v => typeof v !== 'string' || v.length > 500))) return `${label} must contain up to 50 short lines.`;
    if (typeof value === 'string' && value.length > 10000) return `${label} is too long.`;
    if (type === 'color' && !/^#[0-9a-f]{6}$/i.test(value)) return 'Choose a valid icon color.';
    if (type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address.';
  }
  if (Array.isArray(item)) return 'Invalid entry.';
  if (!['profile','cv'].includes(section) && !(item.title || item.name || '').trim()) return 'A name or title is required.';
  if (section === 'gallery' && !safeUrl(item.url)) return 'Upload an image or enter its HTTPS URL.';
  if (['projects','skills'].includes(section) && !item.category?.trim()) return 'A category is required.';
  return '';
}

// Only known fields are rendered. URLs are checked again at the point of use.
export function normalizeContent(input) {
  if (!input || typeof input !== 'object') throw new Error('Invalid portfolio data.');
  const result = {};
  for (const [section, schema] of Object.entries(sections)) {
    const normalize = (raw, index) => {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error(`Invalid ${section} entry.`);
      const item = { id: typeof raw.id === 'string' ? raw.id : `${section}-${index}` };
      for (const [key,,type] of schema.fields) {
        item[key] = type === 'list' ? (Array.isArray(raw[key]) ? raw[key].filter(v => typeof v === 'string').slice(0,50) : []) : type === 'checkbox' ? raw[key] === true : typeof raw[key] === 'string' ? raw[key].slice(0,10000) : type === 'color' ? '#2dd1f4' : '';
      }
      if (section === 'projects') {
        item.visual = ['wildlife','orchid','dashboard','inventory','process','scatter'].includes(raw.visual) ? raw.visual : 'dashboard';
        item.number = String(index+1).padStart(2,'0');
      }
      return item;
    };
    if (section === 'profile' || section === 'cv') result[section] = normalize(input[section] || {},0);
    else {
      if (!Array.isArray(input[section]) || input[section].length > 200) throw new Error(`Invalid ${section} collection.`);
      result[section] = input[section].map(normalize);
    }
  }
  return result;
}

export async function validateUpload(file, kind) {
  const max = kind === 'pdf' ? 10*1024*1024 : 5*1024*1024;
  if (!file || file.size > max) throw new Error(`Choose a file smaller than ${kind === 'pdf' ? '10' : '5'} MB.`);
  const imageTypes = ['image/jpeg','image/png','image/webp'];
  if (kind === 'pdf' ? file.type !== 'application/pdf' : !imageTypes.includes(file.type)) throw new Error(kind === 'pdf' ? 'Choose a PDF file.' : 'Choose a JPEG, PNG, or WebP image.');
  const bytes = new Uint8Array(await file.slice(0,12).arrayBuffer());
  const starts = values => values.every((v,i) => bytes[i] === v);
  const valid = file.type === 'application/pdf' ? starts([37,80,68,70,45]) : file.type === 'image/jpeg' ? starts([255,216,255]) : file.type === 'image/png' ? starts([137,80,78,71,13,10,26,10]) : starts([82,73,70,70]) && [87,69,66,80].every((v,i)=>bytes[i+8]===v);
  if (!valid) throw new Error('The file contents do not match its file type.');
}
