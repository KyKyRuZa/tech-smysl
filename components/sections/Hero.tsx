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

export default function Hero({ slides }: { slides?: HeroSlideData[] }) {
  const HERO_SLIDES: HeroSlideData[] = slides && slides.length > 0 ? slides : DEFAULT_HERO_SLIDES;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [imageFade, setImageFade] = useState(true);

  useEffect(() => {
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

  const currentSlideData = HERO_SLIDES[currentSlide];

  return (
    <section className={styles.hero}>
      <div className={styles.heroImage}>
        {currentSlideData && (
          <Image
            src={currentSlideData.imageUrl}
            alt={currentSlideData.imageAlt || ''}
            className={`${styles.heroImg} ${imageFade ? '' : styles.fadeOut}`}
            width={1920}
            height={1080}
            fetchPriority="high"
            decoding="async"
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

          <p className={styles.heroSub}>{displayText}</p>

          <div className={styles.heroActions}>
            <button type="button" className={styles.btnRed}>
              Обсудить проект
            </button>
            <span className={styles.microNote}>Ответ в течение 15 минут · Можно в Telegram</span>
          </div>
        </div>
      </div>
    </section>
  );
}
