'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import styles from './Hero.module.css';

const BlockControls = dynamic(() => import('@/components/admin/BlockControls'), { ssr: false })

const TYPING_SPEED = 30;
const PAUSE_DURATION = 3000;
const ERASE_SPEED = 20;
const SLIDE_TRANSITION = 500;

export interface HeroSlideData {
  imageUrl: string;
  imageAlt?: string;
  subtitle?: string;
}

const DEFAULT_HERO_SLIDES = [
  {
    imageUrl: '/hero/1.svg',
    imageAlt: 'AR-решения и интерактивные инсталляции',
    subtitle:
      'AR-решения и интерактивные инсталляции, сенсорные столы. Мобильные приложения под любые задачи. +40% вовлечённости клиентов.',
  },
  {
    imageUrl: '/hero/2.svg',
    imageAlt: 'AR для перекраски и кастомизации',
    subtitle:
      'AR для перекраски и кастомизации. Меняем цвет мебели и интерьеров в один клик на смартфоне. —25% на рекламный бюджет.',
  },
  {
    imageUrl: '/hero/3.svg',
    imageAlt: '3D-визуализация',
    subtitle:
      '3D-визуализация с точностью до миллиметра. Индустрия: 150+ моделей. Сроки: без задержек. Гарантируем результат.',
  },
  {
    imageUrl: '/hero/4.svg',
    imageAlt: 'Веб-сайты любой сложности',
    subtitle:
      'Веб-сайты любой сложности: от корпоративных порталов до индивидуальных сервисов. Запуск за 30 дней. 99,9% аптайм.',
  },
];

interface HeroProps {
  slides?: HeroSlideData[];
  editable?: boolean;
  activeIndex?: number;
  onActiveChange?: (index: number) => void;
  onEdit?: () => void;
  onAdd?: () => void;
  onDelete?: () => void;
  onToggle?: () => void;
  slidePublished?: boolean;
  eyebrow?: string;
  title?: string;
  ctaText?: string;
  microNote?: string;
}

export default function Hero({
  slides,
  editable = false,
  activeIndex = 0,
  onActiveChange,
  onEdit,
  onAdd,
  onDelete,
  onToggle,
  slidePublished,
  eyebrow,
  title,
  ctaText,
  microNote,
}: HeroProps) {
  const HERO_SLIDES: HeroSlideData[] = slides && slides.length > 0 ? slides : DEFAULT_HERO_SLIDES;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const active = editable ? activeIndex : currentSlide;
  const currentSlideData = HERO_SLIDES[active];

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (HERO_SLIDES.length === 0) return
    setCurrentSlide(0)
    setDisplayText('')
    setIsTyping(false)
    setIsTransitioning(false)
  }, [HERO_SLIDES])
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (editable) return;
    let timeout: ReturnType<typeof setTimeout>;

    const texts = HERO_SLIDES.map((s) => s.subtitle || '');

    if (isTransitioning) {
      timeout = setTimeout(() => {
        setIsTransitioning(false)
        setCurrentSlide((prev) => (prev + 1) % texts.length)
        setDisplayText('')
        setIsTyping(true)
      }, 800)
      return () => clearTimeout(timeout)
    }

    const fullText = texts[currentSlide] || '';

    if (isTyping) {
      if (displayText.length < fullText.length) {
        timeout = setTimeout(() => {
          setDisplayText(fullText.slice(0, displayText.length + 1));
        }, TYPING_SPEED);
      } else {
        timeout = setTimeout(() => setIsTyping(false), PAUSE_DURATION);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, ERASE_SPEED);
      } else {
        timeout = setTimeout(() => {
          setIsTransitioning(true)
        }, SLIDE_TRANSITION);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, currentSlide, HERO_SLIDES, editable, isTransitioning]);

  const subtitleText = editable ? currentSlideData?.subtitle || '' : displayText;

  return (
    <section className={`${styles.hero} ${editable ? styles.heroEditable : ''}`}>
      <div className={styles.heroImage}>
        {currentSlideData && (
          <Image
            src={currentSlideData.imageUrl}
            alt={currentSlideData.imageAlt || ''}
            className={`${styles.heroImg} ${isTransitioning ? styles.fadeOut : ''}`}
            width={1920}
            height={1080}
            fetchPriority="high"
            decoding="async"
            priority={editable}
          />
        )}
      </div>

      <div className={styles.heroContent}>
        <div className={styles.heroText}>
          <div className={styles.heroEyebrowWrap}>
            <span className={styles.heroEyebrowBar} />
            <span className={styles.heroEyebrow}>{eyebrow ?? 'Начнём работать вместе прямо сейчас'}</span>
          </div>

          <h1 className={styles.heroTitle}>{title ?? 'Техсмысл: +30 IT-решений ежегодно'}</h1>

          <p className={styles.heroSub}>{subtitleText}</p>

          <div className={styles.heroActions}>
            <button type="button" className={styles.btnRed}>
              {ctaText ?? 'Обсудить проект'}
            </button>
            <span className={styles.microNote}>{microNote ?? 'Ответ в течение 15 минут · Можно в Telegram'}</span>
          </div>
        </div>
      </div>

      {editable && (
        <>
          <BlockControls
            published={slidePublished}
            onAdd={onAdd}
            onEdit={onEdit ?? (() => {})}
            onDelete={onDelete}
            onToggle={onToggle}
          />

          {HERO_SLIDES.length > 1 && (
            <div
              className={styles.heroEditDots}
              onClick={(e) => e.stopPropagation()}
            >
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`${styles.heroEditDot} ${i === active ? styles.heroEditDotActive : ''}`}
                  aria-label={`Слайд ${i + 1}`}
                  onClick={() => onActiveChange?.(i)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
