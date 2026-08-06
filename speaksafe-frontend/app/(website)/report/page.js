"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ReportForm from "@/app/components/Report/ReportForm";

// School selection step — commented out until backend has GET /schools/public endpoint
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { getPublicSchools } from "@/app/lib/schools";
// import { Loader2, Search } from "lucide-react";
//
// function SchoolPicker() {
//   const router = useRouter();
//   const [schools, setSchools] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [query, setQuery] = useState("");
//
//   useEffect(() => {
//     getPublicSchools()
//       .then((data) => {
//         const list = data?.data?.schools ?? data?.data ?? data?.schools ?? [];
//         setSchools(list);
//       })
//       .catch(() => setError("Could not load schools. Please try again."))
//       .finally(() => setLoading(false));
//   }, []);
//
//   const filtered = schools.filter((s) =>
//     s.name?.toLowerCase().includes(query.toLowerCase())
//   );
//
//   function select(school) {
//     router.push(`/report?school=${school.id}`);
//   }
//
//   return (
//     <section className="min-h-screen bg-paper flex items-start justify-center px-4 py-12">
//       <div className="w-full max-w-lg">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-navy">Report an Incident</h1>
//           <p className="mt-2 text-[14.5px] text-text-muted">
//             First, select your school so your report reaches the right authority.
//           </p>
//         </div>
//         <div className="relative mb-5">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
//           <input
//             type="text"
//             placeholder="Search for your school…"
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             className="w-full pl-9 pr-4 py-3 border border-border rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-blue/30 bg-white"
//           />
//         </div>
//         {loading && (
//           <div className="flex items-center justify-center py-16">
//             <Loader2 className="w-6 h-6 animate-spin text-peri" />
//           </div>
//         )}
//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
//             {error}
//           </div>
//         )}
//         {!loading && !error && filtered.length === 0 && (
//           <div className="text-center py-12 text-text-faint text-[13.5px]">
//             {query ? `No schools found for "${query}"` : "No schools available yet."}
//           </div>
//         )}
//         {!loading && !error && filtered.length > 0 && (
//           <div className="flex flex-col gap-2">
//             {filtered.map((school) => (
//               <button
//                 key={school.id}
//                 onClick={() => select(school)}
//                 className="w-full text-left bg-white border border-border hover:border-blue/40 hover:bg-peri-light rounded-xl px-5 py-4 transition-colors group"
//               >
//                 <p className="text-[14px] font-semibold text-navy group-hover:text-blue">
//                   {school.name}
//                 </p>
//                 {school.address && (
//                   <p className="text-[12px] text-text-faint mt-0.5">{school.address}</p>
//                 )}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }

function ReportPageContent() {
  const searchParams = useSearchParams();
  const schoolId = searchParams.get("school");
  return <ReportForm schoolId={schoolId} />;
}

export default function ReportPage() {
  return (
    <Suspense>
      <ReportPageContent />
    </Suspense>
  );
}
