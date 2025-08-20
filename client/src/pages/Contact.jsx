// src/pages/Contact.jsx
import { useTheme } from "../context/ThemeContext";
import { useState } from "react";
import { toast } from "react-hot-toast";
import api from "../lib/api";   // calls backend /api/contact
import {
  Linkedin, Github, Instagram, Code2, Globe, Mail
} from "lucide-react";

export default function Contact() {
  const { theme } = useTheme();
  const [message, setMessage] = useState("");
  const [mapInteractive, setMapInteractive] = useState(false);

  // Handle form submit
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.post("/contact", { message });   // ✅ only message is sent
      toast.success("Message sent successfully!");
      setMessage(""); // reset
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    }
  }

  const socials = [
    { icon: <Linkedin />, url: "https://linkedin.com/in/madhansingh" },
    { icon: <Github />, url: "https://github.com/madhansingh" },
    { icon: <Code2 />, url: "https://leetcode.com/madhansingh" },
    { icon: <Instagram />, url: "https://instagram.com/madhansingh" },
    { icon: <Globe />, url: "https://madhansingh-portfolio.com" },
  ];

  return (
    <div className="relative w-full h-[calc(100vh-64px)]">
      {/* Map Background */}
      <iframe
        title="Madurai Map"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3910.0692674095653!2d78.11977891480071!3d9.925200392907675!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b00c582b9a6e8f1%3A0x9a8c24e82f85a74d!2sMadurai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1675668591671!5m2!1sen!2sin"
        className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-300
          ${mapInteractive ? "opacity-100" : "opacity-70"}`}
        style={{ pointerEvents: mapInteractive ? "auto" : "none" }}
        allowFullScreen
        loading="lazy"
      />

      {/* Click/drag overlay */}
      <div
        className="absolute inset-0"
        onClick={() => setMapInteractive(true)}
        onMouseLeave={() => setMapInteractive(false)}
      />

      {/* Contact Card */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`w-full max-w-lg rounded-lg shadow-xl p-6 transition duration-300
            ${theme === "dark" ? "bg-black/80 text-white" : "bg-white text-black"}
            ${mapInteractive ? "opacity-40" : "opacity-100"}`}
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Mail size={20} /> Contact Creator
          </h2>

          {/* Form (only message needed) */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              className="w-full p-2 border rounded"
              placeholder="Your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded"
            >
              Submit
            </button>
          </form>

          {/* Social Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            {socials.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-emerald-600 hover:text-white transition"
                title={s.url}
              >
                {s.icon}
              </a>
            ))}
          </div>

          {/* Footer */}
          <footer className="mt-6 text-center text-xs opacity-70">
            © All rights reserved by <b>Madhan Singh</b> | Call: +91 6382703678
          </footer>
        </div>
      </div>
    </div>
  );
}
