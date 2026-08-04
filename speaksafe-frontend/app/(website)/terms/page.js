import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions | SpeakSafe",
  description: "Terms and conditions for the SpeakSafe reporting platform.",
};

const sections = [
  { id: "acceptance", title: "1. Acceptance of Terms" },
  { id: "description", title: "2. Description of Service" },
  { id: "eligibility", title: "3. Eligibility & School Deployment" },
  { id: "acceptable-use", title: "4. Acceptable Use of Anonymous Reporting" },
  { id: "accounts", title: "5. Authority & Admin Accounts" },
  { id: "content", title: "6. Content & Evidence Submissions" },
  { id: "no-guarantee", title: "7. No Guarantee of Outcome or Response Time" },
  { id: "third-party", title: "8. Third-Party Services" },
  { id: "ip", title: "9. Intellectual Property" },
  { id: "liability", title: "10. Limitation of Liability" },
  { id: "termination", title: "11. Suspension & Termination" },
  { id: "governing-law", title: "12. Governing Law" },
  { id: "changes", title: "13. Changes to These Terms" },
  { id: "contact", title: "14. Contact Us" },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-paper">
      {/* Hero banner */}
      <div className="text-navy px-5 py-8">
        <div className="mx-auto max-w-3xl">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-peri mb-3">Legal</span>
          <h1 className="text-4xl font-display font-bold mb-3">Terms &amp; Conditions</h1>
          <p className="text-navtext bg-navy w-fit p-2 rounded-md text-[10px] mb-5">
            Last updated: July 2026 · Version 1.0 · Applies to the SpeakSafe reporting platform
          </p>
          <div className="flex gap-4 text-[13.5px]">
            <Link href="/privacy" className="text-peri hover:text-navy transition-colors font-medium">
              Privacy Policy →
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-5 pb-12">
        {/* Emergency notice */}
        <div className="bg-amber-light border border-amber rounded-2xl px-5 py-4 mb-10 flex gap-3">
          <span className="text-amber text-xl mt-0.5">⚠</span>
          <div>
            <p className="text-[13.5px] font-bold text-amber mb-1">SpeakSafe is not an emergency service.</p>
            <p className="text-[13px] text-amber">
              If you or someone else is in immediate danger, contact your local emergency services
              or a trusted adult right away. Reports submitted through SpeakSafe are reviewed by a
              school authority, not monitored in real time.
            </p>
          </div>
        </div>

        {/* TOC */}
        <div className="bg-white border border-border rounded-2xl px-6 py-5 mb-10">
          <p className="text-[11px] font-bold uppercase tracking-widest text-text-faint mb-4">On this page</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-[13px] text-blue hover:text-navy transition-colors flex items-center gap-1.5"
              >
                <span className="w-1 h-1 rounded-full bg-peri shrink-0" />
                {s.title}
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-5">

          <section id="acceptance" className="bg-white border border-border rounded-2xl px-6 py-6">
            <h2 className="text-[17px] font-display font-bold text-navy mb-3">1. Acceptance of Terms</h2>
            <p className="text-[14.5px] text-text-muted leading-relaxed">
              By submitting a report, or by accessing SpeakSafe as a school authority or
              administrator, you agree to these Terms &amp; Conditions and to our{" "}
              <Link href="/privacy" className="text-blue hover:underline font-medium">Privacy Policy</Link>.
              If you don&apos;t agree, please don&apos;t use the platform.
            </p>
          </section>

          <section id="description" className="bg-white border border-border rounded-2xl px-6 py-6">
            <h2 className="text-[17px] font-display font-bold text-navy mb-3">2. Description of Service</h2>
            <p className="text-[14.5px] text-text-muted leading-relaxed">
              SpeakSafe is a reporting tool that lets students submit anonymous or identified
              reports about bullying, harassment, and other safety concerns to a designated
              authority at their school. School authorities use the SpeakSafe dashboard to
              review, triage, and respond to reports.
            </p>
          </section>

          <section id="eligibility" className="bg-white border border-border rounded-2xl px-6 py-6">
            <h2 className="text-[17px] font-display font-bold text-navy mb-3">3. Eligibility &amp; School Deployment</h2>
            <p className="text-[14.5px] text-text-muted leading-relaxed">
              SpeakSafe is deployed on a per-school basis. A school&apos;s use of SpeakSafe, and any
              rules about who may report or who may hold an authority account, are set by that
              school. Authority and administrator accounts are limited to staff authorized by
              the school.
            </p>
          </section>

          <section id="acceptable-use" className="bg-white border border-border rounded-2xl px-6 py-6">
            <h2 className="text-[17px] font-display font-bold text-navy mb-3">4. Acceptable Use of Anonymous Reporting</h2>
            <p className="text-[14.5px] text-text-muted leading-relaxed mb-4">
              Anonymous reporting exists to help real concerns get heard safely. To keep it
              trustworthy for everyone:
            </p>
            <ul className="space-y-3">
              {[
                "Reports should be submitted in good faith, based on what you've experienced or witnessed.",
                "Knowingly false or malicious reports undermine a tool meant to protect people, and may be addressed by the school according to its own policies.",
                "Don't use the report form to submit content that is unlawful, or evidence obtained in a way that violates someone else's rights.",
                "We don't ask who you are, so we generally can't verify the details of a report beyond what a school authority determines through its own review.",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-[14px] text-text-muted">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-peri shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section id="accounts" className="bg-white border border-border rounded-2xl px-6 py-6">
            <h2 className="text-[17px] font-display font-bold text-navy mb-3">5. Authority &amp; Admin Accounts</h2>
            <p className="text-[14.5px] text-text-muted leading-relaxed mb-4">
              If you hold an authority or administrator account, you&apos;re responsible for keeping
              your login credentials confidential and for all activity under your account.
            </p>
            <ul className="space-y-3">
              {[
                "Use the dashboard only for its intended purpose: reviewing and responding to reports as part of your role at your school.",
                "Access granted through the Admin Panel may be reviewed, adjusted, or revoked by your school's administrator at any time.",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-[14px] text-text-muted">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-peri shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section id="content" className="bg-white border border-border rounded-2xl px-6 py-6">
            <h2 className="text-[17px] font-display font-bold text-navy mb-3">6. Content &amp; Evidence Submissions</h2>
            <p className="text-[14.5px] text-text-muted leading-relaxed">
              Anything you submit with a report — description, evidence files, or other details —
              is provided so the relevant school authority can review and act on your concern. By
              submitting content, you confirm you have the right to share it, and you grant
              SpeakSafe and the relevant school a license to use it solely for reviewing and
              responding to your report.
            </p>
          </section>

          <section id="no-guarantee" className="bg-white border border-border rounded-2xl px-6 py-6">
            <h2 className="text-[17px] font-display font-bold text-navy mb-3">7. No Guarantee of Outcome or Response Time</h2>
            <p className="text-[14.5px] text-text-muted leading-relaxed">
              SpeakSafe is a reporting and case-management tool, not a guarantee of a specific
              outcome. Reports are reviewed and acted on by school authorities, who set their own
              priorities and response times. SpeakSafe does not investigate reports itself and is
              not responsible for how a school ultimately handles a report.
            </p>
          </section>

          <section id="third-party" className="bg-white border border-border rounded-2xl px-6 py-6">
            <h2 className="text-[17px] font-display font-bold text-navy mb-3">8. Third-Party Services</h2>
            <p className="text-[14.5px] text-text-muted leading-relaxed">
              SpeakSafe relies on third-party providers for hosting, analytics, and related
              infrastructure, as described in our{" "}
              <Link href="/privacy" className="text-blue hover:underline font-medium">Privacy Policy</Link>.
              We aren&apos;t responsible for the availability or performance of those services, though
              we choose providers that meet our security and privacy standards.
            </p>
          </section>

          <section id="ip" className="bg-white border border-border rounded-2xl px-6 py-6">
            <h2 className="text-[17px] font-display font-bold text-navy mb-3">9. Intellectual Property</h2>
            <p className="text-[14.5px] text-text-muted leading-relaxed">
              The SpeakSafe name, logo, and platform design belong to the SpeakSafe project.
              Schools using SpeakSafe are granted the right to use the platform as intended;
              this doesn&apos;t transfer ownership of the underlying product to any school or user.
            </p>
          </section>

          <section id="liability" className="bg-white border border-border rounded-2xl px-6 py-6">
            <h2 className="text-[17px] font-display font-bold text-navy mb-3">10. Limitation of Liability</h2>
            <p className="text-[14.5px] text-text-muted leading-relaxed">
              SpeakSafe is provided &quot;as is.&quot; To the fullest extent permitted by law, SpeakSafe
              and its team aren&apos;t liable for indirect, incidental, or consequential damages
              arising from use of the platform, including delays in a school&apos;s response, technical
              outages, or decisions made by a school authority. Nothing in this section limits
              liability where it can&apos;t be limited under applicable law.
            </p>
          </section>

          <section id="termination" className="bg-white border border-border rounded-2xl px-6 py-6">
            <h2 className="text-[17px] font-display font-bold text-navy mb-3">11. Suspension &amp; Termination</h2>
            <p className="text-[14.5px] text-text-muted leading-relaxed mb-3">
              A school administrator may suspend or remove an authority account at any time.
            </p>
            <p className="text-[14.5px] text-text-muted leading-relaxed">
              We may suspend access to the platform if we reasonably believe it&apos;s being used to
              cause harm, submit knowingly false reports at scale, or compromise the security of
              the system.
            </p>
          </section>

          <section id="governing-law" className="bg-white border border-border rounded-2xl px-6 py-6">
            <h2 className="text-[17px] font-display font-bold text-navy mb-3">12. Governing Law</h2>
            <p className="text-[14.5px] text-text-muted leading-relaxed">
              These terms are governed by the laws of [jurisdiction to be confirmed], without
              regard to conflict-of-law principles.
            </p>
          </section>

          <section id="changes" className="bg-white border border-border rounded-2xl px-6 py-6">
            <h2 className="text-[17px] font-display font-bold text-navy mb-3">13. Changes to These Terms</h2>
            <p className="text-[14.5px] text-text-muted leading-relaxed">
              We may update these terms as SpeakSafe evolves. We&apos;ll update the &quot;last updated&quot;
              date at the top of this page when we do, and will flag material changes to school
              authorities where practical.
            </p>
          </section>

          <section id="contact" className="bg-white border border-border rounded-2xl px-6 py-6">
            <h2 className="text-[17px] font-display font-bold text-navy mb-3">14. Contact Us</h2>
            <p className="text-[14.5px] text-text-muted leading-relaxed">
              Questions about these terms can be directed to your school&apos;s designated SpeakSafe
              administrator, or to [project contact email to be added].
            </p>
          </section>

        </div>

        {/* Footer nav */}
        <div className="mt-14 pt-8 border-t border-border flex flex-wrap items-center justify-between gap-4 text-[13px] text-text-faint">
          <Link href="/privacy" className="hover:text-navy transition-colors font-medium">Privacy Policy →</Link>
          <span>© 2026 SpeakSafe</span>
        </div>
      </div>
    </div>
  );
}
