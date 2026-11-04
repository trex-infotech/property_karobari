"use client";

import { formatDateTime as formatCreated } from "@/app/lib/format-date";
import dynamic from "next/dynamic";
import { useActionState, useEffect, useMemo, useState } from "react";
import "react-quill-new/dist/quill.snow.css";
import {
  createBlog,
  deleteBlog,
  updateBlog,
  type BlogFormState,
} from "@/app/actions/blogs";
import { stripHtml, type Blog } from "@/app/lib/blog-utils";
import ViewBlogModal from "./view-blog-modal";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    [{ align: [] }],
    ["clean"],
  ],
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "list",
  "link",
  "align",
];

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20";

function formatDateTimeForInput(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}


function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-zinc-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function BlogForm({
  action,
  blog,
  onDone,
}: {
  action: (prevState: BlogFormState, formData: FormData) => Promise<BlogFormState>;
  blog?: Blog;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [content, setContent] = useState(blog?.content ?? "");

  const nowStr = useMemo(() => formatDateTimeForInput(new Date().toISOString()), []);

  useEffect(() => {
    if (state?.success) onDone();
  }, [state?.success, onDone]);

  return (
    <form action={formAction} className="space-y-4">
      {blog && <input type="hidden" name="id" value={blog._id} />}

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Title
        </label>
        <input
          name="title"
          defaultValue={blog?.title}
          required
          placeholder="Enter title"
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Content
        </label>
        <input type="hidden" name="content" value={content} />
        <div className="admin-blog-quill relative rounded-lg border border-zinc-300 text-zinc-900">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={quillModules}
            formats={quillFormats}
            placeholder="Write your blog content..."
          />
        </div>
        <style>{`
          .admin-blog-quill .ql-container { height: 260px; overflow-y: auto; }
          .admin-blog-quill .ql-editor { color: #18181b; }
          .admin-blog-quill .ql-tooltip { z-index: 50; left: 8px !important; max-width: calc(100% - 16px); }
          .admin-blog-quill .ql-tooltip input { width: 220px; max-width: 60vw; }
        `}</style>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            {blog ? "Replace Thumbnail (optional)" : "Thumbnail"}
          </label>
          <input
            name="thumbnail"
            type="file"
            accept="image/*"
            className={`${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-700`}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            {blog ? "Replace Banner Image (optional)" : "Banner Image"}
          </label>
          <input
            name="banner"
            type="file"
            accept="image/*"
            className={`${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-700`}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Posting Date &amp; Time
          </label>
          <input
            name="postingDateTime"
            type="datetime-local"
            defaultValue={formatDateTimeForInput(blog?.postingDateTime ?? null)}
            min={nowStr}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-zinc-500">
            Leave empty to post immediately. If set, the blog will be visible
            only after this date &amp; time.
          </p>
        </div>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
        >
          {pending ? "Saving…" : blog ? "Save" : "Post"}
        </button>
      </div>
    </form>
  );
}

export default function BlogManager({ blogs }: { blogs: Blog[] }) {
  const [search, setSearch] = useState("");
  const [postOpen, setPostOpen] = useState(false);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteBlog,
    undefined,
  );

  const filtered = blogs.filter((blog) => {
    const q = search.toLowerCase();
    return (
      blog.title.toLowerCase().includes(q) ||
      blog.content.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Blogs
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Create and manage blog posts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputClass} w-56`}
          />
          <button
            type="button"
            onClick={() => setPostOpen(true)}
            className="shrink-0 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Post Blog
          </button>
        </div>
      </div>

      {deleteState?.error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {deleteState.error}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3">Thumbnail</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Content</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-zinc-500">
                  No blogs found
                </td>
              </tr>
            ) : (
              filtered.map((blog) => (
                <tr
                  key={blog._id}
                  className="border-b border-zinc-100 last:border-0"
                >
                  <td className="px-4 py-3">
                    {blog.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={blog.thumbnailUrl}
                        alt={blog.title}
                        className="h-14 w-14 rounded-md object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="grid h-14 w-14 place-items-center rounded-md bg-zinc-200 text-xs text-zinc-500">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="max-w-48 px-4 py-3 font-medium text-zinc-900">
                    {blog.title}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-zinc-600">
                    <p className="line-clamp-2">{stripHtml(blog.content)}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600">
                    {formatCreated(blog.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <ViewBlogModal blog={blog} />
                      <button
                        type="button"
                        onClick={() => setEditing(blog)}
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <form
                        action={deleteAction}
                        onSubmit={(e) => {
                          if (!confirm("Delete this blog?")) e.preventDefault();
                        }}
                      >
                        <input type="hidden" name="id" value={blog._id} />
                        <button
                          type="submit"
                          disabled={deletePending}
                          className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {postOpen && (
        <Modal title="Post a Blog" onClose={() => setPostOpen(false)}>
          <BlogForm action={createBlog} onDone={() => setPostOpen(false)} />
        </Modal>
      )}

      {editing && (
        <Modal title="Edit Blog" onClose={() => setEditing(null)}>
          <BlogForm
            key={editing._id}
            action={updateBlog}
            blog={editing}
            onDone={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  );
}
