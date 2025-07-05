"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  Download,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";

const BackgroundRemover = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loadingStage, setLoadingStage] = useState<
    "uploading" | "initializing" | "processing" | "finalizing"
  >("uploading");
  const [progress, setProgress] = useState(0);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("@/lib/workers/worker-remove-bg", import.meta.url)
    );

    workerRef.current.onmessage = (event) => {
      const {
        type,
        stage,
        progress: workerProgress,
        output,
        error: workerError,
      } = event.data;

      if (type === "progress") {
        setLoadingStage(stage);
        setProgress(workerProgress);
      } else if (type === "complete") {
        const img = output;
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.putImageData(
            new ImageData(img.data, img.width, img.height),
            0,
            0
          );
        }
        setOutputUrl(canvas.toDataURL("image/png"));
        setProgress(100);
        setLoading(false);
      } else if (type === "error") {
        setError(`Error processing: ${workerError}`);
        console.error(workerError);
        setLoading(false);
        setProgress(0);
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const startBackgroundRemoval = async (file: File) => {
    setLoading(true);
    setError(null);
    setOutputUrl(null);
    setLoadingStage("uploading");
    setProgress(20);
    workerRef.current?.postMessage(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith("image/")) {
      setImageFile(files[0]);
    }
  };

  const getLoadingMessage = () => {
    switch (loadingStage) {
      case "uploading":
        return "Uploading image...";
      case "initializing":
        return "Initializing AI model...";
      case "processing":
        return "Removing background...";
      case "finalizing":
        return "Finalizing...";
      default:
        return "Processing...";
    }
  };

  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(sizeInBytes / 1024 / 1024).toFixed(1)} MB`;
    }
  };

  const resetAll = () => {
    setImageFile(null);
    setOutputUrl(null);
    setError(null);
    setLoading(false);
    setProgress(0);
  };

  useEffect(() => {
    if (imageFile) {
      startBackgroundRemoval(imageFile);
    }
  }, [imageFile]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br mt-10 from-background to-muted/20 p-4">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            AI-Powered
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Background Remover
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Remove backgrounds from your images instantly using advanced AI
            technology
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Upload Area */}
          {!outputUrl && !loading && (
            <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                <div
                  className={`relative rounded-lg border-2 border-dashed transition-all duration-200 ${
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                  }`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={loading}
                      ref={fileInputRef}
                      onChange={(e) => {
                        setImageFile(e.target.files?.[0] || null);
                      }}
                    />
                    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                      <div className="mb-4 p-4 rounded-full bg-primary/10">
                        <Upload className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        Drop your image here
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        or click to browse files
                      </p>
                      <div className="flex gap-2 mb-6">
                        <Badge variant="secondary">JPG</Badge>
                        <Badge variant="secondary">PNG</Badge>
                        <Badge variant="secondary">WEBP</Badge>
                      </div>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-2 cursor-pointer"
                      >
                        <Upload className="h-4 w-4" />
                        Select Image
                      </Button>
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <Card>
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full border-4 border-primary/20"></div>
                      <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {progress}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">
                      {getLoadingMessage()}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Please wait while we process your image
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Processing...</span>
                      <span>{progress}% complete</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Processing Failed</AlertTitle>
              <AlertDescription className="mt-2">
                {error}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetAll}
                  className="mt-3 gap-2 bg-transparent"
                >
                  <RotateCcw className="h-4 w-4" />
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Results */}
          {outputUrl && !loading && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold">
                    Background removed successfully!
                  </h3>
                </div>
                <Button
                  variant="outline"
                  onClick={resetAll}
                  className="gap-2 bg-transparent cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  Process Another
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Original Image */}
                {imageFile && (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Original</CardTitle>
                        <Badge variant="secondary">
                          {formatFileSize(imageFile.size)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-square rounded-lg overflow-hidden border bg-muted/50">
                        <img
                          src={
                            URL.createObjectURL(imageFile) || "/placeholder.svg"
                          }
                          alt="Original"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Processed Image */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Result</CardTitle>
                      <Badge className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        No Background
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-square rounded-lg overflow-hidden border relative">
                      {/* Transparency pattern */}
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='10' height='10' fill='%23e5e7eb'/%3e%3crect x='10' y='10' width='10' height='10' fill='%23e5e7eb'/%3e%3c/svg%3e")`,
                          backgroundSize: "20px 20px",
                        }}
                      ></div>
                      <img
                        src={outputUrl || "/placeholder.svg"}
                        alt="Background removed"
                        className="relative w-full h-full object-contain"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Download Button */}
              <div className="flex justify-center pt-4">
                <a href={outputUrl} download="background-removed.png">
                  <Button size="lg" className="gap-2 cursor-pointer">
                    <Download className="h-5 w-5 " />
                    Download Image
                  </Button>
                </a>
              </div>
            </div>
          )}

          {/* Instructions */}
          {!outputUrl && !loading && !error && (
            <Card className="bg-muted/30">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-center">How it works</h3>
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <p className="text-sm font-medium">Upload Image</p>
                    <p className="text-xs text-muted-foreground">
                      Choose your image file
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <p className="text-sm font-medium">AI Processing</p>
                    <p className="text-xs text-muted-foreground">
                      Wait for automatic processing
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <p className="text-sm font-medium">Download</p>
                    <p className="text-xs text-muted-foreground">
                      Get your processed image
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackgroundRemover;
