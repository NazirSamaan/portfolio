import { useEffect, useRef, useState } from 'react';
import { configured, supabase } from '../supabaseClient';
import { loadPortfolio, verifyOwner, publishPortfolio, uploadAsset, listAssets, deleteAsset } from '../portfolioStore';
import { sections, emptyItem, safeUrl, safeImageUrl, validateItem } from '../portfolioValidation';
import './Admin.css';

const clone = value => JSON.parse(JSON.stringify(value));
const titleOf = item => item.title || item.name || 'Untitled';

function useDialogFocus() {
  const previous = useRef(document.activeElement);
  useEffect(() => {
    const restoreFocus = previous.current;
    const dialog = document.querySelector('.admin-overlay');
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const trap = e => {
      if (e.key !== 'Tab') return;
      const items = Array.from(dialog.querySelectorAll('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),a[href]'));
      const first = items[0], last = items[items.length-1];
      if (e.shiftKey && document.activeElement === first) {e.preventDefault();last?.focus();}
      else if (!e.shiftKey && document.activeElement === last) {e.preventDefault();first?.focus();}
    };
    dialog.addEventListener('keydown',trap);
    return () => {dialog.removeEventListener('keydown',trap);document.body.style.overflow=oldOverflow;restoreFocus?.focus();};
  },[]);
}

function Confirmation({ confirmation, close }) {
  useDialogFocus();
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  return <div className="admin-overlay"><section className="admin-confirm" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"><h2 id="confirm-title">{confirmation.title}</h2><p>{confirmation.message}</p>{error&&<p className="admin-error" role="alert">{error}</p>}<div className="admin-form-actions"><button autoFocus disabled={busy} onClick={close}>Cancel</button><button className={confirmation.danger?'danger':'primary'} disabled={busy} onClick={async()=>{setBusy(true);try{await confirmation.action();close();}catch(e){setError(e.message || 'The operation failed.');setBusy(false);}}}>{busy?'Working…':confirmation.label || 'Confirm'}</button></div></section></div>;
}

function Editor({ section, initial, onSave, onClose }) {
  useDialogFocus();
  const [item,setItem] = useState(()=>clone(initial));
  const [error,setError] = useState('');
  const [uploading,setUploading] = useState('');
  const [changed,setChanged] = useState(false);
  const update=(key,value)=>{setItem(old=>({...old,[key]:value}));setChanged(true);setError('');};
  const close=()=>{if(!uploading&&(!changed||window.confirm('Discard the changes in this editor?')))onClose();};
  useEffect(()=>{const listener=e=>{if(e.key==='Escape'&&!uploading) { if(!changed||window.confirm('Discard the changes in this editor?'))onClose(); }};document.addEventListener('keydown',listener);return()=>document.removeEventListener('keydown',listener);},[changed,uploading,onClose]);
  return <div className="admin-overlay"><section className="admin-editor" role="dialog" aria-modal="true" aria-labelledby="editor-title"><header><div><span className="admin-eyebrow">CONTENT EDITOR</span><h2 id="editor-title">{sections[section].singular}</h2></div><button type="button" onClick={close} disabled={Boolean(uploading)} aria-label="Close editor">×</button></header><form onSubmit={e=>{e.preventDefault();const problem=validateItem(section,item);if(problem){setError(problem);return;}onSave(item);}}><div className="admin-editor-fields">{sections[section].fields.map(([key,label,type])=><label className={`admin-field ${type==='checkbox'?'checkbox-field':''}`} key={key}>{type==='checkbox'?<><input type="checkbox" checked={item[key]===true} onChange={e=>update(key,e.target.checked)}/>{label}</>:<><span>{label}</span>{['textarea','list'].includes(type)?<textarea autoFocus={key===sections[section].fields[0][0]} rows={type==='list'?3:4} value={type==='list'?(item[key]||[]).join('\n'):item[key]||''} maxLength={10000} onChange={e=>update(key,type==='list'?e.target.value.split('\n'):e.target.value)}/>:<input autoFocus={key===sections[section].fields[0][0]} type={type==='color'?'color':type==='email'?'email':['pdf','url'].includes(type)?'url':'text'} value={item[key]||''} maxLength={10000} placeholder={['image','pdf','url'].includes(type)?'https://…':undefined} onChange={e=>update(key,e.target.value)}/ >}{['image','pdf'].includes(type)&&<><div className="admin-upload"><input type="file" aria-label={`Upload ${label}`} accept={type==='pdf'?'application/pdf':'image/jpeg,image/png,image/webp'} disabled={Boolean(uploading)} onChange={async e=>{const file=e.target.files[0];if(!file)return;setUploading(key);setError('');try{const result=await uploadAsset(file,type);update(key,result.url);}catch(err){setError(err.message);}finally{setUploading('');e.target.value='';}}}/><small>{uploading===key?'Uploading…':type==='pdf'?'PDF · up to 10 MB':'JPEG, PNG, WebP · up to 5 MB'}</small></div>{(type==='image'?safeImageUrl(item[key]):safeUrl(item[key]))&&(type==='image'?<img className="admin-image-preview" src={safeImageUrl(item[key])} alt={`${label} preview`}/>:<a href={safeUrl(item[key])} target="_blank" rel="noreferrer">Preview CV ↗</a>)}</>}</>}</label>)}</div><p className="admin-upload-note">Uploaded images and CV files are public portfolio assets immediately. Only upload files you want visitors to access. Saved text changes stay in this session until you publish.</p>{error&&<p className="admin-error" role="alert">{error}</p>}<div className="admin-form-actions"><button type="button" onClick={close} disabled={Boolean(uploading)}>Cancel</button><button type="submit" className="primary" disabled={Boolean(uploading)}>Save to draft</button></div></form></section></div>;
}

