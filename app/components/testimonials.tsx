"use client";

import { useEffect, useRef } from "react";

type Testimonial = {
  content: string;
  author: string;
  position: string;
  rating: number;
};

const testimonials: Testimonial[] = [
  {
    content:
      "Property Karobari helped me find a 2BHK in my budget within two weeks. The listings were genuine and the team arranged site visits quickly. Smoothest home-buying experience I've had.",
    author: "Priya Sharma",
    position: "Home Buyer, Mumbai",
    rating: 5,
  },
  {
    content:
      "I was relocating for work and needed a rental flat fast. Their verified listings saved me from broker runarounds — I signed my lease in three days.",
    author: "Rahul Verma",
    position: "Tenant, Pune",
    rating: 5,
  },
  {
    content:
      "As a first-time PG seeker, I had no idea where to start. The filters made it easy to find a safe, well-maintained PG close to my office.",
    author: "Sneha Patel",
    position: "Working Professional, Bangalore",
    rating: 4,
  },
  {
    content:
      "We listed our flat for resale and got genuine enquiries within a week. The team handled negotiations and paperwork end to end. Highly recommended.",
    author: "Amit Deshmukh",
    position: "Property Seller, Thane",
    rating: 5,
  },
  {
    content:
      "Investing from abroad felt risky, but their team verified every document and did video walkthroughs of each shortlisted property. Bought my flat with full confidence.",
    author: "Farhan Khan",
    position: "NRI Investor, Dubai",
    rating: 5,
  },
  {
    content:
      "Found a builder floor in the exact locality we wanted, under our budget. The price was exactly what was listed — no hidden charges anywhere.",
    author: "Meera Iyer",
    position: "Home Buyer, Chennai",
    rating: 4,
  },
  {
    content:
      "Their new launch section helped us book early in a project we had been tracking for months. The possession timeline and payment plan were crystal clear.",
    author: "Vikram Malhotra",
    position: "Investor, Gurgaon",
    rating: 5,
  },
  {
    content:
      "Moved cities twice in two years and found rentals both times through Property Karobari. Verified owners, fair deposits, zero broker drama.",
    author: "Kavya Nair",
    position: "Tenant, Hyderabad",
    rating: 5,
  },
  {
    content:
      "The team understood exactly what we needed — a villa near the kids' school. Patient with our many visits and honest about every property's pros and cons.",
    author: "Rohan & Anjali Joshi",
    position: "Home Buyers, Navi Mumbai",
    rating: 5,
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={`h-4 w-4 ${
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-zinc-200 text-zinc-200"
          }`}
          aria-hidden="true"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current) return;
      const el = trackRef.current;
      if (!el) return;

      const card = el.querySelector<HTMLElement>("[data-card]");
      const step = card ? card.offsetWidth + 24 : el.clientWidth;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;

      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="bg-linear-to-b from-white to-blue-50/40 py-16 sm:py-20">
      <div className="container mx-auto px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-linear-to-r from-blue-100 to-blue-50 px-5 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-600">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Testimonials
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-blue-950 sm:text-4xl">
            What Our Clients Say
          </h2>
          <p className="mt-3 text-zinc-600">
            Hear from buyers, tenants, and professionals who found their space
            with Property Karobari.
          </p>
        </div>

        <div
          ref={trackRef}
          onMouseEnter={() => {
            pausedRef.current = true;
          }}
          onMouseLeave={() => {
            pausedRef.current = false;
          }}
          onTouchStart={() => {
            pausedRef.current = true;
          }}
          onTouchEnd={() => {
            // Keep paused briefly to cover momentum scrolling after the finger lifts.
            window.setTimeout(() => {
              pausedRef.current = false;
            }, 1500);
          }}
          className="scrollbar-none flex gap-6 overflow-x-auto pb-8 pt-6"
        >
          {testimonials.map((t) => (
            <figure
              data-card
              key={t.author}
              className="relative flex w-full shrink-0 flex-col rounded-2xl border border-blue-100/60 bg-white p-6 pt-8 shadow-lg sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
            >
              <span className="absolute -top-4 left-6 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M10 8c-3.3 0-6 2.7-6 6v2h5v-5H6.5C6.8 9.9 8.2 9 10 9V8zm10 0c-3.3 0-6 2.7-6 6v2h5v-5h-2.5c.3-1.1 1.7-2 3.5-2V8z" />
                </svg>
              </span>

              <Stars rating={t.rating} />

              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-zinc-600">
                “{t.content}”
              </blockquote>

              <figcaption className="mt-6 flex items-center gap-3 border-t border-zinc-100 pt-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {t.author
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {t.author}
                  </p>
                  <p className="text-xs text-zinc-500">{t.position}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
