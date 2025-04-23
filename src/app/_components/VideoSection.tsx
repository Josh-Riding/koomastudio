"use client";

import { useEffect, useRef, useState } from "react";

export default function VideoSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) setVisible(true);
      },
      { threshold: 0.3 },
    );

    const element = ref.current;
    if (element) observer.observe(element);
    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  return (
    <section className="mt-24 w-full max-w-5xl text-center">
      <h2
        className={`mb-6 text-3xl font-bold transition-all duration-1000 ease-out ${
          visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        See It In Action
      </h2>

      <div
        ref={ref}
        className={`relative w-full overflow-hidden rounded-xl shadow-lg transition-all duration-1000 ease-out ${
          visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <video
          className="h-auto w-full"
          autoPlay
          loop
          muted
          controls
          playsInline
        >
          <source src="/videos/ksdemo.webm" type="video/webm" />
          <source src="/videos/ksdemo_ios.mp4" type="video/mp4" />
          <source src="/videos/ksdemo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  );
}
