import React, { useState } from "react";
import api from "../lib/api.js";
import { Lightbulb, Play, Sparkles } from "lucide-react";

export default function DecisionHelper() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const starterPrompts = [
    "I feel overwhelmed. How do I prioritize today?",
    "Help me plan study routine for 2 hours.",
    "Recommend videos to learn React quickly.",
    "Motivate me to start a deep work session.",
  ];

  async function submit() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/ai/suggest", { notes: query });
      setResult(res.data);
    } catch (e) {
      if (e.response?.status === 503) {
        setResult(e.response.data); // still show fallback videos
        setError(e.response.data.error);
      } else {
        setError("Unexpected error: " + (e.response?.data?.error || e.message));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto text-neutral-900 dark:text-neutral-100">
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-neutral-800 dark:to-neutral-700 border dark:border-neutral-700 rounded-xl p-5">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles size={22} /> Decision Helper
        </h2>
        <p className="text-neutral-600 dark:text-neutral-300">
          Ask anything. Get suggestions, videos and music ideas for your situation.
        </p>
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-neutral-900 border dark:border-neutral-800 rounded-xl p-4 shadow-sm">
        <textarea
          className="w-full p-3 border dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
          rows={4}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe your situation or ask a question..."
        />
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <button
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-60"
            onClick={submit}
            disabled={loading}
          >
            <Play size={18} /> {loading ? "Thinking..." : "Ask AI"}
          </button>

          {!result && (
            <div className="flex gap-2 flex-wrap">
              {starterPrompts.map((p, idx) => (
                <button
                  key={idx}
                  className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  onClick={() => setQuery(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Empty state */}
      {!result && (
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          {[
            { title: "Focus better", desc: "Use Pomodoro: 25min deep work + 5min break x4." },
            { title: "Tidy your tasks", desc: "Keep 3 priorities. Everything else = backlog." },
            { title: "Sleep > Hustle", desc: "7–8h sleep improves memory & speed." },
            { title: "Weekly review", desc: "Every Sunday, clean your board & plan." },
          ].map((c, i) => (
            <div
              key={i}
              className="bg-white dark:bg-neutral-900 border dark:border-neutral-800 rounded-xl p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-2 font-semibold">
                <Lightbulb size={18} /> {c.title}
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{c.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-6 space-y-6">
          {result.suggestions?.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-3">Suggestions</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {error && (
                  <div className="mt-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
                    {error}
                  </div>
                )}
                {result.suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-neutral-900 border dark:border-neutral-800 rounded-xl p-4 shadow-sm"
                  >
                    <div className="text-sm text-neutral-600 dark:text-neutral-300 whitespace-pre-line">
                      {s.text}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ✅ YouTube video section */}
          {result?.videos?.length > 0 && (
            <section className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Recommended Videos</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {result.videos.map((v, i) => {
                  const videoId = v.url.split("v=")[1];
                  return (
                    <div
                      key={i}
                      className="bg-white dark:bg-neutral-900 border dark:border-neutral-800 rounded-xl p-4 shadow-sm"
                    >
                      <p className="font-medium mb-2">{v.title}</p>
                      {videoId ? (
                        <iframe
                          className="w-full aspect-video rounded"
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={v.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <a
                          href={v.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Watch on YouTube
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
      {/* Footer */}
          <footer className="mt-6 text-center text-xs opacity-70">
            © All rights reserved by <b>Madhan Singh</b> | Call: +91 6382703678
          </footer>
    </div>
  );
}
