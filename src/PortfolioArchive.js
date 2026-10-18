import { useState } from 'react';
import archive from './portfolioArchive.json';
import './PortfolioArchive.css';

const asset = path => path.startsWith('https://github.com/NazirSamaan/portfolio/releases/download/') ? path : `${process.env.PUBLIC_URL || ''}/${path}`;
function fileSize(bytes) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function PortfolioArchive() {
  const [filter, setFilter] = useState('All');
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const matching = archive.filter(item => (filter === 'All' || item.category === filter) && `${item.title} ${item.source} ${item.type}`.toLowerCase().includes(query.toLowerCase()));
  const visible = expanded ? matching : matching.slice(0, 8);
  return <section id="portfolio-archive" className="section archive-section" aria-labelledby="archive-title">
    <div className="archive-heading"><div><span className="eyebrow">FROM MY PROJECT FOLDER</span><h2 id="archive-title">The portfolio archive<span>.</span></h2><p>Websites, reports, prototypes, and coursework. A look at the files behind my work.</p></div><span className="archive-total">{archive.length} entries</span></div>
    <div className="archive-toolbar"><div className="filters" aria-label="Filter portfolio archive">{['All', 'Software Development', 'Data Analytics'].map(value => <button key={value} aria-pressed={filter === value} className={filter === value ? 'selected' : ''} onClick={() => { setFilter(value); setExpanded(false); }}>{value}</button>)}</div><label className="archive-search"><span className="archive-sr-only">Search portfolio files</span><input type="search" placeholder="Find a project or file…" value={query} onChange={e => { setQuery(e.target.value); setExpanded(false); }}/></label></div>
    <p className="archive-results" role="status">{matching.length} {matching.length === 1 ? 'entry' : 'entries'}{query ? ` matching “${query}”` : ''}</p>
    <div className="archive-grid">{visible.map(item => <article className="archive-card" key={item.id}>
      <a className="archive-picture" href={asset(item.image)} target="_blank" rel="noreferrer" aria-label={`View preview of ${item.title}`}><img src={asset(item.image)} alt={`${item.title} — ${item.previewNote.toLowerCase()}`} loading="lazy"/><span className="archive-format">{item.type}</span></a>
      <div className="archive-caption"><span>{item.category}</span><span>{item.previewNote}</span></div><h3>{item.title}</h3><p className="archive-source">{item.source}</p>
      {item.video && <video controls preload="none" poster={asset(item.image)} aria-label={item.title}><source src={asset(item.video)} type="video/mp4"/>Your browser does not support video playback.</video>}
      <div className="archive-links">{item.file ? <a href={asset(item.file)} download>Download {item.type} <span>↗</span><small>{fileSize(item.size)}</small></a> : <span>Full project archive available on request</span>}{item.website && <a href={item.website} target="_blank" rel="noopener noreferrer">Visit website ↗</a>}</div>
    </article>)}</div>
    {!matching.length && <p className="archive-empty">No files match this search. Try a project name or file type.</p>}
    {matching.length > 8 && <div className="center-action"><button className="button outline" onClick={() => setExpanded(!expanded)}>{expanded ? 'Show fewer files' : `View all ${matching.length} entries`}</button></div>}
  </section>;
}
