import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Seo } from "@/components/Seo";
import {
  LEGAL_LAST_UPDATED,
  PRIVACY_CONTACT_EMAIL,
  TERMS_VERSION,
} from "@/lib/legal";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-2">
    <h2 className="text-lg font-semibold text-foreground">{title}</h2>
    <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
  </section>
);

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-16">
      <Seo
        title="Terms of Use | Vellyn"
        description="The terms that apply when you use the Vellyn nutrition and wellbeing app."
        path="/terms"
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
          <h1 className="text-xl font-bold text-foreground">Terms of Use</h1>
        </div>

        <p className="text-xs text-muted-foreground mb-6">
          Version {TERMS_VERSION} · Last updated {LEGAL_LAST_UPDATED} · UK English
        </p>

        <div className="space-y-6 bg-card rounded-2xl p-5 shadow-card border border-border/60">
          <Section title="1. About these terms">
            <p>
              These terms apply when you create an account and use Vellyn. By creating an account
              you agree to them. If you do not agree, please do not use the service.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <p>
              Vellyn is currently available to adults aged 18 or over only. You confirm you are 18
              or over when you register. We may suspend or close accounts where this is not the
              case.
            </p>
          </Section>

          <Section title="3. Not medical advice">
            <p>
              Vellyn provides general nutrition and wellbeing information and estimates. It does
              not provide medical advice, diagnosis or treatment, and it is not a medical device.
              Calorie, macronutrient and photo-based estimates are approximate and may be wrong.
              Always speak to a qualified healthcare professional before making significant
              changes to your diet, especially if you are pregnant, have a medical condition, an
              eating disorder or take medication. If you feel unwell, seek medical help.
            </p>
          </Section>

          <Section title="4. Your account">
            <p>
              You are responsible for keeping your login details secure and for activity on your
              account. Please give accurate information, as guidance is based on what you enter.
            </p>
          </Section>

          <Section title="5. Acceptable use">
            <ul className="list-disc pl-5 space-y-1">
              <li>Do not upload content you do not have the right to share.</li>
              <li>Do not upload unlawful, harmful or offensive material.</li>
              <li>Do not attempt to access other people's data or disrupt the service.</li>
              <li>Do not use the service to provide clinical advice to others.</li>
            </ul>
          </Section>

          <Section title="6. AI-generated content">
            <p>
              Parts of the service use AI models to analyse photos and text, transcribe voice
              input and generate suggestions. AI output can be inaccurate or incomplete. You are
              responsible for deciding whether to act on any suggestion.
            </p>
          </Section>

          <Section title="7. Subscriptions and payments">
            <p>
              Paid plans are processed by Stripe. Where a free trial applies, it converts to a
              paid subscription unless cancelled beforehand. You can manage or cancel a
              subscription from your account. Statutory consumer rights under UK law are not
              affected.
            </p>
          </Section>

          <Section title="8. Your data">
            <p>
              Our handling of personal information is described in the{" "}
              <Link className="text-primary underline" to="/privacy">
                Privacy Notice
              </Link>
              . Consent to health-adjacent personalisation is asked for separately from these
              terms and can be withdrawn at any time in Settings → Privacy &amp; Security.
            </p>
          </Section>

          <Section title="9. Availability and changes">
            <p>
              We may change, suspend or withdraw features, and we may update these terms. Where
              changes are material we will update the version number and ask you to review them in
              the app.
            </p>
          </Section>

          <Section title="10. Liability">
            <p>
              To the extent permitted by law, we are not liable for loss arising from reliance on
              estimates or suggestions produced by the service. Nothing in these terms limits
              liability that cannot lawfully be limited, including for death or personal injury
              caused by negligence or for fraud.
            </p>
          </Section>

          <Section title="11. Ending your use">
            <p>
              You may stop using Vellyn at any time and request deletion of your account and data
              from Settings → Privacy &amp; Security. We may suspend or end access where these
              terms are breached.
            </p>
          </Section>

          <Section title="12. Governing law and contact">
            <p>
              These terms are governed by the laws of England and Wales. Questions can be sent to{" "}
              <a className="text-primary underline" href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>
                {PRIVACY_CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
