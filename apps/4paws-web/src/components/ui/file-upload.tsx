import { useState, useRef } from "react";
import { Upload, Camera, X } from "lucide-react";
import { Button } from "./button";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  showCamera?: boolean;
  preview?: string;
  onClearPreview?: () => void;
}

export function FileUpload({ 
  onFileSelect, 
  accept = "image/*", 
  maxSize = 10 * 1024 * 1024,
  showCamera = false,
  preview,
  onClearPreview
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.size > maxSize) {
      alert(`File size must be less than ${maxSize / 1024 / 1024}MB`);
      return;
    }
    onFileSelect(file);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  if (preview) {
    return (
      <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-border" data-testid="file-upload-preview">
        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        {onClearPreview && (
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2"
            onClick={onClearPreview}
            data-testid="button-clear-preview"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full" data-testid="file-upload">
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
          dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleChange}
          data-testid="input-file"
        />
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Camera className="w-8 h-8 text-primary" />
        </div>
        <p className="font-medium text-foreground mb-1">Click to upload or drag and drop</p>
        <p className="text-sm text-muted-foreground">PNG, JPG up to {maxSize / 1024 / 1024}MB</p>
        <Button className="mt-4" type="button" data-testid="button-choose-file">
          <Upload className="w-4 h-4 mr-2" />
          Choose File
        </Button>
      </div>
      {showCamera && (
        <div className="mt-4 lg:hidden">
          <Button className="w-full" variant="outline" data-testid="button-take-photo">
            <Camera className="w-4 h-4 mr-2" />
            Take Photo Now
          </Button>
        </div>
      )}
    </div>
  );
}
