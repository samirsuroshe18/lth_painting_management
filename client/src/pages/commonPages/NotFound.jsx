import React from "react";
import { Link, useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950"
      aria-labelledby="notfound-title"
    >
      {/* Decorative grid/pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -left-1/2 top-1/4 h-[40rem] w-[40rem] rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-400/10" />
        <div className="absolute -right-1/3 bottom-1/4 h-[30rem] w-[30rem] rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-400/10" />
      </div>

      <section className="relative mx-4 w-full max-w-xl rounded-2xl border border-slate-200/60 bg-white/70 p-8 shadow-xl backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/60">
        {/* Illustration */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md ring-1 ring-black/5 dark:ring-white/5">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            className="opacity-95"
            role="img"
            aria-label="Broken compass icon"
          >
            <path
              fill="currentColor"
              className="text-white"
              d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm0 1.8a8.2 8.2 0 1 1 0 16.4a8.2 8.2 0 0 1 0-16.4Z"
            />
            <path
              fill="currentColor"
              className="text-white"
              d="M15.9 8.1L11 9.8l-1.8 4.9l4.9-1.8l1.8-4.9Zm-3.1 3l-1 2.7l2.7-1l1-2.7l-2.7 1Z"
            />
          </svg>
        </div>

        <h1
          id="notfound-title"
          className="text-center text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 drop-shadow-sm dark:from-blue-400 dark:to-indigo-400"
        >
          404
        </h1>

        <h2 className="mt-3 text-center text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Oops! Page not found
        </h2>

        <p className="mx-auto mt-2 max-w-prose text-center text-slate-600 dark:text-slate-300">
          The page you’re looking for doesn’t exist, was moved, or the URL is
          incorrect. You can go back or head to the homepage.
        </p>

        {/* Actions */}
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            ← Go Back
          </button>

          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-slate-900"
          >
            Go to Homepage
          </Link>
        </div>

        {/* Optional: quick tips / links area */}
        <div className="mt-6 grid gap-2 text-center text-xs text-slate-500 dark:text-slate-400">
          <span>Tip: Check the URL for typos.</span>
          <span>
            Still stuck?{" "}
            <Link
              to="/contact"
              className="underline decoration-dotted underline-offset-4 transition hover:opacity-80"
            >
              Contact support
            </Link>
            .
          </span>
        </div>
      </section>
    </main>
  );
};

export default NotFound;