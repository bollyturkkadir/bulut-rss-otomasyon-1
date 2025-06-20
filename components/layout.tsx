"use client"; // Bu component'in bir istemci component'i olduğunu belirtir (hook kullandığı için)
import React from "react";
import { Toaster } from "react-hot-toast";
import Sidebar from "./sidebar";
import Header from "./header";
import { useAuth } from "../context/AuthContext"; // Giriş durumunu kontrol etmek için hook'u import ediyoruz

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth(); // Kullanıcı bilgisini alıyoruz

  // Eğer kullanıcı giriş yapmamışsa, sadece ana içeriği göster (login sayfası)
  if (!user) {
    return (
      <>
        <div>
          <Toaster position="top-right" />
        </div>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </>
    );
  }

  // Eğer kullanıcı giriş yapmışsa, profesyonel panel layout'unu göster
  return (
    <>
      <div>
        <Toaster position="top-right" />
      </div>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        <div className="md:pl-64">
          {" "}
          {/* Sidebar genişliği kadar soldan boşluk bırak */}
          <Header />
          <main className="p-4 sm:p-6 lg:p-8 text-slate-800 dark:text-slate-200">
            {children}
          </main>
        </div>
      </div>
    </>
  );
};

export default Layout;
