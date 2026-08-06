'use client'

import { useState } from 'react'
import { useForm, type FieldValues } from 'react-hook-form'
import { toast } from 'sonner'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Accent, SectionHeading } from '../SectionHeading'
import { Reveal } from '../Reveal'
import { useLanguage } from '../i18n/LanguageContext'

export function ContactSection() {
  const { t } = useLanguage()
  const form = t.contact.form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (data: FieldValues) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || form.errorGeneric)

      toast.success(form.success)
      reset()
    } catch (error: any) {
      toast.error(error.message || form.errorGeneric)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section id="contact" className="bg-slate-50/60 py-24 dark:bg-white/[0.02] sm:py-28">
      <div className="mx-auto max-w-xl px-5 sm:px-8">
        <SectionHeading
          title={
            <>
              {t.contact.titlePre}
              <Accent>{t.contact.titleAccent}</Accent>
            </>
          }
          description={t.contact.description}
        />

        <Reveal delay={100}>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700 dark:text-slate-300">
              {form.name}
            </label>
            <input
              type="text"
              placeholder={form.namePlaceholder}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[14px] text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 dark:border-white/10 dark:bg-[#11151C] dark:text-white"
              {...register('name', { required: form.nameRequired })}
            />
            {errors.name ? <p className="mt-1.5 text-[12px] text-rose-500">{errors.name.message as string}</p> : null}
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700 dark:text-slate-300">
              {form.email}
            </label>
            <input
              type="email"
              placeholder={form.emailPlaceholder}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[14px] text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 dark:border-white/10 dark:bg-[#11151C] dark:text-white"
              {...register('email', {
                required: form.emailRequired,
                pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: form.emailInvalid },
              })}
            />
            {errors.email ? <p className="mt-1.5 text-[12px] text-rose-500">{errors.email.message as string}</p> : null}
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700 dark:text-slate-300">
              {form.phone} <span className="font-normal text-slate-400">{form.phoneOptional}</span>
            </label>
            <input
              type="tel"
              placeholder={form.phonePlaceholder}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[14px] text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 dark:border-white/10 dark:bg-[#11151C] dark:text-white"
              {...register('phone')}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700 dark:text-slate-300">
              {form.message}
            </label>
            <textarea
              rows={4}
              placeholder={form.messagePlaceholder}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 dark:border-white/10 dark:bg-[#11151C] dark:text-white"
              {...register('message', { required: form.messageRequired })}
            />
            {errors.message ? (
              <p className="mt-1.5 text-[12px] text-rose-500">{errors.message.message as string}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#22C55E] text-[15px] font-semibold text-white transition-colors hover:bg-[#16A34A] disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {form.submit}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
        </Reveal>
      </div>
    </section>
  )
}
