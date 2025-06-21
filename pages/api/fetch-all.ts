import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/firebase-admin';
import Parser from 'rss-parser';

const parser = new Parser();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  try {
    // 1. Veritabanındaki tüm RSS kaynaklarını çek
    const feedsSnapshot = await db.collection('rss_feeds').get();
    if (feedsSnapshot.empty) {
      return res.status(200).json({ success: true, message: 'Veritabanında kayıtlı RSS kaynağı bulunamadı.' });
    }

    let totalArticlesAdded = 0;
    const feedProcessingPromises = [];

    // 2. Her bir kaynak için işlemleri başlat
    for (const feedDoc of feedsSnapshot.docs) {
      const feedUrl = feedDoc.data().url;
      
      const promise = parser.parseURL(feedUrl).then(async (feed) => {
        console.log(`Processing feed: ${feed.title}`);
        
        let articlesInThisFeed = 0;
        const articleCheckingPromises = [];

        // 3. Kaynaktaki her bir makaleyi kontrol et
        if (feed.items) {
            for (const item of feed.items) {
              const articleLink = item.link;
              if (!articleLink) continue;

              // 4. Bu makale daha önce eklenmiş mi diye kontrol et
              const promise = db.collection('raw_articles').where('link', '==', articleLink).limit(1).get().then(async (existingArticle) => {
                if (existingArticle.empty) {
                  // 5. Eğer eklenmemişse, yeni makaleyi veritabanına ekle
                  await db.collection('raw_articles').add({
                    title: item.title || 'Başlık Yok',
                    link: articleLink,
                    content: item.content || item.contentSnippet || 'İçerik Yok',
                    pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
                    sourceFeed: feedUrl,
                    status: 'pending', // İşlem durumu: çeviri bekliyor
                    addedAt: new Date(),
                  });
                  articlesInThisFeed++;
                }
              });
              articleCheckingPromises.push(promise);
            }
        }
        await Promise.all(articleCheckingPromises);
        totalArticlesAdded += articlesInThisFeed;
      }).catch(err => {
        console.error(`Error parsing feed ${feedUrl}:`, err.message);
      });

      feedProcessingPromises.push(promise);
    }
    
    // Tüm kaynakların işlenmesini bekle
    await Promise.all(feedProcessingPromises);
    
    res.status(200).json({ success: true, message: `${totalArticlesAdded} adet yeni makale veritabanına eklendi.` });

  } catch (error: any) {
    console.error('Error in fetch-all API:', error);
    res.status(500).json({ success: false, message: `Sunucu hatası: ${error.message}` });
  }
}
