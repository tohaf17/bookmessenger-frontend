'use client';

import css from './LoginForm.module.css';
import React, { useState,useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useT,t as staticT } from '@/lib/translations';
import { useAuthStore } from '@/store/authStore';
import { BookOpen, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import {useLangStore} from "@/store/langStore";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const t = useT();

  const lang = useLangStore((state) => state.lang);

  const loginUser = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const loginSchema = useMemo(()=>{
    return zod.object({
      email: zod.string().email(t('auth.validation.email')),
      password: zod.string().min(1, t('auth.validation.passwordRequired')),
    })
  },[lang,t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await api.post('/auth/login', data);
      const token = res.data.accessToken;
      if (token) {
        await loginUser(token);
        router.push('/');
      } else {
        throw new Error('No access token returned');
      }
    } catch (err: any) {
      console.error(err);
      setApiError(
        err.response?.data?.message || 
        t('auth.error.loginInvalid')
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
            {t('auth.login.subtitle')}
          </p>
        </div>

        {apiError && (
          <div className={css.errorAlert}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className={css.form}>
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

          <button
            type="submit"
            disabled={isLoading}
            className={`btn-primary ${css.submitBtn}`}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className={css.spinner} />
                {t('auth.loggingIn')}
              </>
            ) : (
              t('auth.loginAction')
            )}
          </button>
        </form>

        <div className={css.footer}>
          <span>{t('auth.noAccount')}</span>
          <Link href="/auth/register" className={css.registerLink}>
            {t('auth.registerAction')}
          </Link>
        </div>
      </div>
    </div>
  );
}

