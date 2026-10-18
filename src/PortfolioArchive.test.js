import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import PortfolioArchive from './PortfolioArchive';
import archive from './portfolioArchive.json';

let root, container;
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(<PortfolioArchive/>));
});
afterEach(() => { act(() => root.unmount()); container.remove(); });
const click = element => act(() => element.dispatchEvent(new MouseEvent('click', { bubbles: true })));

test('shows a limited image gallery and expands to every imported entry', () => {
  expect(container.querySelectorAll('.archive-card')).toHaveLength(8);
  click(container.querySelector('.center-action button'));
  expect(container.querySelectorAll('.archive-card')).toHaveLength(archive.length);
  expect(container.querySelectorAll('a[download]')).toHaveLength(archive.filter(item => item.file).length);
  expect(container.querySelector('video').getAttribute('preload')).toBe('none');
});

test('filters archive files by discipline with original download URLs', () => {
  click(Array.from(container.querySelectorAll('.filters button')).find(b => b.textContent === 'Data Analytics'));
  const count = archive.filter(item => item.category === 'Data Analytics').length;
  expect(container.querySelector('[role="status"]').textContent).toContain(`${count} entries`);
  click(container.querySelector('.center-action button'));
  expect(container.querySelectorAll('.archive-card')).toHaveLength(count);
  for (const card of container.querySelectorAll('.archive-card')) {
    expect(card.querySelector('.archive-caption').textContent).toContain('Data Analytics');
    expect(card.querySelector('a[download]').getAttribute('href')).toContain('/portfolio/files/');
  }
});
