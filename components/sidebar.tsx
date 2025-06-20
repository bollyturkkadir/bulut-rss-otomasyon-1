import React from 'react';
import { Rss, Home, Languages, Newspaper, Settings } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Kontrol Paneli', icon: Home, href: '#' },
    { name: 'RSS Kaynakları', icon: Rss, href: '#' },
    { name: 'Çeviriler', icon: Languages, href: '#' },
    { name: 'Yayınlanmış Yazılar', icon: Newspaper, href: '#' },
    { name: 'Ayarlar', icon: Settings, href: '#' },
  ];

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow pt-5 bg-slate-800 text-slate-50 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h2 className="text-2xl font-bold text-white">Oto-Blog</h2>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {menuItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-slate-700 hover:text-white"
            >
              <item.icon className="mr-3 flex-shrink-0 h-6 w-6" aria-hidden="true" />
              {item.name}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;