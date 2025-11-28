import React, { useEffect, useState } from "react";
import axios from "axios";
import { ExternalLink, Newspaper, Loader2 } from "lucide-react";

export default function TechNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const apiKey = import.meta.env.VITE_NEWS_API_KEY;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Fallback to mock data if no API key is present (for demo purposes)
        if (!apiKey) {
          console.warn("No NewsAPI key found. Using mock data.");
          setNews([
            { title: "The Future of AI in Productivity", url: "#", source: { name: "TechCrunch" }, publishedAt: new Date().toISOString() },
            { title: "Top 10 Developer Tools for 2024", url: "#", source: { name: "The Verge" }, publishedAt: new Date().toISOString() },
            { title: "How to Master React Performance", url: "#", source: { name: "React Blog" }, publishedAt: new Date().toISOString() },
            { title: "SpaceX Launches New Starlink Satellites", url: "#", source: { name: "SpaceNews" }, publishedAt: new Date().toISOString() },
          ]);
          return;
        }

        const res = await axios.get(
          `https://newsapi.org/v2/top-headlines?sources=techcrunch,the-verge,wired&pageSize=5&apiKey=${apiKey}`
        );
        setNews(res.data.articles || []);
      } catch (err) {
        console.error("Failed to fetch news", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [apiKey]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
        <Loader2 className="animate-spin mb-2" size={24} />
        <span className="text-xs">Fetching latest updates...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 text-gray-400 text-xs">
        <p>Failed to load news.</p>
        <p>Please check your connection.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {news.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">No tech news available right now.</div>
      )}
      {news.map((n, i) => (
        <a
          key={i}
          href={n.url}
          target="_blank"
          rel="noreferrer"
          className="block group p-3 rounded-xl bg-gray-50 dark:bg-neutral-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-800"
        >
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 leading-snug">
                {n.title}
              </h4>
              <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
                <span className="uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-500">
                  {n.source?.name || "Tech News"}
                </span>
                <span>•</span>
                <span>{new Date(n.publishedAt).toLocaleDateString()}</span>
              </div>
            </div>
            <ExternalLink size={14} className="text-gray-300 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
          </div>
        </a>
      ))}
    </div>
  );
}
