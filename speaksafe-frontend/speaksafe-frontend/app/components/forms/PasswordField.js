"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PasswordField({
  id,
  label,
  placeholder,
  register,
  validation,
  errors,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          {...register(id, validation)}
          className="pr-10"
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {errors[id] && (
        <p className="text-sm text-red-500">{errors[id].message}</p>
      )}
    </div>
  );
}
