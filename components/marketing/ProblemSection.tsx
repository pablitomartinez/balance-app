const questions = ["¿Quién pagó esta vez?", "¿Cuánto te tengo que transferir?", "¿La luz ya está paga?", "¿Esto lo dividimos?", "¿Cuánto gastamos este mes?"];

export function ProblemSection() {
  return (
    <section className="bg-foreground px-5 py-24 text-background md:px-8 md:py-32 lg:px-12">
      <div className="mx-auto grid max-w-[1440px] gap-16 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">La vida cotidiana</p>
          <h2 className="mt-5 text-4xl font-black leading-[1.02] tracking-[-0.04em] md:text-6xl">El problema no es compartir gastos.<br /><span className="text-secondary">El problema es no tenerlos claros.</span></h2>
          <p className="mt-7 max-w-lg text-base leading-7 opacity-70">Una compra queda en la memoria, otra en WhatsApp, un comprobante se pierde y la transferencia aparece sin contexto. Las cuentas pequeñas terminan ocupando demasiado espacio.</p>
        </div>
        <div className="relative min-h-[26rem]">
          {questions.map((question, index) => (
            <p key={question} className={`absolute max-w-[85%] rounded-full border border-background/20 bg-background/10 px-5 py-3 text-lg font-semibold backdrop-blur md:text-2xl ${["left-0 top-0", "right-0 top-[18%]", "left-[8%] top-[39%]", "right-[5%] top-[61%]", "left-0 top-[82%]"][index]}`}>{question}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
