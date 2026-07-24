const IncidentTitle = ({ register, error }) => {
  return (
    <div className="space-y-2">
      <label className="mb-2 block font-medium text-gray-800">
        Incident Title
      </label>

      <input
        type="text"
        placeholder="A short summary, e.g. Bullying in the hostel"
        {...register("title", {
          required: "Incident title is required",
          minLength: {
            value: 5,
            message: "Title should contain at least 5 characters",
          },
        })}
        className={`w-full rounded-lg border p-3 outline-none transition ${
          error ? "border-red-500" : "border-gray-300 focus:border-black"
        }`}
      />

      {error && <p className="mt-2 text-sm text-red-500">{error.message}</p>}
    </div>
  );
};

export default IncidentTitle;
