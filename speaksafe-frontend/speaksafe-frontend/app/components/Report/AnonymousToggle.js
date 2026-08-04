const AnonymousToggle = ({ register }) => {
  return (
    <div className="flex items-center justify-between rounded-xl border p-4">
      <div>
        <h3 className="font-semibold">Report anonymously</h3>

        <p className="text-sm text-gray-500">
          No name or contact information will be collected.
        </p>
      </div>

      <input
        type="checkbox"
        defaultChecked
        {...register("anonymous")}
        className="h-5 w-5 accent-blue-700"
      />
    </div>
  );
};

export default AnonymousToggle;
