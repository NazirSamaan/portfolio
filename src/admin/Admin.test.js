import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import Admin from './Admin';
import * as client from '../supabaseClient';
import { verifyOwner, loadPortfolio, publishPortfolio } from '../portfolioStore';
import { defaultContent } from '../portfolioData';

jest.mock('../supabaseClient',()=>({__esModule:true,configured:true,supabase:{auth:{getSession:jest.fn(),onAuthStateChange:jest.fn(),signOut:jest.fn(),signInWithPassword:jest.fn()}}}));
jest.mock('../portfolioStore',()=>({verifyOwner:jest.fn(),loadPortfolio:jest.fn(),publishPortfolio:jest.fn(),listAssets:jest.fn(),uploadAsset:jest.fn(),deleteAsset:jest.fn()}));
let container,root,authChange;
const click=async element=>act(async()=>element.dispatchEvent(new MouseEvent('click',{bubbles:true})));
const button=text=>Array.from(container.querySelectorAll('button')).find(el=>el.textContent===text);
beforeEach(()=>{
  global.IS_REACT_ACT_ENVIRONMENT=true;
  jest.clearAllMocks();
  client.configured=true;
  global.crypto = { randomUUID: () => `test-${Math.random()}` };
  client.supabase.auth.getSession.mockResolvedValue({data:{session:{user:{id:'owner'}}},error:null});
  client.supabase.auth.onAuthStateChange.mockImplementation(callback=>{authChange=callback;return {data:{subscription:{unsubscribe:jest.fn()}}};});
  verifyOwner.mockResolvedValue(true);
  loadPortfolio.mockResolvedValue({content:JSON.parse(JSON.stringify(defaultContent)),version:1});
  publishPortfolio.mockImplementation(async(content)=>({content,version:2}));
  container=document.createElement('div');document.body.appendChild(container);root=createRoot(container);
});
afterEach(()=>{act(()=>root.unmount());container.remove();});
const render=async()=>act(async()=>root.render(<Admin/>));

test('unconfigured dashboard remains locked without a login or editor',async()=>{
  client.configured=false;
  await render();
  expect(container.textContent).toContain('Dashboard is locked');
  expect(container.querySelector('.admin-shell')).toBeNull();
  expect(container.querySelector('input[type="password"]')).toBeNull();
});

test('non-owner sessions cannot view editor content',async()=>{
  verifyOwner.mockResolvedValue(false);
  await render();
  expect(container.querySelector('.admin-shell')).toBeNull();
  expect(container.textContent).toContain('does not have owner access');
  expect(loadPortfolio).not.toHaveBeenCalled();
});

test('owner can remove a project from draft and explicitly publish',async()=>{
  await render();
  const projects=container.querySelector('nav button:nth-child(3)');
  await click(projects);
  expect(container.querySelectorAll('.admin-item')).toHaveLength(5);
  await click(container.querySelector('[aria-label="Delete Wildlife Reporting Mobile App"]'));
  await click(button('Delete from draft'));
  expect(container.querySelectorAll('.admin-item')).toHaveLength(4);
  expect(publishPortfolio).not.toHaveBeenCalled();
  await click(button('Publish changes ↗'));
  await click(button('Publish changes'));
  expect(publishPortfolio).toHaveBeenCalledWith(expect.objectContaining({projects:expect.any(Array)}),1);
  expect(publishPortfolio.mock.calls[0][0].projects).toHaveLength(4);
  expect(container.textContent).toContain('Published successfully');
});

test('owner can add and edit a skill and token refresh preserves the draft',async()=>{
  await render();
  await click(Array.from(container.querySelectorAll('nav button')).find(el=>el.textContent.includes('Skills')));
  await click(button('+ Add skill'));
  const inputs=container.querySelectorAll('.admin-editor input');
  const change=(input,value)=>{const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}));};
  act(()=>{change(inputs[0],'TypeScript');change(inputs[1],'TS');change(inputs[2],'Programming');});
  await act(async()=>container.querySelector('.admin-editor form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
  expect(container.querySelectorAll('.admin-item')).toHaveLength(defaultContent.skills.length + 1);
  expect(container.textContent).toContain('TypeScript');
  await act(async()=>authChange('TOKEN_REFRESHED',{user:{id:'owner'},access_token:'refreshed'}));
  expect(container.textContent).toContain('TypeScript');
  expect(container.textContent).toContain('Unpublished changes');
  await click(container.querySelector('[aria-label="Edit TypeScript"]'));
  act(()=>change(container.querySelector('.admin-editor input'),'TypeScript advanced'));
  await act(async()=>container.querySelector('.admin-editor form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
  expect(container.textContent).toContain('TypeScript advanced');
});
