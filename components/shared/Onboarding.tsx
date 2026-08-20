"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  HandCoins,
  Home,
  ReceiptText,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "balance_onboarding_seen_v1";

const slides = [
  {
    icon: Home,
    eyebrow: "Tu hogar",
    title: "Las cuentas de la casa, claras",
    description:
      "Registrá los gastos compartidos y Balance calcula automáticamente cuánto le corresponde a cada uno.",
  },
  {
    icon: CheckCircle2,
    eyebrow: "Gastos compartidos",
    title: "Uno registra. El otro confirma.",
    description:
      "Los gastos del hogar se dividen 50/50 y sólo afectan el balance cuando la otra persona los aprueba.",
  },
  {
    icon: HandCoins,
    eyebrow: "Préstamos personales",
    title: "Lo personal queda separado",
    description:
      "Si uno adelanta dinero exclusivamente por el otro, registralo como préstamo personal sin mezclarlo con los gastos de la casa.",
  },
  {
    icon: ReceiptText,
    eyebrow: "Todo en un lugar",
    title: "Sabé siempre cómo están las cuentas",
    description:
      "Consultá gastos, deuda del hogar y préstamos personales desde una misma app, sin volver al cuaderno.",
  },
];

export function Onboarding() {
  const [visible, setVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const alreadySeen = window.localStorage.getItem(STORAGE_KEY);

    if (!alreadySeen) {
      setVisible(true);
    }
  }, []);

  function finishOnboarding() {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  }

  function nextSlide() {
    if (currentSlide === slides.length - 1) {
      finishOnboarding();
      return;
    }

    setCurrentSlide((current) => current + 1);
  }

  function previousSlide() {
    setCurrentSlide((current) => Math.max(0, current - 1));
  }

  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current === null) return;

    const difference =
      touchStartX.current - event.changedTouches[0].clientX;

    touchStartX.current = null;

    if (Math.abs(difference) < 50) return;

    if (difference > 0 && currentSlide < slides.length - 1) {
      setCurrentSlide((current) => current + 1);
    }

    if (difference < 0 && currentSlide > 0) {
      setCurrentSlide((current) => current - 1);
    }
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-background">
      {/* Fondo animado */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Luna */}
        <svg
          className="onboarding-moon"
          viewBox="0 0 120 120"
          aria-hidden="true"
        >
          <path
            d="M78 12C48 18 30 42 30 68c0 22 12 42 32 51-34 1-58-25-58-56C4 28 30 2 64 2c5 0 10 1 14 2z"
            fill="currentColor"
          />
        </svg>

        {/* Sol */}
        <svg
          className="onboarding-sun"
          viewBox="0 0 160 160"
          aria-hidden="true"
        >
          <circle cx="80" cy="80" r="28" fill="currentColor" />
          {Array.from({ length: 16 }).map((_, index) => {
            const angle = (index * 360) / 16;
            return (
              <line
                key={index}
                x1="80"
                y1="14"
                x2="80"
                y2="34"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                transform={`rotate(${angle} 80 80)`}
              />
            );
          })}
        </svg>

        {/* Planta izquierda */}
        <svg
          className="onboarding-botanical onboarding-botanical-left"
          viewBox="0 0 260 520"
          aria-hidden="true"
        >
          <path
            className="botanical-stem"
            d="M120 500C105 410 120 330 105 260C90 190 95 120 125 35"
          />

          <ellipse
            className="botanical-leaf botanical-leaf-1"
            cx="82"
            cy="360"
            rx="48"
            ry="22"
            transform="rotate(-32 82 360)"
          />
          <ellipse
            className="botanical-leaf botanical-leaf-2"
            cx="150"
            cy="280"
            rx="52"
            ry="24"
            transform="rotate(28 150 280)"
          />
          <ellipse
            className="botanical-leaf botanical-leaf-3"
            cx="76"
            cy="200"
            rx="44"
            ry="20"
            transform="rotate(-25 76 200)"
          />
          <ellipse
            className="botanical-leaf botanical-leaf-4"
            cx="154"
            cy="120"
            rx="38"
            ry="18"
            transform="rotate(24 154 120)"
          />
        </svg>

        {/* Planta derecha */}
        <svg
          className="onboarding-botanical onboarding-botanical-right"
          viewBox="0 0 260 520"
          aria-hidden="true"
        >
          <path
            className="botanical-stem"
            d="M140 510C160 420 145 345 160 275C175 205 168 130 135 40"
          />

          <ellipse
            className="botanical-leaf botanical-leaf-1"
            cx="178"
            cy="370"
            rx="46"
            ry="21"
            transform="rotate(30 178 370)"
          />
          <ellipse
            className="botanical-leaf botanical-leaf-2"
            cx="108"
            cy="290"
            rx="50"
            ry="23"
            transform="rotate(-26 108 290)"
          />
          <ellipse
            className="botanical-leaf botanical-leaf-3"
            cx="184"
            cy="205"
            rx="42"
            ry="19"
            transform="rotate(27 184 205)"
          />
        </svg>

        {/* Passiflora */}
        <svg
          className="onboarding-passiflora"
          viewBox="0 0 180 180"
          aria-hidden="true"
        >
          <g className="passiflora-spin">
            {Array.from({ length: 12 }).map((_, index) => {
              const angle = (index * 360) / 12;

              return (
                <ellipse
                  key={index}
                  cx="90"
                  cy="34"
                  rx="14"
                  ry="28"
                  fill="currentColor"
                  opacity="0.16"
                  transform={`rotate(${angle} 90 90)`}
                />
              );
            })}
          </g>

          <circle
            cx="90"
            cy="90"
            r="34"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            opacity="0.25"
          />

          {Array.from({ length: 24 }).map((_, index) => {
            const angle = (index * 360) / 24;

            return (
              <line
                key={index}
                x1="90"
                y1="55"
                x2="90"
                y2="31"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.35"
                transform={`rotate(${angle} 90 90)`}
              />
            );
          })}

          <circle cx="90" cy="90" r="12" fill="currentColor" opacity="0.4" />
        </svg>

        {/* Destellos */}
        <span className="onboarding-spark onboarding-spark-1">✦</span>
        <span className="onboarding-spark onboarding-spark-2">✦</span>
        <span className="onboarding-spark onboarding-spark-3">✧</span>
        <span className="onboarding-spark onboarding-spark-4">✦</span>
      </div>

      <button
        type="button"
        onClick={finishOnboarding}
        aria-label="Omitir introducción"
        className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card/70 text-muted-foreground backdrop-blur-md transition hover:bg-card hover:text-foreground"
      >
        <X className="h-5 w-5" />
      </button>

      <div
        className="relative z-10 flex min-h-screen flex-col"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex flex-1 items-center overflow-hidden">
          <div
            className="flex w-full transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
            }}
          >
            {slides.map((slide) => {
              const Icon = slide.icon;

              return (
                <section
                  key={slide.title}
                  className="flex min-w-full items-center justify-center px-6"
                >
                  <div className="mx-auto w-full max-w-md text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] border border-border/60 bg-card/70 text-primary shadow-soft backdrop-blur-xl">
                      <Icon className="h-9 w-9" />
                    </div>

                    <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                      {slide.eyebrow}
                    </p>

                    <h1 className="mt-3 text-3xl font-black leading-tight text-foreground sm:text-4xl">
                      {slide.title}
                    </h1>

                    <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-muted-foreground">
                      {slide.description}
                    </p>
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        <div className="relative z-20 mx-auto w-full max-w-md px-6 pb-8">
          <div className="mb-6 flex items-center justify-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                aria-label={`Ir al paso ${index + 1}`}
                onClick={() => setCurrentSlide(index)}
                className={[
                  "h-2 rounded-full transition-all duration-300",
                  index === currentSlide
                    ? "w-7 bg-primary"
                    : "w-2 bg-border",
                ].join(" ")}
              />
            ))}
          </div>

          <div className="flex gap-3">
            {currentSlide > 0 && (
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={previousSlide}
              >
                Atrás
              </Button>
            )}

            <Button
              type="button"
              className="flex-1"
              onClick={nextSlide}
            >
              {currentSlide === slides.length - 1
                ? "Empezar"
                : "Siguiente"}
            </Button>
          </div>

          <button
            type="button"
            onClick={finishOnboarding}
            className="mt-4 w-full text-center text-sm font-semibold text-muted-foreground transition hover:text-foreground"
          >
            Omitir introducción
          </button>
        </div>
      </div>
    </div>
  );
}