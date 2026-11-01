import Link from 'next/link'
import { dict, type Locale } from '@/lib/i18n'

export default async function Home({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang } = await searchParams
  const l: Locale = lang === 'en' ? 'en' : 'ar'
  const t = dict[l]
  return (
    <div dir={l === 'ar' ? 'rtl' : 'ltr'} className='min-h-screen'>
      <header className='mx-auto flex max-w-6xl items-center justify-between p-5'>
        <b className='text-xl text-brand'>Egytronic POS</b>
        <Link className='rounded-lg border px-3 py-1.5 text-sm' href={l === 'ar' ? '/?lang=en' : '/'}>{l === 'ar' ? 'EN' : 'عربي'}</Link>
      </header>
      <section className='bg-gradient-to-b from-brand-dark to-brand px-5 py-20 text-center text-white'>
        <h1 className='mx-auto max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl'>{t.tagline}</h1>
        <p className='mx-auto mt-5 max-w-xl text-lg text-white/80'>{t.sub}</p>
        <Link href='/pos' className='mt-8 inline-block rounded-xl bg-white px-7 py-3 font-bold text-brand-dark shadow-lg'>{t.openPos}</Link>
      </section>
      <section className='mx-auto max-w-6xl px-5 py-14'>
        <h2 className='mb-8 text-center text-3xl font-bold'>{t.features}</h2>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {t.feats.map((f) => (
            <div key={f.t} className='rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200'>
              <h3 className='mb-1 text-lg font-bold text-brand'>{f.t}</h3>
              <p className='text-slate-600'>{f.d}</p>
            </div>
          ))}
        </div>
      </section>
      <section className='mx-auto max-w-6xl px-5 pb-16'>
        <h2 className='mb-8 text-center text-3xl font-bold'>{t.pricing}</h2>
        <div className='grid gap-4 md:grid-cols-3'>
          {t.plans.map((p, i) => (
            <div key={p.n} className={'rounded-2xl bg-white p-6 shadow-sm ' + (i === 1 ? 'ring-2 ring-brand' : 'ring-1 ring-slate-200')}>
              <h3 className='text-xl font-bold'>{p.n}</h3>
              <div className='my-2 text-4xl font-extrabold text-brand'>{p.p}</div>
              <div className='text-sm text-slate-500'>{t.month}</div>
              <ul className='mt-4 list-disc space-y-1 ps-5 text-slate-700'>{p.f.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
          ))}
        </div>
        <p className='mt-4 text-center text-sm text-slate-500'>{t.note}</p>
      </section>
      <footer className='border-t py-6 text-center text-sm text-slate-500'>© Egytronic</footer>
    </div>
  )
}
