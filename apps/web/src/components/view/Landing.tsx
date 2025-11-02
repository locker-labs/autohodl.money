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
      <div className='lg:hidden top-0 sticky w-full h-[64px] bg-[#f7feec] flex items-center justify-between px-[24px] border-b border-[#4D4A4A]/10'>
        <Link href='/'>
          <Image className='w-[100px]' src='/AutoHODL.png' alt='AutoHODL' width={200} height={100} priority />
        </Link>

        <Button
          type={'button'}
          onAction={() => open()}
          disabled={false}
          aria-disabled={false}
          className={'w-[124px] h-[38px] font-bold rounded-[8px]'}
          title={'Connect Wallet'}
        >
          Get Started
        </Button>
      </div>

      <section className='px-[24px] bg-[#f7feec] h-screen flex flex-col items-center lg:justify-center'>
        <div className={'h-[120px] py-4 max-w-[1440px] w-full hidden lg:flex justify-between items-end'}>
          <Link href='/'>
            <Image
              className='w-[150px] lg:w-[200px]'
              src='/AutoHODL.png'
              alt='AutoHODL'
              width={200}
              height={100}
              priority
            />
          </Link>
        </div>

        {/* Mobile */}
        <div className='lg:hidden w-full max-w-[1440px] flex flex-col items-center justify-center gap-[60px]'>
          <div>
            <p className='mt-[80px] text-[44px] font-semibold text-center leading-none'>Save your spare change</p>
            <p className='mt-[16px] text-[#4D4A4A] text-[20px] w-full'>
              Earn yield on your spare change, earn points while you shop, and more ways to HODL.
            </p>
            <div className='flex justify-center'>
              <Button
                type={'button'}
                onAction={() => open()}
                disabled={false}
                aria-disabled={false}
                className={'mt-[16px] w-[144px] h-[44px] font-bold rounded-[8px]'}
                title={'Connect Wallet'}
              >
                Get Started
              </Button>
            </div>
          </div>
          <div className='w-full flex items-center justify-center'>
            <img
              className='lg:max-w-[480px] aspect-auto'
              src={'/hero.landing.png'}
              alt='hero'
              width={600}
              height={400}
            />
          </div>
        </div>

        {/* Desktop */}
        <div className='hidden h-[calc(100vh-120px)] w-full max-w-[1440px] lg:grid grid-cols-2 items-center justify-between gap-[60px]'>
          <div>
            <h1 className='text-[44px] lg:text-[42px] font-medium max-w-[700px]'>
              Saves your spare change.
              <br />
              Every time you spend with a crypto card
            </h1>
            <h4 className='mt-[16px] text-[#4D4A4A] text-[20px] max-w-[500px]'>
              Earn yield on your spare change, earn points while you shop, and more ways to HODL.
            </h4>
            <Button
              type={'button'}
              onAction={() => open()}
              disabled={false}
              aria-disabled={false}
              className={'mt-[40px] w-[245px] h-[52px] font-bold rounded-[8px]'}
              title={'Connect Wallet'}
            >
              Get started
            </Button>
          </div>
          <div className='w-full flex items-center justify-end'>
            <Image
              className='lg:max-w-[480px] aspect-auto'
              src={'/hero.landing.png'}
              alt='Welcome Image'
              width={600}
              height={400}
            />
          </div>
        </div>
        <div className='h-[120px]' />
      </section>

      {/* On-chain Savings Simplified */}
      {/* mobile */}
      <section className='lg:hidden p-[48px] bg-[#ffffff] w-full flex flex-col items-center justify-center'>
        <div className={'mb-[82px] max-w-[1440px] w-full flex flex-col justify-center items-center'}>
          <p className='text-[40px] font-medium'>
            On-chain Savings, <span className='text-[#78E76E]'>Simplified</span>
          </p>
          <p className='text-center text-[#4D4A4A] text-[20px] mt-[16px]'>
            Auto HODL automatically rounds up your crypto card purchases and sends the savings to Aave, where they earn
            passive yield.
          </p>
        </div>

        <div className='mb-4 max-w-[1440px] grid gap-[32px]'>
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
      {/* Desktop */}
      <section className='hidden p-[48px] bg-[#ffffff] h-screen lg:flex flex-col items-center justify-center'>
        <div className={'mb-[82px] max-w-[1440px] w-full flex flex-col justify-center items-center'}>
          <p className='text-[40px] font-medium'>
            On-chain Savings, <span className='text-[#78E76E]'>Simplified</span>
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

      {/* Launch Partner MetaMask Card */}
      <section className='px-[24px] bg-[#f7feec] lg:h-[600px] flex items-center justify-center'>
        <div className={'mb-12 lg:mb-0 max-w-[1440px] w-full grid lg:grid-cols-2 gap-[32px]'}>
          <div className='flex flex-col items-start justify-center'>
            <p className='mt-12 lg:mt-0 lg:mb-2 text-[24px] font-base'>Launch Partner</p>
            <p className='text-[40px] font-medium'>MetaMask Card</p>
            <p className='mb-[24px] lg:mb-[32px] max-w-[500px] text-[#4D4A4A] text-[20px]'>
              Save & earn yield on your MetaMask Card transfers
            </p>

            <Button
              type={'button'}
              onAction={() => window.open(paths.GetMetaMaskCard, '_blank')}
              disabled={false}
              aria-disabled={false}
              className={'w-[140px] lg:w-[245px] h-[44px] lg:h-[52px] font-bold rounded-[8px]'}
              title={'Start now'}
            >
              Start now
            </Button>
          </div>
          <div className='my-8 lg:my-0 transition-transform duration-500 hover:rotate-[-8deg] lg:size-[800px] flex items-center justify-center'>
            <Image src='/mmcards.png' alt='img' width={800} height={800} />
          </div>
        </div>
      </section>

      {/* Recognized by */}
      <section className='p-[48px] bg-[#ffffff] lg:h-[67vh] flex flex-col items-center justify-center'>
        <div className={'mb-[40px] lg:mb-[82px] max-w-[1440px] w-full flex flex-col justify-center items-center'}>
          <p className='text-[40px] font-medium'>Recognized by</p>
        </div>

        <div className='lg:mb-0 mb-4 max-w-[1440px] grid grid-cols-2 gap-[32px]'>
          <BorderCard2 href={paths.MetaMask} imgSrc='/MetaMask-icon-fox-with-margins.svg' />
          <BorderCard2 href={paths.Circle} imgSrc='/circle-icon.svg' />
          <BorderCard2 href={paths.Arbitrum} imgSrc='/0923_Arbitrum_Logos_Logomark_RGB.svg' />
          <BorderCard2 href={paths.Base} imgSrc='/Base_square_blue.svg' />
        </div>
      </section>

      {/* Setup once, Save forever */}
      <section className='px-[24px] bg-[#f7feec] lg:h-[420px] flex flex-col items-center justify-center'>
        <div className='w-full max-w-[1440px] flex items-center justify-between gap-[60px]'>
          <div className='mt-8 lg:mt-0 mb-12 lg:mb-0'>
            <h1 className='text-[42px] font-medium max-w-[600px]'>
              Setup once. <br className='sm:hidden' />
              <span className='text-[#78E76E] font-bold'>Save forever.</span>
            </h1>
            <h4 className='mt-4 lg:mt-0 mb-[40px] text-[24px]'>
              Join thousands of users who are building wealth with every purchase.
              <br />
              No effort required.
            </h4>
            <Button
              type={'button'}
              onAction={() => open()}
              disabled={false}
              aria-disabled={false}
              className={'w-[140px] lg:w-[245px] h-[44px] lg:h-[52px] font-bold rounded-[8px]'}
              title={'Get started'}
            >
              Get started
            </Button>
          </div>
        </div>
      </section>
      <hr className='bg-[#D0D0D0] h-[2px] opacity-70' />
      <footer className='px-[24px] bg-[#f7feec] w-full flex items-center justify-center py-[40px]'>
        <div className='max-w-[1440px] w-full flex items-start lg:items-center justify-between'>
          <button
            type='button'
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className='text-[16px] text-black cursor-pointer'
          >
            Auto<span className='font-bold'>HODL</span>
          </button>
          <div className='flex flex-col sm:flex-row items-start lg:items-center justify-center gap-[12px] lg:gap-[32px] text-[16px] text-[#4D4A4A]'>
            <p className='sm:hidden text-sm font-bold'>Connect</p>
            {[
              { href: links.telegram, label: 'Telegram' },
              { href: links.twitter, label: 'Twitter' },
              { href: links.github, label: 'GitHub' },
              { href: links.contact, label: 'Email' },
            ].map((item, idx) => (
              <ExternalLink href={item.href} key={`footer-link-${`${idx}`}`}>
                <p className='text-sm lg:text-base'>{item.label}</p>
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

function BorderCard2({ className, imgSrc, href }: { className?: string; imgSrc: string; href: string }) {
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
