import type { NextApiRequest, NextApiResponse } from 'next'
import createMollieClient from '@mollie/api-client'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  try{
    const mollie = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY! });
    const id = req.body.id || req.query.id;
    if(!id) return res.status(400).end('missing id');
    const payment = await mollie.payments.get(id as string);
    if(payment.isPaid()){
      // TODO: activate license in your DB for the user
    }
    return res.status(200).end('ok');
  }catch(e:any){
    return res.status(500).end(e.message);
  }
}
