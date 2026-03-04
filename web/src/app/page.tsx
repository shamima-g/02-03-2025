import { GoogleReCaptchaProvider } from '@/components/RecaptchaProvider';
import { ContactForm } from '@/components/ContactForm';

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <GoogleReCaptchaProvider
        reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ''}
      >
        <ContactForm />
      </GoogleReCaptchaProvider>
    </main>
  );
}