function Dashboard({ onSignOut }) {
  const [content,setContent] = useState(null);
  const [published,setPublished] = useState(null);
  const [version,setVersion] = useState(0);
  const [section,setSection] = useState('overview');
  const [query,setQuery] = useState('');
  const [dirty,setDirty] = useState(false);
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [editor,setEditor] = useState(null);
  const [confirmation,setConfirmation] = useState(null);
  const [assets,setAssets] = useState([]);
  const [assetsLoading,setAssetsLoading] = useState(false);

  const reload = async()=>{setError('');const result=await loadPortfolio();setContent(result.content);setPublished(result.content);setVersion(result.version);setDirty(false);};
  useEffect(()=>{let cancelled=false;loadPortfolio().then(result=>{if(!cancelled){setContent(result.content);setPublished(result.content);setVersion(result.version);}}).catch(e=>{if(!cancelled)setError(e.message);});return()=>{cancelled=true;};},[]);
  useEffect(()=>{const before=e=>{if(dirty){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',before);return()=>window.removeEventListener('beforeunload',before);},[dirty]);
  useEffect(()=>{if(section!=='uploads')return;let cancelled=false;setAssetsLoading(true);listAssets().then(data=>{if(!cancelled)setAssets(data);}).catch(e=>{if(!cancelled)setError(e.message);}).finally(()=>{if(!cancelled)setAssetsLoading(false);});return()=>{cancelled=true;};},[section]);
  const edit=(key,item,index)=>setEditor({section:key,item:clone(item),index});
  const markChanged=next=>{setContent(next);setDirty(true);setNotice('Draft updated. Publish when you are ready.');};
  const saveItem=item=>{
    const key=editor.section;
    const next=clone(content);
    if(['profile','cv'].includes(key))next[key]=item;
    else if(editor.index===null)next[key].push(item);
    else next[key][editor.index]=item;
    markChanged(next);setEditor(null);
  };
  const remove=(key,item,index)=>setConfirmation({title:`Delete ${sections[key].singular.toLowerCase()}?`,message:`“${titleOf(item)}” will be removed from your draft. The live website changes only when you publish.`,label:'Delete from draft',danger:true,action:()=>{const next=clone(content);next[key].splice(index,1);markChanged(next);}});
  const move=(index,direction)=>{const next=clone(content);const other=index+direction;[next[section][index],next[section][other]]=[next[section][other],next[section][index]];markChanged(next);};
  const publish=()=>setConfirmation({title:'Publish your changes?',message:'Your saved draft will replace the portfolio content shown to all visitors. Personal information in the profile will be public.',label:'Publish changes',action:async()=>{const result=await publishPortfolio(content,version);setContent(result.content);setPublished(result.content);setVersion(result.version);setDirty(false);setNotice('Published successfully. Your website now shows these changes.');}});
  const switchSection=key=>{setSection(key);setQuery('');setNotice('');setError('');};
  const isUsed=url=>JSON.stringify(content).includes(url)||JSON.stringify(published).includes(url);
  const counts=content?['projects','skills','experience','certifications'].map(key=>({key,count:content[key].length})):[];
  return <div className="admin-shell"><aside className="admin-sidebar"><a className="admin-brand" href="./"><span>N</span> Nazir Portfolio</a><div className="admin-owner"><span>●</span> OWNER WORKSPACE<small>Private editing access</small></div><nav aria-label="Dashboard sections"><button className={section==='overview'?'active':''} onClick={()=>switchSection('overview')}>◈ <span>Overview</span></button>{Object.entries(sections).map(([key,schema])=><button key={key} className={section===key?'active':''} onClick={()=>switchSection(key)}>{({profile:'◎',projects:'▣',skills:'⌘',experience:'▤',education:'◇',certifications:'✧',gallery:'▧',cv:'↓'})[key]} <span>{schema.label}</span></button>)}<button className={section==='uploads'?'active':''} onClick={()=>switchSection('uploads')}>↑ <span>Upload library</span></button></nav><div className="admin-sidebar-bottom"><a href="./" target="_blank" rel="noreferrer">View portfolio ↗</a><button onClick={()=>{if(!dirty||window.confirm('Sign out and discard your unpublished draft?'))onSignOut();}}>Sign out</button></div></aside><main className="admin-main"><header className="admin-topbar"><span><span className="admin-lock">◆</span> Owner dashboard</span><span className={`admin-save-state ${dirty?'unsaved':''}`}>{dirty?'● Unpublished changes':'● Up to date'}</span></header><div className="admin-workspace"><div className="admin-page-heading"><div><span className="admin-eyebrow">YOUR PERSONAL CORNER OF THE WEB</span><h1>{section==='overview'?'Welcome back, Nazir.':section==='uploads'?'Upload library':sections[section].label}</h1><p>{section==='overview'?'Keep your portfolio as current as your next idea.':'Manage the details that make your portfolio yours.'}</p></div><div className="admin-heading-actions"><button disabled={!content} onClick={()=>setConfirmation({title:'Reload published content?',message:'Any unpublished changes in this session will be discarded.',label:'Reload',action:reload})}>Reload</button><button className="primary" disabled={!content||(!dirty&&version>0)} onClick={publish}>Publish changes ↗</button></div></div>{error&&<p role="alert" className="admin-error">{error}</p>}{notice&&<p role="status" className="admin-notice">{notice}</p>}{!content?<div className="admin-empty"><h2>{error?'Content could not be loaded':'Loading your portfolio…'}</h2>{error&&<button onClick={()=>reload().catch(e=>setError(e.message))}>Try again</button>}</div>:<>
      {section==='overview'&&<><div className="admin-stat-grid">{counts.map(({key,count})=><button key={key} onClick={()=>switchSection(key)}><span>{sections[key].label}</span><strong>{String(count).padStart(2,'0')}</strong><small>Manage {sections[key].label.toLowerCase()} ↗</small></button>)}</div><div className="admin-overview-grid"><article className="admin-panel"><span className="admin-eyebrow">A GOOD PLACE TO START</span><h2>Tell your story.</h2><p>Update your profile, add your latest project, or upload a fresh CV. Save changes to your draft, then publish when everything looks right.</p><button className="primary" onClick={()=>{switchSection('profile');edit('profile',content.profile);}}>Edit personal information →</button></article><article className="admin-panel"><h2>Publishing checklist</h2><ul className="admin-checklist"><li>✓ Check your public contact details</li><li>✓ Replace concept projects with your work</li><li>✓ Add clear image descriptions</li><li>✓ Upload only public images and documents</li></ul><small>Access is checked with Supabase Auth. Write access is enforced by database and storage policies.</small></article></div><article className="admin-panel admin-recent"><div className="admin-panel-heading"><h2>Your projects</h2><button onClick={()=>switchSection('projects')}>Manage all →</button></div>{content.projects.slice(0,4).map(item=><div key={item.id}><span>{item.title}</span><small>{item.category}</small></div>)}</article></>}
      {['profile','cv'].includes(section)&&<article className="admin-panel admin-single"><div className="admin-panel-heading"><h2>{sections[section].label}</h2><button className="primary" onClick={()=>edit(section,content[section])}>Edit {section==='cv'?'CV':'profile'}</button></div>{section==='profile'?<><div className="admin-profile-preview">{safeImageUrl(content.profile.portrait)&&<img src={safeImageUrl(content.profile.portrait)} alt="Your portrait"/>}<div><h2>{content.profile.name}</h2><p>{content.profile.role}</p><small>{content.profile.location}</small></div></div><p>{content.profile.bio}</p><p className="admin-upload-note">All profile fields are public website content. Clear a field in the editor to remove it.</p></>:<><p>A CV download button appears on your public portfolio when a PDF URL is set.</p>{safeUrl(content.cv.url)?<div className="admin-cv-actions"><a href={safeUrl(content.cv.url)} target="_blank" rel="noreferrer">Preview current CV ↗</a><button className="danger" onClick={()=>setConfirmation({title:'Remove public CV?',message:'The download button will disappear after you publish. Delete the old PDF from Upload library afterwards to remove the file itself.',label:'Remove CV',danger:true,action:()=>markChanged({...content,cv:{...content.cv,url:''}})})}>Remove CV link</button></div>:<div className="admin-empty">No CV added yet.</div>}</>}</article>}
      {!['overview','profile','cv','uploads'].includes(section)&&<article className="admin-panel"><div className="admin-panel-heading"><div><h2>{sections[section].label}<small className="admin-count">{content[section].length}</small></h2><p>Add, edit, arrange, or remove entries.</p></div><button className="primary" disabled={content[section].length>=200} onClick={()=>edit(section,emptyItem(section),null)}>+ Add {sections[section].singular.toLowerCase()}</button></div><label className="admin-search"><span>Search {sections[section].label.toLowerCase()}</span><input type="search" placeholder={`Search ${sections[section].label.toLowerCase()}…`} value={query} onChange={e=>setQuery(e.target.value)}/></label><div className="admin-item-list">{content[section].map((item,index)=>({item,index})).filter(({item})=>`${titleOf(item)} ${item.category||''} ${item.organization||''}`.toLowerCase().includes(query.toLowerCase())).map(({item,index})=><article className="admin-item" key={item.id}>{safeImageUrl(item.image||item.url)?<img src={safeImageUrl(item.image||item.url)} alt=""/>:<span className="admin-item-icon" style={{color:item.color||'#2dd1f4'}}>{item.symbol||String(index+1).padStart(2,'0')}</span>}<div className="admin-item-text"><h3>{titleOf(item)}</h3><p>{item.category||item.organization||item.institution||item.issuer||item.alt||item.description}</p></div><div className="admin-item-actions"><button aria-label={`Move ${titleOf(item)} up`} disabled={index===0} onClick={()=>move(index,-1)}>↑</button><button aria-label={`Move ${titleOf(item)} down`} disabled={index===content[section].length-1} onClick={()=>move(index,1)}>↓</button><button onClick={()=>edit(section,item,index)} aria-label={`Edit ${titleOf(item)}`}>Edit</button><button className="danger-text" onClick={()=>remove(section,item,index)} aria-label={`Delete ${titleOf(item)}`}>Delete</button></div></article>)}</div>{content[section].length===0&&<div className="admin-empty"><h3>Make this space yours.</h3><p>Add your first {sections[section].singular.toLowerCase()} to get started.</p></div>}{query&&!content[section].some(item=>`${titleOf(item)} ${item.category||''} ${item.organization||''}`.toLowerCase().includes(query.toLowerCase()))&&<p className="admin-empty">No matching entries.</p>}</article>}
      {section==='uploads'&&<article className="admin-panel"><h2>Public portfolio files</h2><p>Upload images or a CV from their content editor. Deleting an entry does not delete its file. Files still used by the published site or this draft are protected here.</p>{assetsLoading?<p>Loading files…</p>:<div className="admin-asset-grid">{assets.map(asset=><article key={asset.id}>{/\.pdf$/i.test(asset.name)?<span className="admin-pdf-icon">PDF</span>:<img src={asset.url} alt="Uploaded portfolio asset" loading="lazy"/>}<a href={asset.url} target="_blank" rel="noreferrer">Preview file ↗</a><small>{asset.name}</small><button className="danger-text" disabled={isUsed(asset.url)} onClick={()=>setConfirmation({title:'Permanently delete this file?',message:'The public URL will stop working. This cannot be undone. Make sure you have a backup.',label:'Delete file',danger:true,action:async()=>{const latest=await loadPortfolio();if(JSON.stringify(latest.content).includes(asset.url))throw new Error('This file is used by the published site. Remove its reference and publish first.');await deleteAsset(asset.name);setAssets(old=>old.filter(a=>a.id!==asset.id));setNotice('File deleted.');}})}>{isUsed(asset.url)?'In use':'Delete file'}</button></article>)}</div>}{!assetsLoading&&!assets.length&&<p className="admin-empty">No files uploaded yet.</p>}</article>}
    </>}</div></main>{editor&&<Editor key={`${editor.section}-${editor.item.id}`} section={editor.section} initial={editor.item} onSave={saveItem} onClose={()=>setEditor(null)}/>}{confirmation&&<Confirmation confirmation={confirmation} close={()=>setConfirmation(null)}/>}</div>;
}

export default function Admin() {
  const sessionOwner = useRef(null);
  const [session,setSession] = useState(null);
  const [checking,setChecking] = useState(configured);
  const [allowed,setAllowed] = useState(false);
  const [error,setError] = useState('');
  const [busy,setBusy] = useState(false);
  useEffect(()=>{
    const meta=document.createElement('meta');meta.name='robots';meta.content='noindex, nofollow, noarchive';document.head.appendChild(meta);
    const previous=document.title;document.title='Owner workspace | Nazir Portfolio';
    return()=>{meta.remove();document.title=previous;};
  },[]);
  useEffect(()=>{
    if(!configured || !supabase)return;
    let alive=true;
    supabase.auth.getSession().then(({data,error:err})=>{if(alive){sessionOwner.current=data.session?.user?.id;setSession(data.session);if(err)setError('Could not restore your session. Sign in again.');if(!data.session)setChecking(false);}});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,current)=>{if(alive){setSession(current);if(sessionOwner.current!==current?.user?.id){setAllowed(false);setChecking(Boolean(current));}sessionOwner.current=current?.user?.id;}});
    return()=>{alive=false;subscription.unsubscribe();};
  },[]);
  useEffect(()=>{
    if(!session){setAllowed(false);return;}
    let alive=true;
    verifyOwner().then(ok=>{if(alive){setAllowed(ok);setChecking(false);if(!ok)setError('This account does not have owner access.');}}).catch(()=>{if(alive){setAllowed(false);setChecking(false);setError('Access could not be verified. Try signing in again.');}});
    return()=>{alive=false;};
  },[session]);
  const signOut=async()=>{setAllowed(false);setChecking(false);setSession(null);setError('');const {error:err}=await supabase.auth.signOut({scope:'local'});if(err)setError('The session was locked. Close this tab to clear its saved sign-in.');};
  useEffect(()=>{
    if(!allowed)return;
    let timer;
    const reset=()=>{clearTimeout(timer);timer=setTimeout(()=>{setAllowed(false);setSession(null);supabase.auth.signOut({scope:'local'});setError('You were signed out after 20 minutes of inactivity.');},20*60*1000);};
    const events=['pointerdown','keydown'];events.forEach(event=>window.addEventListener(event,reset));reset();
    return()=>{clearTimeout(timer);events.forEach(event=>window.removeEventListener(event,reset));};
  },[allowed]);
  if(allowed)return <Dashboard onSignOut={signOut}/>;
  return <main className="admin-login-page"><a className="admin-login-brand" href="./"><span>N</span> Nazir Portfolio</a><section className="admin-login"><span className="admin-lock-badge">◆</span><span className="admin-eyebrow">OWNER WORKSPACE</span><h1>{!configured?'Dashboard is locked':checking?'Checking your access…':'Welcome back.'}</h1><p>{!configured?'Connect Supabase using the setup guide in ADMIN_SETUP.md. No one can edit the portfolio through this dashboard until authentication and owner policies are configured.':'Sign in to manage your portfolio. Access is limited to the owner account.'}</p>{!configured?<a href="./" className="admin-public-link">Return to portfolio →</a>:checking?<div className="admin-loading">Verifying your session…</div>:session?<><p className="admin-error" role="alert">{error||'Owner access is required.'}</p><button onClick={signOut}>Sign out</button></>:<form onSubmit={async e=>{e.preventDefault();const data=new FormData(e.currentTarget);setBusy(true);setError('');try{const {error:err}=await supabase.auth.signInWithPassword({email:data.get('email'),password:data.get('password')});if(err)throw err;}catch{setError('Sign-in failed. Check your credentials and try again.');}finally{setBusy(false);}}}><label>Email<input autoFocus type="email" name="email" required autoComplete="username" placeholder="Your owner email"/></label><label>Password<input type="password" name="password" required autoComplete="current-password"/></label>{error&&<p className="admin-error" role="alert">{error}</p>}<button type="submit" className="primary" disabled={busy}>{busy?'Signing in…':'Sign in securely →'}</button><p className="admin-login-footnote">No public registration. Manage password recovery from your Supabase project.</p></form>}</section><small>Unlisted from the public website. Protected by authentication and owner access rules.</small></main>;
}
