"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { Bot, Send, Sparkles, UserRound } from "lucide-react";

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
};

const starterMessages: ChatMessage[] = [
  {
    id: 1,
    role: "assistant",
    text: "สวัสดีครับ ผมช่วยสรุปต้นทุนงานพิมพ์ เช็กสต็อกวัสดุ วางราคาขาย หรือเตรียมคำตอบให้ลูกค้าได้ ลองพิมพ์รายละเอียดงานพิมพ์มาได้เลย",
  },
];

const suggestions = [
  "ช่วยคิดราคางานพิมพ์ PLA 120g ใช้เวลา 8 ชั่วโมง",
  "ควรตั้งสต็อกแจ้งเตือน filament ยังไง",
  "ช่วยร่างข้อความตอบลูกค้าเรื่องเวลาพิมพ์งาน",
];

function createAssistantReply(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("ราคา") || normalized.includes("ต้นทุน") || normalized.includes("cost")) {
    return "เริ่มจากแยกต้นทุนเป็น 5 ส่วนครับ: วัสดุ, ค่าไฟ, ค่าเสื่อมเครื่อง, ค่าแรงเตรียมงาน/เก็บงาน และ buffer งานเสีย จากนั้นบวก margin ที่ต้องการ ถ้าส่งน้ำหนักวัสดุ เวลาเครื่องพิมพ์ ค่าไฟ และราคาม้วน/เรซินมา ผมช่วยจัดสูตรให้เป็นตัวเลขได้";
  }

  if (normalized.includes("สต็อก") || normalized.includes("stock") || normalized.includes("filament") || normalized.includes("resin")) {
    return "สำหรับสต็อก แนะนำตั้งจุดเตือนจากปริมาณใช้เฉลี่ยต่อสัปดาห์ x เวลารอของเข้า แล้วเผื่ออีก 15-25% สำหรับงานด่วน สีขายดีควรมี safety stock แยกจากสีทั่วไป";
  }

  if (normalized.includes("ลูกค้า") || normalized.includes("ข้อความ") || normalized.includes("ตอบ")) {
    return "ได้ครับ โครงตอบลูกค้าที่ดีคือยืนยันรายละเอียดงาน, แจ้งระยะเวลาประเมิน, บอกเงื่อนไขไฟล์/ผิวงาน, แล้วปิดด้วยขั้นตอนถัดไป เช่น ส่งไฟล์ STL/ขนาด/สีที่ต้องการ ผมช่วยปรับให้นุ่มหรือเป็นทางการขึ้นได้";
  }

  return "รับทราบครับ ส่งรายละเอียดเพิ่มอีกนิดได้ไหม เช่น วัสดุที่ใช้ น้ำหนักงาน เวลาพิมพ์ เครื่องพิมพ์ หรือเป้าหมายที่อยากได้ ผมจะช่วยแตกเป็นขั้นตอนให้ใช้งานต่อในร้านได้ง่ายขึ้น";
}

export function ChatWorkspace() {
  const [messages, setMessages] = useState(starterMessages);
  const [input, setInput] = useState("");
  const nextId = useRef(2);

  const canSubmit = input.trim().length > 0;
  const latestAssistantMessage = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].role === "assistant") return messages[index];
    }
    return undefined;
  }, [messages]);

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: nextId.current++,
      role: "user",
      text: trimmed,
    };
    const assistantMessage: ChatMessage = {
      id: nextId.current++,
      role: "assistant",
      text: createAssistantReply(trimmed),
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setInput("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(input);
  }

  return (
    <section className="card overflow-hidden">
      <div className="border-b border-slate-200 bg-white/70 p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">แชทช่วยงานร้านพิมพ์</h1>
            <p className="mt-2 max-w-2xl text-slate-500">
              คุยเพื่อช่วยคิดต้นทุน วางสต็อก เตรียมคำตอบลูกค้า และสรุปงานประจำวันของร้าน
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2 font-bold text-blue-700">
            <Sparkles size={18} />
            พร้อมช่วยงาน
          </div>
        </div>
      </div>

      <div className="grid min-h-[620px] lg:grid-cols-[1fr_18rem]">
        <div className="flex min-h-[620px] flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.map((message) => {
              const isUser = message.role === "user";
              const Icon = isUser ? UserRound : Bot;

              return (
                <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`} key={message.id}>
                  {!isUser && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
                      <Icon size={20} />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-3 leading-7 ${
                      isUser
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 bg-white text-slate-700 shadow-sm"
                    }`}
                  >
                    {message.text}
                  </div>
                  {isUser && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                      <Icon size={20} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <form className="border-t border-slate-200 bg-white/80 p-5" onSubmit={handleSubmit}>
            <div className="flex gap-3">
              <input
                aria-label="พิมพ์ข้อความแชท"
                className="input"
                onChange={(event) => setInput(event.target.value)}
                placeholder="พิมพ์รายละเอียดงาน หรือต้นทุนที่อยากให้ช่วยคิด..."
                value={input}
              />
              <button className="btn btn-primary shrink-0" disabled={!canSubmit} type="submit">
                <Send size={18} />
                ส่ง
              </button>
            </div>
          </form>
        </div>

        <aside className="border-t border-slate-200 bg-slate-50/80 p-5 lg:border-l lg:border-t-0">
          <h2 className="text-lg font-black">เริ่มคุยเร็ว</h2>
          <div className="mt-4 space-y-3">
            {suggestions.map((suggestion) => (
              <button
                className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left font-bold leading-6 text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                key={suggestion}
                onClick={() => sendMessage(suggestion)}
                type="button"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {latestAssistantMessage && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-black text-slate-500">คำตอบล่าสุด</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{latestAssistantMessage.text}</p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}