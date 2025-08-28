import type { NextApiRequest, NextApiResponse } from 'next'
import createMollieClient from '@mollie/api-client'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  try{
    const mollie = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY! });
    const payment = await mollie.payments.create({
      amount: { value: '49.00', currency: 'EUR' },
      description: 'FormBuilder licentie',
      redirectUrl: `${process.env.APP_URL}/thanks`,
      webhookUrl: `${process.env.APP_URL}/api/purchase/webhook`,
      method: ['ideal']
    });
    return res.status(200).json({ checkoutUrl: payment.getCheckoutUrl() });
  }catch(e:any){
    return res.status(500).json({ error: e.message });
  }
}
