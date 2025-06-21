"use client";
import { useState, useEffect } from "react";
// Firebase import'ları geri geldi
import { db } from "../lib/firebase";
import { collection, onSnapshot, query, where, doc, addDoc, deleteDoc } from "firebase/firestore";
import type { SetStateAction } from 'react';

// Tip tanımlamaları
interface Feed {
  id: string;
  url: string;
  [key: string]: any;
}

interface RawArticle {
  id: string;
  title: string;
  link: string;
  [key: string]: any;
}

export default function Home() {
    const [feeds, setFeeds] = useState<Feed[]>([]);
    const [newFeed, setNewFeed] = useState("");
    const [rawArticles, setRawArticles] = useState<RawArticle[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);

    // --- ÖNEMLİ: Listeleme kodları geri geldi! ---
    // Bu useEffect, sadece component tarayıcıya yüklendikten sonra çalışır,
    // bu yüzden Vercel build'ini bozmaz.
    useEffect(() => {
        // RSS Feeds listesini çekme
        const qFeeds = query(collection(db, "rss_feeds"));
        const unsubscribeFeeds = onSnapshot(qFeeds, (querySnapshot) => {
            const feedsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Feed[];
            setFeeds(feedsData);
        });

        // Çevrilmeyi bekleyen ham makaleleri çekme
        const qArticles = query(collection(db, "raw_articles"), where("status", "==", "pending"));
        const unsubscribeArticles = onSnapshot(qArticles, (querySnapshot) => {
            const articlesData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as RawArticle[];
            setRawArticles(articlesData);
        });
        
        // Component kaldırıldığında listener'ları temizle
        return () => {
            unsubscribeFeeds();
            unsubscribeArticles();
        };
    }, []); // Boş bağımlılık dizisi, sadece bir kere çalışmasını sağlar.

    // Buton fonksiyonları hala devre dışı, onları bir sonraki adımda yapacağız.
    const addFeed = async (e: React.FormEvent) => {
        e.preventDefault();
        alert("Bu özellik bir sonraki adımda eklenecek.");
    };

    const deleteFeed = async (id: string) => {
        alert("Bu özellik bir sonraki adımda eklenecek.");
    };

    const handleFetchAll = async () => {
        alert("Bu özellik bir sonraki adımda eklenecek.");
    };

    const handleTranslateArticle = async (id: string) => {
        alert("Bu özellik bir sonraki adımda eklenecek.");
    };

    // Arayüz kodu (JSX) aynı kalıyor
    return (
        <main className="flex min-h-screen flex-col items-center p-8 bg-gray-100 text-gray-800">
            <div className="w-full max-w-4xl">
                {/* ... Başlık ve diğer kısımlar ... */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">RSS Otomasyon Paneli</h1>
                </div>
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4">Kontrol Paneli</h2>
                        <button onClick={handleFetchAll} disabled={loading} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors">
                            {loading ? 'Çekiliyor...' : 'Tüm Kaynaklardan İçerikleri Çek'}
                        </button>
                        {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4">Yeni RSS Kaynağı Ekle</h2>
                        <form onSubmit={addFeed} className="flex">
                            <input type="url" value={newFeed} onChange={(e) => setNewFeed(e.target.value)} placeholder="https://ornek-site.com/rss" className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors">Ekle</button>
                        </form>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4">Kaydedilmiş Kaynaklar ({feeds.length})</h2>
                        <ul>
                            {feeds.length > 0 ? feeds.map((feed) => (
                                <li key={feed.id} className="flex justify-between items-center p-3 mb-2 border-b border-gray-200">
                                    <span className="break-all">{feed.url}</span>
                                    <button onClick={() => deleteFeed(feed.id)} className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm">Sil</button>
                                </li>
                            )) : <li>Henüz RSS kaynağı eklenmedi.</li>}
                        </ul>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4">Çevrilmeyi Bekleyen Ham Makaleler ({rawArticles.length})</h2>
                        <ul className="space-y-2">
                            {rawArticles.length > 0 ? rawArticles.map((article) => (
                                <li key={article.id} className="flex justify-between items-center p-3 border-b">
                                    <a href={article.link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 truncate mr-4" title={article.title}>{article.title}</a>
                                    <button onClick={() => handleTranslateArticle(article.id)} disabled={processingId === article.id} className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm whitespace-nowrap disabled:bg-gray-400">
                                        {processingId === article.id ? 'Çeviriliyor...' : 'DeepL ile Çevir'}
                                    </button>
                                </li>
                            )) : <li>Çevrilecek yeni makale bulunmuyor.</li>}
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
}
