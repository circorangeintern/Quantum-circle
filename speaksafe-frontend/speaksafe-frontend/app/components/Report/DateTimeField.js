const DateTimeField = ({ register }) => {
  return (
    <div>
      <label className="mb-2 block font-medium text-gray-800">
        Date & Time
        <span className="ml-1 text-sm text-gray-500">(Optional)</span>
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <input
          type="date"
          {...register("date")}
          className="rounded-lg border border-gray-300 p-3 outline-none transition focus:border-black"
        />

        <input
          type="time"
          {...register("time")}
          className="rounded-lg border border-gray-300 p-3 outline-none transition focus:border-black"
        />
      </div>
    </div>
  );
};

export default DateTimeField;
