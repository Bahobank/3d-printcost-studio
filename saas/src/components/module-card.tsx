export function ModuleCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="card p-7">
      <div className="mb-5">
        <h1 className="text-3xl font-black">{title}</h1>
        <p className="mt-2 text-slate-500">{description}</p>
      </div>
      {children ?? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-slate-500">
          โมดูลนี้พร้อมเชื่อมฟังก์ชันจากโปรแกรมเดิมในขั้นถัดไป
        </div>
      )}
    </section>
  );
}

