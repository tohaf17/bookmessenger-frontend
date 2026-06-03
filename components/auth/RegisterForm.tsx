'use client';

import css from './RegisterForm.module.css';
import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useT } from '@/lib/translations';
import { BookOpen, User, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useLangStore } from '@/store/langStore';
import { useAuthStore } from '@/store/authStore';
import { isAdminUser } from '@/lib/auth';

type RegisterFormValues = {
  name: string;
  surname: string;
  email: string;
  password: string;
  preferredLanguage: 'uk' | 'en';
};

export default function RegisterPage() {
  const router = useRouter();
  const t = useT();
  const loginUser = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const lang = useLangStore((state) => state.lang);
  const setLanguage = useLangStore((state) => state.setLanguage);

  const registerSchema = useMemo(() => {
    return zod.object({
      name: zod.string().min(1, t('auth.validation.nameRequired')),
      surname: zod.string().min(1, t('auth.validation.surnameRequired')),
      email: zod.string().email(t('auth.validation.email')),
      password: zod.string().min(6, t('auth.validation.passwordMin')),
      preferredLanguage: zod.enum(['uk', 'en']),
    });
  }, [lang, t]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      surname: '',
      email: '',
      password: '',
      preferredLanguage: lang,
    },
  });

  const selectedLang = watch('preferredLanguage');

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await api.post('/auth/register', data);
      const token = res.data.accessToken;

      if (!token) {
        throw new Error('No access token returned');
      }

      const loggedUser = await loginUser(token);
      setIsSuccess(true);
      router.replace(isAdminUser(loggedUser) ? '/admin' : '/');
    } catch (err: any) {
      console.error(err);
      setApiError(
        err.response?.data?.message || 
        t('auth.error.registerFailed')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={css.container}>
      <div className={css.backgroundBlob1}></div>
      <div className={css.backgroundBlob2}></div>

      <div className={`glass-panel ${css.card}`}>
        <div className={css.header}>
          <Link href="/" className={css.logo}>
            <BookOpen size={36} color="#9333ea" />
            <h1 className={css.logoText}>Book<span className={css.logoAccent}>Messenger</span></h1>
          </Link>
          <p className={css.subtitle}>
            {t('auth.register.subtitle')}
          </p>
        </div>

        {apiError && (
          <div className={css.errorAlert}>
            {apiError}
          </div>
        )}

        {isSuccess && (
          <div className={css.successAlert}>
            {t('auth.registerSuccess')}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className={css.form}>
          <div className={css.row}>
            <div className={css.inputGroup}>
              <label className={css.label}>{t('auth.name')}</label>
              <div className={css.inputWrapper}>
                <User size={18} className={css.inputIcon} />
                <input
                  type="text"
                  placeholder="Олексій"
                  className={`glass-input ${css.inputField}`}
                  {...register('name')}
                />
              </div>
              {errors.name && <span className={css.errorText}>{errors.name.message}</span>}
            </div>

            <div className={css.inputGroup}>
              <label className={css.label}>{t('auth.surname')}</label>
              <div className={css.inputWrapper}>
                <User size={18} className={css.inputIcon} />
                <input
                  type="text"
                  placeholder="Коваленко"
                  className={`glass-input ${css.inputField}`}
                  {...register('surname')}
                />
              </div>
              {errors.surname && <span className={css.errorText}>{errors.surname.message}</span>}
            </div>
          </div>

          <div className={css.inputGroup}>
            <label className={css.label}>{t('auth.email')}</label>
            <div className={css.inputWrapper}>
              <Mail size={18} className={css.inputIcon} />
              <input
                type="email"
                placeholder="reader@example.com"
                className={`glass-input ${css.inputField}`}
                {...register('email')}
              />
            </div>
            {errors.email && <span className={css.errorText}>{errors.email.message}</span>}
          </div>

          <div className={css.inputGroup}>
            <label className={css.label}>{t('auth.password')}</label>
            <div className={css.inputWrapper}>
              <Lock size={18} className={css.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`glass-input ${css.inputField}`}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={css.eyeBtn}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className={css.errorText}>{errors.password.message}</span>}
          </div>

          <div className={css.inputGroup}>
            <label className={css.label}>{t('auth.language')}</label>
            <div className={css.langSelector}>
              <button
                type="button"
                onClick={() => { setValue('preferredLanguage', 'uk'); setLanguage('uk'); }}
                className={`${css.langBtn} ${selectedLang === 'uk' ? css.langBtnActive : ''}`}
              >
                Українська (UK)
              </button>
              <button
                type="button"
                onClick={() => { setValue('preferredLanguage', 'en'); setLanguage('en'); }}
                className={`${css.langBtn} ${selectedLang === 'en' ? css.langBtnActive : ''}`}
              >
                English (EN)
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className={`btn-primary ${css.submitBtn}`}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className={css.spinner} />
                {t('auth.registering')}
              </>
            ) : (
              t('auth.registerAction')
            )}
          </button>
        </form>

        <div className={css.footer}>
          <span>{t('auth.hasAccount')}</span>
          <Link href="/auth/login" className={css.loginLink}>
            {t('auth.loginAction')}
          </Link>
        </div>
      </div>
    </div>
  );
}
