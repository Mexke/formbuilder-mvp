import type { NextApiRequest, NextApiResponse } from 'next'
import { buildWebdavClient } from '../../utils/webdavClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  try{
    const { dav, path, html } = req.body || {};
    if(!dav || !dav.topdeskBaseUrl) return res.status(400).json({ ok:false, error: 'Missing dav' });

    const client = buildWebdavClient(dav.topdeskBaseUrl, dav.username, dav.password);

    const segments = path.split('/').slice(0,-1);
    let cur = '';
    for(const seg of segments){
      cur = cur ? `${cur}/${seg}` : seg;
      try{ await client.createDirectory(cur); }catch(e){}
    }

    await client.putFileContents(path, html, { overwrite: true });
    return res.status(200).json({ ok:true, path });
  }catch(e:any){
    return res.status(200).json({ ok:false, error: e.message });
  }
}
