import Link from "next/link";
import {
  Subtitles,
  Video,
  ArrowRightLeft,
  Zap,
  Globe,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: Subtitles,
    title: "Create Subtitles",
    description:
      "Build SRT files from scratch or choose from pre-built templates for interviews, tutorials, social media, and more.",
    href: "/create",
    color: "blue",
  },
  {
    icon: Video,
    title: "Embed Subtitles",
    description:
      "Burn subtitles directly into your video or add them as a separate track using browser-based FFmpeg.",
    href: "/embed",
    color: "purple",
  },
  {
    icon: ArrowRightLeft,
    title: "Convert Formats",
    description:
      "Convert between SRT, WebVTT, plain text, and ASS subtitle formats instantly.",
    href: "/convert",
    color: "pink",
  },
];

const highlights = [
  {
    icon: Zap,
    title: "Fast & Free",
    description: "Everything runs in your browser. No uploads, no waiting.",
  },
  {
    icon: Globe,
    title: "Works Everywhere",
    description: "Responsive design that works on desktop, tablet, and mobile.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your files never leave your device. 100% client-side processing.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 px-4 py-20 text-center text-white sm:py-28">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            SubtitleForge
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100 sm:text-xl">
            Create, edit, and embed subtitles into your videos — all in your
            browser. No server uploads, no sign-ups, completely free.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-lg transition-transform hover:scale-105 hover:shadow-xl"
            >
              <Subtitles className="h-5 w-5" />
              Start Creating
            </Link>
            <Link
              href="/embed"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-transform hover:scale-105 hover:bg-white/10"
            >
              <Video className="h-5 w-5" />
              Embed in Video
            </Link>
          </div>
        </div>
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          Everything you need for subtitles
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-slate-500 dark:text-slate-400">
          A complete toolkit for creating, converting, and embedding subtitles
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 dark:border-slate-700 dark:bg-slate-800"
            >
              <div
                className={`mb-4 inline-flex rounded-xl p-3 ${
                  feature.color === "blue"
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                    : feature.color === "purple"
                    ? "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400"
                    : "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400"
                }`}
              >
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {feature.description}
              </p>
              <span className="mt-4 inline-flex text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                Get started →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Highlights */}
      <section className="border-t border-slate-200 bg-white px-4 py-16 dark:border-slate-800 dark:bg-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto mb-3 inline-flex rounded-full bg-slate-100 p-3 dark:bg-slate-800">
                  <item.icon className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 px-4 py-8 text-center dark:border-slate-800 dark:bg-slate-950">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          SubtitleForge. Built with Next.js &amp; Tailwind CSS. 100% client-side.
        </p>
      </footer>
    </div>
  );
}
