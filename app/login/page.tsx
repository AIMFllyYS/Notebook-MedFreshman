"use client";

import { useRouter } from "next/navigation";
import { BookOpen, GraduationCap, Sparkles, X } from "lucide-react";
import BrandLogo from "@/components/layout/BrandLogo";
import LoginForm from "@/components/auth/LoginForm";

/**
 * 独立登录页：左侧品牌叙事区 + 右侧 Mac 窗壳登录卡。
 * 背景 = 页面底色（--bg-app），无虚化、无光效（用户口径：登录不要背景效果）。
 * 窄屏（<900px）退化为单栏：品牌区收成居中头部。
 */
export default function LoginPage() {
  const router = useRouter();
  const goHome = () => router.push("/");

  return (
    <div
      className="login-page login-overlay"
      data-testid="login-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) goHome();
      }}
    >
      <div className="login-page-grid">
        <section className="login-brand">
          <div className="flex items-center gap-3">
            <BrandLogo size={44} />
            <div>
              <p className="m-0 text-[11px] font-semibold tracking-[0.18em] text-[var(--md-sys-color-primary)]">STUDYSOLO</p>
              <p className="m-0 text-[15px] font-bold leading-tight">一人一室的学习工作室</p>
            </div>
          </div>
          <h1 className="login-brand-slogan">
            把课堂变成<em>自己的复习工作站</em>
          </h1>
          <p className="login-brand-sub">
            笔记、对话、动画和测验都在这里。登录后继续你的复习进度，一切内容与设置随手可得。
          </p>
          <ul className="login-brand-points">
            <li>
              <BookOpen size={15} />
              课堂录音一键整理成笔记与复习手卡
            </li>
            <li>
              <GraduationCap size={15} />
              按课表与培养方案安排复习与出题
            </li>
            <li>
              <Sparkles size={15} />
              对话、动画、测验多形态吃透每个知识点
            </li>
          </ul>
        </section>

        <section className="login-aside">
          <div className="auth-window login-dialog" role="dialog" aria-modal="true" aria-label="登录 StudySolo">
            <div className="auth-titlebar">
              <div className="auth-titlebar-lights">
                <button
                  type="button"
                  className="auth-light"
                  data-tone="close"
                  aria-label="关闭登录"
                  title="关闭"
                  onClick={goHome}
                >
                  <X size={9} strokeWidth={3} />
                </button>
                <span className="auth-light" data-tone="min" aria-hidden="true" />
                <span className="auth-light" data-tone="zoom" aria-hidden="true" />
              </div>
              <div className="auth-titlebar-title">登录 StudySolo</div>
            </div>
            <LoginForm />
          </div>
        </section>
      </div>
    </div>
  );
}
