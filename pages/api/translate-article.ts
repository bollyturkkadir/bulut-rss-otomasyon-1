import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/firebase-admin';
import * as deepl from 'deepl-node';

const authKey = process.env.DEEPL_API_KEY_1;
if (!authKey) {
  throw new Error("DEEPL_API_KEY_1 environment variable is not set.");
}

const translator = new deepl.Translator(authKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Makale ID\'si eksik.' });
    }

    const rawArticleRef = db.collection('raw_articles').doc(id);
    const rawArticleDoc = await rawArticleRef.get();

    if (!rawArticleDoc.exists) {
      return res.status(404).json({ success: false, message: 'Makale bulunamadı.' });
    }

    const rawArticle = rawArticleDoc.data();

    if (!rawArticle) {
        return res.status(404).json({ success: false, message: 'Makale verisi boş.' });
    }

    // Başlığı ve içeriği çevir
    const translatedTitleResult = await translator.translateText(rawArticle.title, null, 'tr');
    const translatedContentResult = await translator.translateText(rawArticle.content, null, 'tr');

    // === YENİ EKLENEN DÜZELTME BAŞLANGICI ===
    // TypeScript'in tür hatasını çözmek için gelen sonucun dizi olup olmadığını kontrol et
    const translatedTitle = Array.isArray(translatedTitleResult) 
      ? translatedTitleResult[0].text 
      : translatedTitleResult.text;

    const translatedContent = Array.isArray(translatedContentResult)
      ? translatedContentResult[0].text
      : translatedContentResult.text;
    // === YENİ EKLENEN DÜZELTME SONU ===

    // Çevrilmiş veriyi yeni koleksiyona kaydet
    await db.collection('translated_articles').add({
        translatedTitle: translatedTitle,
        translatedContent: translatedContent,
        original_id: id,
        original_link: rawArticle.link,
        translatedAt: new Date(),
        status: 'pending_enrichment' // Zenginleştirilmeyi bekliyor
    });

    // Ham makalenin durumunu güncelle
    await rawArticleRef.update({ status: 'translated' });

    res.status(200).json({ success: true, message: 'Makale başarıyla çevrildi.' });

  } catch (error: any) {
    console.error('Error in translate-article API:', error);
    res.status(500).json({ success: false, message: `Sunucu hatası: ${error.message}` });
  }
}
