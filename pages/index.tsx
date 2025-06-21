import { useState, useEffect } from "react";
import type { SetStateAction } from 'react';

// --- Ikonlar için SVG Bileşenleri (lucide-react yerine) ---
const RssIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" />
  </svg>
);
const NewspaperIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2V4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2Z" /><path d="M10.5 17.5H16" /><path d="M10.5 13.5H16" /><path d="M10.5 9.5H16" />
  </svg>
);
const CpuIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M15 2v2" /><path d="M15 20v2" /><path d="M9 2v2" /><path d="M9 20v2" /><path d="M2 15h2" /><path d="M2 9h2" /><path d="M20 15h2" /><path d="M20 9h2" />
  </svg>
);
const PlusIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="M12 5v14" />
  </svg>
);
const Trash2Icon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M10 11v6" /><path d="M14 11v6" />
  </svg>
);
const LanguagesIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 8 6 6" /><path d="m4 14 6-6 2-3" /><path d="M2 5h12" /><path d="M7 2h1" /><path d="m22 22-5-10-5 10" /><path d="M14 18h6" />
  </svg>
);
const ExternalLinkIcon = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" x2="21" y1="14" y2="3" />
    </svg>
);


// --- Tip Tanımlamaları ---
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

// --- Ana Sayfa Bileşeni ---
export default function Home() {
    const [feeds, setFeeds] = useState<Feed[]>([]);
    const [newFeed, setNewFeed] = useState("");
    const [rawArticles, setRawArticles] = useState<RawArticle[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);

    // --- Veritabanı İşlemleri (Mantık Aynı, Dinamik Import Kullanılıyor) ---
    useEffect(() => {
        const setupListeners = async () => {
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

            return () => {
                unsubscribeFeeds();
                unsubscribeArticles();
            };
        };
        setupListeners();
    }, []);

    const addFeed = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newFeed.trim() === "") return;
        const { db } = await import('../lib/firebase');
        const { collection, addDoc } = await import('firebase/firestore');
        await addDoc(collection(db, "rss_feeds"), { url: newFeed, addedAt: new Date() });
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
            setMessage(data.message || 'Bir hata oluştu.');
        } catch (error) {
            setMessage("API çağrılırken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleTranslateArticle = async (id: string) => {
        setProcessingId(id);
        try {
            await fetch('/api/translate-article', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id }),
            });
        } catch (error) {
            console.error("Çeviri hatası:", error);
        } finally {
            setProcessingId(null);
        }
    };

    // --- Arayüz (JSX) ---
    return (
        <div className="min-h-screen w-full bg-muted/40">
            {/* --- Sol Menü (Sidebar) --- */}
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-background sm:flex">
                <div className="flex h-16 shrink-0 items-center border-b px-6">
                    <a href="#" className="flex items-center gap-2 font-semibold">
                        <RssIcon className="h-6 w-6 text-primary" />
                        <span>RSS Otomasyon</span>
                    </a>
                </div>
                <nav className="flex-1 overflow-auto py-4">
                    <div className="grid items-start px-4 text-sm font-medium">
                        <a href="#" className="flex items-center gap-3 rounded-lg bg-primary text-primary-foreground px-3 py-2 transition-all">
                            <NewspaperIcon className="h-4 w-4" />
                            Kontrol Paneli
                        </a>
                    </div>
                </nav>
            </aside>
            
            {/* --- Ana İçerik Alanı --- */}
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-60">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <h1 className="text-xl font-semibold">Genel Bakış</h1>
                </header>
                
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    {/* --- Üst Kartlar --- */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border bg-card text-card-foreground shadow">
                            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                                <h3 className="tracking-tight text-sm font-medium">Kaydedilmiş RSS Kaynakları</h3>
                                <RssIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="p-6 pt-0">
                                <div className="text-2xl font-bold">{feeds.length}</div>
                                <p className="text-xs text-muted-foreground">Adet aktif kaynak</p>
                            </div>
                        </div>
                        <div className="rounded-xl border bg-card text-card-foreground shadow">
                            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                                <h3 className="tracking-tight text-sm font-medium">Çevrilmeyi Bekleyen Makaleler</h3>
                                <NewspaperIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="p-6 pt-0">
                                <div className="text-2xl font-bold">{rawArticles.length}</div>
                                <p className="text-xs text-muted-foreground">Adet ham makale</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* --- Kontrol Paneli Kartı --- */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow">
                        <div className="p-6">
                           <h3 className="text-lg font-semibold mb-4">İşlem Merkezi</h3>
                            <div className="flex items-center gap-4">
                               <button onClick={handleFetchAll} disabled={loading} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                                   <CpuIcon className="mr-2 h-4 w-4" />
                                   {loading ? 'Çekiliyor...' : 'Tüm Kaynaklardan İçerik Çek'}
                               </button>
                               {message && <p className="text-sm text-muted-foreground">{message}</p>}
                           </div>
                        </div>
                    </div>

                    {/* --- RSS Kaynakları Tablosu --- */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">RSS Kaynakları</h3>
                                <form onSubmit={addFeed} className="flex items-center gap-2">
                                    <input type="url" value={newFeed} onChange={(e) => setNewFeed(e.target.value)} placeholder="https://ornek.com/rss" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 max-w-sm" />
                                    <button type="submit" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 w-9">
                                        <PlusIcon className="h-4 w-4" />
                                    </button>
                                </form>
                            </div>
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b transition-colors hover:bg-muted/50">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">URL</th>
                                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground w-[100px]">İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {feeds.length > 0 ? feeds.map((feed) => (
                                            <tr key={feed.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle font-medium break-all">{feed.url}</td>
                                                <td className="p-4 align-middle text-right">
                                                    <button onClick={() => deleteFeed(feed.id)} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9">
                                                        <Trash2Icon className="h-4 w-4 text-red-500"/>
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={2} className="p-4 text-center text-muted-foreground">Kayıtlı RSS kaynağı bulunamadı.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    
                    {/* --- Ham Makaleler Tablosu --- */}
                     <div className="rounded-xl border bg-card text-card-foreground shadow">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Çevrilmeyi Bekleyen Ham Makaleler</h3>
                             <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b transition-colors hover:bg-muted/50">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Başlık</th>
                                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground w-[150px]">İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {rawArticles.slice(0, 10).map((article) => ( // İlk 10 makaleyi göster
                                            <tr key={article.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle font-medium">
                                                    <a href={article.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-primary">
                                                        {article.title}
                                                        <ExternalLinkIcon className="h-3 w-3" />
                                                    </a>
                                                </td>
                                                <td className="p-4 align-middle text-right">
                                                    <button onClick={() => handleTranslateArticle(article.id)} disabled={processingId === article.id} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-9 px-4 py-2">
                                                        <LanguagesIcon className="mr-2 h-4 w-4" />
                                                        {processingId === article.id ? 'Çevriliyor...' : 'Çevir'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {rawArticles.length === 0 && (
                                            <tr><td colSpan={2} className="p-4 text-center text-muted-foreground">Çevrilecek makale bulunamadı.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                                 {rawArticles.length > 10 && <div className="text-center text-sm text-muted-foreground pt-4">... ve {rawArticles.length - 10} makale daha</div>}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
```

---

Lütfen önce `styles/globals.css` dosyasını, ardından `pages/index.tsx` dosyasını projenizde güncelleyin ve değişiklikleri GitHub'a gönderin. Vercel'deki dağıtım tamamlandığında, projenizin yeni, modern ve profesyonel yüzüyle karşılaşacaksın
