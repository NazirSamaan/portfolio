import { defaultContent } from './portfolioData';
import { normalizeContent, safeUrl, safeImageUrl, validateItem, validateUpload } from './portfolioValidation';

test('supports bundled image paths without permitting unsafe image sources', () => {
  expect(safeImageUrl('/images/graduation.jpeg')).toBe('/images/graduation.jpeg');
  expect(safeImageUrl('/portfolio/images/graduation.jpeg')).toBe('/portfolio/images/graduation.jpeg');
  ['//example.com/image.jpeg', '/images/../secret.jpeg', 'javascript:alert(1)', '/images/photo.svg'].forEach(value => expect(safeImageUrl(value)).toBe(''));
  expect(validateItem('profile',defaultContent.profile)).toBe('');
});

test('rejects executable and insecure links', () => {
  ['javascript:alert(1)','data:text/html,<script/>','http://example.com','/local','not a URL'].forEach(url=>expect(safeUrl(url)).toBe(''));
  expect(safeUrl('https://example.com/file.pdf')).toBe('https://example.com/file.pdf');
});

test('empty collections stay deleted and unknown fields are dropped', () => {
  const content = normalizeContent({...defaultContent,projects:[],skills:[],privatePassword:'never render'});
  expect(content.projects).toEqual([]);
  expect(content.skills).toEqual([]);
  expect(content.privatePassword).toBeUndefined();
  expect(()=>normalizeContent({...defaultContent,projects:'bad'})).toThrow();
});

test('validates public project fields before publishing', () => {
  const project = {...defaultContent.projects[0],sourceUrl:'javascript:alert(1)'};
  expect(validateItem('projects',project)).toContain('HTTPS');
  expect(validateItem('projects',{...project,sourceUrl:'https://github.com',title:''})).toContain('required');
  expect(validateItem('projects',{...project,sourceUrl:''})).toBe('');
});

const file = (type, bytes, size=bytes.length) => ({type,size,slice:()=>({arrayBuffer:async()=>Uint8Array.from(bytes).buffer})});
test('checks file type, size, and signatures before an upload', async () => {
  await expect(validateUpload(file('application/pdf',[37,80,68,70,45]),'pdf')).resolves.toBeUndefined();
  await expect(validateUpload(file('image/png',[137,80,78,71,13,10,26,10]),'image')).resolves.toBeUndefined();
  await expect(validateUpload(file('image/png',[60,115,99,114,105,112,116]),'image')).rejects.toThrow('contents');
  await expect(validateUpload(file('image/svg+xml',[60,115,118,103]),'image')).rejects.toThrow('JPEG');
  await expect(validateUpload(file('application/pdf',[37,80,68,70,45],11*1024*1024),'pdf')).rejects.toThrow('10 MB');
});
