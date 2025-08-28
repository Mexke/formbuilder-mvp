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

// ----------------- Types -----------------
type FieldType = "text" | "email" | "number" | "select" | "checkbox" | "textarea" | "hidden";

interface FieldBase {
  id: string;
  type: FieldType;
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  hidden?: boolean;
  defaultValue?: string;
  defaultChecked?: boolean;
  rows?: number;
  options?: string[];
}

// ----------------- Constants -----------------
const fieldTypes: FieldType[] = ["text","email","number","select","checkbox","textarea","hidden"];

const defaultFields: FieldBase[] = [
  { id: uuidv4(), type: "text", label: "Naam", name: "name", required: true, placeholder: "Jouw naam" },
  { id: uuidv4(), type: "email", label: "E-mail", name: "email", required: true, placeholder: "jij@voorbeeld.nl" },
  { id: uuidv4(), type: "textarea", label: "Omschrijving", name: "description", rows: 4 },
];

// ----------------- Functions -----------------
function fieldFactory(type: FieldType): FieldBase {
  const id = uuidv4();
  switch(type) {
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

function generateFormHTML(fields: FieldBase[], webhook: { webhookUrl: string }) {
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
    const fields = ${JSON.stringify(fields)};
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
        const res = await fetch(${JSON.stringify(webhook.webhookUrl)}, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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

// ----------------- Component -----------------
interface WebhookConfig { webhookUrl: string; username: string; appPassword: string }
interface DAVConfig { topdeskBaseUrl: string; username: string; password: string; scope: string; formName: string }

export default function FormBuilderApp() {
  const [fields, setFields] = useState<FieldBase[]>(defaultFields);
  const [webhook, setWebhook] = useState<WebhookConfig>({ webhookUrl: "https://example.com/webhook", username: "", appPassword: "" });
  const [dav, setDav] = useState<DAVConfig>({ topdeskBaseUrl: "https://yourtopdesk.example.com", username: "", password: "", scope: "open", formName: "mijn-formulier" });
  const [testing, setTesting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const htmlPreview = useMemo(()=>generateFormHTML(fields, webhook), [fields, webhook]);

  const addField = (type: FieldType) => setFields(prev=>[...prev, fieldFactory(type)]);
  const removeField = (id: string) => setFields(prev=>prev.filter(f=>f.id!==id));
  const moveField = (id: string, dir: number) => {
    setFields(prev=> {
      const i = prev.findIndex(f=>f.id===id);
      if(i<0) return prev;
      const j = i + dir;
      if(j<0 || j>=prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(i,1);
      next.splice(j,0,item);
      return next;
    });
  };
  const updateField = (id: string, key: keyof FieldBase, value: any) => setFields(prev=> prev.map(f=> f.id===id ? { ...f, [key]: value } : f ));

  const testConnection = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/test-webhook", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(webhook) });
      const json = await res.json();
      alert(json.ok ? "Webhook ok" : "Mislukt: " + (json.error||""));
    } catch(e) { alert("Mislukt: " + e); }
    finally { setTesting(false); }
  };

  const doUpload = async () => {
    setUploading(true);
    try {
      const path = `web/${dav.scope}/${dav.formName}/index.html`;
      const res = await fetch("/api/upload", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ dav, path, html: htmlPreview }) });
      const json = await res.json();
      if(json.ok) alert("Geüpload: " + path); else alert("Upload mislukt: " + (json.error||""));
    } catch(e) { alert(e); }
    finally { setUploading(false); }
  };

  return (
    <div style={{padding:24}}>
      {/* Je render-code blijft identiek */}
    </div>
  );
}
