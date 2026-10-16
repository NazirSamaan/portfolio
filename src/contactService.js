export function getContactEndpoint() {
  const endpoint = (process.env.REACT_APP_FORMSPREE_ENDPOINT || '').trim();
  return /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(endpoint) ? endpoint : '';
}

export function validateContact(input) {
  const errors = {};
  if (!input.name || input.name.length > 120) errors.name = 'Enter your name (up to 120 characters).';
  const email = input.email || '';
  const [local = '', domain = ''] = email.split('@');
  if (email.length > 254 || local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..') || !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/.test(email)) {
    errors.email = 'Enter a complete email address, such as yourname@gmail.com.';
  } else if (['gmial.com','gamil.com','gmail.con','gmail.co','gmai.com','gmal.com'].includes(domain.toLowerCase())) {
    errors.email = 'Did you mean gmail.com? Please check your email address.';
  }
  if (!input.subject || input.subject.length > 200 || /[\r\n]/.test(input.subject)) errors.subject = 'Enter a subject (up to 200 characters).';
  if (!input.message || input.message.length > 5000) errors.message = 'Enter your message (up to 5,000 characters).';
  return errors;
}

export async function sendContact(input) {
  const endpoint = getContactEndpoint();
  if (!endpoint) throw new Error('The contact form is not connected yet. Please use the email link instead.');
  if (Object.keys(validateContact(input)).length) throw new Error('Please check your contact details before sending.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', Accept:'application/json' },
      body: JSON.stringify({name:input.name,email:input.email,subject:input.subject,message:input.message,_subject:`Portfolio enquiry: ${input.subject}`,_gotcha:input._gotcha || ''}),
      signal: controller.signal,
      credentials: 'omit'
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data || data.ok !== true) {
      if (response.status === 429) throw new Error('Too many messages were submitted. Please try again later or email me directly.');
      if (data?.errors?.some(error => error.field === 'email')) throw new Error('The email service rejected that address. Please check it and try again.');
      throw new Error('Your message was not confirmed. Please try again later or email me directly.');
    }
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('The request timed out. Check whether it arrived before retrying, or email me directly.');
    if (error instanceof TypeError) throw new Error('Could not connect to the email service. Check your connection and try again.');
    throw error;
  } finally { clearTimeout(timer); }
}
