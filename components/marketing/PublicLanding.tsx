import Image from "next/image";
import Link from "next/link";
import { Check, HeartHandshake, Scale } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { LandingMotion } from "./LandingMotion";
import styles from "./Landing.module.css";

const money = (amount: number) => formatCurrency(amount);

export function PublicLanding() {
  return (
    <LandingMotion className={styles.landing}>
      <a href="#contenido" className={styles.skip}>Ir al contenido</a>
      <header className={styles.header}>
        <Link href="/" aria-label="Balance, inicio" className={styles.brand}>
          <Image src="/logo.png" alt="" width={42} height={42} priority />
          <span>Balance</span>
        </Link>
        <nav aria-label="Navegación de la landing" className={styles.navigation}>
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#producto">Por dentro</a>
          <a href="#preguntas">Preguntas</a>
        </nav>
        <Link href="/login" className={styles.login}>Ingresar</Link>
      </header>

      <main id="contenido">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.intro}>Para quienes comparten casa.</p>
            <h1 id="hero-title">La vida juntos.<br />Las cuentas claras.</h1>
            <p className={styles.lead}>El súper, internet, esa compra para casa. Organizá los gastos entre dos y dejá espacio para todo lo demás.</p>
            <Link href="/login" className={styles.button}>Empezar con Balance</Link>
            <a href="#como-funciona" className={styles.textLink}>Mirá cómo se comparte un gasto</a>
          </div>
          <figure className={styles.heroFigure}>
            <div className={styles.photoWindow}>
              <div data-parallax className={styles.parallaxPhoto}>
                <Image src="/marketing/hero-couple.webp" alt="Dos personas revisan juntas el celular en el sillón de su casa" fill sizes="(max-width: 760px) 100vw, 55vw" priority />
              </div>
            </div>
            <figcaption>Un hogar de a dos. Un lugar para sus cuentas.</figcaption>
          </figure>
        </section>

        <section id="como-funciona" data-story className={styles.story} aria-labelledby="story-title">
          <div className={styles.storySticky}>
            <div className={styles.storyCopy}>
              <p className={styles.scene}>Un sábado cualquiera</p>
              <h2 id="story-title">La compra es de los dos.<br />La cuenta, también.</h2>
              <p>Luz pasa por el súper. Tomás ya pagó internet. No hace falta acordarse de todo: lo registran, lo revisan y Balance les muestra cómo quedan.</p>
              <p className={styles.storyMath}>En este ejemplo, Luz pagó {money(48000)} y Tomás, {money(24000)}. Con ambos gastos aprobados y un reparto 50/50, Tomás le debe {money(12000)} a Luz.</p>
              <span className={styles.scrollHint}>Seguí bajando: de la compra al balance.</span>
            </div>
            <div className={styles.storyStage} aria-hidden="true">
              <div data-receipt className={styles.receipt}>
                <p className={styles.receiptHeading}>Para casa</p>
                <p className={styles.receiptSubtitle}>La lista del súper de Luz y Tomás</p>
                <ul>
                  {[['Frutas y verduras', 14000], ['Leche, yogur y huevos', 12000], ['Pan y cosas ricas', 8000], ['Limpieza para casa', 14000]].map(([label, amount]) => (
                    <li key={label}><Check size={15} /><span>{label}</span><b>{money(Number(amount))}</b></li>
                  ))}
                </ul>
                <div className={styles.receiptTotal}><span>Pagó Luz</span><strong>{money(48000)}</strong></div>
                <p className={styles.receiptFoot}>Ahora, a guardar la compra.</p>
              </div>
              <div data-balance className={styles.balanceResult}>
                <Scale size={30} strokeWidth={1.4} />
                <p>Todo revisado. Todo compartido.</p>
                <h3>Así quedan las cuentas</h3>
                <dl><div><dt>Súper · pagó Luz</dt><dd>{money(48000)}</dd></div><div><dt>Internet · pagó Tomás</dt><dd>{money(24000)}</dd></div><div><dt>A cada uno le toca</dt><dd>{money(36000)}</dd></div></dl>
                <div className={styles.resultAmount}><span>Tomás le debe a Luz</span><strong>{money(12000)}</strong></div>
                <p className={styles.demoLabel}>Ejemplo ilustrativo · gastos aprobados</p>
              </div>
            </div>
          </div>
        </section>

        <section id="producto" className={styles.product} aria-labelledby="product-title">
          <div className={styles.productHeading}>
            <h2 id="product-title">Menos «¿quién pagó?».<br />Más saber dónde están.</h2>
            <p>Lo que gastaron, lo que falta revisar y el balance compartido. El mismo hogar, desde el celu o la compu.</p>
          </div>
          <figure data-captures className={styles.captures}>
            <div className={styles.desktopCapture} data-capture-part>
              <div className={styles.windowBar}><span /><span /><span /><p>Balance · nuestro hogar</p></div>
              <Image src="/marketing/product/dashboard-desktop.webp" width={1440} height={1000} sizes="(max-width: 760px) 94vw, 82vw" alt="Dashboard real de Balance: Luz y Tomás gastaron 72.000 pesos, con un balance compartido de 12.000 pesos y una aprobación pendiente" />
            </div>
            <div className={styles.mobileCapture} data-capture-part>
              <Image src="/marketing/product/dashboard-mobile.webp" width={390} height={844} sizes="(max-width: 760px) 36vw, 21vw" alt="El mismo dashboard real en un celular, con los indicadores organizados en una columna" />
            </div>
            <figcaption data-capture-part>Capturas reales de Balance con datos ficticios. Luz, Tomás y su hogar son un ejemplo.</figcaption>
          </figure>
        </section>

        <section className={styles.steps} aria-labelledby="steps-title">
          <div className={styles.stepsHeading}><h2 id="steps-title">Compartir casa ya tiene<br />sus vueltas. Esto no.</h2><p>Un hogar para dos personas. Cada una con su cuenta.</p></div>
          <ol>
            <li><span>1</span><div><h3>Armen su hogar</h3><p>Una persona crea el hogar y comparte el código. La otra se une con su propia cuenta.</p></div></li>
            <li><span>2</span><div><h3>Uno carga, el otro revisa</h3><p>Registrá qué pagaste. El gasto queda pendiente hasta que la otra persona lo apruebe.</p></div></li>
            <li><span>3</span><div><h3>Las cuentas, a la vista</h3><p>Los gastos aprobados se reparten 50/50 y actualizan el balance. Sin hacer la cuenta otra vez.</p></div></li>
          </ol>
          <aside className={styles.personalNote}><HeartHandshake size={26} strokeWidth={1.5} /><p><strong>Lo personal, por separado.</strong> Si le prestás plata a la otra persona, registralo como préstamo. No se mezcla con los gastos compartidos.</p></aside>
        </section>

        <section className={styles.lifestyle} aria-labelledby="lifestyle-title">
          <div className={styles.lifestylePhoto}><Image src="/marketing/lifestyle-couple.webp" alt="Dos personas comparten un café en la mesa de su cocina" fill sizes="(max-width: 760px) 100vw, 55vw" /></div>
          <div className={styles.lifestyleCopy}><p className={styles.scene}>La compra guardada. El café listo.</p><h2 id="lifestyle-title">Hay mejores cosas<br />de las que hablar.</h2><p>Que las cuentas tengan su lugar. Y ustedes, el suyo.</p><Link href="/login" className={styles.button}>Organizar nuestras cuentas</Link></div>
        </section>

        <section id="preguntas" className={styles.faq} aria-labelledby="faq-title">
          <h2 id="faq-title">Antes de empezar</h2>
          <div>
            <details><summary>¿Cómo se dividen los gastos?</summary><p>Los gastos compartidos se reparten en partes iguales entre las dos personas del hogar. Solo los aprobados impactan en el balance.</p></details>
            <details><summary>¿Qué pasa si no estamos de acuerdo con un gasto?</summary><p>La otra persona puede rechazarlo. Mientras no esté aprobado, no se suma al balance compartido.</p></details>
            <details><summary>¿Cada uno tiene su propia cuenta?</summary><p>Sí. Cada persona ingresa con su email y contraseña y se une al mismo hogar mediante un código de invitación.</p></details>
            <details><summary>¿Puedo usarlo desde el celular?</summary><p>Sí, Balance se adapta al celular y a la computadora. También podés instalarlo desde un navegador compatible para tenerlo a mano.</p></details>
          </div>
        </section>
      </main>
      <footer className={styles.footer}><Link href="/" className={styles.brand}><Image src="/logo.png" alt="" width={32} height={32} /><span>Balance</span></Link><p>Compartir la vida. No las dudas.</p><Link href="/login">Ingresar a Balance</Link></footer>
    </LandingMotion>
  );
}
