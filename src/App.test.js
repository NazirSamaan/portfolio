import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

jest.mock('./portfolioStore', () => ({
  usePortfolioContent: () => ({ content: require('./portfolioValidation').normalizeContent(require('./portfolioData').defaultContent) })
}));

let container;
let root;
beforeEach(() => {
  localStorage.clear();
  global.IS_REACT_ACT_ENVIRONMENT = true;
  global.IntersectionObserver = class {
    observe() {}
    disconnect() {}
  };
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(<App />));
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});
const click = element => act(() => element.dispatchEvent(new MouseEvent('click', { bubbles: true })));

test('presents work once and keeps the coursework archive closed initially', () => {
  expect(container.querySelector('.work-index')).toBeNull();
  expect(container.querySelectorAll('#projects')).toHaveLength(1);
  expect(container.querySelector('.coursework-drawer').open).toBe(false);
  expect(container.querySelector('.editorial-portrait img').getAttribute('src')).toContain('graduation.jpeg');
  expect(container.querySelectorAll('.experience-role')).toHaveLength(2);
  expect(container.querySelector('.role-story').textContent).toContain('I built a Wildlife Management app');
});

test('filters project cards by category and restores all projects', () => {
  expect(container.querySelectorAll('.project-card')).toHaveLength(5);
  const buttons = Array.from(container.querySelectorAll('[aria-label="Filter projects"] button'));
  click(buttons.find(button => button.textContent === 'Software Development'));
  expect(container.querySelectorAll('.project-card')).toHaveLength(2);
  expect(container.querySelector('.project-card').textContent).toContain('Wildlife');
  click(buttons.find(button => button.textContent === 'All'));
  expect(container.querySelectorAll('.project-card')).toHaveLength(5);
});

test('project details show the selected content and close with Escape', () => {
  const card = container.querySelector('.project-card');
  click(card);
  expect(container.querySelector('[role="dialog"]').textContent).toContain('Wildlife Reporting Mobile App');
  expect(document.body.style.overflow).toBe('hidden');
  const features = Array.from(container.querySelectorAll('[role="tab"]')).find(button => button.textContent.includes('Features'));
  click(features);
  expect(container.querySelector('[role="tabpanel"]').textContent).toContain('Wildlife tracking and incident reporting');
  act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
  expect(container.querySelector('[role="dialog"]')).toBeNull();
  expect(document.body.style.overflow).toBe('');
  expect(document.activeElement).toBe(card);
});

test('theme, mobile navigation, and skill filters respond to input', () => {
  expect(container.querySelector('.site').classList.contains('light')).toBe(true);
  click(container.querySelector('.theme-toggle'));
  expect(container.querySelector('.site').classList.contains('light')).toBe(false);
  expect(localStorage.getItem('portfolio-theme')).toBe('dark');
  expect(document.documentElement.dataset.theme).toBe('dark');
  click(container.querySelector('.menu-toggle'));
  expect(container.querySelector('.menu-toggle').getAttribute('aria-expanded')).toBe('true');
  click(container.querySelector('.nav a[href="#about"]'));
  expect(container.querySelector('.menu-toggle').getAttribute('aria-expanded')).toBe('false');
  const tools = Array.from(container.querySelectorAll('[aria-label="Filter skills"] button')).find(button => button.textContent === 'Tools');
  click(tools);
  expect(container.querySelectorAll('.skill')).toHaveLength(2);
  expect(container.querySelector('.skills-grid').textContent).toContain('GitHub');
});

test('restores the selected theme on the next visit', () => {
  click(container.querySelector('.theme-toggle'));
  act(() => root.unmount());
  root = createRoot(container);
  act(() => root.render(<App />));
  expect(container.querySelector('.site').classList.contains('light')).toBe(false);
  expect(container.querySelector('.theme-toggle').getAttribute('aria-label')).toBe('Switch to light theme');
});

test('contact form submits directly without opening Gmail', async () => {
  process.env.REACT_APP_FORMSPREE_ENDPOINT='https://formspree.io/f/testform';
  global.AbortController=class { constructor(){this.signal={};} abort(){} };
  global.fetch=jest.fn().mockResolvedValue({ok:true,json:async()=>({ok:true})});
  const open=jest.spyOn(window,'open').mockImplementation(()=>null);
  const form=container.querySelector('.contact-form');
  form.elements.name.value='Visitor';
  form.elements.email.value='visitor@gmail.com';
  form.elements.subject.value='Project idea';
  form.elements.message.value='Let us collaborate.';
  await act(async()=>form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
  expect(fetch).toHaveBeenCalledWith('https://formspree.io/f/testform',expect.objectContaining({method:'POST'}));
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({name:'Visitor',email:'visitor@gmail.com',subject:'Project idea',message:'Let us collaborate.'});
  expect(open).not.toHaveBeenCalled();
  expect(form.querySelector('[role="status"]').textContent).toContain('submitted successfully');
  expect(form.elements.message.value).toBe('');
  delete process.env.REACT_APP_FORMSPREE_ENDPOINT;
  delete global.fetch;
  open.mockRestore();
});
