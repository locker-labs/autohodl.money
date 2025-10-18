'use client';

import { useAppKit } from '@reown/appkit/react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/subcomponents/Button';
import { links, paths } from '@/lib/paths';
import { ArrowUpRight } from 'lucide-react';

export default function LandingPage() {
  const { open } = useAppKit();

  // TODO: fix hero section header layout and remove bottom margin
  // TODO: add responsive design for mobile views

  return (
    <div className='w-full min-h-screen overflow-x-hidden'>
      <section className='px-[24px] bg-[#f7feec] h-screen flex flex-col items-center justify-center'>
        <div className={'h-[120px] py-4 max-w-[1440px] w-full flex justify-between items-end'}>
          <Link href='/'>
            <Image src='/AutoHODL.png' alt='AutoHODL' width={200} height={100} priority />
          </Link>
        </div>

        <div className='h-[calc(100vh-120px)] w-full max-w-[1440px] grid grid-cols-2 items-center justify-between gap-[60px]'>
          <div>
            <h1 className='text-[42px] font-medium max-w-[600px]'>
              Saves your spare change,
              <br />
              Every time you spend with a Crypto Card
            </h1>
            <h4 className='mt-[16px] text-[#4D4A4A] text-[20px] max-w-[500px]'>
              Auto HODL automatically rounds up your crypto card purchases and sends the savings to Aave, where they
              earn passive yield.
            </h4>
            <Button
              type={'button'}
              onAction={() => open()}
              disabled={false}
              aria-disabled={false}
              className={'mt-[40px] w-[245px] h-[52px] font-bold rounded-[8px]'}
              title={'Connect Wallet'}
            >
              Start Saving Now
            </Button>

            <p className='mt-[16px] text-[14px] text-black'>MetaMask card is supported now, but more coming soon</p>
          </div>
          <div className='w-full flex items-center justify-end'>
            <Image
              className='max-w-[480px] aspect-auto'
              src={'/hero.landing.png'}
              alt='Welcome Image'
              width={600}
              height={400}
            />
          </div>
        </div>
        <div className='h-[120px]' />
      </section>

      {/* Crypto Savings Simplified */}
      <section className='p-[48px] bg-[#ffffff] h-screen flex flex-col items-center justify-center'>
        <div className={'mb-[82px] max-w-[1440px] w-full flex flex-col justify-center items-center'}>
          <p className='text-[40px] font-medium'>
            Crypto Savings, <span className='text-[#78E76E]'>Simplified</span>
          </p>
          <p className='max-w-[600px] text-center text-[#4D4A4A] text-[20px] mt-[16px]'>
            Auto HODL automatically rounds up your crypto card purchases and sends the savings to Aave, where they earn
            passive yield.
          </p>
        </div>

        <div className='max-w-[1440px] grid grid-cols-3 gap-[32px]'>
          <BorderCard
            imgSrc='/coins.png'
            title='Spend normally'
            description='Use your MetaMask Card for daily purchases'
          />
          <BorderCard
            imgSrc='/save.png'
            title='Auto round-up'
            description='Spare change ($0.37, $5.32, etc.) is deposited into Aave automatically'
          />
          <BorderCard
            imgSrc='/grow.svg'
            title='Grow passively'
            description='Your savings earn yield while staying fully secure'
          />
        </div>
      </section>

      {/* Support for metamask card */}
      <section className='px-[24px] bg-[#f7feec] h-[600px] flex items-center justify-center'>
        <div className={'max-w-[1440px] w-full grid grid-cols-2 gap-[32px]'}>
          <div className='flex flex-col items-start justify-center'>
            <p className='mb-2 text-[24px] font-base'>Support for</p>
            <p className='text-[40px] font-medium'>MetaMask Card</p>
            <p className='mb-[32px] max-w-[500px] text-[#4D4A4A] text-[20px]'>
              1st place: MetaMask x Circle - Smart Agents & Liquidity Automation
            </p>

            <Button
              type={'button'}
              onAction={() => window.open(paths.GetMetaMaskCard, '_blank')}
              disabled={false}
              aria-disabled={false}
              className={'w-[245px] h-[52px] font-bold rounded-[8px]'}
              title={'Learn more'}
            >
              Learn more
            </Button>
          </div>
          <div className='transition-transform duration-500 hover:rotate-[-8deg] size-[800px] flex items-center justify-center'>
            <Image src='/mmcards.png' alt='img' width={800} height={800} />
          </div>
        </div>
      </section>

      {/* Grant & Bounties */}
      <section className='p-[48px] bg-[#ffffff] h-[67vh] flex flex-col items-center justify-center'>
        <div className={'mb-[82px] max-w-[1440px] w-full flex flex-col justify-center items-center'}>
          <p className='text-[40px] font-medium'>Grant & Bounties</p>
        </div>

        <div className='max-w-[1440px] grid grid-cols-3 gap-[32px]'>
          <BorderCard2 href={paths.CircleGrantee} imgSrc='/circle-logo.png' title='Grantee' />
          <BorderCard2
            href={paths.MetaMaskHackathonBounty}
            imgSrc='/MetaMask-icon-fox-with-margins.svg'
            title='Hackathon Bounty'
          />
          <BorderCard2 href={paths.EthGlobalHackathonBounty} imgSrc='/ethglobal.png' title='Hackathon Bounty' />
        </div>
      </section>

      {/* Setup once, Save forever */}
      <section className='px-[24px] bg-[#f7feec] h-[420px] flex flex-col items-center justify-center'>
        <div className='w-full max-w-[1440px] flex items-center justify-between gap-[60px]'>
          <div>
            <h1 className='text-[42px] font-medium max-w-[600px]'>
              Setup once. <span className='text-[#78E76E] font-bold'>Save forever.</span>
            </h1>
            <h4 className='mb-[40px] text-[24px]'>
              Join thousands of users who are building wealth with every purchase.
              <br />
              No effort required.
            </h4>
            <Button
              type={'button'}
              onAction={() => open()}
              disabled={false}
              aria-disabled={false}
              className={'w-[245px] h-[52px] font-bold rounded-[8px]'}
              title={'Start Saving Now'}
            >
              Start Saving Now
            </Button>
          </div>
        </div>
      </section>
      <hr className='bg-[#D0D0D0] h-[2px] opacity-70' />
      <footer className='px-[24px] bg-[#f7feec] w-full flex items-center justify-center py-[40px]'>
        <div className='max-w-[1440px] w-full flex items-center justify-between'>
          <button
            type='button'
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className='text-[16px] text-black cursor-pointer'
          >
            Auto<span className='font-bold'>HODL</span>
          </button>
          <div className='flex items-center justify-center gap-[32px] text-[16px] text-[#4D4A4A]'>
            {[
              { href: links.telegram, label: 'Telegram' },
              { href: links.twitter, label: 'Twitter' },
              { href: links.github, label: 'GitHub' },
              { href: links.contact, label: 'Contact' },
            ].map((item, idx) => (
              <ExternalLink href={item.href} key={`footer-link-${`${idx}`}`}>
                {item.label}
              </ExternalLink>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

function BorderCard({
  className,
  title,
  description,
  imgSrc,
}: {
  className?: string;
  title: string;
  description: string;
  imgSrc: string;
}) {
  return (
    <div
      className={`border border-[#78E76E] rounded-[8px] p-[16px] flex flex-col items-center justify-center ${className}`}
    >
      <div className='transition-transform duration-500 hover:scale-105 w-[300px] aspect-auto p-4 flex items-center justify-center'>
        <div className='h-[300px] aspect-auto p-4 flex items-center justify-center'>
          <Image className='aspect-auto shrink-0' src={imgSrc} alt='img' width={800} height={800} />
        </div>
      </div>

      <div className='p-4'>
        <p className='mb-2 font-medium text-black text-[24px] text-center'>{title}</p>
        <p className='font-base text-[#4D4A4A] text-[16px] text-center'>{description}</p>
      </div>
    </div>
  );
}

function BorderCard2({
  className,
  title,
  imgSrc,
  href,
}: {
  className?: string;
  title: string;
  imgSrc: string;
  href: string;
}) {
  return (
    <Link href={href} target='_blank' rel='noopener noreferrer'>
      <div
        className={`group relative transition-all duration-500 cursor-pointer hover:scale-105 border border-[#78E76E] rounded-[8px] p-[16px] flex flex-col items-center justify-center ${className}`}
      >
        <div className='group-hover:opacity-100 absolute top-4 right-4 group-hover:top-3 group-hover:right-3 opacity-0 transition-all duration-300'>
          <ArrowUpRight size={24} color='#78E76E' />
        </div>

        <div className='h-[150px] p-4 flex items-center justify-center'>
          <Image className='aspect-auto' src={imgSrc} alt='img' width={100} height={150} />
        </div>

        <div className='pt-4 px-4 pb-2'>
          <p className='font-medium text-black text-[24px] text-center'>{title}</p>
        </div>
      </div>
    </Link>
  );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} target='_blank' className='hover:text-black transition-colors duration-300'>
      {children}
    </Link>
  );
}
