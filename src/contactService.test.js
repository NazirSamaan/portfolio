import { getContactEndpoint, validateContact, sendContact } from './contactService';

const valid={name:'Visitor',email:'visitor@gmail.com',subject:'Project enquiry',message:'I would like to discuss a project.'};
const originalFetch=global.fetch;
const originalAbort=global.AbortController;
beforeEach(()=>{
  process.env.REACT_APP_FORMSPREE_ENDPOINT='https://formspree.io/f/testform';
  global.AbortController=class {constructor(){this.signal={};}abort(){}};
  global.fetch=jest.fn();
});
afterEach(()=>{delete process.env.REACT_APP_FORMSPREE_ENDPOINT;global.fetch=originalFetch;global.AbortController=originalAbort;});

test('does not send to an unconfigured or untrusted endpoint',async()=>{
  process.env.REACT_APP_FORMSPREE_ENDPOINT='https://untrusted.example/collect';
  expect(getContactEndpoint()).toBe('');
  await expect(sendContact(valid)).rejects.toThrow('not connected');
  expect(fetch).not.toHaveBeenCalled();
});

test('rejects incomplete addresses, header injection, and common Gmail typos',()=>{
  ['someone','someone@localhost','name@@gmail.com','name..test@gmail.com','name@gmial.com','name@gmail.con','name@gmail.com\r\nBcc:other@gmail.com'].forEach(email=>expect(validateContact({...valid,email}).email).toBeTruthy());
  expect(validateContact({...valid,subject:'Hello\r\nBcc:evil'}).subject).toBeTruthy();
  expect(validateContact({...valid,email:'visitor@company.org'})).toEqual({});
});

test('accepts only a confirmed service response and omits recipient overrides',async()=>{
  fetch.mockResolvedValue({ok:true,json:async()=>({ok:true})});
  await expect(sendContact(valid)).resolves.toBeUndefined();
  const body=JSON.parse(fetch.mock.calls[0][1].body);
  expect(body.email).toBe(valid.email);
  expect(body.to).toBeUndefined();
  expect(body._to).toBeUndefined();
});

test('handles rate limiting and ambiguous responses without claiming success',async()=>{
  fetch.mockResolvedValueOnce({ok:false,status:429,json:async()=>({})});
  await expect(sendContact(valid)).rejects.toThrow('Too many');
  fetch.mockResolvedValueOnce({ok:true,json:async()=>({})});
  await expect(sendContact(valid)).rejects.toThrow('not confirmed');
});

test('reports offline and timeout failures',async()=>{
  fetch.mockRejectedValueOnce(new TypeError('network failure'));
  await expect(sendContact(valid)).rejects.toThrow('connection');
  fetch.mockRejectedValueOnce(Object.assign(new Error('abort'),{name:'AbortError'}));
  await expect(sendContact(valid)).rejects.toThrow('timed out');
});
