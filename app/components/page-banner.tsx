import Link from "next/link";

export type Crumb = { label: string; href?: string };

export default function PageBanner({
  title,
  subtitle,
  breadcrumb,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: Crumb[];
}) {
  return (
    <section className="relative overflow-hidden border-b border-blue-800 bg-linear-to-br from-blue-950 via-blue-900 to-blue-950 text-blue-200">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1440 260"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M-40 200 C 320 120, 640 260, 1000 170 S 1400 90, 1480 130"
          fill="none"
          stroke="rgba(217, 169, 74, 0.45)"
          strokeWidth="1.5"
        />
        <path
          d="M-40 230 C 320 150, 640 290, 1000 200 S 1400 120, 1480 160"
          fill="none"
          stroke="rgba(217, 169, 74, 0.3)"
          strokeWidth="1.5"
        />
        <path
          d="M-40 90 C 400 170, 800 20, 1480 110"
          fill="none"
          stroke="rgba(147, 197, 253, 0.18)"
          strokeWidth="1.5"
        />
        <path
          d="M900 -20 C 1050 60, 1250 40, 1480 -30"
          fill="none"
          stroke="rgba(147, 197, 253, 0.22)"
          strokeWidth="2"
        />
      </svg>

      <div className="relative mx-auto max-w-4xl px-4 pb-14 pt-32 text-center sm:pb-16 sm:pt-36">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="mb-3 text-xs font-medium text-blue-300 sm:text-sm"
          >
            <ol className="flex flex-wrap items-center justify-center gap-1.5">
              {breadcrumb.map((crumb, index) => {
                const isLast = index === breadcrumb.length - 1;

                return (
                  <li key={index} className="flex items-center gap-1.5">
                    {index > 0 && <span className="text-blue-700">/</span>}
                    {crumb.href && !isLast ? (
                      <Link
                        href={crumb.href}
                        className="transition-colors hover:text-white"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span
                        className={isLast ? "text-blue-300" : undefined}
                        aria-current={isLast ? "page" : undefined}
                      >
                        {crumb.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-3 max-w-xl text-sm text-blue-200/80 sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
