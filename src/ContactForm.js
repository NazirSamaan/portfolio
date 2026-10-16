import { useRef, useState } from 'react';
import { getContactEndpoint, sendContact, validateContact } from './contactService';

export default function ContactForm({ email }) {
  const [status,setStatus] = useState('idle');
  const [error,setError] = useState('');
  const [errors,setErrors] = useState({});
  const pending = useRef(false);
  const configured = Boolean(getContactEndpoint());
  const contactEmail = email || 'mdnazzzir@gmail.com';
  const fields = [
    {key:'name',label:'Your name',placeholder:'What should I call you?',autoComplete:'name',maxLength:120},
    {key:'email',label:'Email address',type:'email',placeholder:'yourname@gmail.com',autoComplete:'email',maxLength:254},
    {key:'subject',label:'Subject',placeholder:'A project, an opportunity, a hello…',maxLength:200},
    {key:'message',label:'Your message',placeholder:'Tell me what you have in mind.',maxLength:5000}
  ];
  const field = ({key,label,...props}) => <label key={key} htmlFor={`contact-${key}`}>{label}{key==='message'?<textarea id={`contact-${key}`} name={key} rows={4} required {...props} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key]?`contact-${key}-error`:undefined}/>:<input id={`contact-${key}`} name={key} type="text" required {...props} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key]?`contact-${key}-error`:undefined}/ >}{errors[key]&&<span className="contact-field-error" id={`contact-${key}-error`}>{errors[key]}</span>}</label>;
  const submit=async e=>{
    e.preventDefault();
    if(pending.current)return;
    const form=e.currentTarget;
    const input=Object.fromEntries(Array.from(new FormData(form).entries()).map(([key,value])=>[key,typeof value==='string'?value.trim():value]));
    const problems=validateContact(input);
    setErrors(problems);setError('');setStatus('idle');
    if(Object.keys(problems).length){form.elements[Object.keys(problems)[0]].focus();return;}
    pending.current=true;setStatus('sending');
    try {await sendContact(input);form.reset();setStatus('success');}
    catch(err){setError(err.message);setStatus('error');}
    finally {pending.current=false;}
  };
  return <form className="contact-form" noValidate onSubmit={submit} aria-busy={status==='sending'} onChange={e=>{if(status!=='sending'){setStatus('idle');setError('');setErrors(old=>({...old,[e.target.name]:''}));}}}>
    <fieldset disabled={status==='sending'}>
      <div className="form-row">{fields.slice(0,2).map(field)}</div>
      {fields.slice(2).map(field)}
      <div className="contact-honeypot" aria-hidden="true"><label>Leave this empty<input type="text" name="_gotcha" tabIndex={-1} autoComplete="off"/></label></div>
      <div className="form-footer"><small>{configured?'Your message goes directly to my inbox. I’ll reply to the email you provide.':<>Email me directly while the form is being connected: <a href={`mailto:${encodeURIComponent(contactEmail)}`}>{contactEmail}</a></>}</small><button className="button" type="submit" disabled={!configured || status==='sending'}>{status==='sending'?'Sending…':'Send to Gmail'} <span aria-hidden="true">→</span></button></div>
    </fieldset>
    <span role="status" className="form-status">{status==='success'?'Your message was submitted successfully. Thank you for getting in touch.':''}</span>
    {error&&<p className="contact-send-error" role="alert">{error}</p>}
  </form>;
}
