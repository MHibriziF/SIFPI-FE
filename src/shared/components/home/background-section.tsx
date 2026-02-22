'use client';

import { motion } from 'motion/react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function BackgroundSection() {
  return (
    <section id="background" className="py-20 bg-grey">
      <div className="mx-auto max-w-6xl px-6">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-4xl font-bold text-primary mb-8"
        >
          BACKGROUND
        </motion.h2>
        <div className="max-w-3xl space-y-4 text-base text-gray-700 leading-relaxed">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <strong className="text-primary">Growth needs private sector investment.</strong>
          </motion.p>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
          >
            Indonesia has set ambitious goals for infrastructure development as a foundation for
            economic growth and prosperity. However, attracting and realizing infrastructure
            investment has often faced challenges, such as complex permitting, fragmented
            coordination, and lack of accessible project information.
          </motion.p>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
          >
            In response, and as announced at the International Conference on Infrastructure (ICI)
            2025, the Government established the Indonesia Project Facilitation Office (IPFO) under
            the Coordinating Ministry for Infrastructure and Regional Development. IPFO is a
            concrete step to accelerate infrastructure investment and ensure projects are supported
            throughout the way.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
