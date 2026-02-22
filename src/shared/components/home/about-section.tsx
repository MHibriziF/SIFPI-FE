'use client';

import { motion } from 'motion/react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="mx-auto max-w-6xl px-6">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-4xl font-bold text-primary mb-8"
        >
          ABOUT US
        </motion.h2>
        <div className="max-w-3xl space-y-8 text-base text-gray-700 leading-relaxed">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
          >
            <h3 className="text-xl font-semibold text-primary mb-3">Our Role</h3>
            <p className="mb-4">
              IPFO serves as the focal point for infrastructure facilitation in Indonesia. We exist
              to:
            </p>
            <ul className="space-y-3 list-none">
              {[
                {
                  label: 'Inform',
                  desc: 'Identify and provide access to available infrastructure projects across Indonesia.',
                },
                {
                  label: 'Guide',
                  desc: 'Help investors and government stakeholders navigate processes — from permits and PPP mechanisms to financing pathways.',
                },
                {
                  label: 'Support',
                  desc: 'Liaise for project delivery bottlenecks troubleshooting and enable effective inter-agency coordination.',
                },
              ].map(({ label, desc }) => (
                <li key={label} className="flex gap-3">
                  <span className="mt-0.5 shrink-0 w-2 h-2 rounded-full bg-secondary translate-y-1.5" />
                  <p>
                    <strong className="text-primary">{label}:</strong> {desc}
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
          >
            <h3 className="text-xl font-semibold text-primary mb-3">Our Focus</h3>
            <p className="mb-4">
              We prioritize sectors critical to Indonesia&apos;s growth and sustainability, including but
              not limited to:
            </p>
            <ul className="space-y-2 list-none">
              {[
                'Water Supply and Sanitation',
                'Connectivity and Transportation',
                'Waste Management',
                'Energy Transition and Clean Power',
              ].map(item => (
                <li key={item} className="flex gap-3 items-center">
                  <span className="shrink-0 w-2 h-2 rounded-full bg-secondary" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
