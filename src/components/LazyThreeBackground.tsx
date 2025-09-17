"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import ThreeBackground only on the client side
const DynamicThreeBackground = dynamic(
  () => import("./ThreeBackground"),
  { 
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 -z-10">
        <div 
          className="w-full h-full"
          style={{ background: '#1A1735' }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20" />
      </div>
    )
  }
);

export default function LazyThreeBackground() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only render the dynamic component on the client side
  if (!isClient) {
    return (
      <div className="absolute inset-0 -z-10">
        <div 
          className="w-full h-full"
          style={{ background: '#1A1735' }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20" />
      </div>
    );
  }

  return <DynamicThreeBackground />;
}