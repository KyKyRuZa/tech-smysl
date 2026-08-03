'use client';

import { useInView } from '@/hooks/useInView';
import styles from './CaseStudy.module.css';

interface Metric {
  label: string;
  value: string;
}

interface CaseStudyData {
  title: string;
  subtitle: string;
  tagline: string;
  metrics: Metric[];
  tags: string[];
  cta: string;
}

const DATA: CaseStudyData = {
  title: 'Один кейс — конкретика',
  subtitle: 'Как мы решали задачу и что получилось',
  tagline: 'Глубокий разбор одного проекта с цифрами и выводами',
  metrics: [
    { label: 'Срок разработки', value: '45 дней' },
    { label: 'Рост конверсии', value: '+35%' },
    { label: 'Сэкономлено бюджета', value: '400 тыс. ₽' },
  ],
  tags: ['Веб', 'React', 'Node.js', 'PostgreSQL'],
  cta: 'Смотреть полный кейс',
};

interface CaseStudyProps {
  data?: CaseStudyData;
}

const CaseStudy: React.FC<CaseStudyProps> = ({ data: externalData }) => {
  const data = externalData ?? DATA;
  const { ref: headRef, isInView: headVisible } = useInView({ threshold: 0.1 });

  if (!data) return null;

  return (
    <section className={styles.caseStudy}>
      <div className={styles.caseStudyInner} ref={headRef}>
        <div className={styles.caseStudyHead}>
          <h2
            className={`${styles.caseStudyTitle} ${styles.animateIn} ${headVisible ? styles.visible : ''}`}
          >
            {data.title}
          </h2>
          <p
            className={`${styles.caseStudySubtitle} ${styles.animateIn} ${headVisible ? styles.visible : ''}`}
            style={{ transitionDelay: '0.1s' }}
          >
            {data.subtitle}
          </p>
          <span
            className={`${styles.caseStudyTagline} ${styles.animateIn} ${headVisible ? styles.visible : ''}`}
            style={{ transitionDelay: '0.15s' }}
          >
            {data.tagline}
          </span>
        </div>

        <div className={styles.caseStudyMetrics}>
          {data.metrics.map((m, i) => (
            <MetricCard key={m.label} metric={m} index={i} />
          ))}
        </div>

        <div className={styles.caseStudyTags}>
          {data.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>

        <div className={styles.caseStudyCta}>
          <button className="btn btn-primary">{data.cta}</button>
        </div>
      </div>
    </section>
  );
};

function MetricCard({ metric, index }: { metric: Metric; index: number }) {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={`${styles.metric} ${styles.animateIn} ${isInView ? styles.visible : ''}`}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <span className={styles.metricValue}>{metric.value}</span>
      <span className={styles.metricLabel}>{metric.label}</span>
    </div>
  );
}

export default CaseStudy;
