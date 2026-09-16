export default function PpdbHeader({
  eyebrow = "PPDB Online",
  title,
  description,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-white">
      <div className="px-6 py-8 sm:px-8 sm:py-10">

        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-blue-600">
            {eyebrow}
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {title}
          </h1>

          {description && (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              {description}
            </p>
          )}
        </div>

        {children && (
          <div className="mt-6">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}