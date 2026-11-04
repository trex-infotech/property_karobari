import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBlogBySlug } from "@/app/lib/blogs";
import PageBanner from "@/app/components/page-banner";
import { normalizeQuillHtml, stripHtml } from "@/app/lib/blog-utils";
import { formatDate } from "@/app/lib/format-date";

// Reads MongoDB at request time.
export const instant = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) return { title: "Blog not found | Property Karobari" };

  const description = blog.content
    ? stripHtml(blog.content).slice(0, 160)
    : blog.title;
  const image = blog.bannerUrl || blog.thumbnailUrl;

  return {
    title: `${blog.title} | Property Karobari`,
    description,
    openGraph: {
      title: blog.title,
      description,
      type: "article",
      images: image ? [image] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

function formatBlogDate(value: string | null) {
  return value ? formatDate(value) : "";
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) notFound();

  const description = blog.content
    ? stripHtml(blog.content).slice(0, 160)
    : blog.title;
  const hero = blog.bannerUrl || blog.thumbnailUrl;
  const postedOn = formatBlogDate(blog.postingDateTime || blog.createdAt);

  return (
    <section className="min-h-screen bg-linear-to-br from-white via-blue-50/30 to-blue-100/20 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: blog.title,
            image: hero ? [hero] : undefined,
            datePublished: blog.createdAt ?? undefined,
            author: { "@type": "Organization", name: "Property Karobari" },
            publisher: {
              "@type": "Organization",
              name: "Property Karobari",
            },
            description,
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "/" },
              { "@type": "ListItem", position: 2, name: "Blogs", item: "/blogs" },
              {
                "@type": "ListItem",
                position: 3,
                name: blog.title,
                item: `/blogs/${blog.slug}`,
              },
            ],
          }),
        }}
      />

      <PageBanner
        title={blog.title}
        subtitle={postedOn ? `Posted on ${postedOn}` : undefined}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Blogs", href: "/blogs" },
          { label: blog.title },
        ]}
      />

      <div className="container mx-auto px-6 pt-10">
        <article className="overflow-hidden rounded-2xl border border-blue-100/50 bg-white shadow-lg">
          {hero && (
            <div className="w-full bg-blue-50">
              <div className="relative aspect-video w-full md:aspect-16/7 lg:aspect-16/6">
                <Image
                  src={hero}
                  alt={blog.title}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            </div>
          )}
          <div className="p-6 md:p-10">
            <div
              className="blog-content max-w-none"
              dangerouslySetInnerHTML={{
                __html: normalizeQuillHtml(blog.content),
              }}
            />
          </div>
        </article>
      </div>
    </section>
  );
}
