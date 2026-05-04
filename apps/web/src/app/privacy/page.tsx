import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/subcomponents/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'autoHODL Privacy Policy',
};

export default function PrivacyPage() {
  return (
    <div className='min-h-screen w-full flex flex-col'>
      <div className='flex-1 px-6 py-12 max-w-3xl mx-auto w-full'>
        <Link
          href='/'
          className='text-sm text-[#4D4A4A] hover:text-black transition-colors duration-300 mb-8 inline-block'
        >
          ← auto<span className='font-bold'>HODL</span>
        </Link>

        <h1 className='text-3xl font-bold mb-2'>Privacy Policy</h1>
        <p className='text-sm text-[#4D4A4A] mb-10'>Effective Date: June 1, 2025</p>

        <div className='space-y-8 text-[#1a1a1a] text-base leading-relaxed'>
          <p>
            This Privacy Policy explains how Locker Labs (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;)
            collects, uses, and shares information when you use the autoHODL interface at autohodl.money (the
            &ldquo;Interface&rdquo;). This policy is governed by the laws of the State of Delaware, United States.
          </p>

          <Section title='1. Information We Collect'>
            <SubSection title='a. Wallet Addresses'>
              <p>
                When you connect a wallet to the Interface, we receive your public wallet address. Wallet addresses are
                publicly visible on the blockchain and are not personally identifiable information on their own.
              </p>
            </SubSection>

            <SubSection title='b. Social Profile Data'>
              <p>If you choose to connect your Telegram or Twitter/X account to the Interface, we collect:</p>
              <ul className='list-disc pl-6 mt-2 space-y-1'>
                <li>Your user ID on that platform</li>
                <li>Your display name</li>
                <li>Your profile avatar</li>
              </ul>
              <p className='mt-3'>
                This data is collected only when you initiate the connection and is used to deliver features tied to
                that integration (such as notifications).
              </p>
            </SubSection>

            <SubSection title='c. Usage Analytics'>
              <p>We collect anonymized usage data through RudderStack, including:</p>
              <ul className='list-disc pl-6 mt-2 space-y-1'>
                <li>Pages visited</li>
                <li>Wallet connection events</li>
                <li>General interaction patterns</li>
              </ul>
              <p className='mt-3'>
                This data does not include personally identifiable information and is used to understand how the
                Interface is used and to improve it.
              </p>
            </SubSection>

            <SubSection title='d. Technical Data'>
              <p>
                Our servers may automatically collect standard technical information, including IP addresses, browser
                type and version, operating system, and referring URLs. This data is used for security monitoring,
                debugging, and infrastructure purposes — not for profiling.
              </p>
            </SubSection>
          </Section>

          <Section title='2. Information We Do Not Collect'>
            <p>We do not collect:</p>
            <ul className='list-disc pl-6 mt-2 space-y-1'>
              <li>Government-issued identification documents</li>
              <li>Payment card numbers or bank account information</li>
              <li>Social Security numbers or tax identification numbers</li>
              <li>KYC (Know Your Customer) verification data</li>
            </ul>
            <p className='mt-4'>
              Any identity or payment information you provide during a fiat-to-crypto purchase is collected and retained
              solely by the independent third-party payment service provider facilitating that transaction. Locker Labs
              does not have access to that data. Please review the privacy policy of any payment service provider before
              using their service.
            </p>
          </Section>

          <Section title='3. How We Use Your Information'>
            <p>We use the information we collect to:</p>
            <ul className='list-disc pl-6 mt-2 space-y-1'>
              <li>Provide and operate the Interface</li>
              <li>Deliver notifications and features tied to connected social accounts</li>
              <li>Analyze usage patterns to improve the Interface</li>
              <li>Monitor for security threats and abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className='mt-4'>We do not use your information for targeted advertising or sell it to data brokers.</p>
          </Section>

          <Section title='4. Third-Party Services'>
            <p>We work with the following third-party service providers who may process data on our behalf:</p>
            <ul className='list-disc pl-6 mt-2 space-y-2'>
              <li>
                <strong>RudderStack</strong> — analytics and event tracking
              </li>
              <li>
                <strong>Supabase</strong> — database and storage for wallet configuration and notification preferences
              </li>
              <li>
                <strong>Telegram API / Twitter API</strong> — accessed only when you initiate a social account
                connection
              </li>
              <li>
                <strong>Third-party payment service providers</strong> — independent data controllers that operate under
                their own privacy policies; we do not share data with them and do not receive data from them about your
                payment or identity
              </li>
            </ul>
            <p className='mt-4'>
              Each service provider is subject to its own privacy policy and data processing obligations.
            </p>
          </Section>

          <Section title='5. Data Sharing'>
            <p>We do not sell your personal information.</p>
            <p className='mt-4'>We may share information with:</p>
            <ul className='list-disc pl-6 mt-2 space-y-1'>
              <li>Service providers listed above, only to the extent necessary to operate the Interface</li>
              <li>
                Law enforcement or regulatory authorities, if required by applicable law or to protect the rights and
                safety of users or third parties
              </li>
            </ul>
            <p className='mt-4'>
              We do not share your Telegram or Twitter profile data with any party other than the service providers
              necessary to deliver the features you requested.
            </p>
          </Section>

          <Section title='6. Data Retention'>
            <ul className='list-disc pl-6 space-y-2'>
              <li>
                <strong>Wallet addresses and social profile data</strong> are retained for as long as your configuration
                is active, or until you request deletion.
              </li>
              <li>
                <strong>Analytics data</strong> is retained per RudderStack&apos;s data retention policy.
              </li>
              <li>
                <strong>Server logs</strong> are retained for a limited period for security and debugging purposes and
                then deleted.
              </li>
            </ul>
          </Section>

          <Section title='7. Your Privacy Rights'>
            <SubSection title='California Residents (CCPA)'>
              <p>If you are a California resident, you have the right to:</p>
              <ul className='list-disc pl-6 mt-2 space-y-1'>
                <li>Know what personal information we have collected about you</li>
                <li>Request deletion of your personal information</li>
                <li>Opt out of the sale of your personal information (we do not sell personal information)</li>
                <li>Not be discriminated against for exercising these rights</li>
              </ul>
              <p className='mt-3'>
                To exercise any of these rights, contact us at{' '}
                <a
                  href='mailto:contact@autohodl.money'
                  className='underline hover:text-black transition-colors duration-300'
                >
                  contact@autohodl.money
                </a>
                .
              </p>
            </SubSection>

            <SubSection title='All Users'>
              <p>
                You may request deletion of your Telegram or Twitter profile data at any time by contacting us. You can
                also disconnect your social accounts through the Interface settings.
              </p>
            </SubSection>
          </Section>

          <Section title='8. Security'>
            <p>
              We implement reasonable technical and organizational measures to protect your information from
              unauthorized access, disclosure, or loss. However, no system is completely secure. You are responsible for
              maintaining the confidentiality of your wallet credentials and private keys.
            </p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>
              The Interface is not directed at individuals under the age of 18. We do not knowingly collect personal
              information from minors. If you believe we have inadvertently collected information from a minor, please
              contact us and we will delete it promptly.
            </p>
          </Section>

          <Section title='10. Changes to This Policy'>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update the effective date at the
              top of this page. Continued use of the Interface after changes are posted constitutes your acceptance of
              the revised policy.
            </p>
          </Section>

          <Section title='11. Contact'>
            <p>For privacy-related questions or requests:</p>
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

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className='mt-4'>
      <h3 className='text-base font-semibold mb-2'>{title}</h3>
      {children}
    </div>
  );
}
