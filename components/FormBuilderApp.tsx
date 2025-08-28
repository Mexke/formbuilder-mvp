
import React, { useMemo, useState } from "react";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { Download, EyeOff, PlusCircle, Trash2, Upload, RefreshCw, CreditCard, FileText, Webhook, Link as LinkIcon, Lock, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";

import { Button } from "./ui/ButtonPlaceholder";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/CardPlaceholder";
import { Input } from "./ui/InputPlaceholder";
import { Label } from "./ui/LabelPlaceholder";
import { Switch } from "./ui/SwitchPlaceholder";
import { Textarea } from "./ui/TextareaPlaceholder";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/SelectPlaceholder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/TabsPlaceholder";
import { Badge } from "./ui/BadgePlaceholder";
import { Separator } from "./ui/SeparatorPlaceholder";

const fieldTypes = ["text","email","number","select","checkbox","textarea","hidden"];
const defaultFields = [
  { id: uuidv4(), type: "text", label: "Naam", name: "name", required: true, placeholder: "Jouw naam" },
  { id: uuidv4(), type: "email", label: "E-mail", name: "email", required: true, placeholder: "jij@voorbeeld.nl" },
  { id: uuidv4(), type: "textarea", label: "Omschrijving", name: "description", rows: 4 },
];

function fieldFactory(type){
  const id = uuidv4();
  switch(type){
    case "text": return { id, type, label: "Tekst", name: `field_${id.slice(0,6)}`, placeholder: "Tekst", required: false };
    case "email": return { id, type, label: "E-mail", name: `email_${id.slice(0,6)}`, placeholder: "jij@voorbeeld.nl", required: false };
    case "number": return { id, type, label: "Nummer", name: `number_${id.slice(0,6)}`, placeholder: "0", required: false };
    case "textarea": return { id, type, label: "Tekstvlak", name: `textarea_${id.slice(0,6)}`, rows: 4 };
    case "checkbox": return { id, type, label: "Akkoord", name: `checkbox_${id.slice(0,6)}`, defaultChecked: false };
    case "select": return { id, type, label: "Selectie", name: `select_${id.slice(0,6)}`, options: ["Optie A","Optie B"] };
    case "hidden": return { id, type, label: "Verborgen veld", name: `hidden_${id.slice(0,6)}`, hidden: true, defaultValue: "" };
    default: return { id, type: "text", label: "Tekst", name: `f_${id.slice(0,6)}` };
  }
}

function generateFormHTML(fields, webhook){
  const html = `<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Formulier</title>
  <style>
    body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f8fafc;color:#0f172a;margin:0;padding:24px}
    .card{max-width:720px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;border:1px solid #e6edf3}
    .row{display:flex;flex-direction:column;gap:8px;margin-bottom:16px}
    label{font-weight:600}
    input,select,textarea{background:#fff;border:1px solid #cbd5e1;border-radius:8px;padding:12px;color:#0f172a}
    .hidden{display:none !important}
    button{background:#06b6d4;border:none;border-radius:8px;padding:12px 16px;font-weight:600;color:#fff;cursor:pointer}
    .muted{color:#6b7280;font-size:.9rem}
    .error{color:#ef4444}
    .success{color:#16a34a}
  </style>
</head>
<body>
  <div class="card">
    <h1 style="margin-top:0">Formulier</h1>
    <form id="form"></form>
    <div id="message" class="muted"></div>
  </div>
  <script>
  (function(){
    const params = new URLSearchParams(location.search);
    const form = document.getElementById('form');
    const message = document.getElementById('message');
    const fields = ${JSON.stringify(defaultFields)};
    function create(el, attrs, children){
      const n=document.createElement(el);
      Object.entries(attrs||{}).forEach(([k,v])=>{ if(k==='class') n.className=v; else n.setAttribute(k,v) });
      (children||[]).forEach(c=>{ if(typeof c==='string') n.appendChild(document.createTextNode(c)); else if(c) n.appendChild(c)});
      return n;
    }
    fields.forEach(f=>{
      const prefill = params.get(f.name) ?? (f.defaultValue ?? (f.defaultChecked? 'on': ''));
      const wrap = create('div', { class: 'row' });
      const lbl = create('label', { for: f.id }, [f.label + (f.required?' *':'')]);
      let input;
      if(f.type==='textarea'){
        input = create('textarea', { id:f.id, name:f.name, rows: f.rows||4 });
        if(prefill) input.value = prefill;
      } else if(f.type==='select'){
        input = create('select', { id:f.id, name:f.name });
        (f.options||[]).forEach(o=>{
          const opt = create('option', { value:o }, [o]);
          if(prefill && prefill===o) opt.selected = true;
          input.appendChild(opt);
        });
      } else if(f.type==='checkbox'){
        input = create('input', { id:f.id, name:f.name, type:'checkbox' });
        if(prefill==='on' || f.defaultChecked) input.checked = true;
      } else if(f.type==='hidden'){
        input = create('input', { id:f.id, name:f.name, type:'hidden', value: prefill || '' });
        wrap.classList.add('hidden');
      } else {
        input = create('input', { id:f.id, name:f.name, type: f.type==='email'?'email':(f.type==='number'?'number':'text'), placeholder: f.placeholder||'' });
        if(prefill) input.value = prefill;
      }
      if(f.hidden) wrap.classList.add('hidden');
      wrap.appendChild(lbl);
      wrap.appendChild(input);
      form.appendChild(wrap);
    });
    const submit = create('button', { type:'submit' }, ['Versturen']);
    form.appendChild(submit);
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      message.textContent = '';
      const data = Object.fromEntries(new FormData(form).entries());
      try {
        const res = await fetch(${JSON.stringify("https://example.com/webhook")}, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        if(!res.ok){ throw new Error('Response ' + res.status); }
        message.textContent = 'Verzonden!'; message.className = 'success';
        form.reset();
      } catch(err){
        message.textContent = 'Fout bij verzenden: ' + err;
        message.className = 'error';
      }
    });
  })();
  </script>
</body>
</html>`;
  return html;
}

export default function FormBuilderApp(){
  const [fields, setFields] = useState(defaultFields);
  const [webhook, setWebhook] = useState({ webhookUrl: "https://example.com/webhook", username: "", appPassword: "" });
  const [dav, setDav] = useState({ topdeskBaseUrl: "https://yourtopdesk.example.com", username: "", password: "", scope: "open", formName: "mijn-formulier" });
  const [testing, setTesting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const htmlPreview = useMemo(()=>generateFormHTML(fields, webhook), [fields, webhook]);

  function addField(type){ setFields(prev=>[...prev, fieldFactory(type)]); }
  function removeField(id){ setFields(prev=>prev.filter(f=>f.id!==id)); }
  function moveField(id, dir){ setFields(prev=>{ const i = prev.findIndex(f=>f.id===id); if(i<0) return prev; const j = i + dir; if(j<0 || j>=prev.length) return prev; const next = [...prev]; const [item] = next.splice(i,1); next.splice(j,0,item); return next; }); }
  function updateField(id, key, value){ setFields(prev=>prev.map(f=> f.id===id ? { ...f, [key]: value } : f )); }

  async function testConnection(){
    setTesting(true);
    try{
      const res = await fetch("/api/test-webhook", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(webhook) });
      const json = await res.json();
      alert(json.ok ? "Webhook ok" : "Mislukt: " + (json.error||""));
    }catch(e){ alert("Mislukt: " + e); }
    finally{ setTesting(false); }
  }

  async function doUpload(){
    setUploading(true);
    try{
      const path = `web/${dav.scope}/${dav.formName}/index.html`;
      const res = await fetch("/api/upload", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ dav, path, html: htmlPreview }) });
      const json = await res.json();
      if(json.ok) alert("Geüpload: " + path); else alert("Upload mislukt: " + (json.error||""));
    }catch(e){ alert(e); }
    finally{ setUploading(false); }
  }

  return (
    <div style={{padding:24}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <FileText />
          <h1>FormBuilder voor TOPdesk</h1>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>{ const blob = new Blob([htmlPreview], {type:'text/html'}); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${dav.formName||'formulier'}.html`; a.click(); }}>Download HTML</button>
          <button onClick={doUpload} disabled={uploading}>{uploading? 'Uploaden…' : 'Upload naar TOPdesk'}</button>
        </div>
      </div>

      <div>
        <h2>Velden</h2>
        {fields.map((f,idx)=>(
          <div key={f.id} style={{border:'1px solid #e6edf3',padding:12,borderRadius:8,marginBottom:8}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <strong>{f.label}</strong>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>moveField(f.id,-1)}>↑</button>
                <button onClick={()=>moveField(f.id,1)}>↓</button>
                <button onClick={()=>removeField(f.id)}>Verwijder</button>
              </div>
            </div>
            <div style={{marginTop:8}}>
              <label>Label</label>
              <input value={f.label} onChange={e=>updateField(f.id,'label', e.target.value)} />
            </div>
            <div style={{marginTop:8}}>
              <label>Naam (URL param)</label>
              <input value={f.name} onChange={e=>updateField(f.id,'name', e.target.value)} />
            </div>
          </div>
        ))}
        <div style={{display:'flex',gap:8}}>
          {fieldTypes.map(t=> <button key={t} onClick={()=>addField(t)}>{t}</button>)}
        </div>
      </div>

      <hr style={{margin:'16px 0'}}/>

      <div>
        <h2>Webhook</h2>
        <div>
          <label>Webhook URL</label>
          <input value={webhook.webhookUrl} onChange={e=>setWebhook(v=>({...v, webhookUrl:e.target.value}))} />
        </div>
        <div>
          <label>Gebruiker</label>
          <input value={webhook.username} onChange={e=>setWebhook(v=>({...v, username:e.target.value}))} />
        </div>
        <div>
          <label>App password</label>
          <input type="password" value={webhook.appPassword} onChange={e=>setWebhook(v=>({...v, appPassword:e.target.value}))} />
        </div>
        <div style={{marginTop:8}}>
          <button onClick={testConnection} disabled={testing}>{testing? 'Testen…' : 'Test verbinding'}</button>
        </div>
      </div>

      <hr style={{margin:'16px 0'}}/>

      <div>
        <h2>Publicatie</h2>
        <div>
          <label>TOPdesk base URL</label>
          <input value={dav.topdeskBaseUrl} onChange={e=>setDav(v=>({...v, topdeskBaseUrl:e.target.value}))} />
        </div>
        <div>
          <label>Formuliernaam</label>
          <input value={dav.formName} onChange={e=>setDav(v=>({...v, formName:e.target.value}))} />
        </div>
        <div>
          <label>Scope</label>
          <select value={dav.scope} onChange={e=>setDav(v=>({...v, scope:e.target.value}))}>
            <option value="open">open</option>
            <option value="public">public</option>
          </select>
        </div>
      </div>

      <hr style={{margin:'16px 0'}}/>

      <div>
        <h2>Preview</h2>
        <textarea readOnly value={htmlPreview} style={{width:'100%',height:320}}/>
      </div>
    </div>
  );
}
