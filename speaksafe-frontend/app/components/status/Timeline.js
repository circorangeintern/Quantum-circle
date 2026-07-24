export default function Timeline({ updates }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Progress</h3>

      {updates.map((update, index) => (
        <div key={index} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-blue-600" />

            {index !== updates.length - 1 && (
              <div className="w-[2px] flex-1 bg-gray-300 mt-1" />
            )}
          </div>

          <div className="pb-6">
            <p className="text-sm text-gray-500">{update.date}</p>
            <p>{update.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
