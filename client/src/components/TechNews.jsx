import React, { useEffect, useState } from "react";
import axios from "axios";

export default function TechNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiKey = import.meta.env.VITE_NEWS_API_KEY;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get(
          `https://newsapi.org/v2/top-headlines?sources=techcrunch&apiKey=${apiKey}`
        );
        setNews(res.data.articles || []);
      } catch (err) {
        console.error("Failed to fetch news", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [apiKey]);

  if (loading) {
    return <div className="text-gray-500 text-sm">Loading tech news...</div>;
  }

  return (
    <ul className="mt-2 text-sm list-disc pl-4">
      {news.length === 0 && (
        <li className="text-gray-500">No tech news available right now.</li>
      )}
      {news.map((n, i) => (
        <li key={i}>
          <a
            className="text-blue-600 hover:underline"
            href={n.url}
            target="_blank"
            rel="noreferrer"
          >
            {n.title}
          </a>
        </li>
      ))}
    </ul>
  );
}
