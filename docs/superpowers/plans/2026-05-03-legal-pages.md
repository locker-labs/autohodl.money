# Legal Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `/terms` and `/privacy` static pages to autohodl.money and link them from the footer, satisfying MoonPay KYB partner approval requirements.

**Architecture:** Two new Next.js server-component pages render the legal document content inline with no client-side JS. Path constants are added to `lib/paths.ts` and the Footer is updated to render internal links alongside its existing external links.

**Tech Stack:** Next.js 15, Tailwind CSS v4, TypeScript, Biome (linting), `bun` (package manager/runner)

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Modify | `apps/web/src/lib/paths.ts` | Add `/terms` and `/privacy` internal path constants |
| Modify | `apps/web/src/components/subcomponents/Footer.tsx` | Add Terms and Privacy links |
| Create | `apps/web/src/app/terms/page.tsx` | Terms of Service page |
| Create | `apps/web/src/app/privacy/page.tsx` | Privacy Policy page |

---

### Task 1: Add path constants for legal pages

**Files:**
- Modify: `apps/web/src/lib/paths.ts`

- [ ] **Step 1: Open the file and add internal legal paths**

The file currently exports two objects: `paths` (external URLs) and `links` (social/external links). Add a new `legalPaths` export for internal routes.

Replace the entire file content with:

```ts
export const paths = {
  LearnMoreSYT: 'https://docs.autohodl.money/spendable-yield-tokens',
  GetMetaMaskCard: 'https://metamask.io/card',
  Arbitrum: 'https://devfolio.co/projects/auto-hodl-e5dd',
  Base: 'https://devfolio.co/projects/auto-hodl-e5dd',
  MetaMask: 'https://x.com/MetaMaskDev/status/1950918297483948491',
  Circle: 'https://x.com/BuildOnCircle/status/1985381981748916486',
};

export const links = {
  telegram: 'https://t.me/+713AuddkI9phNjUx',
  twitter: 'https://x.com/autoHODL',
  github: 'https://github.com/locker-labs/autohodl.money',
  contact: 'mailto:hello@autohodl.money',
  docs: 'https://docs.autohodl.money',
  perch: 'https://perch.bio/autohodl',
};

export const legalPaths = {
  terms: '/terms',
  privacy: '/privacy',
};
```

- [ ] **Step 2: Lint check**

Run from repo root:
```bash
cd apps/web && bun run lint
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/lib/paths.ts
git commit -m "feat: add legal page path constants"
```

---

### Task 2: Add Terms and Privacy links to Footer

**Files:**
- Modify: `apps/web/src/components/subcomponents/Footer.tsx`

The Footer currently renders `footerLinks` (external URLs) via an `ExternalLink` component that opens in a new tab. Legal pages are internal routes — they should use `Link` without `target="_blank"`. We add a separate `legalLinks` array and render them in the same nav row.

- [ ] **Step 1: Update Footer.tsx**

Replace the entire file content with:

```tsx
import Link from 'next/link';
import { links, legalPaths } from '@/lib/paths';

const footerLinks = [
  // { href: links.telegram, label: 'Telegram' },
  { href: links.twitter, label: 'Twitter' },
  // { href: links.github, label: 'GitHub' },
  // { href: links.contact, label: 'Email' },
  // { href: links.docs, label: 'Documentation' },
  { href: links.perch, label: 'Bio' },
];

const legalLinks = [
  { href: legalPaths.terms, label: 'Terms' },
  { href: legalPaths.privacy, label: 'Privacy' },
];

export function Footer({ innerClassName = '', className }: { innerClassName?: string; className?: string }) {
  return (
    <div className={className}>
      <hr className='bg-[#D0D0D0] h-[2px] opacity-70' />
      <footer className={`px-[24px] w-full flex items-center justify-center py-[40px] ${innerClassName}`}>
        <div className='max-w-[1080px] w-full flex flex-col sm:flex-row gap-4 sm:gap-0 items-center sm:items-start lg:items-center justify-between'>
          <button
            type='button'
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className='text-[16px] text-black cursor-pointer'
          >
            auto<span className='font-bold'>HODL</span>
          </button>
          <div className='flex flex-col sm:flex-row items-center sm:items-start lg:items-center justify-center gap-[12px] lg:gap-[32px] text-[16px] text-[#4D4A4A]'>
            <p className='sm:hidden text-sm font-bold'>Connect</p>
            {footerLinks.map((item, idx) => (
              <ExternalLink href={item.href} key={`footer-link-${idx}`}>
                <p className='text-sm lg:text-base'>{item.label}</p>
              </ExternalLink>
            ))}
            {legalLinks.map((item, idx) => (
              <InternalLink href={item.href} key={`legal-link-${idx}`}>
                <p className='text-sm lg:text-base'>{item.label}</p>
              </InternalLink>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} target='_blank' className='hover:text-black transition-colors duration-300'>
      {children}
    </Link>
  );
}

function InternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className='hover:text-black transition-colors duration-300'>
      {children}
    </Link>
  );
}
```

- [ ] **Step 2: Lint check**

```bash
cd apps/web && bun run lint
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/subcomponents/Footer.tsx
git commit -m "feat: add Terms and Privacy links to footer"
```

---

### Task 3: Create the Terms of Service page

**Files:**
- Create: `apps/web/src/app/terms/page.tsx`

This is a server component (no `'use client'` directive). It renders the full Terms of Service text with a back-navigation link and the Footer.

- [ ] **Step 1: Create the directory and file**

Create `apps/web/src/app/terms/page.tsx` with this content:

