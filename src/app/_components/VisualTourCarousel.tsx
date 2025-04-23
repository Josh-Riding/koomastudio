"use client";

import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const images = [
  {
    src: "/screenshots/new2.png",
    alt: "Create a New Note",
    label: "Start fresh with a single click",
  },
  {
    src: "/screenshots/editor2.png",
    alt: "Edit and Post Unfinished Notes",
    label: "Edit privately, publish proudly",
  },
  {
    src: "/screenshots/library2.png",
    alt: "See All Your Drafts",
    label: "Every note, always within reach",
  },
];

export default function VisualTourCarousel() {
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 1, spacing: 16 },
  });

  const timeout = useRef<NodeJS.Timeout>();
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const slider = instanceRef.current;
    const clear = () => clearTimeout(timeout.current);
    const next = () => slider?.next();

    const autoPlay = () => {
      clear();
      timeout.current = setTimeout(() => {
        if (!paused) next();
        autoPlay();
      }, 4000);
    };

    autoPlay();
    return clear;
  }, [paused, instanceRef]);

  return (
    <section className="mt-24 w-full max-w-4xl text-center">
      <h2 className="mb-4 text-2xl font-bold">Screenshots from the Editor</h2>
      <p className="mb-6 text-white/70">
        Peek at the tools that keep your content process flowing.
      </p>
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="relative"
      >
        <div ref={sliderRef} className="keen-slider overflow-hidden">
          {images.map((image, i) => (
            <div
              key={i}
              className="keen-slider__slide flex flex-col items-center px-4"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="max-h-[480px] w-full rounded-md object-contain"
              />
              <div className="mt-4 rounded-md bg-white/5 px-4 py-3 backdrop-blur-sm">
                <p className="text-base font-medium text-white">
                  {image.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => instanceRef.current?.prev()}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-gray-500/20 p-2 text-white hover:bg-gray-500/30"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={() => instanceRef.current?.next()}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-gray-500/20 p-2 text-white hover:bg-gray-500/30"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
}
