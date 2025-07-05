"use client";

import type React from "react";

import { useState, useEffect, useRef, useCallback } from "react";
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
  Zap,
} from "lucide-react";

const ImageUpscaler = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [upscaledImageUrl, setUpscaledImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState<
    "uploading" | "initializing" | "processing" | "finalizing"
  >("uploading");
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Worker initialization
  useEffect(() => {
    workerRef.current = new Worker(
      new URL("@/lib/workers/upscale-worker", import.meta.url)
    );

    workerRef.current.onmessage = (event) => {
      const {
        type,
        stage,
        progress: workerProgress,
        output,
        error: workerError,
      } = event.data;

      switch (type) {
        case "progress":
          setLoadingStage(stage);
          setProgress(workerProgress);
          break;
        case "complete":
          handleUpscaleComplete(output);
          break;
        case "error":
          handleUpscaleError(workerError);
          break;
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleUpscaleComplete = useCallback(
    (upscaledImage: { data: Uint8Array; width: number; height: number }) => {
      const canvas = document.createElement("canvas");
      canvas.width = upscaledImage.width;
      canvas.height = upscaledImage.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const rgbaData = convertRgbToRgba(
          upscaledImage.data,
          upscaledImage.width,
          upscaledImage.height
        );
        const imageData = new ImageData(
          new Uint8ClampedArray(rgbaData),
          upscaledImage.width,
          upscaledImage.height
        );
        ctx.putImageData(imageData, 0, 0);
        setUpscaledImageUrl(canvas.toDataURL("image/png"));
      }
      setProgress(100);
      setLoading(false);
    },
    []
  );

  const handleUpscaleError = useCallback((workerError: string) => {
    setError(`Processing error: ${workerError}`);
    console.error(workerError);
    setLoading(false);
    setProgress(0);
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith("image/")) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    resetState();
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const startUpscale = () => {
    if (imageUrl) {
      setLoading(true);
      setError(null);
      setUpscaledImageUrl(null);
      setLoadingStage("uploading");
      setProgress(10);
      workerRef.current?.postMessage(imageUrl);
    }
  };

  const resetState = () => {
    setImageFile(null);
    setImageUrl(null);
    setUpscaledImageUrl(null);
    setError(null);
    setLoading(false);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getLoadingMessage = useCallback(() => {
    const messages = {
      uploading: "Loading image...",
      initializing: "Initializing AI model...",
      processing: "Upscaling image...",
      finalizing: "Finalizing...",
    };
    return messages[loadingStage] || "Processing...";
  }, [loadingStage]);

  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(sizeInBytes / 1024 / 1024).toFixed(1)} MB`;
    }
  };

  const convertRgbToRgba = (
    rgbData: Uint8Array,
    width: number,
    height: number
  ): Uint8ClampedArray => {
    const rgbaData = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      rgbaData[i * 4] = rgbData[i * 3];
      rgbaData[i * 4 + 1] = rgbData[i * 3 + 1];
      rgbaData[i * 4 + 2] = rgbData[i * 3 + 2];
      rgbaData[i * 4 + 3] = 255; // Alpha channel
    }
    return rgbaData;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 mt-10">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Zap className="h-4 w-4" />
            AI-Powered
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Image Upscaler</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enhance your images with AI technology. Increase resolution by 2x
            while maintaining quality and details.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Upload Area */}
          {!imageUrl && (
            <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                <div
                  className={`relative rounded-lg border-2 border-dashed transition-all duration-200 ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={() => setIsDragging(true)}
                  onDragLeave={() => setIsDragging(false)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  role="button"
                  tabIndex={0}
                >
                  <label className="block cursor-pointer">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept="image/png, image/jpeg, image/webp"
                      disabled={loading}
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
                        <Badge variant="secondary">PNG</Badge>
                        <Badge variant="secondary">JPEG</Badge>
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
                  onClick={resetState}
                  className="mt-3 gap-2 bg-transparent"
                >
                  <RotateCcw className="h-4 w-4" />
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Image Processing Area */}
          {imageUrl && (
            <div className="space-y-6">
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
                          Please wait while we enhance your image
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

              {/* Image Comparison */}
              {!loading && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Original Image */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Original</CardTitle>
                        {imageFile && (
                          <Badge variant="secondary">
                            {formatFileSize(imageFile.size)}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-square rounded-lg overflow-hidden border bg-muted/50">
                        <img
                          src={imageUrl || "/placeholder.svg"}
                          alt="Original"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Upscaled Image */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          Enhanced (2x)
                        </CardTitle>
                        {upscaledImageUrl ? (
                          <Badge className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Ready
                          </Badge>
                        ) : (
                          <Badge variant="outline">Waiting</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-square rounded-lg overflow-hidden border bg-muted/50 flex items-center justify-center">
                        {upscaledImageUrl ? (
                          <img
                            src={upscaledImageUrl || "/placeholder.svg"}
                            alt="Upscaled"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                              <Sparkles className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Enhanced image will appear here
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Action Buttons */}
              {!loading && (
                <div className="flex justify-center gap-4 pt-4">
                  {!upscaledImageUrl ? (
                    <>
                      <Button onClick={startUpscale} className="gap-2">
                        <Zap className="h-4 w-4" />
                        Start AI Upscale
                      </Button>
                      <Button
                        variant="outline"
                        onClick={resetState}
                        className="gap-2 bg-transparent"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <a
                        className="cursor-pointer"
                        href={upscaledImageUrl}
                        download="upscaled-image.png"
                      >
                        <Button className="gap-2 cursor-pointer">
                          <Download className="h-4 w-4" />
                          Download Enhanced
                        </Button>
                      </a>
                      <Button
                        variant="outline"
                        onClick={resetState}
                        className="gap-2 bg-transparent cursor-pointer"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Process Another
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          {!imageUrl && !loading && !error && (
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
                    <p className="text-sm font-medium">AI Enhancement</p>
                    <p className="text-xs text-muted-foreground">
                      Upscale to 2x resolution
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <p className="text-sm font-medium">Download</p>
                    <p className="text-xs text-muted-foreground">
                      Get your enhanced image
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

export default ImageUpscaler;
