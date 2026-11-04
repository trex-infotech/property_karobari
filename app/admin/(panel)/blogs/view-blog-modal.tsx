"use client";

import { formatDateTime } from "@/app/lib/format-date";
import Link from "next/link";
import { useState } from "react";
import { normalizeQuillHtml, type Blog } from "@/app/lib/blog-utils";

function formatDate(iso: string | null) {
  return iso ? formatDateTime(iso) : null;
}

function Meta({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-zinc-900">{value}</p>
    </div>
  );
}

export default function ViewBlogModal({ blog }: { blog: Blog }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
      >
        View
      </button>

      {open && (
        <div className="fixed inset-0 z-100 overflow-y-auto bg-black/50 p-4 text-left">
          <div className="mx-auto my-8 w-full max-w-3xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-zinc-900">
                {blog.title || "Untitled"}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6 px-6 py-5">
              {blog.bannerUrl && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    Banner
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={blog.bannerUrl}
                    alt={`${blog.title} banner`}
                    className="mt-2 w-full rounded-lg object-cover"
                  />
                </div>
              )}

              {blog.thumbnailUrl && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    Thumbnail
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={blog.thumbnailUrl}
                    alt={`${blog.title} thumbnail`}
                    className="mt-2 h-40 w-full rounded-lg object-cover"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Meta
                  label="Posting date & time"
                  value={formatDate(blog.postingDateTime)}
                />
                <Meta label="Created" value={formatDate(blog.createdAt)} />
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Content
                </p>
                <div
                  className="admin-blog-view mt-2 max-w-none text-sm text-zinc-900"
                  dangerouslySetInnerHTML={{
                    __html: normalizeQuillHtml(blog.content),
                  }}
                />
                <style>{`
                  .admin-blog-view h1 { font-size: 1.5rem; font-weight: 700; margin: 1rem 0 0.5rem; }
                  .admin-blog-view h2 { font-size: 1.25rem; font-weight: 700; margin: 1rem 0 0.5rem; }
                  .admin-blog-view h3 { font-size: 1.1rem; font-weight: 600; margin: 1rem 0 0.5rem; }
                  .admin-blog-view p { margin: 0.5rem 0; line-height: 1.7; }
                  .admin-blog-view ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
                  .admin-blog-view ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
                  .admin-blog-view a { color: #2563eb; text-decoration: underline; }
                  .admin-blog-view img { max-width: 100%; height: auto; border-radius: 0.5rem; }
                  .admin-blog-view blockquote { border-left: 4px solid #e4e4e7; padding-left: 1rem; color: #52525b; margin: 0.5rem 0; }
                `}</style>
              </div>

              <Link
                href={`/blogs/${blog.slug || blog._id}`}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M15 3h6v6" />
                  <path d="M10 14 21 3" />
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                </svg>
                Open public page
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
