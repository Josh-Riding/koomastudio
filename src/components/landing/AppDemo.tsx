"use client";

import { useState, useEffect } from "react";
import { ArrowUpCircle, Check, Sparkles, Copy } from "lucide-react";

const PROMPT_TEXT =
  "My angle: I'm shipping a B2B tool — how consistency compounds over time";

const OUTPUT_TEXT = `I used to scroll LinkedIn for 20 minutes and post nothing.

Then I realised — everything I was saving was already my content strategy. I just needed to stop consuming and start responding.

Consistency isn't about having more time. It's about having a system.

Build the system. The posts follow.`;

export default function AppDemo() {
  const [scene, setScene] = useState(0);
  const [leaving, setLeaving] = useState(false);

  // Scene 0 sub-states
  const [ksPulsing, setKsPulsing] = useState(false);
  const [ksClicked, setKsClicked] = useState(false);

  // Scene 1 sub-states
  const [showToast, setShowToast] = useState(false);

  // Scene 2 sub-states
  const [cardIn, setCardIn] = useState(false);

  // Scene 3 sub-states
  const [typedPrompt, setTypedPrompt] = useState("");

  // Scene 5 sub-states
  const [typedOutput, setTypedOutput] = useState("");
  const [copyGlow, setCopyGlow] = useState(false);

  function scheduleTransition(delay: number, next: number) {
    return setTimeout(() => {
      setLeaving(true);
      setTimeout(() => {
        setScene(next);
        setLeaving(false);
      }, 400);
    }, delay);
  }

  // Reset sub-states when scene changes
  useEffect(() => {
    setKsPulsing(false);
    setKsClicked(false);
    setShowToast(false);
    setCardIn(false);
    setTypedPrompt("");
    setTypedOutput("");
    setCopyGlow(false);
  }, [scene]);

  // Scene orchestration
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (scene === 0) {
      timers.push(setTimeout(() => setKsPulsing(true), 800));
      timers.push(setTimeout(() => setKsClicked(true), 1800));
      timers.push(scheduleTransition(3000, 1));
    } else if (scene === 1) {
      timers.push(setTimeout(() => setShowToast(true), 300));
      timers.push(scheduleTransition(2000, 2));
    } else if (scene === 2) {
      timers.push(setTimeout(() => setCardIn(true), 300));
      timers.push(scheduleTransition(2800, 3));
    } else if (scene === 3) {
      timers.push(scheduleTransition(4000, 4));
    } else if (scene === 4) {
      timers.push(scheduleTransition(1800, 5));
    } else if (scene === 5) {
      timers.push(setTimeout(() => setCopyGlow(true), 3800));
      timers.push(scheduleTransition(4200, 0));
    }

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  // Typing effect for scene 3
  useEffect(() => {
    if (scene !== 3) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedPrompt(PROMPT_TEXT.slice(0, i));
      if (i >= PROMPT_TEXT.length) clearInterval(interval);
    }, 35);
    return () => clearInterval(interval);
  }, [scene]);

  // Typing effect for scene 5
  useEffect(() => {
    if (scene !== 5) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedOutput(OUTPUT_TEXT.slice(0, i));
      if (i >= OUTPUT_TEXT.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [scene]);

  function sceneClass(n: number) {
    const active = scene === n && !leaving;
    const isLeaving = scene === n && leaving;
    if (active) return "opacity-100 translate-y-0";
    if (isLeaving) return "opacity-0 -translate-y-2 pointer-events-none";
    return "opacity-0 translate-y-2 pointer-events-none";
  }

  return (
    <div className="relative mx-auto mt-16 max-w-4xl">
      <div className="overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-violet-900/40">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-white/10 bg-zinc-900 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-zinc-600" />
          <span className="h-3 w-3 rounded-full bg-zinc-600" />
          <span className="h-3 w-3 rounded-full bg-zinc-600" />
          <span className="ml-3 flex-1 rounded bg-zinc-800 px-3 py-1 text-xs text-zinc-500">
            koomastudio.com
          </span>
        </div>

        {/* Scene viewport */}
        <div
          className="relative overflow-hidden bg-zinc-950"
          style={{ aspectRatio: "16/10" }}
        >
          {/* Scene 0 — LinkedIn feed */}
          <div
            className={`absolute inset-0 p-5 transition-all duration-[400ms] ${sceneClass(0)}`}
          >
            <div className="space-y-3">
              {/* Inert post */}
              <div className="rounded-lg border border-white/5 bg-zinc-800/60 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-zinc-700" />
                  <div>
                    <div className="h-2 w-20 rounded bg-zinc-600" />
                    <div className="mt-1 h-1.5 w-14 rounded bg-zinc-700" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-2 w-full rounded bg-zinc-700" />
                  <div className="h-2 w-5/6 rounded bg-zinc-700" />
                  <div className="h-2 w-4/6 rounded bg-zinc-700" />
                </div>
              </div>

              {/* Active post with ks button */}
              <div className="rounded-lg border border-white/5 bg-zinc-800/60 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-zinc-600" />
                  <div>
                    <div className="h-2 w-24 rounded bg-zinc-600" />
                    <div className="mt-1 h-1.5 w-16 rounded bg-zinc-700" />
                  </div>
                </div>
                <div className="mb-3 space-y-1.5">
                  <div className="h-2 w-full rounded bg-zinc-700" />
                  <div className="h-2 w-11/12 rounded bg-zinc-700" />
                  <div className="h-2 w-3/4 rounded bg-zinc-700" />
                  <div className="h-2 w-5/6 rounded bg-zinc-700" />
                </div>
                <div className="flex items-center gap-0.5 border-t border-white/5 pt-2">
                  {/* Like */}
                  <button className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-zinc-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>
                    Like
                  </button>
                  {/* Comment */}
                  <button className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-zinc-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Comment
                  </button>
                  {/* Repost */}
                  <button className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-zinc-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                    Repost
                  </button>
                  {/* Send */}
                  <button className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-zinc-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    Send
                  </button>
                  {/* ks */}
                  <button
                    className={`ml-auto flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold transition-all duration-300 ${
                      ksClicked
                        ? "border-violet-600 bg-violet-600 text-white"
                        : "border-violet-500/30 bg-violet-600/20 text-violet-400"
                    } ${ksPulsing && !ksClicked ? "ring-2 ring-violet-400/50 ring-offset-1 ring-offset-zinc-950" : ""}`}
                  >
                    <ArrowUpCircle className="h-3 w-3" />
                    ks
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Scene 1 — Saved confirmation */}
          <div
            className={`absolute inset-0 p-5 transition-all duration-[400ms] ${sceneClass(1)}`}
          >
            <div className="space-y-3">
              <div className="rounded-lg border border-white/5 bg-zinc-800/60 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-zinc-700" />
                  <div>
                    <div className="h-2 w-20 rounded bg-zinc-600" />
                    <div className="mt-1 h-1.5 w-14 rounded bg-zinc-700" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-2 w-full rounded bg-zinc-700" />
                  <div className="h-2 w-5/6 rounded bg-zinc-700" />
                  <div className="h-2 w-4/6 rounded bg-zinc-700" />
                </div>
              </div>
              <div className="rounded-lg border border-white/5 bg-zinc-800/60 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-zinc-600" />
                  <div>
                    <div className="h-2 w-24 rounded bg-zinc-600" />
                    <div className="mt-1 h-1.5 w-16 rounded bg-zinc-700" />
                  </div>
                </div>
                <div className="mb-3 space-y-1.5">
                  <div className="h-2 w-full rounded bg-zinc-700" />
                  <div className="h-2 w-11/12 rounded bg-zinc-700" />
                  <div className="h-2 w-3/4 rounded bg-zinc-700" />
                </div>
                <div className="flex items-center gap-0.5 border-t border-white/5 pt-2">
                  {/* Like */}
                  <button className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-zinc-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>
                    Like
                  </button>
                  {/* Comment */}
                  <button className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-zinc-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Comment
                  </button>
                  {/* Repost */}
                  <button className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-zinc-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                    Repost
                  </button>
                  {/* Send */}
                  <button className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-zinc-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    Send
                  </button>
                  {/* ks — saved state */}
                  <button className="ml-auto flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-600/20 px-2.5 py-1 text-xs font-bold text-emerald-400">
                    <Check className="h-3 w-3" />
                    ks
                  </button>
                </div>
              </div>
            </div>
            {/* Toast */}
            <div
              className={`absolute bottom-4 right-4 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-zinc-900 px-3 py-2 text-xs text-emerald-400 shadow-lg transition-all duration-500 ${
                showToast
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              <Check className="h-3.5 w-3.5" />
              Post saved to library
            </div>
          </div>

          {/* Scene 2 — Library */}
          <div
            className={`absolute inset-0 p-5 transition-all duration-[400ms] ${sceneClass(2)}`}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold text-white">Saved Posts</p>
              <span className="text-xs text-zinc-500">25 posts</span>
            </div>
            <div className="space-y-2">
              {/* New card */}
              <div
                className={`rounded-lg border bg-zinc-800/80 p-2.5 transition-all duration-500 ${
                  cardIn
                    ? "translate-y-0 border-violet-500/50 opacity-100"
                    : "-translate-y-2 border-white/5 opacity-0"
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-xs font-semibold text-violet-300">
                    Marcus Reid
                  </p>
                  <span className="rounded-full bg-violet-600/20 px-1.5 py-0.5 text-[10px] text-violet-400">
                    new
                  </span>
                </div>
                <p className="line-clamp-1 text-xs text-zinc-500">
                  Consistency on LinkedIn isn&apos;t about posting every day...
                </p>
              </div>
              {/* Existing cards */}
              {[
                {
                  author: "Sarah Chen",
                  preview:
                    "The best founders I know treat their LinkedIn like a product...",
                },
                {
                  author: "Priya Nair",
                  preview:
                    "Three years ago I had 200 followers. Here's the one thing...",
                },
                {
                  author: "James Liu",
                  preview:
                    "Stop writing for the algorithm. Write for the one person who...",
                },
              ].map((p) => (
                <div
                  key={p.author}
                  className="rounded-lg border border-white/5 bg-zinc-800/60 p-2.5"
                >
                  <p className="mb-1 text-xs font-semibold text-zinc-300">
                    {p.author}
                  </p>
                  <p className="line-clamp-1 text-xs text-zinc-500">
                    {p.preview}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Scene 3 — Remix workspace */}
          <div
            className={`absolute inset-0 p-5 transition-all duration-[400ms] ${sceneClass(3)}`}
          >
            <p className="mb-3 text-xs font-semibold text-zinc-400">
              Remix Workspace
            </p>
            <div className="grid grid-cols-2 gap-3">
              {/* Selected post */}
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Inspiration
                </p>
                <div className="rounded-lg border border-violet-500/40 bg-violet-950/20 p-2.5">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-xs font-semibold text-zinc-300">
                      Marcus Reid
                    </p>
                    <Check className="h-3 w-3 text-violet-400" />
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-500">
                    Consistency on LinkedIn isn&apos;t about posting every day.
                    It&apos;s about showing up when it matters...
                  </p>
                </div>
              </div>
              {/* Prompt */}
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Your Angle
                </p>
                <div className="h-full rounded-lg border border-white/10 bg-zinc-800 p-2.5">
                  <p className="text-xs leading-relaxed text-zinc-300">
                    {typedPrompt}
                    <span className="animate-pulse">|</span>
                  </p>
                </div>
              </div>
            </div>
            <button className="mt-3 flex w-full items-center justify-between rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Generate Remix
              </div>
              <span className="text-[10px] text-violet-300">
                Anthropic Claude
              </span>
            </button>
          </div>

          {/* Scene 4 — Generating */}
          <div
            className={`absolute inset-0 p-5 transition-all duration-[400ms] ${sceneClass(4)}`}
          >
            <p className="mb-3 text-xs font-semibold text-zinc-400">
              Remix Workspace
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Inspiration
                </p>
                <div className="rounded-lg border border-violet-500/40 bg-violet-950/20 p-2.5">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-xs font-semibold text-zinc-300">
                      Marcus Reid
                    </p>
                    <Check className="h-3 w-3 text-violet-400" />
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-500">
                    Consistency on LinkedIn isn&apos;t about posting every day.
                    It&apos;s about showing up when it matters...
                  </p>
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Your Angle
                </p>
                <div className="h-full rounded-lg border border-white/10 bg-zinc-800 p-2.5">
                  <p className="text-xs leading-relaxed text-zinc-300">
                    {PROMPT_TEXT}
                  </p>
                </div>
              </div>
            </div>
            <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white opacity-80">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Generating…
            </button>
          </div>

          {/* Scene 5 — Output */}
          <div
            className={`absolute inset-0 p-5 transition-all duration-[400ms] ${sceneClass(5)}`}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold text-white">Your Remix</p>
              <button
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-all duration-500 ${
                  copyGlow
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/40"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
            </div>
            <div className="rounded-lg border border-white/5 bg-zinc-800/60 p-4">
              <p className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-300">
                {typedOutput}
                {typedOutput.length < OUTPUT_TEXT.length && (
                  <span className="animate-pulse">|</span>
                )}
              </p>
            </div>
          </div>

          {/* Scene indicator dots */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  scene === n ? "w-4 bg-violet-400" : "w-1.5 bg-zinc-700"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
