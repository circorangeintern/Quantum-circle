const LocationField = ({ register }) => {
  return (
    <div>
      <label className="mb-2 block font-medium text-gray-800">
        Location
        <span className="ml-1 text-sm text-gray-500">(Optional)</span>
      </label>

      <input
        type="text"
        placeholder="e.g. West dormitory, Block B"
        {...register("location")}
        className="w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-black"
      />
    </div>
  );
};

export default LocationField;
