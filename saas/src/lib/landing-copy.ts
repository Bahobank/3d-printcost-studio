export type LandingLanguage = "th" | "en" | "zh" | "ja" | "ko";

export function getLandingLanguage(value: string | undefined): LandingLanguage {
  return value === "en" || value === "zh" || value === "ja" || value === "ko" ? value : "th";
}

type Item = { title: string; description: string };

export type LandingCopy = {
  nav: { features: string; how: string; pricing: string; faq: string; signIn: string; enterApp: string; start: string };
  hero: {
    badge: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    note: string;
  };
  demo: {
    caption: string;
    jobName: string;
    jobMeta: string;
    /** Four cost lines, in the order the page renders them. Amounts live in page.tsx. */
    rowLabels: string[];
    costLabel: string;
    priceLabel: string;
    profitLabel: string;
  };
  problem: { title: string; subtitle: string; solutionLabel: string; items: Item[] };
  features: { title: string; subtitle: string; items: Item[] };
  steps: { title: string; subtitle: string; items: Item[] };
  pricing: {
    title: string;
    subtitle: string;
    perMonth: string;
    yearlyNote: (yearly: string, monthlyEquivalent: string) => string;
    popular: string;
    cta: string;
    footnote: string;
    plans: Record<"maker" | "studio", { name: string; badge: string; description: string; features: string[] }>;
  };
  faq: { title: string; subtitle: string; items: Array<{ question: string; answer: string }> };
  finalCta: { title: string; subtitle: string; primary: string; secondary: string };
  footer: { tagline: string; privacy: string; terms: string; rights: string };
};

