// src/pages/Contact.jsx
import { useTheme } from "../context/ThemeContext";
import { useState } from "react";
import { toast } from "react-hot-toast";
import api from "../lib/api";
import {
  Linkedin, Github, Instagram, Code2, Globe, Mail, Send, Phone, MapPin
} from "lucide-react";

export default function Contact() {
  const { theme } = useTheme();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle form submit
  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      await api.post("/contact", { message });
      toast.success("Message sent successfully!");
      setMessage("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  }

  const socials = [
    { icon: <Linkedin size={20} />, url: "https://www.linkedin.com/in/madhan-singh6382703678/", label: "LinkedIn", color: "hover:text-blue-600" },
    { icon: <Github size={20} />, url: "https://github.com/Madhansingh23/", label: "GitHub", color: "hover:text-gray-900 dark:hover:text-white" },
    { icon: <Code2 size={20} />, url: "https://leetcode.com/u/Madhansingh/", label: "LeetCode", color: "hover:text-yellow-500" },
    { icon: <Instagram size={20} />, url: "https://www.instagram.com/mr.darkstrange/", label: "Instagram", color: "hover:text-pink-500" },
    { icon: <Globe size={20} />, url: "https://madhan-portfolio-two.vercel.app/", label: "Portfolio", color: "hover:text-emerald-500" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Get in Touch
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Have a question, suggestion, or just want to say hi? I'd love to hear from you!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info & Socials */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact Info</h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Email</h3>
                  <p className="text-gray-500 dark:text-gray-400">madhansingh@example.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Phone</h3>
                  <p className="text-gray-500 dark:text-gray-400">+91 6382703678</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Location</h3>
                  <p className="text-gray-500 dark:text-gray-400">India</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-neutral-800">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Connect with me</h3>
              <div className="flex flex-wrap gap-3">
                {socials.map((s, index) => (
                  <a
                    key={index}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3 bg-gray-50 dark:bg-neutral-800 rounded-xl text-gray-500 transition-all transform hover:scale-110 hover:shadow-md ${s.color}`}
                    title={s.label}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full h-40 p-4 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={20} /> Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© {new Date().getFullYear()} Smart Productivity Tracker. All rights reserved.</p>
        <p className="mt-1">Designed & Built by <span className="font-bold text-gray-900 dark:text-white">Madhan Singh</span></p>
      </footer>
    </div>
  );
}
