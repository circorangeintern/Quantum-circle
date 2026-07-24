"use client";
import { AuthoritiesTable } from "@/app/components/admin/AuthoritiesTable";
import { useAdmin } from "@/lib/admin/AdminContext";
import { seedAuthorities } from "@/lib/admin/data";


export default function AuthoritiesPage() {
  const { signupRequests } = useAdmin();
  const approved = signupRequests.filter((r) => r.status === "Approved");
  const all = [
    ...seedAuthorities,
    ...approved.map((r) => ({ name: r.name, role: r.role, school: r.school, email: r.email })),
  ];
  return <AuthoritiesTable list={all} />;
}