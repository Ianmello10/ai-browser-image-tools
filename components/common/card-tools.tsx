"use client";

import type React from "react";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Scissors,
  Search,
  Sparkles,
  Users,
  ImageIcon,
  Zap,
} from "lucide-react";
import Link from "next/link";

interface Tool {
  name: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  category: string;
  features: string[];
  color: string;
}

const ToolsShowcase = () => {
  const [tools] = useState<Tool[]>([
    {
      name: "Background Remover",
      description:
        "Remove backgrounds from your images with precision using advanced AI technology. Perfect for e-commerce and professional design work.",
      path: "/remove-bg",
      icon: <Scissors className="h-8 w-8" />,
      category: "Editing",
      features: ["Advanced AI", "High Precision", "Batch Processing"],
      color: "from-blue-500/10 to-purple-500/10",
    },
    {
      name: "Image Upscaler",
      description:
        "Enhance image resolution up to 4x without quality loss. Ideal for prints, presentations, and high-definition displays.",
      path: "/image-upscale",
      icon: <Search className="h-8 w-8" />,
      category: "Enhancement",
      features: ["2x Resolution", "Lossless Quality", "Super Fast"],
      color: "from-primary/10 to-blue-500/10",
    },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background pb-25">
      <div className="container mx-auto max-w-6xl p-6 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-8 py-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Premium AI Tools
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-foreground">
              AI Image Tools
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transform your images with professional AI-powered tools. Get
              stunning results in seconds, no technical knowledge required.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <Card className="border-primary/20 bg-gradient-to-br from-background to-muted/30">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary">
                  {tools.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Tools Available
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-500/20 bg-gradient-to-br from-background to-green-500/5">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-600">10K+</div>
                <div className="text-sm text-muted-foreground">Happy Users</div>
              </CardContent>
            </Card>
            <Card className="border-blue-500/20 bg-gradient-to-br from-background to-blue-500/5">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <ImageIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-600">1M+</div>
                <div className="text-sm text-muted-foreground">
                  Images Processed
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {tools.map((tool, index) => (
            <Card
              key={tool.name}
              className="group relative overflow-hidden border-2 border-muted/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2"
            >
              {/* Background Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              {/* Category Badge */}
              <div className="absolute top-4 right-4 z-10">
                <Badge
                  variant="outline"
                  className="bg-background/80 backdrop-blur-sm"
                >
                  {tool.category}
                </Badge>
              </div>

              <CardHeader className="relative z-10 text-center pb-4">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <div className="text-primary">{tool.icon}</div>
                  </div>
                </div>

                <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors duration-300">
                  {tool.name}
                </CardTitle>
                <CardDescription className="text-base leading-relaxed mt-2">
                  {tool.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="relative z-10 space-y-6">
                {/* Features */}
                <div className="flex flex-wrap justify-center gap-2">
                  {tool.features.map((feature) => (
                    <Badge
                      key={feature}
                      variant="secondary"
                      className="text-xs"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                {/* Action Button */}
                <div className="flex justify-center">
                  <Link href={tool.path}>
                    <Button
                      size="lg"
                      className="group/btn gap-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4 transition-transform duration-300 group-hover/btn:rotate-12" />
                      Get Started
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>

              {/* Bottom Accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ToolsShowcase;
