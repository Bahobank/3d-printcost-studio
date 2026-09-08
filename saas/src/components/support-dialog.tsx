"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, LifeBuoy, Send, X } from "lucide-react";

export type SupportLanguage = "th" | "en" | "zh" | "ja" | "ko";

type SupportCopy = {
  title: string;
  intro: string;
  nameLabel: string;
  subjectLabel: string;
  bodyLabel: string;
  send: string;
  sending: string;
  cancel: string;
  close: string;
  sentTitle: string;
  sentBody: string;
  errorEmpty: string;
  errorFailed: string;
};

const supportCopy: Record<SupportLanguage, SupportCopy> = {
  th: {
    title: "ติดต่อทีมงาน",
    intro: "เล่าปัญหาที่เจอให้เราฟังได้เลย เราจะรีบตรวจสอบและติดต่อกลับ",
    nameLabel: "ชื่อผู้ส่ง",
    subjectLabel: "หัวข้อ",
    bodyLabel: "รายละเอียด",
    send: "ส่งข้อความ",
    sending: "กำลังส่ง...",
    cancel: "ยกเลิก",
    close: "ปิด",
    sentTitle: "ส่งเรียบร้อยแล้ว",
    sentBody: "ทีมงานได้รับข้อความของคุณแล้ว และจะรีบติดต่อกลับโดยเร็วที่สุด",
    errorEmpty: "กรุณากรอกทั้งหัวข้อและรายละเอียด",
    errorFailed: "ส่งไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
  },
  en: {
    title: "Contact us",
    intro: "Tell us what went wrong and we will look into it and get back to you.",
    nameLabel: "Your name",
    subjectLabel: "Subject",
    bodyLabel: "Details",
    send: "Send message",
    sending: "Sending...",
    cancel: "Cancel",
    close: "Close",
    sentTitle: "Message sent",
    sentBody: "We have your message and will get back to you as soon as we can.",
    errorEmpty: "Please fill in both the subject and the details.",
    errorFailed: "Could not send. Please try again.",
  },
  zh: {
    title: "联系我们",
    intro: "请告诉我们遇到的问题，我们会尽快核实并回复您。",
    nameLabel: "您的姓名",
    subjectLabel: "主题",
    bodyLabel: "详细说明",
    send: "发送",
    sending: "发送中...",
    cancel: "取消",
    close: "关闭",
    sentTitle: "已发送",
    sentBody: "我们已收到您的消息，会尽快与您联系。",
    errorEmpty: "请填写主题和详细说明。",
    errorFailed: "发送失败，请重试。",
  },
  ja: {
    title: "お問い合わせ",
    intro: "困っている内容をお知らせください。確認のうえご連絡します。",
    nameLabel: "お名前",
    subjectLabel: "件名",
    bodyLabel: "詳細",
    send: "送信する",
    sending: "送信中...",
    cancel: "キャンセル",
    close: "閉じる",
    sentTitle: "送信しました",
    sentBody: "メッセージを受け取りました。できるだけ早くご連絡します。",
    errorEmpty: "件名と詳細の両方をご入力ください。",
    errorFailed: "送信できませんでした。もう一度お試しください。",
  },
  ko: {
    title: "문의하기",
    intro: "어떤 문제가 있었는지 알려주시면 확인 후 연락드리겠습니다.",
    nameLabel: "보내는 분",
    subjectLabel: "제목",
    bodyLabel: "상세 내용",
    send: "보내기",
    sending: "보내는 중...",
    cancel: "취소",
    close: "닫기",
    sentTitle: "전송되었습니다",
    sentBody: "메시지를 받았습니다. 최대한 빨리 연락드리겠습니다.",
    errorEmpty: "제목과 상세 내용을 모두 입력해 주세요.",
    errorFailed: "보내지 못했습니다. 다시 시도해 주세요.",
  },
};

type SupportDialogProps = {
  language: SupportLanguage;
  onClose: () => void;
  open: boolean;
};

export function SupportDialog({ language, onClose, open }: SupportDialogProps) {
  const copy = supportCopy[language] ?? supportCopy.th;
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [state, setState] = useState<"editing" | "sending" | "sent">("editing");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName("");
    setSubject("");
    setBody("");
    setState("editing");
    setError(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  async function send() {
    if (!name.trim() || !subject.trim() || !body.trim()) {
      setError(copy.errorEmpty);
      return;
    }

    setState("sending");
    setError(null);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, subject, body }),
      });
      if (!res.ok) throw new Error(String(res.status));

      // Web3Forms only accepts submissions from the browser on the free plan, so
      // the server hands back the composed notification and it goes out from here.
      // The message is already stored by this point: a delivery failure is worth
      // logging, not worth telling the customer their message did not arrive.
      const data = (await res.json().catch(() => ({}))) as { notify?: Record<string, unknown> };
      if (data.notify) {
        try {
          await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(data.notify),
          });
        } catch (deliveryError) {
          console.error("[support] could not deliver the notification", deliveryError);
        }
      }

      setState("sent");
    } catch {
      setState("editing");
      setError(copy.errorFailed);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <button
          aria-label={copy.close}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
          onClick={onClose}
          type="button"
        >
          <X size={18} />
        </button>

        {state === "sent" ? (
          <div className="py-6 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={28} strokeWidth={2.4} />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-950">{copy.sentTitle}</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{copy.sentBody}</p>
            <button
              className="mt-6 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
              onClick={onClose}
              type="button"
            >
              {copy.close}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-100 text-blue-600">
                <LifeBuoy size={22} strokeWidth={2.4} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-950">{copy.title}</h2>
                <p className="text-sm font-semibold text-slate-500">{copy.intro}</p>
              </div>
            </div>

            <label className="mt-5 block text-sm font-bold text-slate-700" htmlFor="support-name">
              {copy.nameLabel}
            </label>
            <input
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500"
              disabled={state === "sending"}
              id="support-name"
              maxLength={120}
              onChange={(event) => setName(event.target.value)}
              type="text"
              value={name}
            />

            <label className="mt-4 block text-sm font-bold text-slate-700" htmlFor="support-subject">
              {copy.subjectLabel}
            </label>
            <input
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500"
              disabled={state === "sending"}
              id="support-subject"
              maxLength={200}
              onChange={(event) => setSubject(event.target.value)}
              type="text"
              value={subject}
            />

            <label className="mt-4 block text-sm font-bold text-slate-700" htmlFor="support-body">
              {copy.bodyLabel}
            </label>
            <textarea
              className="mt-1.5 h-36 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold leading-6 text-slate-900 outline-none transition focus:border-blue-500"
              disabled={state === "sending"}
              id="support-body"
              maxLength={4000}
              onChange={(event) => setBody(event.target.value)}
              value={body}
            />

            {error ? <p className="mt-3 text-sm font-bold text-rose-600">{error}</p> : null}

            <div className="mt-5 flex flex-wrap justify-end gap-2.5">
              <button
                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                disabled={state === "sending"}
                onClick={onClose}
                type="button"
              >
                {copy.cancel}
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
                disabled={state === "sending"}
                onClick={send}
                type="button"
              >
                <Send size={16} strokeWidth={2.4} />
                {state === "sending" ? copy.sending : copy.send}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
