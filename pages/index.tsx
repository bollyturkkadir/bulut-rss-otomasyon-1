"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc } from "firebase/firestore";

export default function Home() {
    const { user, googleSignIn, logOut } = useAuth();
    const [feeds, setFeeds] = useState([]);
    const [newFeed, setNewFeed] = useState("");
    const [rawArticles, setRawArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [processingId, setProcessingId] = useState(null);

    // RSS Feeds listesini çek
    useEffect(() => {
        if (user) {
            const q = query(collection(db, "rss_feeds"));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                setFeeds(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
            });
            return () => unsubscribe();
        }
    }, [user]);

    // Çevrilmeyi bekleyen ham makaleleri çek
    useEffect(() => {
        if (user) {
            const q = query(collection(db, "raw_articles"), where("status", "==", "pending"));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                setRawArticles(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
            });
            return () => unsubscribe();
        }
    }, [user]);

    const addFeed = async (e) => { e.preventDefault(); if (newFeed.trim() === "") { alert("Lütfen geçerli bir URL girin."); return; } await addDoc(collection(db, "rss_feeds"), { url: newFeed, addedAt: new Date(), userId: user.uid }); setNewFeed(""); };
    const deleteFeed = async (id) => { await deleteDoc(doc(db, "rss_feeds", id)); };
    const handleFetchAll = async () => { setLoading(true); setMessage("İçerikler çekiliyor, lütfen bekleyin..."); try { const res = await fetch('/api/fetch-all', { method: 'POST' }); const data = await res.json(); if (data.success) { setMessage(data.message); } else { setMessage(`Hata: ${data.message}`); } } catch (error) { setMessage("API çağrılırken bir hata oluştu."); console.error(error); } setLoading(false); };
    const handleSignIn = async () => { try { await googleSignIn(); } catch (error) { console.error(error); } };
    const handleSignOut = async () => { try { await logOut(); } catch (error) { console.error(error); } };

    // Makaleyi DeepL ile çevir
    const handleTranslateArticle = async (id) => {
        setProcessingId(id);
        try {
            const res = await fetch('/api/translate-article', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id }),
            });
            const data = await res.json();
            if (!data.success) {
                alert(`Hata: ${data.message}`);
            }
            // Başarılı olunca, onSnapshot sayesinde liste otomatik güncellenecek
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
                    {user && ( <button onClick={handleSignOut} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">Çıkış Yap</button> )}
                </div>

                {!user ? (
                    <div className="text-center bg-white p-8 rounded-lg shadow-md">
                        <p className="mb-4">İçerikleri yönetmek için lütfen giriş yapın.</p>
                        <button onClick={handleSignIn} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Google ile Giriş Yap</button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-md"> <h2 className="text-2xl font-semibold mb-4">Kontrol Paneli</h2> <button onClick={handleFetchAll} disabled={loading} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors">{loading ? 'Çekiliyor...' : 'Tüm Kaynaklardan İçerikleri Çek'}</button> {message && <p className="mt-4 text-sm text-gray-600">{message}</p>} </div>
                        <div className="bg-white p-6 rounded-lg shadow-md"> <h2 className="text-2xl font-semibold mb-4">Yeni RSS Kaynağı Ekle</h2> <form onSubmit={addFeed} className="flex"> <input type="url" value={newFeed} onChange={(e) => setNewFeed(e.target.value)} placeholder="https://ornek-site.com/rss" className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /> <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors">Ekle</button> </form> </div>
                        <div className="bg-white p-6 rounded-lg shadow-md"> <h2 className="text-2xl font-semibold mb-4">Kaydedilmiş Kaynaklar</h2> <ul> {feeds.map((feed) => (<li key={feed.id} className="flex justify-between items-center p-3 mb-2 border-b border-gray-200"> <span className="break-all">{feed.url}</span> <button onClick={() => deleteFeed(feed.id)} className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm">Sil</button> </li>))} {feeds.length === 0 && (<li className="text-gray-500">Henüz RSS kaynağı eklenmedi.</li>)} </ul> </div>

                        {/* Çevrilecek Makaleler Bölümü */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold mb-4">Çevrilmeyi Bekleyen Ham Makaleler ({rawArticles.length})</h2>
                            <ul className="space-y-2">
                                {rawArticles.map((article) => (
                                    <li key={article.id} className="flex justify-between items-center p-3 border-b">
                                        <a href={article.link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 truncate mr-4" title={article.title}>{article.title}</a>
                                        <button 
                                            onClick={() => handleTranslateArticle(article.id)} 
                                            disabled={processingId === article.id}
                                            className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm whitespace-nowrap disabled:bg-gray-400">
                                            {processingId === article.id ? 'Çeviriliyor...' : 'DeepL ile Çevir'}
                                        </button>
                                    </li>
                                ))}
                                {rawArticles.length === 0 && (
                                    <li className="text-gray-500">Çevrilecek yeni makale bulunmuyor.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}