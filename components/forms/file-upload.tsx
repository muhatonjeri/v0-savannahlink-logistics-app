"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText, Image as ImageIcon, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  id: string;
  label: string;
  accept?: string;
  maxSize?: number; // in MB
  value?: string | null;
  onChange: (url: string | null) => void;
  showCamera?: boolean;
  className?: string;
}

export function FileUpload({
  id,
  label,
  accept = "image/*",
  maxSize = 5,
  value,
  onChange,
  showCamera = false,
  className,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);

    // Validate file type
    if (accept && !accept.includes("*")) {
      const acceptedTypes = accept.split(",").map((t) => t.trim());
      const isValidType = acceptedTypes.some((type) => {
        if (type.endsWith("/*")) {
          return file.type.startsWith(type.replace("/*", ""));
        }
        return file.type === type;
      });
      if (!isValidType) {
        setError("Invalid file type");
        return;
      }
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File must be less than ${maxSize}MB`);
      return;
    }

    setIsUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        // In a real app, you would upload to Vercel Blob here
        // For now, we store the data URL as a mock
        onChange(dataUrl);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
  };

  const isImage = preview?.startsWith("data:image");

  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>

      {preview ? (
        <div className="relative rounded-lg border border-border bg-muted/50 p-4">
          {isImage ? (
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-border">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">File uploaded</p>
                <p className="text-xs text-muted-foreground">Click remove to change</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">File uploaded</p>
                <p className="text-xs text-muted-foreground">Click remove to change</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 transition-colors hover:border-primary/50 hover:bg-muted/50",
              isUploading && "pointer-events-none opacity-50"
            )}
          >
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Click to upload</p>
                  <p className="text-xs text-muted-foreground">
                    Max {maxSize}MB
                  </p>
                </div>
              </>
            )}
          </div>

          {showCamera && (
            <Button
              type="button"
              variant="outline"
              onClick={() => cameraRef.current?.click()}
              className="gap-2"
            >
              <Camera className="h-4 w-4" />
              Take Photo
            </Button>
          )}

          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
          />

          {showCamera && (
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleInputChange}
              className="hidden"
            />
          )}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
