import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function InputField({
  id,
  label,
  type = "text",
  placeholder,
  register,
  validation,
  errors,
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        {...register(id, validation)}
      />

      {errors[id] && (
        <p className="text-sm text-red-500">
          {errors[id].message}
        </p>
      )}
    </div>
  );
}