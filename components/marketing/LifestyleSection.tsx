import Image from "next/image";

export function LifestyleSection() {
  return (
    <section className="px-5 py-12 md:px-8 md:py-20 lg:px-12">
      <div className="relative mx-auto min-h-[42rem] max-w-[1440px] overflow-hidden rounded-[2rem] md:min-h-[48rem] md:rounded-[3rem]">
        <Image
          src="/marketing/lifestyle-couple.webp"
          alt="Una pareja comparte un momento tranquilo en su casa"
          fill
          sizes="(max-width: 768px) 100vw, 94vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c181d]/90 via-[#1c181d]/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-8 text-white md:p-14 lg:p-20">
          <p className="max-w-4xl text-4xl font-black leading-[1.02] tracking-[-0.04em] md:text-7xl">
            Las cuentas son compartidas.
            <br />
            <span className="text-[#d8c7e3]">La tranquilidad también.</span>
          </p>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/75 md:text-lg">
            Organizar la economía cotidiana juntos ayuda a que cada conversación
            empiece con la misma información.
          </p>
        </div>
      </div>
    </section>
  );
}
