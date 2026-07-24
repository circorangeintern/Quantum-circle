export function AuthoritiesTable({ list }) {
  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr className="bg-[#FAFBFE]">
              {["Name", "Role", "School", "Email"].map((h) => (
                <th
                  key={h}
                  className="text-left text-[10.5px] uppercase tracking-wider text-text-faint font-bold px-4 py-3 border-b border-border"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((u, i) => {
              const initials = u.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <tr key={i} className="hover:bg-[#FAFBFE]">
                  <td className="px-4 py-3.5 border-b border-border">
                    <div className="flex items-center gap-2.5">
                      <div className="w-[30px] h-[30px] rounded-full bg-peri text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                        {initials}
                      </div>
                      {u.name}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-text-faint text-[12.5px] border-b border-border">
                    {u.role}
                  </td>
                  <td className="px-4 py-3.5 text-text-faint text-[12.5px] border-b border-border">
                    {u.school}
                  </td>
                  <td className="px-4 py-3.5 text-text-faint text-[12.5px] border-b border-border">
                    {u.email}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
