import { Label } from "@/components/ui/label";

export default function CheckboxField({
  id,
  label,
  register,
  validation,
  errors,
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          className="mt-1 h-4 w-4 accent-[#142353]"
          {...register(id, validation)}
        />

        <Label htmlFor={id} className="text-sm leading-6">
          {label}
        </Label>
      </div>

      {errors[id] && (
        <p className="text-sm text-red-500">
          {errors[id].message}
        </p>
      )}
    </div>
  );
}