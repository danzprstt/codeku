// src/components/Layout.tsx
import React from 'react';
import Head from 'next/head';
import Navbar from './Navbar';

interface Props {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function Layout({ children, title = 'CodeKu', description = 'Platform simpan & bagikan kode untuk developer' }: Props) {
  return (
    <>
      <Head>
        <title>{title} | CodeKu</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`${title} | CodeKu`} />
        <meta property="og:description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen grid-bg">
        <Navbar />
        <main>{children}</main>
      </div>
    </>
  );
}
