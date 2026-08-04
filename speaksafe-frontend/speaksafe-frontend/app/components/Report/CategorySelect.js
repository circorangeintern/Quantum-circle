const categories = [
  { value: "bullying", label: "Bullying" },
  { value: "harassment", label: "Harassment" },
  { value: "violence", label: "Violence" },
  { value: "discrimination", label: "Discrimination" },
  { value: "mental-health", label: "Mental Health" },
  { value: "safety-hazard", label: "Safety Hazard" },
  { value: "other", label: "Other" },
];

const CategorySelect = ({ register, error }) => {
  return (
    <div>
      <label className="mb-2 block font-medium text-gray-800">
        Incident Category
      </label>

      <select
        defaultValue=""
        {...register("category", {
          required: "Please select a category",
        })}
        className={`w-full rounded-lg border bg-white p-3 outline-none transition ${
          error ? "border-red-500" : "border-gray-300 focus:border-black"
        }`}
      >
        <option value="" disabled>
          Select a category
        </option>

        {categories.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      {error && <p className="mt-2 text-sm text-red-500">{error.message}</p>}
    </div>
  );
};

export default CategorySelect;
