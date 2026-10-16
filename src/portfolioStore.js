import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { defaultContent } from './portfolioData';
import { normalizeContent, validateItem, validateUpload } from './portfolioValidation';

export async function loadPortfolio() {
  if (!supabase) return { content: normalizeContent(defaultContent), version: 0 };
  const { data, error } = await supabase.from('portfolio_content').select('data,version').eq('id', true).maybeSingle();
  if (error) throw error;
  return data ? {content:normalizeContent(data.data),version:data.version} : {content:normalizeContent(defaultContent),version:0};
}

export function usePortfolioContent() {
  const [content, setContent] = useState(() => normalizeContent(defaultContent));
  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    loadPortfolio().then(result => { if (!cancelled) setContent(result.content); }).catch(() => { /* Keep the bundled portfolio available during service outages. */ });
    return () => { cancelled = true; };
  }, []);
  return { content };
}

export async function verifyOwner() {
  if (!supabase) return false;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return false;
  const {data:allowed,error:denied} = await supabase.rpc('is_portfolio_owner');
  return !denied && allowed === true;
}

export async function publishPortfolio(content, version) {
  if (!supabase || !await verifyOwner()) throw new Error('Your session has expired or this account is not the owner. Sign in again.');
  const clean = normalizeContent(content);
  for (const key of Object.keys(clean)) {
    const entries = Array.isArray(clean[key]) ? clean[key] : [clean[key]];
    for (const item of entries) { const error = validateItem(key,item); if(error) throw new Error(`${key}: ${error}`); }
  }
  const { data, error } = await supabase.rpc('save_portfolio', { document:clean, expected_version:version });
  if (error) throw error;
  if (!data?.length) throw new Error('The portfolio changed in another session. Reload the published version before saving.');
  return { content: normalizeContent(data[0].data), version: data[0].version };
}

export async function uploadAsset(file, kind) {
  await validateUpload(file,kind);
  if (!supabase || !await verifyOwner()) throw new Error('Only the owner can upload files. Sign in again.');
  const extensions = {'image/jpeg':'jpg','image/png':'png','image/webp':'webp','application/pdf':'pdf'};
  const path = `${crypto.randomUUID()}.${extensions[file.type]}`;
  const {error} = await supabase.storage.from('portfolio-public').upload(path,file,{contentType:file.type,cacheControl:'3600',upsert:false});
  if(error) throw error;
  return { path, url:supabase.storage.from('portfolio-public').getPublicUrl(path).data.publicUrl };
}

export async function listAssets() {
  const { data, error } = await supabase.storage.from('portfolio-public').list('',{limit:1000,sortBy:{column:'created_at',order:'desc'}});
  if(error) throw error;
  return data.filter(file=>file.id).map(file=>({...file,url:supabase.storage.from('portfolio-public').getPublicUrl(file.name).data.publicUrl}));
}

export async function deleteAsset(path) {
  if (!await verifyOwner()) throw new Error('Only the owner can delete uploads.');
  const {error} = await supabase.storage.from('portfolio-public').remove([path]);
  if(error) throw error;
}
