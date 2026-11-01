'use client'
import { useCallback, useEffect, useState } from 'react'
import { sb } from '@/lib/supabase/client'
import { totals, useCart } from '@/lib/store'
import { dict, type Locale } from '@/lib/i18n'

type P = { id: string; name_en: string; name_ar: string; price: number; stock: number }
type Org = { id: string; name: string; vat_rate: number }

export default function Pos() {
  const [l, setL] = useState<Locale>('ar')
  const t = dict[l]
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState<string | null>(null)
  const [org, setOrg] = useState<Org | null>(null)
  const [prods, setProds] = useState<P[]>([])
  const [q, setQ] = useState('')
  const [email, setEmail] = useState('')
  const [biz, setBiz] = useState('')
  const [type, setType] = useState('dine')
  const [msg, setMsg] = useState('')
  const [nf, setNf] = useState({ en: '', ar: '', price: '', stock: '' })
  const { lines, disc, add, inc, setDisc, clear } = useCart()

  const load = useCallback(async () => {
    const { data: u } = await sb().auth.getUser()
    setUser(u.user?.id ?? null)
    if (u.user) {
      const { data: o } = await sb().from('orgs').select('id,name,vat_rate').limit(1)
      const g = (o?.[0] as Org | undefined) ?? null
      setOrg(g)
      if (g) {
        const { data: p } = await sb().from('products').select('id,name_en,name_ar,price,stock').eq('active', true).order('name_en')
        setProds((p as P[]) ?? [])
      }
    }
    setReady(true)
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    if (!org) return
    const ch = sb().channel('products').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => load()).subscribe()
    return () => { sb().removeChannel(ch) }
  }, [org, load])

  const fmt = (n: number) => n.toFixed(2) + ' ' + t.cur
  const name = (p: P) => (l === 'ar' ? p.name_ar : p.name_en)
  const c = totals(lines, disc, org?.vat_rate ?? 14)

  const pay = async (method: string) => {
    if (!lines.length || !org) return
    const { error } = await sb().rpc('checkout', {
      p_org: org.id, p_type: type, p_method: method, p_discount_pct: disc,
      p_items: lines.map((x) => ({ id: x.id, qty: x.qty })),
    })
    if (error) { setMsg(t.error + ': ' + error.message); return }
    clear(); setMsg(t.paid); load()
  }
  const addProduct = async () => {
    if (!org || !nf.en || !nf.price) return
    const { error } = await sb().from('products').insert({
      org_id: org.id, name_en: nf.en, name_ar: nf.ar || nf.en, price: Number(nf.price), stock: Number(nf.stock) || 0,
    })
    if (error) setMsg(t.error + ': ' + error.message); else { setNf({ en: '', ar: '', price: '', stock: '' }); load() }
  }

  const box = 'rounded-xl border bg-white px-3 py-2'
  const shell = (c: React.ReactNode) => <main dir={l === 'ar' ? 'rtl' : 'ltr'} className='mx-auto max-w-md p-6'>{c}</main>

  if (!ready) return shell(<p>…</p>)
  if (!user) return shell(
    <div className='space-y-3'>
      <h1 className='text-2xl font-bold text-brand'>Egytronic POS</h1>
      <input className={box + ' w-full'} type='email' placeholder={t.email} value={email} onChange={(e) => setEmail(e.target.value)} />
      <button className='w-full rounded-xl bg-brand px-4 py-2 font-bold text-white' onClick={async () => {
        const { error } = await sb().auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + '/pos' } })
        setMsg(error ? t.error + ': ' + error.message : t.checkEmail)
      }}>{t.sendLink}</button>
      <p className='text-sm text-slate-600'>{msg}</p>
    </div>,
  )
  if (!org) return shell(
    <div className='space-y-3'>
      <h1 className='text-2xl font-bold'>{t.createBiz}</h1>
      <input className={box + ' w-full'} placeholder={t.bizName} value={biz} onChange={(e) => setBiz(e.target.value)} />
      <button className='w-full rounded-xl bg-brand px-4 py-2 font-bold text-white' onClick={async () => {
        const { error } = await sb().rpc('create_org', { p_name: biz })
        if (error) setMsg(t.error + ': ' + error.message); else load()
      }}>{t.create}</button>
      <p className='text-sm text-red-600'>{msg}</p>
    </div>,
  )

  const shown = prods.filter((p) => (p.name_en + p.name_ar).toLowerCase().includes(q.toLowerCase()))
  return (
    <div dir={l === 'ar' ? 'rtl' : 'ltr'} className='mx-auto grid max-w-7xl gap-4 p-4 lg:grid-cols-[1fr_380px]'>
      <section>
        <div className='mb-3 flex items-center gap-2'>
          <b className='me-auto text-xl text-brand'>{org.name}</b>
          <button className={box} onClick={() => setL(l === 'ar' ? 'en' : 'ar')}>{l === 'ar' ? 'EN' : 'عربي'}</button>
          <button className={box} onClick={async () => { await sb().auth.signOut(); load() }}>{t.signOut}</button>
        </div>
        <input className={box + ' w-full'} placeholder={t.search} value={q} onChange={(e) => setQ(e.target.value)} />
        <div className='mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4'>
          {shown.map((p) => (
            <button key={p.id} disabled={p.stock < 1} onClick={() => add({ id: p.id, name: name(p), price: p.price, max: p.stock })}
              className='flex h-24 flex-col justify-between rounded-xl bg-white p-3 text-start shadow-sm ring-1 ring-slate-200 disabled:opacity-40'>
              <span className='font-semibold'>{name(p)}</span>
              <small className='text-slate-500'>{fmt(p.price)} · {p.stock}</small>
            </button>
          ))}
        </div>
        <details className='mt-4 rounded-xl bg-white p-3 ring-1 ring-slate-200'>
          <summary className='cursor-pointer font-semibold'>{t.addItem}</summary>
          <div className='mt-2 flex flex-wrap gap-2'>
            <input className={box} placeholder={t.nameEn} value={nf.en} onChange={(e) => setNf({ ...nf, en: e.target.value })} />
            <input className={box} placeholder={t.nameAr} value={nf.ar} onChange={(e) => setNf({ ...nf, ar: e.target.value })} />
            <input className={box + ' w-28'} type='number' placeholder={t.price} value={nf.price} onChange={(e) => setNf({ ...nf, price: e.target.value })} />
            <input className={box + ' w-28'} type='number' placeholder={t.stock} value={nf.stock} onChange={(e) => setNf({ ...nf, stock: e.target.value })} />
            <button className='rounded-xl bg-brand px-4 py-2 font-bold text-white' onClick={addProduct}>{t.save}</button>
          </div>
        </details>
      </section>
      <aside className='h-fit space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200'>
        <h2 className='text-lg font-bold'>{t.cart}</h2>
        <div className='flex gap-2'>
          {(['dine', 'take', 'del'] as const).map((k) => (
            <button key={k} onClick={() => setType(k)} className={'flex-1 rounded-lg border px-2 py-1 text-sm ' + (type === k ? 'bg-brand text-white' : '')}>{t[k]}</button>
          ))}
        </div>
        {lines.length === 0 && <p className='text-slate-500'>{t.empty}</p>}
        {lines.map((x) => (
          <div key={x.id} className='flex items-center justify-between gap-2'>
            <span className='flex-1'>{x.name}</span>
            <button className='h-8 w-8 rounded-lg border' onClick={() => inc(x.id, -1)}>-</button>
            <span>{x.qty}</span>
            <button className='h-8 w-8 rounded-lg border' onClick={() => inc(x.id, 1)}>+</button>
            <b className='w-20 text-end'>{fmt(x.price * x.qty)}</b>
          </div>
        ))}
        <label className='flex items-center justify-between text-sm'>{t.discount}
          <input className={box + ' w-24'} type='number' min={0} max={100} value={disc} onChange={(e) => setDisc(Number(e.target.value))} />
        </label>
        <div className='space-y-1 border-t pt-2 text-sm'>
          <div className='flex justify-between'><span>{t.subtotal}</span><span>{fmt(c.sub)}</span></div>
          <div className='flex justify-between'><span>{t.vat} {org.vat_rate}%</span><span>{fmt(c.tax)}</span></div>
          <div className='flex justify-between text-xl font-extrabold text-brand'><span>{t.total}</span><span>{fmt(c.total)}</span></div>
        </div>
        <div className='grid grid-cols-3 gap-2'>
          {(['cash', 'card', 'wallet'] as const).map((m) => (
            <button key={m} disabled={!lines.length} onClick={() => pay(m)} className='rounded-xl bg-brand px-2 py-3 font-bold text-white disabled:opacity-40'>{t[m]}</button>
          ))}
        </div>
        <p className='text-sm text-slate-600'>{msg}</p>
      </aside>
    </div>
  )
}
