"use client";

import { useForm } from "react-hook-form";

import IncidentTitle from "./IncidentTitle";
import CategorySelect from "./CategorySelect";
import DescriptionField from "./DescriptionField";
import DateTimeField from "./DateTimeField";
import LocationField from "./LocationField";
import PeopleField from "./PeopleField";
import EvidenceUpload from "./EvidenceUpload";
import SubmitButton from "./SubmitButton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const ReportForm = () => {
  const router = useRouter();

  const {
    register,
    watch,
    reset,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      anonymous: true,
      evidence: [],
    },
  });

  const onSubmit = async (data) => {
    const trackingId = generateTrackingId();

    const report = {
      ...data,
      trackingId,
      status: "Open",
      submitted: new Date().toISOString().split("T")[0],
      updates: [
        {
          title: "Report submitted",
          date: new Date().toISOString().split("T")[0],
        },
      ],
    };

    // Get existing reports
    const reports = JSON.parse(localStorage.getItem("reports")) || [];

    // Add the new report
    reports.push(report);

    // Save back to localStorage
    localStorage.setItem("reports", JSON.stringify(reports));

    try {
      await toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
        loading: "Submitting report...",
        success: "Report submitted successfully!",
        error: "Something went wrong.",
      });

      reset();

      router.push(`/report/success?ref=${trackingId}`);
    } catch (error) {
      console.error(error);
    }
  };

  const generateTrackingId = () => {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();

    return `SS-${year}-${random}`;
  };

  return (
    <section className="mx-auto my-10  w-full md:w-2xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Report an Incident</h1>

        <p className="mt-3 text-gray-600">
          Share what happened. You choose how much to tell us — this can stay
          completely anonymous.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit, () => {
          toast.error("Please complete all required fields.");
        })}
        className="flex flex-col gap-5"
      >
        <IncidentTitle register={register} error={errors.title} />

        <CategorySelect register={register} error={errors.category} />

        <DescriptionField register={register} error={errors.description} />

        <DateTimeField register={register} />

        <LocationField register={register} />

        <PeopleField register={register} />

        <EvidenceUpload watch={watch} setValue={setValue} />

        {/* <AnonymousToggle register={register} />

        <PrivacyNotice /> */}

        <SubmitButton isSubmitting={isSubmitting} />
      </form>
    </section>
  );
};

export default ReportForm;
