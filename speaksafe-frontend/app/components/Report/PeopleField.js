const PeopleField = ({ register }) => {
  return (
    <div>
      <label
        htmlFor="peopleInvolved"
        className="mb-2 block font-medium text-gray-800"
      >
        People Involved
        <span className="ml-1 text-sm font-normal text-gray-500">
          (Optional)
        </span>
      </label>

      <input
        id="peopleInvolved"
        type="text"
        placeholder="Names, roles, or descriptions — whatever you know"
        {...register("peopleInvolved")}
        className="w-full rounded-lg border border-gray-300 p-3 outline-none transition duration-200 focus:border-black "
      />

      <p className="mt-2 text-sm text-gray-500">
        If you know who was involved, you can mention their names, roles, or a
        brief description. Leave this blank if you're unsure.
      </p>
    </div>
  );
};

export default PeopleField;
