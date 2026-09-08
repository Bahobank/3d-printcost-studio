-- In-app announcement for everyone: the new Sales documents menu, and the
-- dashboard change that only counts money once the customer has paid.
--
-- The second half matters most. Every existing shop will open the dashboard and
-- see revenue and profit drop, so the wording says plainly that nothing was
-- lost, where the outstanding amount now appears, and what to do about it.
--
-- target_email is null, so this reaches every account - the owner's included.
-- Run this in the Supabase SQL editor. No deploy is needed.

insert into public.announcements (target_email, title, body, translations, cta_label, cta_url, is_active)
values (
  null,
  'อัปเดตใหม่: เอกสารขาย และวิธีนับกำไรบนแดชบอร์ด',
  'เพิ่มเมนู "เอกสารขาย" สำหรับออกใบเสนอราคา ใบแจ้งชำระเงิน และใบเสร็จรับเงิน และแดชบอร์ดจะนับกำไรเมื่อได้รับเงินจากลูกค้าแล้วเท่านั้น',
  jsonb_build_object(
    'th', jsonb_build_object(
      'title', 'อัปเดตใหม่: เอกสารขาย และวิธีนับกำไรบนแดชบอร์ด',
      'body',
        E'🧾 เมนูใหม่ "เอกสารขาย"\n'
        E'ออกเอกสารให้ลูกค้าได้ครบในที่เดียว — ใบเสนอราคา → ใบแจ้งชำระเงิน → ใบเสร็จรับเงิน\n\n'
        E'• เลือกออเดอร์ที่มีอยู่ ระบบดึงชื่องาน รูป ราคา และต้นทุนมาให้เอง\n'
        E'• เอกสารขั้นถัดไปคัดลอกข้อมูลต่อให้ ไม่ต้องกรอกซ้ำ\n'
        E'• ใส่โลโก้ร้าน ข้อมูลร้าน และเลขบัญชีธนาคารได้ที่ปุ่ม "ตั้งค่าเอกสาร"\n'
        E'• พิมพ์หรือบันทึกเป็น PDF ขนาด A4 ได้ทันที\n'
        E'• ติ๊กรายการเป็น "ของแถม" หรือซ่อนไม่ให้ลูกค้าเห็นก็ได้ แต่ยังคิดรวมต้นทุนให้\n\n'
        E'📊 แดชบอร์ดเปลี่ยนวิธีนับกำไร\n'
        E'เดิมนับรายรับและกำไรตั้งแต่ตอนตั้งราคาออเดอร์ ตอนนี้จะนับเมื่อ "ได้รับเงินจากลูกค้าแล้ว" เท่านั้น เพื่อให้ตัวเลขตรงกับเงินที่เข้าจริง\n\n'
        E'⚠️ ถ้าเปิดแดชบอร์ดแล้วเห็นกำไรลดลงหรือเป็น 0 — ข้อมูลไม่ได้หายไปครับ\n'
        E'ยอดที่ยังไม่ได้รับจะแสดงเป็น "รอรับเงิน" อยู่บนการ์ดเดิม และต้นทุนยังนับเหมือนเดิมเพราะจ่ายออกไปจริงแล้ว\n\n'
        E'วิธีทำให้ออเดอร์นับเป็นรายรับ:\n'
        E'เอกสารขาย → สร้างใบเสนอราคา → ลูกค้าตกลง → สร้างใบแจ้งชำระเงิน → กด "รับชำระเงินแล้ว"\n\n'
        E'ขอบคุณที่ใช้งาน 3DPrintCost Studio ครับ',
      'ctaLabel', 'เปิดเมนูเอกสารขาย'
    ),
    'en', jsonb_build_object(
      'title', 'New: Sales documents, and how profit is counted',
      'body',
        E'🧾 A new "Sales documents" menu\n'
        E'Everything a customer needs, in one place — quotation → payment request → receipt.\n\n'
        E'• Pick an existing order and the job name, photo, price and cost come across automatically\n'
        E'• Each next document copies the one before it, so nothing is retyped\n'
        E'• Add your logo, shop details and bank account under "Document settings"\n'
        E'• Print or save as an A4 PDF straight away\n'
        E'• Mark a line as a free gift, or hide it from the customer while it still counts towards your cost\n\n'
        E'📊 The dashboard counts profit differently\n'
        E'It used to count revenue and profit the moment an order was priced. It now counts them only once the customer has paid, so the figures match the money that actually arrived.\n\n'
        E'⚠️ If your profit looks lower or reads zero — nothing was lost.\n'
        E'What has not been collected now shows as "Awaiting" on the same cards, and cost still counts from the moment you spend it.\n\n'
        E'To make an order count as revenue:\n'
        E'Sales documents → new quotation → customer accepted → create payment request → mark as paid.\n\n'
        E'Thank you for using 3DPrintCost Studio.',
      'ctaLabel', 'Open Sales documents'
    ),
    'zh', jsonb_build_object(
      'title', '新功能：销售单据，以及利润的统计方式',
      'body',
        E'🧾 新增「销售单据」菜单\n'
        E'报价单 → 付款通知单 → 收据，全部在一个地方完成。\n\n'
        E'• 选择已有订单，工作名称、图片、售价与成本会自动带入\n'
        E'• 下一份单据会自动复制上一份，无需重复输入\n'
        E'• 可在「单据设置」中填入店铺标志、店铺信息与银行账户\n'
        E'• 可直接打印或保存为 A4 PDF\n'
        E'• 可将项目标为赠品，或对客户隐藏但仍计入你的成本\n\n'
        E'📊 仪表板的利润统计方式已调整\n'
        E'以前订单一旦定价就计入收入与利润，现在只有在客户付款后才计入，让数字与实际到账一致。\n\n'
        E'⚠️ 如果利润变少或显示为 0 — 数据并没有丢失。\n'
        E'尚未收到的金额会在同一张卡片上显示为「待收款」，成本仍照常计入，因为钱确实已经支出。\n\n'
        E'让订单计入收入的方法：\n'
        E'销售单据 → 新建报价单 → 客户已确认 → 创建付款通知单 → 标记已收款。\n\n'
        E'感谢使用 3DPrintCost Studio。',
      'ctaLabel', '打开销售单据'
    ),
    'ja', jsonb_build_object(
      'title', '新機能：販売書類と、利益の集計方法について',
      'body',
        E'🧾 「販売書類」メニューを追加しました\n'
        E'見積書 → 請求書 → 領収書 を一か所で作成できます。\n\n'
        E'• 既存の注文を選ぶと、作業名・写真・価格・原価が自動で入ります\n'
        E'• 次の書類は前の書類をそのまま引き継ぐので、入力し直す必要はありません\n'
        E'• ロゴ・自社情報・銀行口座は「書類設定」から登録できます\n'
        E'• そのまま印刷、またはA4のPDFとして保存できます\n'
        E'• 明細をサービス品にしたり、お客様に見せずに原価だけ計上することもできます\n\n'
        E'📊 ダッシュボードの利益の数え方が変わりました\n'
        E'これまでは注文に価格を付けた時点で売上と利益に入っていましたが、これからはお客様の入金後に計上されます。実際に入ったお金と数字が一致します。\n\n'
        E'⚠️ 利益が減って見えたり0になっていても、データは失われていません。\n'
        E'未入金の分は同じカードに「入金待ち」として表示されます。原価は支出した時点で計上されるため、これまで通りです。\n\n'
        E'注文を売上に計上するには：\n'
        E'販売書類 → 見積書を作成 → 受注にする → 請求書を作成 → 入金済みにする\n\n'
        E'3DPrintCost Studio をご利用いただきありがとうございます。',
      'ctaLabel', '販売書類を開く'
    ),
    'ko', jsonb_build_object(
      'title', '새 기능: 판매 문서와 이익 집계 방식 변경',
      'body',
        E'🧾 「판매 문서」 메뉴가 생겼습니다\n'
        E'견적서 → 대금 청구서 → 영수증을 한곳에서 만들 수 있습니다.\n\n'
        E'• 기존 주문을 고르면 작업명, 사진, 판매가, 원가가 자동으로 채워집니다\n'
        E'• 다음 문서는 앞 문서를 그대로 가져오므로 다시 입력할 필요가 없습니다\n'
        E'• 로고, 상점 정보, 은행 계좌는 「문서 설정」에서 등록하세요\n'
        E'• 바로 인쇄하거나 A4 PDF로 저장할 수 있습니다\n'
        E'• 항목을 무료 증정으로 표시하거나, 고객에게 숨기고 원가만 반영할 수 있습니다\n\n'
        E'📊 대시보드의 이익 집계 방식이 바뀌었습니다\n'
        E'예전에는 주문에 가격을 매기는 순간 매출과 이익에 포함됐지만, 이제는 고객이 결제한 뒤에만 집계됩니다. 실제로 들어온 돈과 숫자가 맞아떨어집니다.\n\n'
        E'⚠️ 이익이 줄어 보이거나 0으로 보여도 데이터가 사라진 것이 아닙니다.\n'
        E'아직 받지 못한 금액은 같은 카드에 「입금 대기」로 표시되며, 비용은 지출한 시점에 그대로 집계됩니다.\n\n'
        E'주문을 매출로 잡으려면:\n'
        E'판매 문서 → 견적서 만들기 → 고객 승인 → 대금 청구서 만들기 → 입금 처리\n\n'
        E'3DPrintCost Studio를 이용해 주셔서 감사합니다.',
      'ctaLabel', '판매 문서 열기'
    )
  ),
  'เปิดเมนูเอกสารขาย',
  null,
  true
);

-- Check it landed, and see how many people have read it so far.
-- select a.created_at, a.title, count(d.user_id) as dismissed
-- from public.announcements a
-- left join public.announcement_dismissals d on d.announcement_id = a.id
-- where a.target_email is null
-- group by a.id, a.created_at, a.title
-- order by a.created_at desc
-- limit 5;
