import Link from "next/link";
import { Landmark, Mail, MapPin, PhoneCall, ShieldCheck } from "lucide-react";

const quickLinks = [
  { label: "Citizen Desk", href: "/issues" },
  { label: "Admin Control", href: "/admin" },
  { label: "Login", href: "/login" },
];

const emergencyContacts = [
  { label: "Police", value: "100" },
  { label: "Fire Service", value: "101" },
  { label: "Ambulance", value: "102" },
];

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-blue-100 bg-ink text-blue-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">
            <Landmark className="h-4 w-4" />
            Civic Connect Portal
          </div>
          <p className="mt-3 text-sm leading-6 text-blue-100/90">
            Government-style civic grievance portal for transparent and faster issue resolution.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">
            Quick Access
          </p>
          <div className="mt-3 space-y-2 text-sm">
            {quickLinks.map((link) => (
              <Link key={link.label} href={link.href} className="block hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">
            Emergency Helplines
          </p>
          <div className="mt-3 space-y-2 text-sm">
            {emergencyContacts.map((contact) => (
              <p key={contact.label} className="flex items-center justify-between gap-3">
                <span>{contact.label}</span>
                <span className="font-semibold text-white">{contact.value}</span>
              </p>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">
            Contact
          </p>
          <div className="mt-3 space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <PhoneCall className="h-4 w-4" />
              1800-000-1234
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              support@civicconnect.gov.in
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Municipal Operations Center, India
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-blue-900/70">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs text-blue-100/90 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Civic Connect Portal. Government Service Interface.</p>
          <p className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure citizen complaint workflows
          </p>
        </div>
      </div>
    </footer>
  );
}
