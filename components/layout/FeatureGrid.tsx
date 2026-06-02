'use client';

import { Compass, MessageSquare, Target } from 'lucide-react';
import { useT } from '@/lib/translations';
import styles from './FeatureGrid.module.css';

export default function FeatureGrid() {
  const t = useT();
  const features = [
    { title: t('home.catalog'), desc: t('home.catalogDesc'), icon: <Compass size={24} color="#9333ea" /> },
    { title: t('home.trackers'), desc: t('home.trackersDesc'), icon: <Target size={24} color="#3b82f6" /> },
    { title: t('home.discussions'), desc: t('home.discussionsDesc'), icon: <MessageSquare size={24} color="#ec4899" /> },
  ];

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{t('home.featuresTitle')}</h2>
      <div className={styles.grid}>
        {features.map((feature) => (
          <article className={`glass-panel ${styles.card}`} key={feature.title}>
            <div className={styles.iconBox}>{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
