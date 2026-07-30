"use client";

import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, X } from "lucide-react";

// Requirements 3.7, 12.3: accept images only; reject files > 5 MB
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 242 880 bytes
const MAX_FILES = 5;

const EvidenceUpload = ({ watch, setValue }) => {
  const inputRef = useRef(null);

  // fileErrors: array of { name, reason } for rejected files
  const [fileErrors, setFileErrors] = useState([]);

  const files = watch("evidence") || [];

  const formatSize = (size) => {
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const addFiles = (newFiles) => {
    const rejected = [];
    const accepted = [];

    for (const file of newFiles) {
      if (!file.type.startsWith("image/")) {
        rejected.push({ name: file.name, reason: "Only image files are allowed." });
      } else if (file.size > MAX_FILE_SIZE) {
        rejected.push({
          name: file.name,
          reason: `File is too large (${formatSize(file.size)}). Maximum size is 5 MB.`,
        });
      } else {
        accepted.push(file);
      }
    }

    // Update inline error messages (replace on each selection)
    setFileErrors(rejected);

    let merged = [...files, ...accepted];

    // Remove duplicates
    merged = merged.filter(
      (file, index, self) =>
        index ===
        self.findIndex(
          (f) =>
            f.name === file.name &&
            f.size === file.size &&
            f.lastModified === file.lastModified,
        ),
    );

    // Limit total count
    merged = merged.slice(0, MAX_FILES);

    setValue("evidence", merged, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleChange = (e) => {
    addFiles(Array.from(e.target.files));
    // Reset input so the same file can be re-selected after removal
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    addFiles(Array.from(e.dataTransfer.files));
  };

  const removeFile = (index) => {
    const updated = files.filter((_, i) => i !== index);
    setValue("evidence", updated, { shouldDirty: true });
  };

  return (
    <div>
      <label className="mb-2 block font-medium text-gray-800">
        Evidence
        <span className="ml-1 text-sm text-gray-500">(Optional — images only, max 5 MB each)</span>
      </label>

      {/* Drop zone — min-h-[44px] min-w-[44px] for touch target (Requirement 12.3) */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="min-h-[44px] min-w-[44px] overflow-hidden rounded-xl border-2 border-dashed border-gray-300"
      >
        <div className="flex flex-col items-center p-10 text-center">
          <Upload className="mb-4 text-blue-600" size={40} aria-hidden="true" />

          <h3 className="font-semibold">Drag &amp; Drop images here</h3>

          <p className="mt-2 text-sm text-gray-500">or click below to browse</p>

          {/* Upload button — min-h-[44px] min-w-[44px] for touch target (Requirement 12.3) */}
          <button
            type="button"
            onClick={() => inputRef.current.click()}
            aria-label="Choose image files to upload"
            className="mt-5 min-h-[44px] min-w-[44px] rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
          >
            Choose Files
          </button>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleChange}
            aria-label="Upload evidence images"
          />
        </div>

        {/* Rejected file error messages (Requirement 3.7) */}
        {fileErrors.length > 0 && (
          <div
            role="alert"
            aria-live="polite"
            className="border-t border-red-200 bg-red-50 px-5 py-3"
          >
            <p className="mb-2 text-sm font-semibold text-red-700">
              The following file{fileErrors.length > 1 ? "s were" : " was"} not added:
            </p>
            <ul className="space-y-1">
              {fileErrors.map((err, i) => (
                <li key={`${err.name}-${i}`} className="text-sm text-red-600">
                  <span className="font-medium">{err.name}</span> — {err.reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {files.length > 0 && (
          <div className="border-t bg-gray-50 p-5">
            <h4 className="mb-4 font-semibold">
              Selected Files ({files.length}/{MAX_FILES})
            </h4>

            <div className="space-y-3">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-14 w-14 rounded-lg object-cover"
                    />

                    <div>
                      <p className="break-all font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatSize(file.size)}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    aria-label={`Remove ${file.name}`}
                    className="min-h-[44px] min-w-[44px] rounded-full p-2 transition hover:bg-red-100"
                  >
                    <X size={18} className="text-red-500" />
                  </button>
                </div>
              ))}
            </div>

            {files.length < MAX_FILES && (
              <button
                type="button"
                onClick={() => inputRef.current.click()}
                className="mt-5 min-h-[44px] text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                + Add more files
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EvidenceUpload;
