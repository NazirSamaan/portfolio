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

test('shows only the eight retained screenshot entries with downloads', () => {
  expect(container.querySelectorAll('.archive-card')).toHaveLength(8);
  expect(container.querySelector('.center-action button')).toBeNull();
  expect(Array.from(container.querySelectorAll('.archive-card h3'), heading => heading.textContent)).toEqual([
    'Bright Master College', 'Kingdom Rides Cycling Club', '27_U18_A2_Nazir',
    'Database', 'DatabaseSDLC', 'Design', 'Now Opening Picture', 'Prototyping Version 2',
  ]);
  expect(container.querySelectorAll('a[download]')).toHaveLength(archive.filter(item => item.file).length);
});

test('filters archive files by discipline with original download URLs', () => {
  click(Array.from(container.querySelectorAll('.filters button')).find(b => b.textContent === 'Data Analytics'));
  const count = archive.filter(item => item.category === 'Data Analytics').length;
  expect(container.querySelector('[role="status"]').textContent).toContain(`${count} entries`);
  expect(container.querySelectorAll('.archive-card')).toHaveLength(count);
  for (const card of container.querySelectorAll('.archive-card')) {
    expect(card.querySelector('.archive-caption').textContent).toContain('Data Analytics');
    expect(card.querySelector('a[download]').getAttribute('href')).toContain('/portfolio/files/');
  }
});
