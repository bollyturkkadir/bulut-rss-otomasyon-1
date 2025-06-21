import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/firebase-admin'; // Sunucu tarafı firebase importu

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Sadece POST isteklerine izin ver.
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  // 2. Eğer istek POST ise, şimdilik başarılı bir test mesajı döndür.
  try {
    // Buraya daha sonra gerçek RSS okuma ve veritabanına yazma kodları gelecek.
    // Şimdilik sadece bağlantının çalıştığını teyit ediyoruz.
    
    console.log('fetch-all API rotası başarıyla tetiklendi.');

    res.status(200).json({ success: true, message: 'Test başarılı! API rotası doğru çalışıyor.' });

  } catch (error: any) {
    console.error('Error in fetch-all API:', error);
    res.status(500).json({ success: false, message: `Sunucu hatası: ${error.message}` });
  }
}
