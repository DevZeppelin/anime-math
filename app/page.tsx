'use client';

import dynamic from "next/dynamic";

const Game = dynamic(() => import("@/components/Game"));

export default function Page() {
  return <Game />;
}
