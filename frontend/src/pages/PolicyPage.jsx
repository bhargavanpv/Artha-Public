import { useNavigate } from "react-router-dom";

function PrivacyPolicy() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#080808] text-white px-6 py-12 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-white/40 text-sm mb-8 hover:text-white">← Back</button>
      <h1 className="text-3xl font-semibold mb-2">Privacy Policy</h1>
      <p className="text-white/40 text-sm mb-10">Last updated: September 2026</p>

      <div className="flex flex-col gap-8 text-white/70 text-sm leading-relaxed">
        <section>
          <h2 className="text-white font-medium text-base mb-2">1. Who We Are</h2>
          <p>Artha ("we", "our", "us") is a personal finance management application operated by Bhargavan PV, based in India. You can reach us at bhargavanpv1@gmail.com. Our website is getarthaai.com.</p>
        </section>

        <section>
          <h2 className="text-white font-medium text-base mb-2">2. What Data We Collect</h2>
          <p>We collect the following information when you use Artha:</p>
          <ul className="list-disc ml-5 mt-2 flex flex-col gap-1">
            <li>Name and email address (on registration)</li>
            <li>Financial transaction data you manually enter (amounts, categories, descriptions)</li>
            <li>Feedback and reviews you voluntarily submit</li>
            <li>Device and usage information for improving the service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-medium text-base mb-2">3. How We Use Your Data</h2>
          <ul className="list-disc ml-5 flex flex-col gap-1">
            <li>To provide and improve the Artha service</li>
            <li>To power AI-based financial insights using your transaction history</li>
            <li>To display your feedback on our website (only with your explicit consent)</li>
            <li>To process subscription payments via Razorpay</li>
            <li>To communicate important updates about the service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-medium text-base mb-2">4. Data Storage and Security</h2>
          <p>Your data is stored securely on MongoDB Atlas servers. Passwords are hashed using bcrypt and never stored in plain text. All data is transmitted over HTTPS. We do not sell your data to third parties.</p>
        </section>

        <section>
          <h2 className="text-white font-medium text-base mb-2">5. Third Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul className="list-disc ml-5 mt-2 flex flex-col gap-1">
            <li>OpenAI — for AI-powered financial insights</li>
            <li>Razorpay — for payment processing</li>
            <li>MongoDB Atlas — for data storage</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-medium text-base mb-2">6. Your Rights</h2>
          <p>You can delete your account and all associated data at any time from the Profile page. You may also contact us at bhargavanpv1@gmail.com to request data export or deletion.</p>
        </section>

        <section>
          <h2 className="text-white font-medium text-base mb-2">7. Cookies</h2>
          <p>Artha uses localStorage to store your authentication token locally on your device. We do not use advertising cookies or tracking pixels at this time.</p>
        </section>

        <section>
          <h2 className="text-white font-medium text-base mb-2">8. Changes to This Policy</h2>
          <p>We may update this policy as the product evolves. We will notify users of significant changes via email or in-app notification.</p>
        </section>

        <section>
          <h2 className="text-white font-medium text-base mb-2">9. Contact</h2>
          <p>For any privacy related questions, contact us at bhargavanpv1@gmail.com.</p>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPolicy