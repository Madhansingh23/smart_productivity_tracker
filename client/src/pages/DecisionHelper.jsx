import React, { useState } from 'react';
import api from '../lib/api';
import { Lightbulb, Play, Sparkles } from 'lucide-react';

/**
 * Decision Helper (responsive, attractive)
 * - Empty state with quick prompts
 * - Suggestions as elegant cards
 * - YouTube embeds playable in-page
 */
export default function DecisionHelper(){
  const [query,setQuery]=useState('');
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);

  const starterPrompts = [
    'I feel overwhelmed. How do I prioritize today?',
    'Help me plan study routine for 2 hours.',
    'Recommend videos to learn React quickly.',
    'Motivate me to start a deep work session.'
  ];

  async function submit(){
    if(!query.trim()) return;
    setLoading(true);
    try{
      const res = await api.post('/ai/suggest',{ notes: query });
      setResult(res.data);
    }catch(e){
      alert('Error: '+(e.response?.data?.error || e.message));
    } finally{
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border rounded-xl p-5">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles size={22}/> Decision Helper
        </h2>
        <p className="text-gray-600">Ask anything. Get suggestions, videos and music ideas for your situation.</p>
      </div>

      {/* Input area */}
      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <textarea
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows={4}
          value={query}
          onChange={e=>setQuery(e.target.value)}
          placeholder="Describe your situation or ask a question..."
        />
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <button
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-60"
            onClick={submit}
            disabled={loading}
          >
            <Play size={18}/> {loading ? 'Thinking...' : 'Ask AI'}
          </button>

          {/* Quick prompts */}
          {!result && (
            <div className="flex gap-2 flex-wrap">
              {starterPrompts.map((p,idx)=>(
                <button
                  key={idx}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
                  onClick={()=> setQuery(p)}
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
            {title:'Focus better',desc:'Use Pomodoro: 25min deep work + 5min break x4.'},
            {title:'Tidy your tasks',desc:'Keep 3 priorities. Everything else = backlog.'},
            {title:'Sleep > Hustle',desc:'7–8h sleep improves memory & speed.'},
            {title:'Weekly review',desc:'Every Sunday, clean your board & plan.'},
          ].map((c,i)=>(
            <div key={i} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-2 font-semibold"><Lightbulb size={18}/>{c.title}</div>
              <p className="text-sm text-gray-600 mt-1">{c.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-6 space-y-6">
          {/* Suggestions */}
          {(result.suggestions?.length>0) && (
            <section>
              <h3 className="text-lg font-semibold mb-3">Suggestions</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {result.suggestions.map((s,i)=>(
                  <div key={i} className="bg-white border rounded-xl p-4 shadow hover:shadow-md transition">
                    <div className="text-sm text-gray-600 whitespace-pre-line">{s.text}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Videos */}
          {(result.videos?.length>0) && (
            <section>
              <h3 className="text-lg font-semibold mb-3">Recommended videos</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {result.videos.map((v,i)=>{
                  const embed = v.url?.includes('watch?v=')
                    ? v.url.replace('watch?v=','embed/')
                    : v.url;
                  return (
                    <div key={i} className="bg-white border rounded-xl overflow-hidden shadow-sm">
                      <div className="p-3 font-medium">{v.title}</div>
                      <div className="aspect-video">
                        <iframe
                          className="w-full h-full"
                          src={embed}
                          title={v.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Songs */}
          {(result.songs?.length>0) && (
            <section>
              <h3 className="text-lg font-semibold mb-3">Songs to match your mood</h3>
              <ul className="bg-white border rounded-xl divide-y">
                {result.songs.map((s,i)=>(
                  <li key={i} className="p-3 flex items-center gap-3">
                    <span className="font-medium">{s.title}</span>
                    <span className="text-gray-500 text-sm">— {s.artist}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
