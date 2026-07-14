import { redirect } from "next/navigation";

export default function PatientRedirect() {
  // Redirect `/patient` to the existing `/patient/explore` route
  redirect("/patient/explore");
}
