const categories = [
  "Bullying",
  "Harassment",
  "Sexual Misconduct",
  "Discrimination",
  "Physical Assault",
  "Academic Misconduct",
  "Theft",
  "Vandalism",
  "Drug Abuse",
  "Other",
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

        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      {error && <p className="mt-2 text-sm text-red-500">{error.message}</p>}
    </div>
  );
};

export default CategorySelect;