```tsx
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
            &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By accessing or using the Interface, you agree to be bound by
            these Terms.
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
              <li>Accept liability for the performance, security, or continued operation of any third-party protocol</li>
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
              <li>Collect or have access to the identity, KYC, or payment data you provide to any payment service provider</li>
              <li>Bear responsibility for the availability, accuracy, fees, or conduct of any third-party payment service</li>
            </ul>
            <p className='mt-4'>
              Your use of any third-party payment service is governed by that provider&apos;s own terms of service and
              privacy policy, which you should review before use. Locker Labs is not a party to any transaction between
              you and a third-party payment provider.
            </p>
          </Section>

          <Section title='5. No Investment Advice'>
            <p>
              Nothing on the Interface constitutes financial, investment, tax, or legal advice. All information
              provided through the Interface is for informational purposes only. You should consult qualified
              professionals before making any financial decisions.
            </p>
            <p className='mt-4'>autoHODL is software. It does not manage assets on your behalf.</p>
          </Section>

          <Section title='6. Risk Disclosures'>
            <p>Use of the Interface involves substantial risk. You acknowledge and accept the following risks, among others:</p>
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
                <strong>Regulatory risk:</strong> The regulatory status of DeFi, digital assets, and related
                activities is uncertain and may change. You are responsible for ensuring your use of the Interface
                complies with applicable laws in your jurisdiction.
              </li>
              <li>
                <strong>Network risk:</strong> Blockchain networks may experience congestion, downtime, forks, or
                other disruptions.
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
                You are not located in, or acting on behalf of any person or entity located in, a jurisdiction where
                use of the Interface is prohibited
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
              To the maximum extent permitted by applicable law, Locker Labs and its officers, directors, employees,
              and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive
              damages, or any loss of funds, revenue, data, or profits, arising out of or related to your use of the
              interface, even if we have been advised of the possibility of such damages.
            </p>
            <p className='uppercase text-sm leading-relaxed mt-4'>
              Our total aggregate liability to you shall not exceed one hundred US dollars ($100).
            </p>
          </Section>

          <Section title='11. Indemnification'>
            <p>
              You agree to indemnify, defend, and hold harmless Locker Labs and its officers, directors, employees,
              and affiliates from and against any claims, liabilities, damages, losses, and expenses (including
              reasonable legal fees) arising out of or related to your use of the Interface, your violation of these
              Terms, or your violation of any applicable law.
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
              this page. Your continued use of the Interface after changes are posted constitutes your acceptance of
              the revised Terms.
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
```

- [ ] **Step 2: Lint check**

```bash
cd apps/web && bun run lint
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/terms/page.tsx
git commit -m "feat: add Terms of Service page"
```

---

### Task 4: Create the Privacy Policy page

**Files:**
- Create: `apps/web/src/app/privacy/page.tsx`

Same structure as the Terms page — server component, back link, Footer.

- [ ] **Step 1: Create `apps/web/src/app/privacy/page.tsx`**

```tsx
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
              <p>
                If you choose to connect your Telegram or Twitter/X account to the Interface, we collect:
              </p>
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
              Any identity or payment information you provide during a fiat-to-crypto purchase is collected and
              retained solely by the independent third-party payment service provider facilitating that transaction.
              Locker Labs does not have access to that data. Please review the privacy policy of any payment service
              provider before using their service.
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
            <p>
              We work with the following third-party service providers who may process data on our behalf:
            </p>
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
                <strong>Third-party payment service providers</strong> — independent data controllers that operate
                under their own privacy policies; we do not share data with them and do not receive data from them
                about your payment or identity
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
              <li>
                Service providers listed above, only to the extent necessary to operate the Interface
              </li>
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
                <strong>Wallet addresses and social profile data</strong> are retained for as long as your
                configuration is active, or until you request deletion.
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
                <li>
                  Opt out of the sale of your personal information (we do not sell personal information)
                </li>
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
                You may request deletion of your Telegram or Twitter profile data at any time by contacting us. You
                can also disconnect your social accounts through the Interface settings.
              </p>
            </SubSection>
          </Section>

          <Section title='8. Security'>
            <p>
              We implement reasonable technical and organizational measures to protect your information from
              unauthorized access, disclosure, or loss. However, no system is completely secure. You are responsible
              for maintaining the confidentiality of your wallet credentials and private keys.
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
              We may update this Privacy Policy from time to time. When we do, we will update the effective date at
              the top of this page. Continued use of the Interface after changes are posted constitutes your
              acceptance of the revised policy.
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
```

- [ ] **Step 2: Lint check**

```bash
cd apps/web && bun run lint
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/privacy/page.tsx
git commit -m "feat: add Privacy Policy page"
```

---

### Task 5: Build verification

**Files:** none (verification only)

- [ ] **Step 1: Run full build**

```bash
cd apps/web && bun run build
```
Expected: Build completes with no errors. Output will include lines like:
```
Route (app)                   Size
├ ○ /terms                    X kB
├ ○ /privacy                  X kB
```
Both routes should appear as `○` (static) — confirming they are server-rendered with no client-side JS.

- [ ] **Step 2: Verify pages are accessible locally**

```bash
cd apps/web && bun run start
```
Open in browser:
- `http://localhost:3000/terms` — should render Terms of Service with "June 1, 2025" effective date and Footer with Terms/Privacy links
- `http://localhost:3000/privacy` — should render Privacy Policy with "June 1, 2025" effective date and Footer with Terms/Privacy links
- `http://localhost:3000` — Footer should show Terms and Privacy links alongside existing Twitter/Bio links

- [ ] **Step 3: Final commit if any fixes were needed**

If the build required any small fixes, commit them:
```bash
git add -p
git commit -m "fix: address build issues in legal pages"
```
