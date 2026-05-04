import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/subcomponents/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'autoHODL Terms of Service',
};

export default function TermsPage() {
  return (
    <div className='min-h-screen w-full flex flex-col'>
      <div className='flex-1 px-6 py-12 max-w-3xl mx-auto w-full'>
        <Link
          href='/'
          className='text-sm text-[#4D4A4A] hover:text-black transition-colors duration-300 mb-8 inline-block'
        >
          ← auto<span className='font-bold'>HODL</span>
        </Link>

        <h1 className='text-3xl font-bold mb-2'>Terms of Service</h1>
        <p className='text-sm text-[#4D4A4A] mb-10'>Effective Date: June 1, 2025</p>

        <div className='space-y-8 text-[#1a1a1a] text-base leading-relaxed'>
          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the autoHODL interface,
            available at autohodl.money (the &ldquo;Interface&rdquo;), operated by Locker Labs (&ldquo;we,&rdquo;
            &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By accessing or using the Interface, you agree to be bound by these
            Terms.
          </p>

          <Section title='1. What autoHODL Is'>
            <p>
              autoHODL is a non-custodial software interface that makes it easier for users to connect their
              self-custodial cryptocurrency wallets to third-party decentralized finance (DeFi) protocols. We provide
              software tools — we do not provide financial services, custody services, investment advice, or brokerage
              services.
            </p>
            <p className='mt-4'>
              Using the Interface does not create a custodial, fiduciary, financial, or advisory relationship between
              you and Locker Labs.
            </p>
          </Section>

          <Section title='2. Non-Custodial Nature of the Interface'>
            <p>
              autoHODL does not take custody of, hold, control, or have access to your funds or digital assets at any
              time.
            </p>
            <p className='mt-4'>
              All digital assets remain in your self-custodial wallet throughout your use of the Interface. Any funds
              acquired through third-party payment services are delivered directly to your wallet address. Locker Labs
              has no ability to access, freeze, reverse, or recover your funds under any circumstances.
            </p>
            <p className='mt-4'>
              You are solely responsible for the security of your private keys, seed phrases, and wallet credentials.
              Loss of access to your wallet cannot be remediated by autoHODL.
            </p>
          </Section>

          <Section title='3. Third-Party Yield Protocols'>
            <p>
              Any yield, returns, or rewards available through the Interface are generated exclusively by independent
              third-party decentralized protocols, including but not limited to Raydium, Meteora, and Jupiter.
            </p>
            <p className='mt-4'>
              autoHODL software facilitates connections between your wallet and these protocols. We do not:
            </p>
            <ul className='list-disc pl-6 mt-2 space-y-1'>
              <li>Operate, control, or manage these protocols</li>
              <li>Set, guarantee, or project yield rates or returns</li>
              <li>Earn yield on your behalf or commingle your assets with our own</li>
              <li>
                Accept liability for the performance, security, or continued operation of any third-party protocol
              </li>
            </ul>
            <p className='mt-4'>
              Yield rates are determined by market conditions and third-party protocol parameters entirely outside of
              our control. Past performance is not indicative of future results.
            </p>
          </Section>

          <Section title='4. Third-Party Payment Services'>
            <p>
              Fiat-to-crypto purchase services available through or alongside the Interface are provided entirely by
              independent third-party payment service providers. Locker Labs does not:
            </p>
            <ul className='list-disc pl-6 mt-2 space-y-1'>
              <li>Process fiat currency payments</li>
              <li>Handle, store, or transmit payment card data or bank account information</li>
              <li>
                Collect or have access to the identity, KYC, or payment data you provide to any payment service provider
              </li>
              <li>
                Bear responsibility for the availability, accuracy, fees, or conduct of any third-party payment service
              </li>
            </ul>
            <p className='mt-4'>
              Your use of any third-party payment service is governed by that provider&apos;s own terms of service and
              privacy policy, which you should review before use. Locker Labs is not a party to any transaction between
              you and a third-party payment provider.
            </p>
          </Section>

          <Section title='5. No Investment Advice'>
            <p>
              Nothing on the Interface constitutes financial, investment, tax, or legal advice. All information provided
              through the Interface is for informational purposes only. You should consult qualified professionals
              before making any financial decisions.
            </p>
            <p className='mt-4'>autoHODL is software. It does not manage assets on your behalf.</p>
          </Section>

          <Section title='6. Risk Disclosures'>
            <p>
              Use of the Interface involves substantial risk. You acknowledge and accept the following risks, among
              others:
            </p>
            <ul className='list-disc pl-6 mt-2 space-y-2'>
              <li>
                <strong>Smart contract risk:</strong> DeFi protocols operate through smart contracts that may contain
                bugs, vulnerabilities, or unexpected behavior that could result in partial or total loss of funds.
              </li>
              <li>
                <strong>Protocol risk:</strong> Third-party protocols may be exploited, deprecated, or discontinued
                without notice.
              </li>
              <li>
                <strong>Market risk:</strong> The value of digital assets is highly volatile. You may lose some or all
                of your assets.
              </li>
              <li>
                <strong>Key management risk:</strong> Loss of your private keys or seed phrase means permanent,
                irrecoverable loss of access to your funds.
              </li>
              <li>
                <strong>Regulatory risk:</strong> The regulatory status of DeFi, digital assets, and related activities
                is uncertain and may change. You are responsible for ensuring your use of the Interface complies with
                applicable laws in your jurisdiction.
              </li>
              <li>
                <strong>Network risk:</strong> Blockchain networks may experience congestion, downtime, forks, or other
                disruptions.
              </li>
            </ul>
            <p className='mt-4'>You use the Interface at your sole risk.</p>
          </Section>

          <Section title='7. Eligibility'>
            <p>By using the Interface, you represent and warrant that:</p>
            <ul className='list-disc pl-6 mt-2 space-y-1'>
              <li>You are at least 18 years of age</li>
              <li>You have the legal capacity to enter into these Terms in your jurisdiction</li>
              <li>Your use of the Interface does not violate any applicable law or regulation</li>
              <li>
                You are not located in, or acting on behalf of any person or entity located in, a jurisdiction where use
                of the Interface is prohibited
              </li>
            </ul>
            <p className='mt-4'>You are solely responsible for compliance with the laws of your jurisdiction.</p>
          </Section>

          <Section title='8. Intellectual Property'>
            <p>
              The Interface, including its design, code, and content, is owned by Locker Labs and protected by
              applicable intellectual property laws. The underlying DeFi protocols integrated with the Interface are
              independent open-source projects and are not owned by Locker Labs.
            </p>
            <p className='mt-4'>
              You may not copy, modify, distribute, or create derivative works of the Interface without our prior
              written permission.
            </p>
          </Section>

          <Section title='9. Disclaimers'>
            <p className='uppercase text-sm leading-relaxed'>
              The interface is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any
              kind, express or implied, including warranties of merchantability, fitness for a particular purpose, or
              non-infringement.
            </p>
            <p className='uppercase text-sm leading-relaxed mt-4'>
              We do not warrant that the interface will be uninterrupted, error-free, or free of viruses or other
              harmful components.
            </p>
          </Section>

          <Section title='10. Limitation of Liability'>
            <p className='uppercase text-sm leading-relaxed'>
              To the maximum extent permitted by applicable law, Locker Labs and its officers, directors, employees, and
              affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages,
              or any loss of funds, revenue, data, or profits, arising out of or related to your use of the interface,
              even if we have been advised of the possibility of such damages.
            </p>
            <p className='uppercase text-sm leading-relaxed mt-4'>
              Our total aggregate liability to you shall not exceed one hundred US dollars ($100).
            </p>
          </Section>

          <Section title='11. Indemnification'>
            <p>
              You agree to indemnify, defend, and hold harmless Locker Labs and its officers, directors, employees, and
              affiliates from and against any claims, liabilities, damages, losses, and expenses (including reasonable
              legal fees) arising out of or related to your use of the Interface, your violation of these Terms, or your
              violation of any applicable law.
            </p>
          </Section>

          <Section title='12. Governing Law and Dispute Resolution'>
            <p>
              These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict
              of law principles.
            </p>
            <p className='mt-4'>
              Any dispute arising out of or relating to these Terms or your use of the Interface shall be resolved by
              binding arbitration in accordance with the rules of the American Arbitration Association, conducted in
              Louisiana. You waive any right to participate in a class action lawsuit or class-wide arbitration.
            </p>
          </Section>

          <Section title='13. Changes to These Terms'>
            <p>
              We may update these Terms from time to time. When we do, we will update the effective date at the top of
              this page. Your continued use of the Interface after changes are posted constitutes your acceptance of the
              revised Terms.
            </p>
          </Section>

          <Section title='14. Contact'>
            <p>If you have questions about these Terms, please contact us at:</p>
            <p className='mt-2'>
              Locker Labs
              <br />
              <a
                href='mailto:contact@autohodl.money'
                className='underline hover:text-black transition-colors duration-300'
              >
                contact@autohodl.money
              </a>
            </p>
          </Section>
        </div>
      </div>

      <Footer className='w-full' />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className='text-lg font-bold mb-3'>{title}</h2>
      {children}
    </section>
  );
}
