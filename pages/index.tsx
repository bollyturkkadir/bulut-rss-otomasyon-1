"use client";
import { useState, useEffect } from "react";
// DİKKAT: Firebase import'ları buradan tamamen kaldırıldı!
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

    // Veri listeleme useEffect'i
    useEffect(() => {
        // Bu fonksiyon sadece tarayıcıda çalışacak
        const setupListeners = async () => {
            // Firebase modüllerini SADECE ŞİMDİ, dinamik olarak import ediyoruz
            const { db } = await import('../lib/firebase');
            const { collection, query, onSnapshot, where } = await import('firebase/firestore');

            const qFeeds = query(collection(db, "rss_feeds"));
            const unsubscribeFeeds = onSnapshot(qFeeds, (querySnapshot) => {
                const feedsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Feed[];
                setFeeds(feedsData);
            });

            const qArticles = query(collection(db, "raw_articles"), where("status", "==", "pending"));
            const unsubscribeArticles = onSnapshot(qArticles, (querySnapshot) => {
                const articlesData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as RawArticle[];
                setRawArticles(articlesData);
            });

            // Cleanup fonksiyonu, listener'ları temizler
            return () => {
                unsubscribeFeeds();
                unsubscribeArticles();
            };
        };

        // setupListeners fonksiyonunu çağırıyoruz.
        // Dönen cleanup fonksiyonunu daha sonra kullanmak için bir değişkende tutabiliriz ama şimdilik gerek yok.
        setupListeners();

    }, []); // Boş bağımlılık, sadece bir kere çalışmasını sağlar

    // Bütün fonksiyonlar artık kendi içinde dinamik import yapacak
    const addFeed = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newFeed.trim() === "") {
            alert("Lütfen geçerli bir URL girin.");
            return;
        }
        // Gerekli modülleri sadece bu fonksiyon çalışınca import et
        const { db } = await import('../lib/firebase');
        const { collection, addDoc } = await import('firebase/firestore');
        
        await addDoc(collection(db, "rss_feeds"), { 
            url: newFeed, 
            addedAt: new Date(),
        });
        setNewFeed("");
    };

    const deleteFeed = async (id: string) => {
        const { db } = await import('../lib/firebase');
        const { doc, deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(db, "rss_feeds", id));
    };

    const handleFetchAll = async () => {
        setLoading(true);
        setMessage("İçerikler çekiliyor, lütfen bekleyin...");
        try {
            const res = await fetch('/api/fetch-all', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setMessage(data.message);
            } else {
                setMessage(`Hata: ${data.message}`);
            }
        } catch (error) {
            setMessage("API çağrılırken bir hata oluştu.");
            console.error(error);
        }
        setLoading(false);
    };

    const handleTranslateArticle = async (id: string) => {
        setProcessingId(id);
        try {
            const res = await fetch('/api/translate-article', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id }),
            });
            const data = await res.json();
            if (!data.success) { alert(`Hata: ${data.message}`); }
        } catch (error) {
            alert("API çağrılırken bir hata oluştu.");
            console.error(error);
        }
        setProcessingId(null);
    };

    return (
        <main className="flex min-h-screen flex-col items-center p-8 bg-gray-100 text-gray-800">
            <div className="w-full max-w-4xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">RSS Otomasyon Paneli</h1>
                </div>
                <div className="space-y-8">
                    {/* ... JSX'in geri kalanı aynı, butonlar artık çalışmalı ... */}
                    <div className="bg-white p-6 rounded-lg shadow-md"> <h2 className="text-2xl font-semibold mb-4">Kontrol Paneli</h2> <button onClick={handleFetchAll} disabled={loading} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors">{loading ? 'Çekiliyor...' : 'Tüm Kaynaklardan İçerikleri Çek'}</button> {message && <p className="mt-4 text-sm text-gray-600">{message}</p>} </div>
                    <div className="bg-white p-6 rounded-lg shadow-md"> <h2 className="text-2xl font-semibold mb-4">Yeni RSS Kaynağı Ekle</h2> <form onSubmit={addFeed} className="flex"> <input type="url" value={newFeed} onChange={(e) => setNewFeed(e.target.value)} placeholder="https://ornek-site.com/rss" className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /> <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors">Ekle</button> </form> </div>
                    <div className="bg-white p-6 rounded-lg shadow-md"> <h2 className="text-2xl font-semibold mb-4">Kaydedilmiş Kaynaklar ({feeds.length})</h2> <ul> {feeds.length > 0 ? feeds.map((feed) => (<li key={feed.id} className="flex justify-between items-center p-3 mb-2 border-b border-gray-200"> <span className="break-all">{feed.url}</span> <button onClick={() => deleteFeed(feed.id)} className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm">Sil</button> </li>)) : <li>Veritabanından kaynaklar bekleniyor...</li>} </ul> </div>
                    <div className="bg-white p-6 rounded-lg shadow-md"> <h2 className="text-2xl font-semibold mb-4">Çevrilmeyi Bekleyen Ham Makaleler ({rawArticles.length})</h2> <ul className="space-y-2"> {rawArticles.length > 0 ? rawArticles.map((article) => (<li key={article.id} className="flex justify-between items-center p-3 border-b"> <a href={article.link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 truncate mr-4" title={article.title}>{article.title}</a> <button onClick={() => handleTranslateArticle(article.id)} disabled={processingId === article.id} className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm whitespace-nowrap disabled:bg-gray-400">{processingId === article.id ? 'Çeviriliyor...' : 'DeepL ile Çevir'}</button> </li>)) : <li>Çevrilecek yeni makale bulunmuyor.</li>} </ul> </div>
                </div>
            </div>
        </main>
    );
}
