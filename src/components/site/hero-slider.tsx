'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@/lib/icon'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface SlideData {
  id: string
  title: string
  subtitle: string
  buttonText: string
  buttonHref: string
  imageUrl: string
  imageAlt: string
}

export function HeroSlider({ slides }: { slides: SlideData[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % slides.length)
  }, [slides.length])

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + slides.length) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (paused || slides.length <= 1) return
    timerRef.current = setInterval(next, 6000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [paused, next, slides.length])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  if (slides.length === 0) return null

  return (
    <section
      className="relative h-[88vh] min-h-[560px] w-full overflow-hidden bg-primary"
      aria-roledescription="carousel"
      aria-label="Diaporama d'accueil"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[index].id}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 0.8 }, scale: { duration: 6, ease: 'linear' } }}
          className="absolute inset-0"
        >
          <Image
            src={slides[index].imageUrl}
            alt={slides[index].imageAlt}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-primary/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-auto px-4 md:px-6">
          <div className="public-hero-copy max-w-2xl text-primary-foreground">
            <AnimatePresence mode="wait">
              <motion.div
                key={slides[index].id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h1 className="text-3xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
                  {slides[index].title}
                </h1>
                <p className="mt-4 text-base text-primary-foreground/90 md:text-lg lg:text-xl">
                  {slides[index].subtitle}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <a href={slides[index].buttonHref}>
                      {slides[index].buttonText}
                      <Icon name="FaArrowRight" size={16} className="ml-2" />
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                    <a href="/contact">Nous contacter</a>
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Diapositive précédente"
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-primary-foreground/15 p-2 text-primary-foreground backdrop-blur hover:bg-primary-foreground/25 md:left-5"
          >
            <Icon name="FaChevronLeft" size={20} />
          </button>
          <button
            onClick={next}
            aria-label="Diapositive suivante"
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-primary-foreground/15 p-2 text-primary-foreground backdrop-blur hover:bg-primary-foreground/25 md:right-5"
          >
            <Icon name="FaChevronRight" size={20} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Aller à la diapositive ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  'h-2 rounded-full transition-all',
                  i === index ? 'w-8 bg-accent' : 'w-2 bg-primary-foreground/40 hover:bg-primary-foreground/70'
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
