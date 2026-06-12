import React from 'react';
import { MapPin, Phone, Clock, Mail, PhoneCall, ShieldCheck, BadgeCheck, MessageSquare } from 'lucide-react';

export const Contact: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-12 pb-24 text-left">
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-tk-blue-deep bg-tk-blue-light py-1 px-2.5 rounded">
          Contact Details
        </span>
        <h1 className="font-display font-bold text-3xl md:text-5xl text-tk-text-primary tracking-tight">
          TEKART Storefront
        </h1>
        <p className="text-sm md:text-base text-tk-text-secondary leading-relaxed max-w-2xl">
          Have questions about a product, pricing, or custom orders? Reach out directly. We operate as a boutique showroom and are happy to assist you over WhatsApp or calls.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Details */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-tk-surface border border-tk-border rounded-tk-card p-6 shadow-sm space-y-6">
            <h3 className="font-display font-bold text-lg text-tk-text-primary border-b border-tk-border pb-3">
              Showroom Coordinates
            </h3>

            <div className="space-y-4 text-sm text-tk-text-secondary">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-tk-blue-deep shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-tk-text-primary">Physical Address</p>
                  <p>30-A/08 Alexandra Press Road,</p>
                  <p>Nagercoil – 629001, Tamil Nadu, India</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-tk-blue-deep shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-tk-text-primary">Contact Numbers</p>
                  <p className="hover:text-tk-blue-deep transition-colors">
                    <a href="tel:+917339433225">+91 7339433225</a> (Primary)
                  </p>
                  <p className="hover:text-tk-blue-deep transition-colors">
                    <a href="tel:+919025511375">+91 9025511375</a> (Secondary)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-tk-blue-deep shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-tk-text-primary">Operating Hours</p>
                  <p>Monday – Saturday: 10:00 AM – 09:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-tk-blue-deep shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-tk-text-primary">Email Support</p>
                  <p>support@tekart.com</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <a
                href="https://wa.me/919384180516"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-tk-wa hover:bg-tk-wa-dark text-white font-bold py-3 px-4 rounded-tk-input shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                id="btn-contact-whatsapp"
              >
                <PhoneCall className="h-4.5 w-4.5" />
                <span>Enquire via WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Trust strip inside */}
          <div className="bg-tk-blue-pale/50 border border-tk-border/50 rounded-tk-card p-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-tk-text-secondary">
              Store Guarantees
            </h4>
            <div className="space-y-3 text-xs text-tk-text-secondary">
              <p className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-tk-blue-deep" />
                <span>Original & authentic products from global vendors</span>
              </p>
              <p className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-tk-blue-deep" />
                <span>Local warranty assistance support handled directly</span>
              </p>
              <p className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-tk-blue-deep" />
                <span>Personalized shopping assistance via owner-chat</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Embedded Map */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-tk-surface border border-tk-border rounded-tk-card overflow-hidden shadow-sm h-96">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3949.3140733568864!2d77.42557997451383!3d8.171060902047805!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b04f123bc60a7ff%3A0xe541cf5e1e484bf8!2sNagercoil%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              title="TEKART Store Location map"
            ></iframe>
          </div>
          
          <div className="text-center">
            <a
              href="https://maps.google.com/?q=Alexandra+Press+Road,+Nagercoil"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-tk-blue-deep hover:underline"
            >
              <span>Get driving directions on Google Maps</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
