"use client";

import { motion } from "framer-motion";
import { Circle } from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

function ElegantShape({
    className,
    delay = 0,
    width = 400,
    height = 100,
    rotate = 0,
    gradient = "from-white/[0.08]",
}: {
    className?: string;
    delay?: number;
    width?: number;
    height?: number;
    rotate?: number;
    gradient?: string;
}) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: -150,
                rotate: rotate - 15,
            }}
            animate={{
                opacity: 1,
                y: 0,
                rotate: rotate,
            }}
            transition={{
                duration: 2.4,
                delay,
                ease: [0.23, 0.86, 0.39, 0.96],
                opacity: { duration: 1.2 },
            }}
            className={cn("absolute", className)}
        >
            <motion.div
                animate={{
                    y: [0, 15, 0],
                }}
                transition={{
                    duration: 12,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
                style={{
                    width,
                    height,
                }}
                className="relative"
            >
                <div
                    className={cn(
                        "absolute inset-0 rounded-full",
                        "bg-gradient-to-r",
                        gradient,
                        "backdrop-blur-[2px] border border-white/[0.18]",
                        "shadow-[0_8px_32px_0_rgba(255,255,255,0.08)]",
                        "after:absolute after:inset-0 after:rounded-full",
                        "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15),transparent_70%)]"
                    )}
                />
            </motion.div>
        </motion.div>
    );
}

function HeroGeometric({
    badge = "OmniParse AI",
    title1 = "OmniParse",
    title2 = "AI Document Intelligence",
    children
}: {
    badge?: string;
    title1?: string;
    title2?: string;
    children?: React.ReactNode;
}) {
    const [bgScale, setBgScale] = useState(1);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        // Calculate distance from center as a ratio (0 at center, 1 at edges)
        const rect = e.currentTarget.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const dx = (e.clientX - rect.left - cx) / cx;
        const dy = (e.clientY - rect.top - cy) / cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Scale from 1.0 to 1.08 based on how far from center the cursor is
        setBgScale(1 + dist * 0.08);
    };

    const handleMouseLeave = () => {
        setBgScale(1);
    };

    const fadeUpVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
                delay: 0.5 + i * 0.2,
                ease: [0.25, 0.4, 0.25, 1],
            },
        }),
    };

    return (
        <div
            className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.12] via-transparent to-rose-500/[0.12] blur-3xl" />

            {/* Background shapes container — zooms with cursor */}
            <div
                className="absolute inset-0 overflow-hidden"
                style={{
                    transform: `scale(${bgScale})`,
                    transition: "transform 0.4s ease-out",
                }}
            >
                {/* Shape 1 — Violet → Fuchsia (top-left large) */}
                <ElegantShape
                    delay={0.3}
                    width={800}
                    height={180}
                    rotate={12}
                    gradient="from-violet-600/[0.55] via-fuchsia-500/[0.35] to-transparent"
                    className="left-[-12%] md:left-[-6%] top-[10%] md:top-[15%]"
                />

                {/* Shape 2 — Rose → Orange (bottom-right large) */}
                <ElegantShape
                    delay={0.5}
                    width={700}
                    height={160}
                    rotate={-15}
                    gradient="from-rose-500/[0.55] via-orange-400/[0.30] to-transparent"
                    className="right-[-8%] md:right-[-2%] top-[65%] md:top-[70%]"
                />

                {/* Shape 3 — Cyan → Blue (bottom-left medium) */}
                <ElegantShape
                    delay={0.4}
                    width={450}
                    height={110}
                    rotate={-8}
                    gradient="from-cyan-400/[0.50] via-blue-500/[0.28] to-transparent"
                    className="left-[2%] md:left-[6%] bottom-[2%] md:bottom-[6%]"
                />

                {/* Shape 4 — Emerald → Teal (top-right small) */}
                <ElegantShape
                    delay={0.6}
                    width={300}
                    height={80}
                    rotate={20}
                    gradient="from-emerald-400/[0.50] via-teal-400/[0.28] to-transparent"
                    className="right-[10%] md:right-[15%] top-[5%] md:top-[8%]"
                />

                {/* Shape 5 — Amber → Pink (top-center tiny) */}
                <ElegantShape
                    delay={0.7}
                    width={220}
                    height={60}
                    rotate={-25}
                    gradient="from-amber-400/[0.55] via-pink-400/[0.30] to-transparent"
                    className="left-[15%] md:left-[20%] top-[2%] md:top-[5%]"
                />
            </div>

            <div className="relative z-10 container mx-auto px-4 md:px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        custom={0}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8 md:mb-12"
                    >
                        <Circle className="h-2 w-2 fill-rose-500/80" />
                        <span className="text-sm text-white/60 tracking-wide">
                            {badge}
                        </span>
                    </motion.div>

                    <motion.div
                        custom={1}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-4 tracking-tight" style={{ fontFamily: 'Outfit' }}>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-neutral-100 via-zinc-300 to-neutral-400">
                                {title1}
                            </span>
                        </h1>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium mb-6 md:mb-8 tracking-wide" style={{ fontFamily: 'Inter' }}>
                            <span
                                className={cn(
                                    "bg-clip-text text-transparent bg-gradient-to-r from-gray-400 via-white/80 to-gray-500"
                                )}
                            >
                                {title2}
                            </span>
                        </h2>
                    </motion.div>

                    <motion.div
                        custom={2}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {children}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export { HeroGeometric }
