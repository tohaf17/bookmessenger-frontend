import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/layout/HeroSection';
import FeatureGrid from '@/components/layout/FeatureGrid';
import CTASection from '@/components/layout/CTASection';
import AdminRedirect from '@/components/common/AdminRedirect';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.appContainer}>
      <AdminRedirect />
      <Navbar />
      <main className={styles.main}>
        <div className={styles.lightOne} />
        <div className={styles.lightTwo} />
        <HeroSection />
        <FeatureGrid />
      </main>
      <CTASection />
    </div>
  );
}
