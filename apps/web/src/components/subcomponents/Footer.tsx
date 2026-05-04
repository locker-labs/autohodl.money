import Link from 'next/link';
import { legalPaths, links } from '@/lib/paths';

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
