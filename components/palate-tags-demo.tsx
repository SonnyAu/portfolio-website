"use client";

import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Check, X } from "lucide-react";

interface TagState {
  [dishId: string]: {
    [tagId: string]: boolean;
  };
}

export default function PalateTagsDemo() {
  const [dishes] = useState<string[]>([
    "Dish 1",
    "Dish 2",
    "Dish 3",
    "Dish 4",
    "Dish 5",
  ]);

  const [tags] = useState<string[]>([
    "Tag 1",
    "Tag 2",
    "Tag 3",
    "Tag 4",
    "Tag 5",
    "Tag 6",
  ]);

  const [tagStates, setTagStates] = useState<TagState>(() => {
    // Initialize with some random tags already set
    const initial: TagState = {};
    dishes.forEach((dish, dishIdx) => {
      initial[dish] = {};
      tags.forEach((tag, tagIdx) => {
        // Set some tags to true for visual interest
        initial[dish][tag] = (dishIdx + tagIdx) % 3 === 0;
      });
    });
    return initial;
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, []);

  const toggleTag = (dishId: string, tagId: string) => {
    setTagStates((prev) => {
      const newState = { ...prev };
      if (!newState[dishId]) {
        newState[dishId] = {};
      }
      newState[dishId] = {
        ...newState[dishId],
        [tagId]: !newState[dishId]?.[tagId],
      };
      return newState;
    });
  };

  const isTagActive = (dishId: string, tagId: string): boolean => {
    return tagStates[dishId]?.[tagId] || false;
  };

  return (
    <div ref={containerRef} className="w-full max-w-6xl mx-auto bg-[#0f0f0f] border border-neutral-800 rounded-lg p-4 md:p-6">
      <div className="mb-4 pb-4 border-b border-neutral-800">
        <h3 className="text-sm md:text-base font-f1-bold text-[#00D2BE] mb-2">
          Tag Editor
        </h3>
        <p className="text-xs text-neutral-400 font-f1">
          Click any cell to toggle tags for each dish
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-[#0f0f0f] border border-neutral-800 px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-f1-bold text-[#00D2BE] min-w-[100px]">
                Dish
              </th>
              {tags.map((tag) => (
                <th
                  key={tag}
                  className="border border-neutral-800 px-2 md:px-3 py-2 md:py-3 text-center text-xs md:text-sm font-f1-bold text-neutral-300 min-w-[80px]"
                >
                  {tag}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dishes.map((dish) => (
              <tr key={dish} className="hover:bg-neutral-900/30 transition-colors">
                <td className="sticky left-0 z-10 bg-[#0f0f0f] border border-neutral-800 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-f1-bold text-white">
                  {dish}
                </td>
                {tags.map((tag) => {
                  const isActive = isTagActive(dish, tag);
                  return (
                    <td
                      key={tag}
                      onClick={() => toggleTag(dish, tag)}
                      className={`border border-neutral-800 px-2 md:px-3 py-2 md:py-3 text-center cursor-pointer transition-all duration-200 ${
                        isActive
                          ? "bg-[#00D2BE]/20 hover:bg-[#00D2BE]/30"
                          : "bg-neutral-900/50 hover:bg-neutral-800"
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        {isActive ? (
                          <Check
                            size={16}
                            className="text-[#00D2BE]"
                            strokeWidth={3}
                          />
                        ) : (
                          <X
                            size={14}
                            className="text-neutral-600"
                            strokeWidth={2}
                          />
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 border-t border-neutral-800">
        <p className="text-xs text-neutral-500 font-f1 text-center">
          Changes are saved automatically
        </p>
      </div>
    </div>
  );
}

