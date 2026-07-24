"use client";
import { RequestsTable } from "@/app/components/admin/RequestsTable";
import { useAdmin } from "@/lib/admin/AdminContext";


export default function RequestsPage() {
  const { signupRequests } = useAdmin();
  return <RequestsTable list={signupRequests} />;
}