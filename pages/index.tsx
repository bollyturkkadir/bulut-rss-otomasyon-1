"use client";
import { useState, useEffect } from "react";
// --- EN ÖNEMLİ DEĞİŞİKLİK: FIREBASE IMPORT'LARI TAMAMEN KALDIRILDI ---
// import { db } from "../lib/firebase";
// import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc } from "firebase/firestore";
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

    // Bütün fonksiyonların içi geçici olarak boşaltıldı.
    const addFeed = async (e: React.FormEvent) => {
        e.preventDefault();
        alert("Bu özellik geçici olarak devre dışıdır.");
    };

    const deleteFeed = async (id: string) => {
        alert("Bu özellik geçici olarak devre dışıdır.");
    };

    const handleFetchAll = async () => {
        alert("Bu özellik geçici olarak devre dışıdır.");
    };

    const handleTranslateArticle = async (id: string) => {
        alert("Bu özellik geçici olarak devre dışıdır.");
    };

    return (
        <main className="flex min-h-screen flex-col items-center p-8 bg-gray-100 text-gray-800">
            <div className="w-full max-w-4xl">
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
                        <h2 className="text-2xl font-semibold mb-4">Kaydedilmiş Kaynaklar</h2>
                        <ul>
                             <li className="text-gray-500">Bu özellik geçici olarak devre dışıdır.</li>
                        </ul>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4">Çevrilmeyi Bekleyen Ham Makaleler</h2>
                        <ul className="space-y-2">
                            <li className="text-gray-500">Bu özellik geçici olarak devre dışıdır.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
}
