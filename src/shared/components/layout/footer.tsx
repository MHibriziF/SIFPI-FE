import Link from 'next/link';
import { MapPin, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-grey text-primary">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          {/* Our Office */}
          <div>
            <h3 className="text-xl font-semibold uppercase tracking-widest text-primary mb-4">
              Our Office
            </h3>
            <Link
              href="https://maps.app.goo.gl/d1MnPAUq1zS32bpJA"
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3 text-sm text-primary/65 hover:text-primary transition-colors leading-relaxed group"
            >
              <MapPin className="size-4 shrink-0 mt-0.5 text-primary/65 group-hover:text-primary" />
              <p>
                2nd floor, Kementerian Koordinator Bidang Infrastruktur &amp; Pembangunan
                Kewilayahan
                <br />
                Jl. M.H. Thamrin No.8, RT.65/RW.65, Kb. Sirih, Kec. Menteng, Jakarta Pusat
                <br />
                Daerah Khusus Ibukota Jakarta 65340
              </p>
            </Link>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-xl font-semibold uppercase tracking-widest text-primary mb-4">
              Contact Us
            </h3>
            <div className="flex flex-col gap-3">
              <Link
                href="mailto:sekretariat@ipfo.kemenkoinfra.go.id"
                className="flex items-center gap-3 text-sm text-primary/65 hover:text-primary transition-colors"
              >
                <Mail className="size-4 shrink-0" />
                sekretariat@ipfo.kemenkoinfra.go.id
              </Link>
              <Link
                href="tel:+6265123332509"
                className="flex items-center gap-3 text-sm text-primary/65 hover:text-primary transition-colors"
              >
                <Phone className="size-4 shrink-0" />
                +62 651 2333 2509
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-primary/65 pt-6 text-xs text-primary/90 text-center">
          © {new Date().getFullYear()} Indonesia Project Facilitation Office. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
