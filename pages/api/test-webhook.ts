import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  try{
    const { webhookUrl, username, appPassword } = req.body || {};
    if(!webhookUrl) return res.status(400).json({ ok:false, error: 'Missing webhookUrl' });

    const headers: Record<string,string> = {};
    if(username && appPassword) headers['Authorization'] = 'Basic ' + Buffer.from(`${username}:${appPassword}`).toString('base64');

    const r = await fetch(webhookUrl, { method: 'OPTIONS', headers });
    if(!r.ok) return res.status(200).json({ ok:false, error: `HTTP ${r.status}` });
    return res.status(200).json({ ok:true });
  }catch(e:any){
    return res.status(200).json({ ok:false, error: e.message });
  }
}
