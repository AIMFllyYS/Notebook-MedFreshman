"use client";

import { ClipboardCheck } from "lucide-react";

export default function QuizTab() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: "2rem",
        color: "var(--md-sys-color-on-surface-variant)",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "var(--md-sys-color-primary-container)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1rem",
        }}
      >
        <ClipboardCheck size={28} style={{ color: "var(--md-sys-color-primary)" }} />
      </div>
      <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--md-sys-color-on-surface)", margin: "0 0 0.5rem" }}>
        题目测试功能即将推出
      </p>
      <p style={{ fontSize: "13px", maxWidth: "280px", textAlign: "center", margin: 0 }}>
        基于当前学习内容自动生成练习题，帮助你巩固知识点
      </p>
    </div>
  );
}
