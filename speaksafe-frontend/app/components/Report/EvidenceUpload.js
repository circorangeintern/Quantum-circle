"use client";

import { useRef } from "react";
import {
  Upload,
  FileText,
  FileVideo,
  Image as ImageIcon,
  X,
} from "lucide-react";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_FILES = 5;

const EvidenceUpload = ({ watch, setValue }) => {
  const inputRef = useRef(null);

  const files = watch("evidence") || [];

  const formatSize = (size) => {
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const addFiles = (newFiles) => {
    let merged = [...files, ...newFiles];

    // remove duplicates
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

    // remove oversized files
    merged = merged.filter((file) => file.size <= MAX_FILE_SIZE);

    // limit
    merged = merged.slice(0, MAX_FILES);

    setValue("evidence", merged, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleChange = (e) => {
    addFiles(Array.from(e.target.files));

    // reset input so same file can be selected again
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();

    addFiles(Array.from(e.dataTransfer.files));
  };

  const removeFile = (index) => {
    const updated = files.filter((_, i) => i !== index);

    setValue("evidence", updated, {
      shouldDirty: true,
    });
  };

  const renderIcon = (file) => {
    if (file.type.startsWith("image")) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="h-14 w-14 rounded-lg object-cover"
        />
      );
    }

    if (file.type.startsWith("video")) {
      return <FileVideo className="text-red-500" size={28} />;
    }

    return <FileText className="text-blue-500" size={28} />;
  };

  return (
    <div>
      <label className="mb-2 block font-medium text-gray-800">
        Evidence
        <span className="ml-1 text-sm text-gray-500">
          (Optional — photos, videos or documents)
        </span>
      </label>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="overflow-hidden rounded-xl border-2 border-dashed border-gray-300"
      >
        <div className="flex flex-col items-center p-10 text-center">
          <Upload className="mb-4 text-blue-600" size={40} />

          <h3 className="font-semibold">Drag & Drop files here</h3>

          <p className="mt-2 text-sm text-gray-500">or click below to browse</p>

          <button
            type="button"
            onClick={() => inputRef.current.click()}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
          >
            Choose Files
          </button>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx"
            className="hidden"
            onChange={handleChange}
          />
        </div>

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
                    {renderIcon(file)}

                    <div>
                      <p className="font-medium break-all">{file.name}</p>

                      <p className="text-sm text-gray-500">
                        {formatSize(file.size)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="rounded-full p-2 transition hover:bg-red-100"
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
                className="mt-5 text-sm font-medium text-blue-600 hover:text-blue-700"
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
