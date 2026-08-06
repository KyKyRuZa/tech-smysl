'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './Hero.module.css';

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
}

export default function Hero({
  slides,
  editable = false,
  activeIndex = 0,
  onActiveChange,
  onEdit,
}: HeroProps) {
  const HERO_SLIDES: HeroSlideData[] = slides && slides.length > 0 ? slides : DEFAULT_HERO_SLIDES;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [imageFade, setImageFade] = useState(true);

  const active = editable ? activeIndex : currentSlide;
  const currentSlideData = HERO_SLIDES[active];

  useEffect(() => {
    if (editable) return;
    let timeout: ReturnType<typeof setTimeout>;

    const texts = HERO_SLIDES.map((s) => s.subtitle || '');
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
          setImageFade(false);
          setTimeout(() => {
            setCurrentSlide((prev) => (prev + 1) % texts.length);
            setImageFade(true);
            setIsTyping(true);
          }, 800);
        }, SLIDE_TRANSITION);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, currentSlide]);

  const subtitleText = editable ? currentSlideData?.subtitle || '' : displayText;

  return (
    <section
      className={`${styles.hero} ${editable ? styles.heroEditable : ''}`}
      onClick={editable ? onEdit : undefined}
    >
      <div className={styles.heroImage}>
        {currentSlideData && (
          <Image
            src={currentSlideData.imageUrl}
            alt={currentSlideData.imageAlt || ''}
            className={styles.heroImg}
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
            <span className={styles.heroEyebrow}>Начнём работать вместе прямо сейчас</span>
          </div>

          <h1 className={styles.heroTitle}>Техсмысл: +30 IT-решений ежегодно</h1>

          <p className={styles.heroSub}>{subtitleText}</p>

          <div className={styles.heroActions}>
            <button type="button" className={styles.btnRed}>
              Обсудить проект
            </button>
            <span className={styles.microNote}>Ответ в течение 15 минут · Можно в Telegram</span>
          </div>
        </div>
      </div>

      {editable && (
        <>
          <div className={styles.heroEditBadge}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            Редактировать слайд {active + 1}
          </div>

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
