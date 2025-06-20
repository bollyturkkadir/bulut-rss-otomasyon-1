import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../lib/firebase-admin"; // Admin SDK kullanacağız
import Parser from "rss-parser";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const parser = new Parser();
    const feedsSnapshot = await db.collection("rss_feeds").get();
    const feedUrls = feedsSnapshot.docs.map((doc) => doc.data().url);

    let newArticlesCount = 0;

    for (const url of feedUrls) {
      try {
        const feed = await parser.parseURL(url);

        for (const item of feed.items) {
          // Bu makalenin daha önce eklenip eklenmediğini kontrol et
          const articleQuery = await db
            .collection("raw_articles")
            .where("guid", "==", item.guid || item.link)
            .limit(1)
            .get();

          if (articleQuery.empty) {
            // Makale yeni, veritabanına ekle
            await db.collection("raw_articles").add({
              guid: item.guid || item.link,
              title: item.title || "",
              link: item.link || "",
              pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
              content: item.content || item.contentSnippet || "",
              feedUrl: url,
              status: "pending", // İşlenmeyi bekliyor
              createdAt: new Date(),
            });
            newArticlesCount++;
          }
        }
      } catch (error) {
        console.error(`Error fetching or parsing feed: ${url}`, error);
        // Bir feed hata verse bile diğerlerine devam et
        continue;
      }
    }

    res
      .status(200)
      .json({
        success: true,
        message: `${newArticlesCount} yeni makale başarıyla çekildi.`,
      });
  } catch (error) {
    console.error("Error in fetch-all API:", error);
    res.status(500).json({ success: false, message: "Sunucu hatası oluştu." });
  }
}
