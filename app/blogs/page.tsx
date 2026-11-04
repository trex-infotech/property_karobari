import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPublishedBlogs } from "@/app/lib/blogs";
import PageBanner from "@/app/components/page-banner";
import { stripHtml, type Blog } from "@/app/lib/blog-utils";
import { formatDate } from "@/app/lib/format-date";

// Reads MongoDB at request time.
export const instant = false;

export const metadata: Metadata = {
  title: "Blogs | Property Karobari",
  description: "Insights and updates on real estate, buying, renting and PGs.",
};

function formatBlogDate(value: string | null) {
  return value ? formatDate(value) : "";
}

function BlogCard({ blog }: { blog: Blog }) {
  const href = `/blogs/${blog.slug || blog._id}`;

  return (
    <article className="grid items-stretch gap-0 overflow-hidden rounded-2xl border border-blue-100/50 bg-white shadow-lg transition-all hover:-translate-y-0.5 md:grid-cols-3 md:gap-4">
      <Link
        href={href}
        className="flex flex-col justify-center p-6 md:col-span-2"
      >
        <h2 className="mb-2 text-2xl font-bold text-blue-900">{blog.title}</h2>
        <p className="line-clamp-4 whitespace-pre-line leading-relaxed text-gray-700">
          {stripHtml(blog.content)}
        </p>

        <div className="mt-2.5 border-t border-slate-100 pt-2.5">
          <span className="inline-flex items-center gap-2 font-semibold text-blue-900">
            Read full article
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </span>
          {blog.postingDateTime || blog.createdAt ? (
            <p className="mt-2 text-xs font-medium text-slate-500">
              Posted on: {formatBlogDate(blog.postingDateTime || blog.createdAt)}
            </p>
          ) : null}
        </div>
      </Link>

      <Link href={href} className="relative block aspect-3/2 bg-blue-50">
        {blog.thumbnailUrl ? (
          <Image
            src={blog.thumbnailUrl}
            alt={blog.title}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center p-6 text-blue-700">
            No Image
          </div>
        )}
      </Link>
    </article>
  );
}

export default async function BlogsPage() {
  const blogs = await getPublishedBlogs();

  return (
    <section className="mx-auto min-h-screen bg-linear-to-br from-white via-blue-50/30 to-blue-100/20 pb-16">
      <PageBanner
        title="Blogs"
        subtitle="Insights and updates on real estate, buying, renting and PGs."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Blogs" }]}
      />

      <div className="container mx-auto px-6 pt-10">
        {blogs.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            No blogs to show
          </div>
        ) : (
          <div className="space-y-6 md:mx-12">
            {blogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
