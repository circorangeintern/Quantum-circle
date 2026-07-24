import { Label } from "@/components/ui/label";

export default function SelectField({
  id,
  label,
  options,
  register,
  validation,
  errors,
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      <select
        id={id}
        {...register(id, validation)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        <option value="">Select...</option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      {errors[id] && (
        <p className="text-sm text-red-500">
          {errors[id].message}
        </p>
      )}
    </div>
  );
}