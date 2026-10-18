import { useNavigate } from "react-router-dom";

function TermsOfService() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#080808] text-white px-6 py-12 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-white/40 text-sm mb-8 hover:text-white">← Back</button>
      <h1 className="text-3xl font-semibold mb-2">Terms of Service</h1>
      <p className="text-white/40 text-sm mb-10">Last updated: September 2026</p>

      <div className="flex flex-col gap-8 text-white/70 text-sm leading-relaxed">
        <section>
          <h2 className="text-white font-medium text-base mb-2">1. Acceptance of Terms</h2>
          <p>By creating an account or using Artha, you agree to these Terms of Service. If you do not agree, please do not use the service.</p>
        </section>

        <section>
          <h2 className="text-white font-medium text-base mb-2">2. Description of Service</h2>
          <p>Artha is a personal finance management tool that helps users track income, expenses, and financial goals. It includes AI-powered insights and subscription-based premium features.</p>
        </section>

        <section>
          <h2 className="text-white font-medium text-base mb-2">3. User Responsibilities</h2>
          <ul className="list-disc ml-5 flex flex-col gap-1">
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>You must not use Artha for any illegal or unauthorized purpose</li>
            <li>The financial data you enter must be your own</li>
            <li>You must be at least 13 years old to use Artha</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-medium text-base mb-2">4. Subscriptions and Payments</h2>
          <p>Artha offers both free and paid subscription plans. Payments are processed securely via Razorpay. Subscription fees are billed monthly and are non-refundable unless required by applicable law. You may cancel your subscription at any time from the Profile page.</p>
        </section>

        <section>
          <h2 className="text-white font-medium text-base mb-2">5. AI Features</h2>
          <p>Artha's AI features are powered by OpenAI and are provided for informational purposes only. They do not constitute financial advice. Always consult a qualified financial advisor for important financial decisions.</p>
        </section>

        <section>
          <h2 className="text-white font-medium text-base mb-2">6. Limitation of Liability</h2>
          <p>Artha is provided "as is" without warranties of any kind. We are not liable for any financial decisions made based on information provided by the app. Our liability is limited to the amount you paid for the service in the last 3 months.</p>
        </section>

        <section>
          <h2 className="text-white font-medium text-base mb-2">7. Termination</h2>
          <p>We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time from the Profile page.</p>
        </section>

        <section>
          <h2 className="text-white font-medium text-base mb-2">8. Governing Law</h2>
          <p>These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Tamil Nadu, India.</p>
        </section>

        <section>
          <h2 className="text-white font-medium text-base mb-2">9. Contact</h2>
          <p>For any questions about these terms, contact us at bhargavanpv1@gmail.com.</p>
        </section>
      </div>
    </div>
  );
}

export default TermsOfService