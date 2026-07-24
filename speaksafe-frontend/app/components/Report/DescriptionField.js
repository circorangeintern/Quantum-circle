const DescriptionField = ({ register, error }) => {
  return (
    <div>
      <label className="mb-2 block font-medium text-gray-800">
        Detailed Description
      </label>

      <textarea
        rows={7}
        placeholder="Describe what happened, as much or as little as you're comfortable sharing."
        {...register("description", {
          required: "Please provide a description.",
          minLength: {
            value: 20,
            message: "Description must be at least 20 characters.",
          },
        })}
        className={`w-full rounded-lg border p-3 outline-none transition resize-none ${
          error ? "border-red-500" : "border-gray-300 focus:border-black"
        }`}
      />

      {error && <p className="mt-2 text-sm text-red-500">{error.message}</p>}
    </div>
  );
};

export default DescriptionField;
