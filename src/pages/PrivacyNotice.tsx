import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Seo } from "@/components/Seo";
import {
  LEGAL_LAST_UPDATED,
  PRIVACY_CONTACT_EMAIL,
  PRIVACY_VERSION,
} from "@/lib/legal";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-2">
    <h2 className="text-lg font-semibold text-foreground">{title}</h2>
    <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
  </section>
);

const PrivacyNotice = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-16">
      <Seo
        title="Privacy Notice | Vellyn"
        description="How Vellyn collects, uses and protects your account, nutrition and health-adjacent information."
        path="/privacy"
      />
      <div className="container max-w-2xl mx-auto px-4 pt-4">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Privacy Notice</h1>
        </div>

        <p className="text-xs text-muted-foreground mb-6">
          Version {PRIVACY_VERSION} · Last updated {LEGAL_LAST_UPDATED} · UK English
        </p>

        <div className="space-y-6 bg-card rounded-2xl p-5 shadow-card border border-border/60">
          <Section title="1. Who we are">
            <p>
              Vellyn is a nutrition and wellbeing app. This notice explains what personal
              information we collect, why we use it, and the choices you have. Vellyn is a
              wellness and nutrition tool. It does not provide medical advice, diagnosis or
              treatment, and it is not a medical device.
            </p>
          </Section>

          <Section title="2. Age requirement">
            <p>
              Vellyn is currently available to adults aged 18 or over only. You must confirm
              you are 18 or over when you create an account. If we learn an account belongs to
              someone under 18, we will close it and delete the associated data.
            </p>
          </Section>

          <Section title="3. Information we collect">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Account details:</strong> email address, password (stored in hashed form
                by our authentication provider), display or full name.
              </li>
              <li>
                <strong>Profile details:</strong> age, gender, height, weight and weight history,
                activity level, dietary preference, allergies and excluded foods.
              </li>
              <li>
                <strong>Food and nutrition data:</strong> meals and drinks you log, portion sizes,
                estimated calories and macronutrients, water intake, and photos of food you choose
                to upload.
              </li>
              <li>
                <strong>Routines, goals and preferences:</strong> meal times, wake and sleep times,
                workout routines, lifestyle modes, non-negotiable habits, goals and check-ins.
              </li>
              <li>
                <strong>Health-adjacent information:</strong> body measurements, wellbeing goals,
                activity and workout logs, and any health metrics you enter manually (for example
                steps, sleep hours or heart-rate figures). In UK GDPR terms some of this may be
                treated as special-category data concerning health, which is why we ask for your
                separate explicit consent.
              </li>
              <li>
                <strong>Voice input:</strong> if you use voice features, the audio you record is
                sent for transcription and the resulting text is processed to understand what you
                logged or asked.
              </li>
              <li>
                <strong>Usage and diagnostic data:</strong> feature interactions, recommendation
                feedback, and technical logs needed to run and debug the service.
              </li>
            </ul>
          </Section>

          <Section title="4. Why we use your information">
            <ul className="list-disc pl-5 space-y-1">
              <li>To create and secure your account and provide the app's core features.</li>
              <li>
                To personalise nutrition guidance: estimating what you eat, identifying patterns,
                suggesting realistic small changes and generating recommendations.
              </li>
              <li>To show your own history, progress and summaries back to you.</li>
              <li>To handle payments and subscriptions where you choose to subscribe.</li>
              <li>To maintain, secure, debug and improve the service.</li>
            </ul>
            <p>
              Our lawful bases are: performance of a contract with you (providing the app),
              your explicit consent (health-adjacent personalisation), our legitimate interests
              (security and service improvement) and legal obligation (financial records).
            </p>
          </Section>

          <Section title="5. AI processing">
            <p>
              Food photo analysis, voice transcription, meal parsing, insights and the Ask Vellyn
              and Hey Vellyn assistants are powered by third-party AI models accessed through the
              Lovable AI gateway. At the time of writing these include Google Gemini models for
              text and image understanding and transcription, and an OpenAI text-to-speech model
              for spoken replies. The model providers we use may change; we will keep this notice
              up to date.
            </p>
            <p>
              The content sent to these models is limited to what is needed for the request, such
              as the photo or audio you submit and relevant profile and nutrition context. AI
              output is an estimate and can be inaccurate. It is general nutrition information,
              not medical advice.
            </p>
          </Section>

          <Section title="6. Service providers we use">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Supabase</strong> (via Lovable Cloud) — database, authentication, file
                storage for photos, and server-side functions.
              </li>
              <li>
                <strong>Lovable AI gateway</strong> — routing requests to the AI models described
                above.
              </li>
              <li>
                <strong>Stripe</strong> — payment and subscription processing. Vellyn does not
                store your card details; Stripe processes them directly.
              </li>
            </ul>
          </Section>

          <Section title="7. International processing">
            <p>
              Some of these providers, and the AI models they route to, may process data outside
              the United Kingdom, including in the European Economic Area and the United States.
              Where that happens, transfers rely on the providers' standard safeguards, such as
              the UK International Data Transfer Addendum or standard contractual clauses.
            </p>
          </Section>

          <Section title="8. How long we keep information">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>While your account is active:</strong> we keep your account, profile,
                nutrition logs, photos and related records so the app can show your history and
                personalise guidance.
              </li>
              <li>
                <strong>Deletion requests:</strong> when you submit a deletion request in
                Privacy &amp; Security, we record it and aim to action it promptly, normally
                within 30 days. Deletion is currently actioned by our team rather than by an
                automatic purge, so the request is logged first and completed afterwards.
              </li>
              <li>
                <strong>Backups:</strong> copies of data may remain in routine encrypted backups
                held by our infrastructure provider for a limited period (typically up to 30 days)
                after deletion, after which they are overwritten in the normal backup cycle.
              </li>
              <li>
                <strong>Payment records:</strong> transaction records held by Stripe and by us may
                be retained for as long as required by UK tax and accounting law.
              </li>
              <li>
                <strong>Consent records:</strong> records of consent given, declined or withdrawn
                are kept as evidence of compliance.
              </li>
            </ul>
          </Section>

          <Section title="9. Your rights">
            <p>
              Under UK GDPR you have the right to access your data, correct it, request its
              erasure, restrict or object to processing, request portability, and withdraw consent
              at any time. Withdrawing consent does not affect processing carried out before you
              withdrew it.
            </p>
            <p>
              You can withdraw your health-personalisation consent and submit a deletion request
              in the app under Settings → Privacy &amp; Security. For any other request, or if you
              want to raise a concern, contact us at{" "}
              <a className="text-primary underline" href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>
                {PRIVACY_CONTACT_EMAIL}
              </a>
              . You also have the right to complain to the UK Information Commissioner's Office
              (ico.org.uk).
            </p>
          </Section>

          <Section title="10. Security">
            <p>
              Your data is stored with per-user access rules so that you can only read and write
              your own records, and food photos are held in private storage. No system is entirely
              risk-free; please use a strong, unique password.
            </p>
          </Section>

          <Section title="11. Changes to this notice">
            <p>
              If we make material changes we will update the version number above and ask you to
              review the notice again in the app.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyNotice;
