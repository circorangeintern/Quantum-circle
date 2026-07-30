"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import IncidentTitle from "./IncidentTitle";
import CategorySelect from "./CategorySelect";
import DescriptionField from "./DescriptionField";
import DateTimeField from "./DateTimeField";
import LocationField from "./LocationField";
import PeopleField from "./PeopleField";
import EvidenceUpload from "./EvidenceUpload";
import SubmitButton from "./SubmitButton";
import AnonymousToggle from "./AnonymousToggle";
import PrivacyNotice from "./PrivacyNotice";
import { createReport } from "@/app/lib/reports";

const ReportForm = ({ schoolId }) => {
  const router = useRouter();
  const [apiErrors, setApiErrors] = useState({});
  const [rateLimitError, setRateLimitError] = useState("");

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

  const isAnonymous = watch("anonymous");

  const onSubmit = async (data) => {
    // Clear previous API errors
    setApiErrors({});
    setRateLimitError("");

    // Build multipart/form-data payload
    const formData = new FormData();
    formData.append("category", data.category);
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("isAnonymous", String(data.anonymous ?? true));

    if (data.contactEmail) {
      formData.append("contactEmail", data.contactEmail);
    }
    if (data.incidentDate) {
      formData.append("incidentDate", data.incidentDate);
    }
    if (data.location) {
      formData.append("location", data.location);
    }
    if (data.peopleInvolved) {
      formData.append("peopleInvolved", data.peopleInvolved);
    }

    // Attach schoolId if present in URL
    if (schoolId) {
      formData.append("schoolId", schoolId);
    }

    // Attach files (evidence array from EvidenceUpload)
    if (Array.isArray(data.evidence)) {
      data.evidence.forEach((file) => {
        formData.append("attachments", file);
      });
    }

    try {
      const result = await createReport(formData);
      const referenceCode = result?.data?.referenceCode;

      reset();
      router.push(`/report/success?ref=${referenceCode}`);
    } catch (error) {
      const status = error?.response?.status;
      const responseData = error?.response?.data;

      if (status === 400) {
        // Map field-level errors from errors[] array
        const fieldErrors = {};
        if (Array.isArray(responseData?.errors)) {
          responseData.errors.forEach(({ field, message }) => {
            if (field) {
              fieldErrors[field] = message;
            }
          });
        }
        setApiErrors(fieldErrors);

        // Show a general error toast if no field-level errors were mapped
        if (Object.keys(fieldErrors).length === 0) {
          toast.error(responseData?.message || "Please check your submission and try again.");
        } else {
          toast.error("Please fix the errors below and try again.");
        }
      } else if (status === 429) {
        const msg =
          responseData?.message ||
          "You've submitted too many reports recently. Please try again later.";
        setRateLimitError(msg);
        toast.error(msg);
      } else {
        toast.error(
          responseData?.message || "Something went wrong. Please try again."
        );
      }
    }
  };

  return (
    <section className="mx-auto my-10 w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 md:w-2xl">
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
        <IncidentTitle register={register} error={errors.title || (apiErrors.title ? { message: apiErrors.title } : undefined)} />

        <CategorySelect register={register} error={errors.category || (apiErrors.category ? { message: apiErrors.category } : undefined)} />

        <DescriptionField register={register} error={errors.description || (apiErrors.description ? { message: apiErrors.description } : undefined)} />

        <DateTimeField register={register} />

        <LocationField register={register} />

        <PeopleField register={register} />

        <EvidenceUpload watch={watch} setValue={setValue} />

        <AnonymousToggle register={register} />

        {/* Contact email — required when not anonymous */}
        {!isAnonymous && (
          <div className="flex flex-col gap-1">
            <label
              htmlFor="contactEmail"
              className="text-sm font-medium text-gray-700"
            >
              Contact Email <span className="text-red-500">*</span>
            </label>
            <input
              id="contactEmail"
              type="email"
              placeholder="your@email.com"
              {...register("contactEmail", {
                required: "Contact email is required when not reporting anonymously.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address.",
                },
              })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {(errors.contactEmail || apiErrors.contactEmail) && (
              <p className="text-sm text-red-500">
                {errors.contactEmail?.message || apiErrors.contactEmail}
              </p>
            )}
          </div>
        )}

        <PrivacyNotice />

        {/* Rate-limit error banner */}
        {rateLimitError && (
          <div
            role="alert"
            className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800"
          >
            {rateLimitError}
          </div>
        )}

        <SubmitButton isSubmitting={isSubmitting} />
      </form>
    </section>
  );
};

export default ReportForm;
