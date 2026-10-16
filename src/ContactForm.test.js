import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import ContactForm from './ContactForm';
import {sendContact} from './contactService';

jest.mock('./contactService',()=>({...jest.requireActual('./contactService'),sendContact:jest.fn()}));
let root,container;
beforeEach(()=>{
  global.IS_REACT_ACT_ENVIRONMENT=true;
  process.env.REACT_APP_FORMSPREE_ENDPOINT='https://formspree.io/f/testform';
  sendContact.mockReset();
  container=document.createElement('div');document.body.appendChild(container);root=createRoot(container);
});
afterEach(()=>{act(()=>root.unmount());container.remove();delete process.env.REACT_APP_FORMSPREE_ENDPOINT;});
const render=()=>act(()=>root.render(<ContactForm email="mdnazzzir@gmail.com"/>));
const fill=()=>{const form=container.querySelector('form');form.elements.name.value='Visitor';form.elements.email.value='visitor@gmail.com';form.elements.subject.value='Hello';form.elements.message.value='My message';return form;};
const submit=async form=>act(async()=>form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));

test('missing configuration disables sending and offers the public email link',()=>{
  delete process.env.REACT_APP_FORMSPREE_ENDPOINT;
  render();
  expect(container.querySelector('button').disabled).toBe(true);
  expect(container.querySelector('a').getAttribute('href')).toContain('mdnazzzir');
  expect(container.textContent).toContain('Send to Gmail');
});

test('validation errors focus the invalid address and do not submit',async()=>{
  render();const form=fill();form.elements.email.value='not-an-email';
  await submit(form);
  expect(sendContact).not.toHaveBeenCalled();
  expect(form.elements.email.getAttribute('aria-invalid')).toBe('true');
  expect(document.activeElement).toBe(form.elements.email);
});

test('failed delivery requests retain the message and show an error',async()=>{
  sendContact.mockRejectedValue(new Error('Service unavailable. Please try later.'));
  render();const form=fill();await submit(form);
  expect(form.elements.message.value).toBe('My message');
  expect(container.querySelector('[role="alert"]').textContent).toContain('unavailable');
  expect(container.querySelector('[role="status"]').textContent).toBe('');
});

test('pending submission blocks duplicate sends',async()=>{
  let resolve;
  sendContact.mockImplementation(()=>new Promise(done=>{resolve=done;}));
  render();const form=fill();
  act(()=>{form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});
  expect(sendContact).toHaveBeenCalledTimes(1);
  expect(container.querySelector('fieldset').disabled).toBe(true);
  await act(async()=>resolve());
  expect(container.querySelector('[role="status"]').textContent).toContain('submitted successfully');
});