export const landingCopy: Record<LandingLanguage, LandingCopy> = {
  th: {
    nav: {
      features: "ฟีเจอร์",
      how: "วิธีใช้งาน",
      pricing: "ราคา",
      faq: "คำถามที่พบบ่อย",
      signIn: "เข้าสู่ระบบ",
      enterApp: "เข้าสู่โปรแกรม",
      start: "เริ่มใช้ฟรี",
    },
    hero: {
      badge: "ทดลองใช้ฟรี 7 วัน ไม่ต้องใช้บัตรเครดิต",
      title: "รู้ต้นทุนงานพิมพ์ 3D จริง ๆ",
      titleAccent: "ก่อนจะเสนอราคาลูกค้า",
      subtitle:
        "3D PrintCost Studio รวมการคำนวณต้นทุนวัสดุ ค่าไฟ ค่าเสื่อมเครื่อง ค่าแรง สต๊อกฟิลาเมนต์และเรซิ่น ประวัติงาน และกำไรของแต่ละงาน ไว้ในระบบเดียว สำหรับร้านพิมพ์ 3D และผู้ขายงานพิมพ์",
      primaryCta: "เริ่มทดลองใช้ฟรี",
      secondaryCta: "เข้าสู่ระบบ",
      note: "ใช้งานผ่านเบราว์เซอร์ ไม่ต้องติดตั้ง · รองรับ FDM และ Resin · ข้อมูลซิงก์ทุกอุปกรณ์",
    },
    demo: {
      caption: "ตัวอย่างการคำนวณ",
      jobName: "ที่วางโทรศัพท์ · PLA",
      jobMeta: "FDM · 68 g · 6.5 ชม.",
      rowLabels: ["ค่าฟิลาเมนต์", "ค่าไฟฟ้า", "ค่าเสื่อมเครื่องพิมพ์", "ค่าแรง / งานเก็บผิว"],
      costLabel: "ต้นทุนรวม",
      priceLabel: "ราคาขาย",
      profitLabel: "กำไร",
    },
    problem: {
      title: "ตั้งราคาด้วยความรู้สึก = กำไรหายโดยไม่รู้ตัว",
      subtitle: "ปัญหาที่ร้านพิมพ์ 3D เจอเหมือนกันเกือบทุกร้าน และสิ่งที่ระบบทำแทนให้",
      solutionLabel: "ทางออก",
      items: [
        {
          title: "คิดแค่ค่าเส้น ลืมต้นทุนที่เหลือ",
          description:
            "ค่าไฟ ค่าเสื่อมเครื่อง เวลาที่เสียไปกับงานเก็บผิว และงานที่พิมพ์เสีย ล้วนเป็นต้นทุนจริงที่มักถูกลืม",
        },
        {
          title: "สต๊อกวัสดุไม่ตรงกับความจริง",
          description:
            "ไม่รู้ว่าเหลือฟิลาเมนต์สีไหนกี่กรัม จนต้องหยุดงานกลางคัน หรือสั่งของซ้ำโดยไม่จำเป็น",
        },
        {
          title: "ใช้ตัวเลขชุดเดียวคิดทุกเครื่อง",
          description:
            "เครื่องเล็กกับเครื่องใหญ่กินไฟไม่เท่ากัน ราคาเครื่องกับอายุการใช้งานก็ต่างกัน แต่ส่วนใหญ่คิดต้นทุนด้วยตัวเลขชุดเดียวทั้งร้าน",
        },
        {
          title: "ลูกค้าเก่ากลับมาสั่ง แต่จำราคาเดิมไม่ได้",
          description:
            "เคยคิดราคางานนี้ไปเท่าไร ใช้วัสดุอะไร ตอบไม่ได้ ต้องนั่งคำนวณใหม่ทุกครั้ง หรือไล่หาราคาที่เคยเสนอในแชทเก่า",
        },
        {
          title: "ไม่รู้ว่างานไหนกำไร งานไหนขาดทุน",
          description:
            "รับงานเยอะแต่เงินไม่เหลือ เพราะไม่มีตัวเลขย้อนหลังให้เปรียบเทียบว่างานแบบไหนคุ้มค่าที่สุด",
        },
        {
          title: "ตัวเลขกระจัดกระจายอยู่คนละที่",
          description:
            "ต้นทุนอยู่ในสเปรดชีต สต๊อกอยู่ในสมุด ยอดขายอยู่ในแชท พอจะสรุปว่าเดือนนี้เป็นยังไง ต้องไล่เปิดทีละที่",
        },
      ],
    },
    features: {
      title: "ทุกอย่างที่ร้านพิมพ์ 3D ต้องใช้ ในที่เดียว",
      subtitle: "ออกแบบจากงานจริงของร้านพิมพ์ ไม่ใช่สเปรดชีตที่ต้องมานั่งแก้สูตรเอง",
      items: [
        {
          title: "คำนวณต้นทุน FDM และ Resin",
          description:
            "ใส่น้ำหนักวัสดุและเวลาพิมพ์ ระบบคิดค่าวัสดุ ค่าไฟ ค่าเสื่อมเครื่อง ค่าแรง และเผื่องานเสียให้อัตโนมัติ",
        },
        {
          title: "จัดการสต๊อกวัสดุ",
          description:
            "บันทึกฟิลาเมนต์และเรซิ่นแต่ละม้วน/ขวด พร้อมราคาทุน สี แบรนด์ และรูปภาพ ตัดสต๊อกอัตโนมัติเมื่อบันทึกงาน",
        },
        {
          title: "โปรไฟล์เครื่องพิมพ์",
          description:
            "ตั้งค่ากำลังไฟ ราคาเครื่อง อายุการใช้งาน และค่าบำรุงรักษาแยกของแต่ละเครื่อง เพื่อให้ต้นทุนตรงกับเครื่องที่ใช้จริง",
        },
        {
          title: "ประวัติงานพิมพ์",
          description: "เก็บทุกงานที่เคยคำนวณไว้ ย้อนดูราคาที่เคยเสนอ ใช้ซ้ำกับลูกค้าเดิม และแก้ไขได้ทุกเมื่อ",
        },
        {
          title: "วิเคราะห์กำไร",
          description: "ดูกำไรต่อชิ้นและกำไรรวม เห็นชัดว่างานไหนควรขึ้นราคา งานไหนควรเลิกรับ",
        },
        {
          title: "แดชบอร์ดสรุป",
          description: "ภาพรวมยอดงาน ต้นทุน กำไร และวัสดุที่ใช้ไป อ่านจบในหน้าเดียว",
        },
      ],
    },
    steps: {
      title: "เริ่มใช้ได้ใน 3 ขั้นตอน",
      subtitle: "ตั้งค่าครั้งเดียว ใช้ได้ยาว ๆ",
      items: [
        {
          title: "ตั้งค่าเครื่องพิมพ์และวัสดุ",
          description: "ใส่ข้อมูลเครื่องพิมพ์ ค่าไฟต่อหน่วย และวัสดุที่มีอยู่ในสต๊อก",
        },
        {
          title: "คำนวณงานที่จะรับ",
          description: "กรอกน้ำหนักและเวลาพิมพ์จากสไลเซอร์ แล้วดูต้นทุนกับราคาที่ควรเสนอทันที",
        },
        {
          title: "บันทึกและติดตามกำไร",
          description: "บันทึกงานเข้าระบบ สต๊อกตัดให้อัตโนมัติ และดูกำไรสะสมได้จากแดชบอร์ด",
        },
      ],
    },
    pricing: {
      title: "ราคาที่คืนทุนตั้งแต่งานแรก ๆ",
      subtitle: "เลือกแพ็กเกจตามชนิดเครื่องพิมพ์ที่คุณใช้ ยกเลิกได้ทุกเมื่อ",
      perMonth: "/ เดือน",
      yearlyNote: (yearly, monthlyEquivalent) => `หรือ ${yearly} / ปี (เฉลี่ย ${monthlyEquivalent} ต่อเดือน)`,
      popular: "คุ้มที่สุด",
      cta: "เริ่มทดลองใช้ฟรี 7 วัน",
      footnote:
        "ชำระผ่านบัตรเครดิต/เดบิต หรือ PromptPay · ยกเลิกได้ทุกเมื่อ ใช้งานต่อได้จนจบรอบที่ชำระไว้",
      plans: {
        maker: {
          name: "Maker",
          badge: "FDM เท่านั้น",
          description: "สำหรับคนที่ใช้เครื่องพิมพ์ FDM",
          features: [
            "คำนวณต้นทุนงานพิมพ์ FDM",
            "จัดการสต๊อกฟิลาเมนต์",
            "ติดตามกำไรรายงาน",
            "แดชบอร์ดสรุป",
            "ประวัติงานพิมพ์",
          ],
        },
        studio: {
          name: "Studio",
          badge: "FDM + Resin",
          description: "สำหรับร้านที่ใช้ทั้ง FDM และ Resin",
          features: [
            "ทุกอย่างในแพ็กเกจ Maker",
            "คำนวณต้นทุนงานพิมพ์ Resin",
            "จัดการสต๊อกเรซิ่น",
            "แดชบอร์ดฝั่ง Resin",
            "ประวัติงานพิมพ์ Resin",
          ],
        },
      },
    },
    faq: {
      title: "คำถามที่พบบ่อย",
      subtitle: "ถ้ายังไม่เจอคำตอบ ทักมาถามได้เลย",
      items: [
        {
          question: "ต้องผูกบัตรเครดิตก่อนทดลองใช้ไหม?",
          answer:
            "ไม่ต้องครับ สมัครด้วยอีเมลหรือบัญชี Google แล้วใช้ได้ครบทุกฟีเจอร์ 7 วัน ค่อยตัดสินใจสมัครแพ็กเกจทีหลัง",
        },
        {
          question: "รองรับเครื่องพิมพ์แบบไหนบ้าง?",
          answer:
            "รองรับ FDM ทุกรุ่น และเครื่อง Resin (LCD / DLP / SLA) ในแพ็กเกจ Studio ตั้งค่ากำลังไฟ ราคาเครื่อง และค่าเสื่อมของแต่ละเครื่องแยกกันได้",
        },
        {
          question: "จ่ายเงินได้ทางไหนบ้าง?",
          answer: "รับชำระผ่านบัตรเครดิต/เดบิต และ PromptPay ผ่านระบบของ Stripe",
        },
        {
          question: "ข้อมูลของผมปลอดภัยไหม?",
          answer:
            "ข้อมูลถูกเก็บบนคลาวด์แบบเข้ารหัส แยกตามบัญชีผู้ใช้ เข้าถึงได้เฉพาะคุณ และเปิดใช้งานได้จากทุกอุปกรณ์",
        },
        {
          question: "ยกเลิกได้ตลอดเวลาไหม?",
          answer: "ยกเลิกได้ทุกเมื่อจากหน้าบัญชีของคุณ และยังใช้งานต่อได้จนถึงสิ้นรอบการชำระเงินปัจจุบัน",
        },
      ],
    },
    finalCta: {
      title: "เลิกเดาราคา แล้วเริ่มคิดจากตัวเลขจริง",
      subtitle: "ทดลองใช้ฟรี 7 วัน ครบทุกฟีเจอร์ ไม่ต้องใช้บัตรเครดิต",
      primary: "เริ่มทดลองใช้ฟรี",
      secondary: "มีบัญชีแล้ว เข้าสู่ระบบ",
    },
    footer: {
      tagline: "ระบบคำนวณต้นทุนและบริหารงานพิมพ์ 3D สำหรับร้านค้าและผู้ขายงานพิมพ์",
      privacy: "นโยบายความเป็นส่วนตัว",
      terms: "ข้อกำหนดการใช้งาน",
      rights: "สงวนลิขสิทธิ์",
    },
  },

  en: {
    nav: {
      features: "Features",
      how: "How it works",
      pricing: "Pricing",
      faq: "FAQ",
      signIn: "Sign in",
      enterApp: "Open the app",
      start: "Start free",
    },
    hero: {
      badge: "7-day free trial · no credit card required",
      title: "Know what a 3D print really costs",
      titleAccent: "before you quote the customer",
      subtitle:
        "3D PrintCost Studio brings material cost, electricity, machine depreciation, labour, filament and resin stock, job history, and per-job profit into one system — built for 3D printing shops and print sellers.",
      primaryCta: "Start free trial",
      secondaryCta: "Sign in",
      note: "Runs in the browser, nothing to install · FDM and Resin · Synced across every device",
    },
    demo: {
      caption: "Sample calculation",
      jobName: "Phone stand · PLA",
      jobMeta: "FDM · 68 g · 6.5 h",
      rowLabels: ["Filament", "Electricity", "Printer depreciation", "Labour / post-processing"],
      costLabel: "Total cost",
      priceLabel: "Sale price",
      profitLabel: "Profit",
    },
    problem: {
      title: "Pricing on instinct quietly eats your margin",
      subtitle: "The gaps below show up in almost every print shop — and what the app does about each one",
      solutionLabel: "The fix",
      items: [
        {
          title: "Counting filament and nothing else",
          description:
            "Electricity, machine wear, the hours spent on post-processing, and failed prints are all real costs that usually get left out.",
        },
        {
          title: "Stock numbers that do not match reality",
          description:
            "Not knowing how many grams of which colour are left, so a print stops halfway or the same spool gets ordered twice.",
        },
        {
          title: "One set of numbers for every machine",
          description:
            "A small printer and a big one do not draw the same power, cost the same, or wear out at the same rate — yet most shops cost every job with a single set of numbers.",
        },
        {
          title: "A repeat customer returns and the old price is gone",
          description:
            "What did you quote last time, and on which material? Without a record you either recalculate from scratch or dig back through old chat messages.",
        },
        {
          title: "No idea which jobs actually make money",
          description:
            "Plenty of orders, nothing left at the end of the month — because there is no history to compare which kind of job is worth taking.",
        },
        {
          title: "The numbers live in three different places",
          description:
            "Costs in a spreadsheet, stock in a notebook, sales in a chat thread. Answering \"how did this month go?\" means opening all of them.",
        },
      ],
    },
    features: {
      title: "Everything a print shop needs, in one place",
      subtitle:
        "Built around how print shops actually work — not a spreadsheet whose formulas you have to maintain",
      items: [
        {
          title: "FDM and Resin cost calculation",
          description:
            "Enter material weight and print time; the system works out material, electricity, depreciation, labour, and a failure allowance automatically.",
        },
        {
          title: "Material stock management",
          description:
            "Record every spool and bottle with its cost, colour, brand, and photo. Stock is deducted automatically when a job is saved.",
        },
        {
          title: "Printer profiles",
          description:
            "Set power draw, machine price, expected lifetime, and maintenance cost per printer, so the cost matches the machine you actually used.",
        },
        {
          title: "Print job history",
          description:
            "Keep every calculation, look back at what you quoted, reuse it for repeat customers, and edit it any time.",
        },
        {
          title: "Profit analysis",
          description:
            "See profit per piece and in total, so it is obvious which jobs need a price rise and which ones to stop taking.",
        },
        {
          title: "Summary dashboard",
          description: "Jobs, cost, profit, and material used — the whole picture on one screen.",
        },
      ],
    },
    steps: {
      title: "Up and running in three steps",
      subtitle: "Set it up once, use it for good",
      items: [
        {
          title: "Set up printers and materials",
          description: "Enter your printers, your electricity rate, and the materials you have in stock.",
        },
        {
          title: "Cost the job you are quoting",
          description:
            "Type in the weight and print time from your slicer, and see the cost and the price you should quote immediately.",
        },
        {
          title: "Save it and track the profit",
          description:
            "Save the job, stock is deducted automatically, and your running profit shows up on the dashboard.",
        },
      ],
    },
    pricing: {
      title: "It pays for itself within the first few jobs",
      subtitle: "Pick the plan that matches the printers you run. Cancel any time.",
      perMonth: "/ month",
      yearlyNote: (yearly, monthlyEquivalent) => `or ${yearly} / year (${monthlyEquivalent} per month)`,
      popular: "Best value",
      cta: "Start 7-day free trial",
      footnote:
        "Pay by credit/debit card or PromptPay · Cancel any time and keep access until the end of the period you paid for",
      plans: {
        maker: {
          name: "Maker",
          badge: "FDM only",
          description: "For people working with FDM printers",
          features: [
            "Calculate FDM print costs",
            "Manage filament stock",
            "Track profit for each job",
            "Summary dashboard",
            "Print job history",
          ],
        },
        studio: {
          name: "Studio",
          badge: "FDM + Resin",
          description: "For shops running both FDM and Resin",
          features: [
            "Everything in Maker",
            "Calculate Resin print costs",
            "Manage resin stock",
            "Resin dashboard",
            "Resin print job history",
          ],
        },
      },
    },
    faq: {
      title: "Frequently asked questions",
      subtitle: "Cannot find your answer? Get in touch.",
      items: [
        {
          question: "Do I need a credit card to start the trial?",
          answer:
            "No. Sign up with email or Google and you get every feature for 7 days. Decide on a plan afterwards.",
        },
        {
          question: "Which printers are supported?",
          answer:
            "Any FDM printer, plus Resin machines (LCD / DLP / SLA) on the Studio plan. Power draw, machine price, and depreciation are configured per printer.",
        },
        {
          question: "How can I pay?",
          answer: "Credit/debit card and PromptPay, both handled by Stripe.",
        },
        {
          question: "Is my data safe?",
          answer:
            "Your data is stored encrypted in the cloud, separated per account, visible only to you, and available from any device.",
        },
        {
          question: "Can I cancel any time?",
          answer:
            "Yes. Cancel from your account page and keep using the app until the end of your current billing period.",
        },
      ],
    },
    finalCta: {
      title: "Stop guessing prices. Start from real numbers.",
      subtitle: "7 days free, every feature included, no credit card required.",
      primary: "Start free trial",
      secondary: "I already have an account",
    },
    footer: {
      tagline: "Cost calculation and job management for 3D printing shops and print sellers",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      rights: "All rights reserved",
    },
  },

  zh: {
    nav: {
      features: "功能",
      how: "使用方式",
      pricing: "价格",
      faq: "常见问题",
      signIn: "登录",
      enterApp: "进入应用",
      start: "免费开始",
    },
    hero: {
      badge: "免费试用 7 天 · 无需信用卡",
      title: "在报价之前",
      titleAccent: "先算清 3D 打印的真实成本",
      subtitle:
        "3D PrintCost Studio 把材料成本、电费、设备折旧、人工、耗材与树脂库存、作业历史，以及每一单的利润集中在一个系统里，专为 3D 打印店和打印服务商设计。",
      primaryCta: "免费开始试用",
      secondaryCta: "登录",
      note: "浏览器直接使用，无需安装 · 支持 FDM 与 Resin · 多设备同步",
    },
    demo: {
      caption: "计算示例",
      jobName: "手机支架 · PLA",
      jobMeta: "FDM · 68 g · 6.5 小时",
      rowLabels: ["耗材费用", "电费", "设备折旧", "人工 / 后处理"],
      costLabel: "总成本",
      priceLabel: "售价",
      profitLabel: "利润",
    },
    problem: {
      title: "凭感觉定价，利润在不知不觉中流失",
      subtitle: "几乎每家打印店都会遇到的问题，以及系统的应对方式",
      solutionLabel: "解决方式",
      items: [
        {
          title: "只算耗材，其他成本全忘了",
          description: "电费、设备损耗、后处理花掉的时间、打印失败的废件，都是常被忽略的真实成本。",
        },
        {
          title: "库存数字和实际对不上",
          description: "不知道哪个颜色还剩多少克，结果打印中途停机，或者重复下单买了同样的耗材。",
        },
        {
          title: "所有机器都用同一套数字",
          description: "小机器和大机器的功耗不同，购机价格和使用寿命也不同，但大多数店铺却用同一套数字计算所有作业的成本。",
        },
        {
          title: "老客户回头下单，却想不起上次报价",
          description: "上次报了多少？用的什么材料？没有记录就只能重新算一遍，或者翻旧聊天记录找价格。",
        },
        {
          title: "不知道哪些单赚钱、哪些单亏钱",
          description: "接单不少却没剩下钱，因为没有历史数据可以比较哪一类作业最划算。",
        },
        {
          title: "数字散落在好几个地方",
          description: "成本在表格里，库存在本子上，销售额在聊天记录中。想知道这个月做得怎么样，得一个一个翻。",
        },
      ],
    },
    features: {
      title: "打印店需要的一切，都在这里",
      subtitle: "按照打印店的真实流程设计，不用再维护表格里的公式",
      items: [
        {
          title: "FDM 与 Resin 成本计算",
          description: "输入材料重量和打印时间，系统自动算出材料费、电费、折旧、人工，并计入失败损耗。",
        },
        {
          title: "材料库存管理",
          description: "登记每一卷耗材和每一瓶树脂，包含成本、颜色、品牌和照片；保存作业时自动扣减库存。",
        },
        {
          title: "打印机配置",
          description: "为每台机器单独设置功率、购机价格、使用寿命和维护成本，让成本与实际使用的机器一致。",
        },
        {
          title: "作业历史",
          description: "保存每一次计算，随时回看报过的价格，老客户复购可直接复用，也可随时修改。",
        },
        {
          title: "利润分析",
          description: "查看单件利润与总利润，一眼看出哪些作业该涨价、哪些不该再接。",
        },
        {
          title: "汇总看板",
          description: "作业量、成本、利润和材料消耗，一屏看完。",
        },
      ],
    },
    steps: {
      title: "三步即可开始",
      subtitle: "设置一次，长期使用",
      items: [
        { title: "设置打印机与材料", description: "录入打印机信息、电费单价，以及现有的库存材料。" },
        { title: "为要接的单计算成本", description: "填入切片软件给出的重量和时间，立即看到成本与建议报价。" },
        { title: "保存并跟踪利润", description: "保存作业后自动扣减库存，累计利润直接显示在看板上。" },
      ],
    },
    pricing: {
      title: "接几单就回本的价格",
      subtitle: "按你使用的打印机类型选择方案，随时可取消。",
      perMonth: "/ 月",
      yearlyNote: (yearly, monthlyEquivalent) => `或 ${yearly} / 年（平均每月 ${monthlyEquivalent}）`,
      popular: "最超值",
      cta: "免费试用 7 天",
      footnote: "支持信用卡/借记卡与 PromptPay 付款 · 随时可取消，已付费周期内仍可继续使用",
      plans: {
        maker: {
          name: "Maker",
          badge: "仅 FDM",
          description: "适合使用 FDM 打印机的用户",
          features: ["计算 FDM 打印成本", "管理耗材库存", "跟踪每单利润", "汇总看板", "打印作业历史"],
        },
        studio: {
          name: "Studio",
          badge: "FDM + Resin",
          description: "适合同时使用 FDM 与 Resin 的商家",
          features: ["包含 Maker 的全部功能", "计算 Resin 打印成本", "管理树脂库存", "Resin 看板", "Resin 作业历史"],
        },
      },
    },
    faq: {
      title: "常见问题",
      subtitle: "没找到答案？欢迎联系我们。",
      items: [
        {
          question: "试用需要先绑定信用卡吗？",
          answer: "不需要。用邮箱或 Google 账号注册即可，7 天内所有功能都能使用，之后再决定是否订阅。",
        },
        {
          question: "支持哪些打印机？",
          answer:
            "支持所有 FDM 打印机；Studio 方案还支持 Resin 机型（LCD / DLP / SLA）。功率、购机价格和折旧可按每台机器单独设置。",
        },
        { question: "有哪些付款方式？", answer: "支持信用卡/借记卡和 PromptPay，均通过 Stripe 处理。" },
        {
          question: "我的数据安全吗？",
          answer: "数据加密存储在云端，按账号隔离，只有你本人可以访问，并支持在任意设备上使用。",
        },
        { question: "可以随时取消吗？", answer: "可以。在账号页面即可取消，并且在当前计费周期结束前仍可继续使用。" },
      ],
    },
    finalCta: {
      title: "别再凭感觉报价，从真实数字开始",
      subtitle: "免费试用 7 天，功能全开，无需信用卡。",
      primary: "免费开始试用",
      secondary: "我已有账号",
    },
    footer: {
      tagline: "面向 3D 打印店与打印服务商的成本计算与作业管理系统",
      privacy: "隐私政策",
      terms: "服务条款",
      rights: "版权所有",
    },
  },

  ja: {
    nav: {
      features: "機能",
      how: "使い方",
      pricing: "料金",
      faq: "よくある質問",
      signIn: "ログイン",
      enterApp: "アプリを開く",
      start: "無料で始める",
    },
    hero: {
      badge: "7日間の無料トライアル · クレジットカード不要",
      title: "見積もりを出す前に",
      titleAccent: "3Dプリントの本当の原価を知る",
      subtitle:
        "3D PrintCost Studio は、材料費・電気代・機材の減価償却・人件費・フィラメントとレジンの在庫・作業履歴・案件ごとの利益をひとつのシステムにまとめます。3Dプリントショップと受託出力者のために作られています。",
      primaryCta: "無料トライアルを始める",
      secondaryCta: "ログイン",
      note: "ブラウザだけで利用でき、インストール不要 · FDM と Resin に対応 · すべての端末で同期",
    },
    demo: {
      caption: "計算例",
      jobName: "スマホスタンド · PLA",
      jobMeta: "FDM · 68 g · 6.5 時間",
      rowLabels: ["フィラメント費", "電気代", "プリンターの減価償却", "人件費 / 後処理"],
      costLabel: "原価合計",
      priceLabel: "販売価格",
      profitLabel: "利益",
    },
    problem: {
      title: "感覚で値付けすると、利益は静かに消えていく",
      subtitle: "ほとんどのプリントショップが抱える問題と、それぞれへの答え",
      solutionLabel: "解決策",
      items: [
        {
          title: "フィラメント代しか数えていない",
          description:
            "電気代、機材の消耗、後処理にかかる時間、失敗した造形。いずれも見落とされがちな実際の原価です。",
        },
        {
          title: "在庫の数字が実際と合わない",
          description:
            "どの色が何グラム残っているか分からず、造形が途中で止まったり、同じ材料を重複して発注してしまいます。",
        },
        {
          title: "どの機体も同じ数字で計算している",
          description:
            "小型機と大型機では消費電力も本体価格も寿命も違うのに、多くのショップは店全体を一つの数字で原価計算しています。",
        },
        {
          title: "リピーターが戻ってきても前回の価格が分からない",
          description:
            "いくらで見積もったのか、どの材料だったのか。記録がなければ毎回計算し直すか、古いチャットを遡って探すことになります。",
        },
        {
          title: "どの案件が儲かっているのか分からない",
          description:
            "受注は多いのに手元に残らない。どんな案件が割に合うのかを比べる履歴がないからです。",
        },
        {
          title: "数字がバラバラの場所にある",
          description:
            "原価はスプレッドシート、在庫はノート、売上はチャット。「今月はどうだった？」を知るには全部を開いて回ることになります。",
        },
      ],
    },
    features: {
      title: "プリントショップに必要なものが、ひとつに",
      subtitle: "数式を自分で直し続けるスプレッドシートではなく、実際の運用に合わせて設計しました",
      items: [
        {
          title: "FDM と Resin の原価計算",
          description:
            "材料の重量と造形時間を入力すれば、材料費・電気代・減価償却・人件費・失敗分の見込みまで自動で計算します。",
        },
        {
          title: "材料在庫の管理",
          description:
            "フィラメント1巻・レジン1本ごとに原価、色、ブランド、写真を登録。作業を保存すると在庫が自動で引き落とされます。",
        },
        {
          title: "プリンタープロファイル",
          description:
            "消費電力、本体価格、想定寿命、メンテナンス費用を機体ごとに設定でき、実際に使った機材どおりの原価になります。",
        },
        {
          title: "作業履歴",
          description:
            "計算したすべての案件を保存。過去の見積もりを見返し、リピーターに再利用でき、いつでも編集できます。",
        },
        {
          title: "利益分析",
          description:
            "1個あたりと合計の利益を確認でき、値上げすべき案件と受けるべきでない案件がはっきりします。",
        },
        {
          title: "サマリーダッシュボード",
          description: "案件数、原価、利益、使用した材料を1画面で把握できます。",
        },
      ],
    },
    steps: {
      title: "3ステップで使い始められます",
      subtitle: "最初に設定すれば、あとはずっと使えます",
      items: [
        {
          title: "プリンターと材料を設定",
          description: "プリンターの情報、電気料金の単価、在庫にある材料を登録します。",
        },
        {
          title: "受ける案件の原価を計算",
          description: "スライサーの重量と造形時間を入力すると、原価と提示すべき価格がすぐ分かります。",
        },
        {
          title: "保存して利益を追う",
          description: "作業を保存すると在庫が自動で減り、累計利益はダッシュボードで確認できます。",
        },
      ],
    },
    pricing: {
      title: "最初の数件で元が取れる価格",
      subtitle: "お使いのプリンターに合わせてプランを選べます。いつでも解約可能です。",
      perMonth: "/ 月",
      yearlyNote: (yearly, monthlyEquivalent) => `または ${yearly} / 年（月あたり ${monthlyEquivalent}）`,
      popular: "いちばんお得",
      cta: "7日間の無料トライアル",
      footnote:
        "クレジット/デビットカードまたは PromptPay でお支払い · いつでも解約でき、支払い済み期間の終わりまで利用できます",
      plans: {
        maker: {
          name: "Maker",
          badge: "FDM のみ",
          description: "FDM プリンターを使う方向け",
          features: [
            "FDM 造形の原価計算",
            "フィラメント在庫の管理",
            "案件ごとの利益追跡",
            "サマリーダッシュボード",
            "作業履歴",
          ],
        },
        studio: {
          name: "Studio",
          badge: "FDM + Resin",
          description: "FDM と Resin の両方を扱う事業者向け",
          features: [
            "Maker のすべての機能",
            "Resin 造形の原価計算",
            "レジン在庫の管理",
            "Resin ダッシュボード",
            "Resin の作業履歴",
          ],
        },
      },
    },
    faq: {
      title: "よくある質問",
      subtitle: "答えが見つからない場合はお問い合わせください。",
      items: [
        {
          question: "トライアルにクレジットカードは必要ですか？",
          answer:
            "不要です。メールまたは Google アカウントで登録すれば、7日間すべての機能を使えます。プランはその後で決められます。",
        },
        {
          question: "対応しているプリンターは？",
          answer:
            "FDM は全機種、Resin 機（LCD / DLP / SLA）は Studio プランで対応します。消費電力・本体価格・減価償却は機体ごとに設定できます。",
        },
        {
          question: "支払い方法は？",
          answer: "クレジット/デビットカードと PromptPay に対応しています。どちらも Stripe 経由です。",
        },
        {
          question: "データは安全ですか？",
          answer:
            "データは暗号化してクラウドに保存され、アカウントごとに分離されます。閲覧できるのはご本人だけで、どの端末からでも利用できます。",
        },
        {
          question: "いつでも解約できますか？",
          answer: "はい。アカウントページから解約でき、現在の請求期間の終わりまで引き続き利用できます。",
        },
      ],
    },
    finalCta: {
      title: "勘の値付けをやめて、実際の数字から始める",
      subtitle: "7日間無料、全機能つき、クレジットカード不要。",
      primary: "無料トライアルを始める",
      secondary: "すでにアカウントをお持ちの方",
    },
    footer: {
      tagline: "3Dプリントショップと受託出力者のための原価計算・案件管理システム",
      privacy: "プライバシーポリシー",
      terms: "利用規約",
      rights: "All rights reserved",
    },
  },

  ko: {
    nav: {
      features: "기능",
      how: "사용 방법",
      pricing: "요금",
      faq: "자주 묻는 질문",
      signIn: "로그인",
      enterApp: "앱으로 이동",
      start: "무료로 시작",
    },
    hero: {
      badge: "7일 무료 체험 · 신용카드 불필요",
      title: "견적을 내기 전에",
      titleAccent: "3D 프린트의 진짜 원가를 확인하세요",
      subtitle:
        "3D PrintCost Studio는 재료비, 전기료, 장비 감가상각, 인건비, 필라멘트와 레진 재고, 작업 이력, 건별 수익을 하나의 시스템에 모았습니다. 3D 프린팅 업체와 출력 판매자를 위해 만들었습니다.",
      primaryCta: "무료 체험 시작",
      secondaryCta: "로그인",
      note: "설치 없이 브라우저에서 사용 · FDM과 Resin 지원 · 모든 기기에서 동기화",
    },
    demo: {
      caption: "계산 예시",
      jobName: "휴대폰 거치대 · PLA",
      jobMeta: "FDM · 68 g · 6.5시간",
      rowLabels: ["필라멘트 비용", "전기료", "프린터 감가상각", "인건비 / 후가공"],
      costLabel: "총 원가",
      priceLabel: "판매가",
      profitLabel: "수익",
    },
    problem: {
      title: "감으로 가격을 정하면 수익은 조용히 사라집니다",
      subtitle: "거의 모든 출력 업체가 겪는 문제와, 각각에 대한 해답",
      solutionLabel: "해결 방법",
      items: [
        {
          title: "필라멘트 값만 계산하는 경우",
          description: "전기료, 장비 마모, 후가공에 들인 시간, 실패한 출력물까지 모두 빠뜨리기 쉬운 실제 원가입니다.",
        },
        {
          title: "재고 숫자가 실제와 다른 경우",
          description: "어떤 색이 몇 그램 남았는지 몰라 출력이 중간에 멈추거나, 같은 재료를 중복 주문하게 됩니다.",
        },
        {
          title: "모든 장비를 같은 숫자로 계산하는 경우",
          description: "소형기와 대형기는 소비 전력도, 장비 가격도, 수명도 다릅니다. 그런데도 대부분은 한 벌의 숫자로 모든 작업의 원가를 계산합니다.",
        },
        {
          title: "재구매 고객이 왔는데 지난 견적이 기억나지 않는 경우",
          description: "얼마에 견적을 냈는지, 어떤 재료였는지. 기록이 없으면 매번 다시 계산하거나 예전 대화를 뒤져야 합니다.",
        },
        {
          title: "어떤 작업이 남는지 모르는 경우",
          description: "주문은 많은데 남는 게 없습니다. 어떤 작업이 수지에 맞는지 비교할 기록이 없기 때문입니다.",
        },
        {
          title: "숫자가 여기저기 흩어져 있는 경우",
          description: "원가는 스프레드시트에, 재고는 노트에, 매출은 대화창에. '이번 달은 어땠지?'를 알려면 전부 열어봐야 합니다.",
        },
      ],
    },
    features: {
      title: "출력 업체에 필요한 모든 것을 한곳에",
      subtitle: "수식을 직접 고쳐야 하는 스프레드시트가 아니라, 실제 업무 흐름에 맞춰 설계했습니다",
      items: [
        {
          title: "FDM 및 Resin 원가 계산",
          description:
            "재료 무게와 출력 시간만 입력하면 재료비, 전기료, 감가상각, 인건비, 실패 예비분까지 자동으로 계산합니다.",
        },
        {
          title: "재료 재고 관리",
          description:
            "필라멘트와 레진을 개별로 원가, 색상, 브랜드, 사진과 함께 등록하고, 작업을 저장하면 재고가 자동 차감됩니다.",
        },
        {
          title: "프린터 프로필",
          description:
            "소비 전력, 장비 가격, 예상 수명, 유지비를 프린터별로 설정해 실제 사용한 장비 기준의 원가가 나옵니다.",
        },
        {
          title: "출력 작업 이력",
          description:
            "계산한 모든 작업을 보관해 과거 견적을 다시 보고, 재구매 고객에게 그대로 활용하며, 언제든 수정할 수 있습니다.",
        },
        {
          title: "수익 분석",
          description: "개당 수익과 총 수익을 확인해 가격을 올려야 할 작업과 받지 말아야 할 작업이 분명해집니다.",
        },
        {
          title: "요약 대시보드",
          description: "작업량, 원가, 수익, 사용한 재료를 한 화면에서 확인합니다.",
        },
      ],
    },
    steps: {
      title: "세 단계면 시작할 수 있습니다",
      subtitle: "한 번 설정하면 계속 사용합니다",
      items: [
        { title: "프린터와 재료 설정", description: "프린터 정보, 전기 요금 단가, 보유 중인 재료를 입력합니다." },
        {
          title: "받을 작업의 원가 계산",
          description: "슬라이서의 무게와 출력 시간을 입력하면 원가와 제시할 가격이 바로 나옵니다.",
        },
        {
          title: "저장하고 수익 추적",
          description: "작업을 저장하면 재고가 자동 차감되고, 누적 수익은 대시보드에서 확인합니다.",
        },
      ],
    },
    pricing: {
      title: "몇 건만 받아도 본전을 뽑는 가격",
      subtitle: "사용하는 프린터에 맞는 플랜을 선택하세요. 언제든 해지할 수 있습니다.",
      perMonth: "/ 월",
      yearlyNote: (yearly, monthlyEquivalent) => `또는 ${yearly} / 년 (월 평균 ${monthlyEquivalent})`,
      popular: "가장 알뜰한 선택",
      cta: "7일 무료 체험 시작",
      footnote:
        "신용/체크카드 또는 PromptPay로 결제 · 언제든 해지할 수 있고 결제한 기간이 끝날 때까지 계속 사용합니다",
      plans: {
        maker: {
          name: "Maker",
          badge: "FDM 전용",
          description: "FDM 프린터를 사용하는 분께",
          features: ["FDM 출력 원가 계산", "필라멘트 재고 관리", "작업별 수익 추적", "요약 대시보드", "출력 작업 이력"],
        },
        studio: {
          name: "Studio",
          badge: "FDM + Resin",
          description: "FDM과 Resin을 함께 쓰는 사업자께",
          features: ["Maker의 모든 기능", "Resin 출력 원가 계산", "레진 재고 관리", "Resin 대시보드", "Resin 작업 이력"],
        },
      },
    },
    faq: {
      title: "자주 묻는 질문",
      subtitle: "답을 찾지 못하셨다면 문의해 주세요.",
      items: [
        {
          question: "체험을 시작할 때 신용카드가 필요한가요?",
          answer:
            "필요 없습니다. 이메일이나 Google 계정으로 가입하면 7일 동안 모든 기능을 쓸 수 있고, 플랜은 그 뒤에 정하면 됩니다.",
        },
        {
          question: "어떤 프린터를 지원하나요?",
          answer:
            "모든 FDM 프린터를 지원하며, Resin 장비(LCD / DLP / SLA)는 Studio 플랜에서 지원합니다. 소비 전력, 장비 가격, 감가상각은 장비별로 설정합니다.",
        },
        { question: "결제 수단은 무엇인가요?", answer: "신용/체크카드와 PromptPay를 지원하며 모두 Stripe로 처리됩니다." },
        {
          question: "데이터는 안전한가요?",
          answer:
            "데이터는 암호화되어 클라우드에 저장되고 계정별로 분리됩니다. 본인만 열람할 수 있으며 모든 기기에서 사용할 수 있습니다.",
        },
        {
          question: "언제든 해지할 수 있나요?",
          answer: "네. 계정 페이지에서 해지할 수 있고, 현재 결제 주기가 끝날 때까지 계속 사용할 수 있습니다.",
        },
      ],
    },
    finalCta: {
      title: "감으로 매기는 가격을 멈추고, 실제 숫자에서 시작하세요",
      subtitle: "7일 무료, 전 기능 제공, 신용카드 불필요.",
      primary: "무료 체험 시작",
      secondary: "이미 계정이 있습니다",
    },
    footer: {
      tagline: "3D 프린팅 업체와 출력 판매자를 위한 원가 계산 및 작업 관리 시스템",
      privacy: "개인정보처리방침",
      terms: "이용약관",
      rights: "All rights reserved",
    },
  },
};
