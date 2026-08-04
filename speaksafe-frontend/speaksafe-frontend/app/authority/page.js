import { redirect } from "next/navigation";

export default function AuthorityIndex() {
  redirect("/authority/dashboard");
}