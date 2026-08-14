'use client';

import { useMemo } from 'react';
import { useInView } from '@/hooks/useInView';
import styles from './Process.module.css';

export interface ProcessStep {
  id: string;
  number: string;
  title: string;
  desc: string;
  order: number;
}

interface RawProcessStep {
  title: string;
  desc: string;
}

interface ProcessProps {
  steps?: RawProcessStep[];
  title?: string;
  subtitle?: string;
}

const DEFAULT_STEPS: ProcessStep[] = [
  {
    id: 'discovery',
    number: '01',
    title: 'Анализ и аудит',
    desc: 'Изучаем бизнес, аудит существующих решений, определяем цели и KPI.',
    order: 0,
  },
  {
    id: 'design',
    number: '02',
    title: 'Дизайн и прототипирование',
    desc: 'Создаём прототип, согласуем визуал и архитектуру продукта.',
    order: 1,
  },
  {
    id: 'development',
    number: '03',
    title: 'Разработка',
    desc: 'Пишем код, тестируем, итерируем. Еженедельные демо и прозрачная коммуникация.',
    order: 2,
  },
  {
    id: 'launch',
    number: '04',
    title: 'Запуск и поддержка',
    desc: 'Деплой, мониторинг, оптимизация. Гарантируем аптайм и стабильность.',
    order: 3,
  },
];

const Process: React.FC<ProcessProps> = ({ steps: externalSteps, title, subtitle }) => {
  const { ref: headRef, isInView: headVisible } = useInView({ threshold: 0.1 });

  const steps = useMemo(() => {
    if (externalSteps) {
      return externalSteps.map((s, i) => ({
        id: `step-${i}`,
        number: String(i + 1).padStart(2, '0'),
        title: s.title,
        desc: s.desc,
        order: i,
      }));
    }
    return DEFAULT_STEPS;
  }, [externalSteps]);

  return (
    <section className={styles.process}>
      <div className={styles.processInner}>
        <div className={styles.processHead} ref={headRef}>
          <h2
            className={`${styles.processTitle} ${styles.animateIn} ${headVisible ? styles.visible : ''}`}
          >
            {title ?? 'Как мы работаем'}
          </h2>
          <p
            className={`${styles.processSubtitle} ${styles.animateIn} ${headVisible ? styles.visible : ''}`}
            style={{ transitionDelay: '0.1s' }}
          >
            {subtitle ?? 'Четыре этапа от идеи до запуска'}
          </p>
        </div>

        <div className={styles.processGrid}>
          {steps.map((step, i) => (
            <ProcessCard key={step.id} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

function ProcessCard({ step, index }: { step: ProcessStep; index: number }) {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={`${styles.processCard} ${styles.animateIn} ${isInView ? styles.visible : ''}`}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <div className={styles.processCardHead}>
        <span className={styles.processNumber}>{step.number}</span>
        <h3 className={styles.processStepTitle}>{step.title}</h3>
      </div>
      <p className={styles.processStepDesc}>{step.desc}</p>
    </div>
  );
}

export default Process;
