import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | SpeakSafe",
  description: "Privacy policy for the SpeakSafe reporting platform.",
};

const sections = [
  { id: "introduction", title: "1. Introduction" },
  { id: "information", title: "2. Information We Collect" },
  { id: "anonymity", title: "3. Our Anonymity Commitment" },
  { id: "use", title: "4. How We Use Information" },
  { id: "sharing", title: "5. Data Sharing & Third-Party Services" },
  { id: "retention", title: "6. Data Retention" },
  { id: "rights", title: "7. Your Rights" },
  { id: "minors", title: "8. Students & Minors" },
  { id: "security", title: "9. Data Security" },
  { id: "changes", title: "10. Changes to This Policy" },
  { id: "contact", title: "11. Contact Us" },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-paper">
      {/* Hero banner */}
      <div className="text-navy px-5 py-8">
        <div className="mx-auto max-w-3xl">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-peri mb-3">Legal</span>
          <h1 className="text-4xl font-display font-bold mb-3">Privacy Policy</h1>
          <p className="text-navtext bg-navy w-fit p-2 rounded-md text-[10px] mb-5">
            Last updated: July 2026 · Version 1.0 · Applies to the SpeakSafe reporting platform
          </p>
          <div className="flex gap-4 text-[13.5px]">
            <Link href="/terms" className="text-peri hover:text-navy transition-colors font-medium">
              Terms &amp; Conditions →
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-5 pb-12">
        {/* Anonymity notice */}
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

          <section id="introduction" className="bg-white border border-border rounded-2xl px-6 py-6">
            <h2 className="text-[17px] font-display font-bold text-navy mb-3">1. Introduction</h2>
            <p className="text-[14.5px] text-text-muted leading-relaxed mb-3">
              SpeakSafe is an anonymous reporting platform that lets students report bullying,
              harassment, and safety concerns to a designated authority at their school, without
              revealing who they are.
            </p>
            <p className="text-[14.5px] text-text-muted leading-relaxed">
              This policy explains what information SpeakSafe collects, how it&apos;s used, and the
              choices available to you — whether you&apos;re a student submitting a report or a school
              authority using the dashboard. This policy applies to everyone who uses SpeakSafe:
              reporters, school authorities, and administrators.
            </p>
          </section>

          <section id="information" className="bg-white border border-border rounded-2xl px-6 py-6">
            <h2 className="text-[17px] font-display font-bold text-navy mb-3">2. Information We Collect</h2>

            <h3 className="text-[15px] font-semibold text-navy mb-2">If you&apos;re submitting a report</h3>
            <p className="text-[14.5px] text-text-muted leading-relaxed mb-3">
              The report form only asks for what&apos;s needed to route and act on your concern:
            </p>

            <div className="overflow-x-auto mb-4">
              <table className="w-full text-[13px] border-collapse">
                <thead>
                  <tr className="bg-paper text-left">
                    <th className="px-4 py-2 border border-border font-semibold text-navy">Field</th>
                    <th className="px-4 py-2 border border-border font-semibold text-navy">Required?</th>
                    <th className="px-4 py-2 border border-border font-semibold text-navy">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Category, description", "Required", "What happened, in your own words"],
                    ["Date/time, location, people involved", "Optional", "You choose how much detail to share"],
                    ["Evidence (photo, video, document)", "Optional", "Up to 25MB per file"],
                    ["Contact email", "Optional", "Only shown if you turn off anonymous reporting"],
                  ].map(([field, req, note]) => (
                    <tr key={field} className="even:bg-paper">
                      <td className="px-4 py-2 border border-border text-text-muted">{field}</td>
                      <td className="px-4 py-2 border border-border text-text-muted">{req}</td>
                      <td className="px-4 py-2 border border-border text-text-faint">{note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[14.5px] text-text-muted leading-relaxed font-medium mb-3">
              We never collect the following, even if anonymous reporting is turned off:
            </p>
            <ul className="space-y-3 mb-5">
              {[
                "Your device ID, browser fingerprint, or IP address tied to a report",
                "Your precise or ongoing location — only what you choose to type into the location field",
                "Any login or account credentials — reporting never requires an account",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-[14px] text-text-muted">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-peri shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <h3 className="text-[15px] font-semibold text-navy mb-2">If you&apos;re a school authority or administrator</h3>
            <p className="text-[14.5px] text-text-muted leading-relaxed mb-4">
              Because your role requires accountability, we collect your name, work email, school,
              role, and a securely hashed password. We also log account activity (like login times)
              for security purposes.
            </p>

            <h3 className="text-[15px] font-semibold text-navy mb-2">Analytics data</h3>
            <p className="text-[14.5px] text-text-muted leading-relaxed">
              We collect anonymous usage events (like &quot;report form started&quot; or &quot;status checked&quot;)
              to understand whether the product is working well. These events are tied to a
              temporary session identifier, never to a person, and never include the content of
              a report.
            </p>
          </section>

          <section id="anonymity" className="bg-white border border-border rounded-2xl px-6 py-6">
            <h2 className="text-[17px] font-display font-bold text-navy mb-3">3. Our Anonymity Commitment</h2>
            <div className="bg-amber-light border border-amber rounded-xl px-5 py-4 mb-4">
              <p className="text-[13.5px] font-bold text-amber mb-1">Core commitment</p>
              <p className="text-[13px] text-amber">
                If you report anonymously, nothing you submit can be traced back to you — not your
                device, not your name, nothing. This isn&apos;t a setting we might change later. It&apos;s
                the reason SpeakSafe exists.
              </p>
            </div>
            <p className="text-[14.5px] text-text-muted leading-relaxed mb-4">
              Anonymity is SpeakSafe&apos;s core design principle, not an optional feature. When you submit a report anonymously:
            </p>
            <ul className="space-y-3">
              {[
                "We generate a reference code that is the only way to look up your report's status — we don't ask for your name or contact details to do it.",
                "No identifying data point is stored against your report, by design at the database level.",
                "We periodically audit our own systems to confirm this holds true, and treat any gap as a critical issue, not a bug to schedule for later.",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-[14px] text-text-muted">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-peri shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section id="use" className="bg-white border border-border rounded-2xl px-6 py-6">
            <h2 className="text-[17px] font-display font-bold text-navy mb-3">4. How We Use Information</h2>
            <ul className="space-y-3 mb-4">
              {[
                "To route your report to the right school authority and let them review, categorize, and act on it",
                "To let you check your report's status using your reference code",
                "To manage authority and administrator accounts and permissions",
                "To keep an audit trail of authority actions, for accountability",
                "To understand, in aggregate and anonymously, how well the product is working, and where to improve it",
                "To keep the platform secure",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-[14px] text-text-muted">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-peri shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-[14.5px] text-text-muted leading-relaxed font-medium">
              We do not use your information for advertising, and we do not sell data to anyone.
            </p>
          </section>

          <section id="sharing" className="bg-white border border-border rounded-2xl px-6 py-6">
            <h2 className="text-[17px] font-display font-bold text-navy mb-3">5. Data Sharing &amp; Third-Party Services</h2>
            <p className="text-[14.5px] text-text-muted leading-relaxed mb-4">
              SpeakSafe relies on a small number of service providers to operate. We share only what each service needs to do its job:
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-[13px] border-collapse">
                <thead>
                  <tr className="bg-paper text-left">
                    <th className="px-4 py-2 border border-border font-semibold text-navy">Service</th>
                    <th className="px-4 py-2 border border-border font-semibold text-navy">Purpose</th>
                    <th className="px-4 py-2 border border-border font-semibold text-navy">What it may receive</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Hosting & infrastructure provider", "Runs the application and database", "All product data, as needed to host the service"],
                    ["Analytics provider", "Anonymous usage tracking and the KPI dashboard", "Anonymous event data only — no report content, no reporter identity"],
                    ["Email/notification service", "Sends account-related emails to authorities", "Authority email address only"],
                  ].map(([service, purpose, receives]) => (
                    <tr key={service} className="even:bg-paper">
                      <td className="px-4 py-2 border border-border text-text-muted">{service}</td>
                      <td className="px-4 py-2 border border-border text-text-muted">{purpose}</td>
                      <td className="px-4 py-2 border border-border text-text-faint">{receives}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[13px] text-text-faint">
              We do not share reporter information with any third party beyond what&apos;s listed here.
              If this list changes, we&apos;ll update this policy and note the date at the top of the page.
            </p>
          </section>

          <section id="retention" className="bg-white border border-border rounded-2xl px-6 py-6">
            <h2 className="text-[17px] font-display font-bold text-navy mb-3">6. Data Retention</h2>
            <ul className="space-y-3">
              {[
                "Reports and their status history are retained according to each school's configured retention setting.",
                "Authority and administrator account data is retained while the account is active, and removed within a reasonable period after an account is closed.",
                "Analytics events are retained in aggregate for product improvement and are not linked back to individual sessions over time.",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-[14px] text-text-muted">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-peri shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section id="rights" className="bg-white border border-border rounded-2xl px-6 py-6">
            <h2 className="text-[17px] font-display font-bold text-navy mb-3">7. Your Rights</h2>
            <h3 className="text-[15px] font-semibold text-navy mb-2">If you submitted a report anonymously</h3>
            <p className="text-[14.5px] text-text-muted leading-relaxed mb-3">
              Because we don&apos;t collect anything that identifies you, we have no way to look up
              &quot;your&quot; report except through the reference code you were given. This means:
            </p>
            <ul className="space-y-3 mb-5">
              {[
                "You can check your report's status anytime using your reference code.",
                "We can't process an access, correction, or deletion request tied to \"you\" as a person, because your report isn't linked to you in any retrievable way — that's the anonymity working as intended, not a gap in your rights.",
                "If you chose to share a contact email, you can email us to have that specific contact detail removed.",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-[14px] text-text-muted">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-peri shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <h3 className="text-[15px] font-semibold text-navy mb-2">If you&apos;re a school authority or administrator</h3>
            <p className="text-[14.5px] text-text-muted leading-relaxed">
              You can request access to, correction of, or deletion of your account information
              at any time by contacting your school&apos;s SpeakSafe administrator or using the
              contact details below.
            </p>
          </section>

          <section id="minors" className="bg-white border border-border rounded-2xl px-6 py-6">
            <h2 className="text-[17px] font-display font-bold text-navy mb-3">8. Students &amp; Minors</h2>
            <p className="text-[14.5px] text-text-muted leading-relaxed mb-3">
              SpeakSafe is designed for use by students, who may be minors. Because reporting
              requires no account, no login, and no identifying information, SpeakSafe does not
              knowingly collect personal information from children through the reporting flow.
            </p>
            <p className="text-[14.5px] text-text-muted leading-relaxed">
              Where a school deploys SpeakSafe, the school is responsible for informing students
              and families about its use, consistent with the school&apos;s own policies and applicable
              education privacy laws in its jurisdiction.
            </p>
          </section>

          <section id="security" className="bg-white border border-border rounded-2xl px-6 py-6">
            <h2 className="text-[17px] font-display font-bold text-navy mb-3">9. Data Security</h2>
            <p className="text-[14.5px] text-text-muted leading-relaxed">
              We use industry-standard safeguards to protect data in transit and at rest,
              including restricted access to the authority dashboard and encrypted password
              storage. No system is perfectly secure, but anonymity by design means that even
              in the unlikely event of a breach, reporter identity is not something that can
              be exposed, because it was never collected.
            </p>
          </section>

          <section id="changes" className="bg-white border border-border rounded-2xl px-6 py-6">
            <h2 className="text-[17px] font-display font-bold text-navy mb-3">10. Changes to This Policy</h2>
            <p className="text-[14.5px] text-text-muted leading-relaxed">
              We may update this policy as SpeakSafe evolves. When we do, we&apos;ll update the
              &quot;last updated&quot; date at the top of this page. Material changes will be communicated
              to school authorities in advance where practical.
            </p>
          </section>

          <section id="contact" className="bg-white border border-border rounded-2xl px-6 py-6">
            <h2 className="text-[17px] font-display font-bold text-navy mb-3">11. Contact Us</h2>
            <p className="text-[14.5px] text-text-muted leading-relaxed">
              Questions about this policy, or about how a specific school has configured
              SpeakSafe, can be directed to your school&apos;s designated SpeakSafe administrator,
              or to [project contact email to be added].
            </p>
          </section>

        </div>

        {/* Footer nav */}
        <div className="mt-14 pt-8 border-t border-border flex flex-wrap items-center justify-between gap-4 text-[13px] text-text-faint">
          <Link href="/terms" className="hover:text-navy transition-colors font-medium">Terms &amp; Conditions →</Link>
          <span>© 2026 SpeakSafe</span>
        </div>
      </div>
    </div>
  );
}
