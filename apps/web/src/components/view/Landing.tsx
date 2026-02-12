'use client';

import { useAppKit } from '@reown/appkit/react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/subcomponents/Button';
import { paths } from '@/lib/paths';
import { ArrowUpRight } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useRef } from 'react';
import { Footer } from '@/components/subcomponents/Footer';

const copy = {
  hero: {
    heading1: 'Grow your crypto passively.',
    heading2: 'While you spend normally.',
    description:
      'Effortlessly save as you spend, earn attractive yields on your savings, and discover even more ways to HODL your assets securely.',
    cta: 'Get started',
    ctaDesktop: 'Start saving now',
  },
  mobile: {
    cta: 'Start saving',
  },
  savings: {
    heading1: 'Crypto Savings,',
    heading2: 'Simplified',
    description:
      'autoHODL rounds up your all your USDC transfers and crypto card purchases, then deposits the extra into Aave to earn yield.',
  },
  cards: [
    {
      title: 'Spend normally',
      description: 'Use your MetaMask card or make USDC transfers for everyday purchases as usual.',
      imgSrc: '/coins.png',
    },
    {
      title: 'Auto round-up',
      description: 'We take the spare change and move it into a savings account that only you control.',
      imgSrc: '/auto-roundup.png',
    },
    {
      title: 'Grow passively',
      description: 'Your savings earn yield while staying fully secure. Or choose idle savings if you prefer.',
      imgSrc: '/grow-passively.png',
    },
  ],
  metaMaskCard: {
    label: 'Support for',
    heading: 'MetaMask Card',
    description: '1st place: MetaMask x Circle - Smart Agents & Liquidity Automation',
    cta: 'Learn more',
  },
  spendableYield: {
    heading: 'Spendable Yield Tokens',
    description:
      'AutoHODL converts your yield into SYTs tokens that accumulate rewards even while you spend them.They work like normal tokens but grow automatically in your wallet without staking, locking, or claiming.',
    cta: 'Learn more',
  },
  testimonials: [
    {
      idx: 0,
      text: `"This is what building on open infrastructure looks like. More of this, please!"`,
      author: 'Alejandro Machado',
      role: 'MetaMask',
    },
  ],
  recognized: {
    heading: 'Recognized by',
  },
  setup: {
    heading1: 'Setup once.',
    heading2: 'Save forever.',
    description: 'Join a worldwide network and start building wealth with every purchase. No effort required.',
    cta: 'Get started',
  },
};

export default function LandingPage() {
  const { open } = useAppKit();
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

  // TODO: fix hero section header layout and remove bottom margin
  // TODO: add responsive design for mobile views

  return (
    <div className='w-full min-h-screen overflow-x-hidden'>
      <div className='lg:hidden top-0 sticky w-full h-[64px] bg-[#f7feec] flex items-center justify-between px-[24px] border-b border-[#4D4A4A]/10'>
        <Link href='/'>
          <Image className='w-[100px]' src='/AutoHODL.png' alt='AutoHODL' width={200} height={100} priority />
        </Link>

        <Button
          onAction={() => open()}
          aria-disabled={false}
          className={'w-[124px] h-[38px] font-bold rounded-[8px]'}
          title={'Connect wallet'}
        >
          {copy.mobile.cta}
        </Button>
      </div>

      <section className='px-[24px] lg:px-[96px] bg-[#f7feec] min-h-screen lg:h-screen flex flex-col items-center lg:justify-center'>
        <div className={'h-[120px] py-4 max-w-[1080px] w-full hidden lg:flex justify-between items-end'}>
          <Link href='/'>
            <Image
              className='w-[150px] lg:w-[200px]'
              src='/AutoHODL.png'
              alt='autoHODL'
              width={200}
              height={100}
              priority
            />
          </Link>
        </div>

        {/* Mobile */}
        <div className='mt-[40px] lg:hidden w-full max-w-[1080px]'>
          <H2 className='text-center'>{copy.hero.heading1}</H2>
          <H2>{copy.hero.heading2}</H2>
          <Description className='mt-[16px] text-center'>{copy.hero.description}</Description>
          <div className='mt-[16px] flex justify-center'>
            <Button
              onAction={() => open()}
              className={'w-[124px] h-[38px] font-bold rounded-[8px]'}
              title={'Connect wallet'}
            >
              {copy.hero.cta}
            </Button>
          </div>
          <div className='mx-auto mt-[60px] max-w-[480px] w-fit flex items-center justify-center'>
            <Image className='aspect-auto' src={'/hero.landing.png'} alt='hero' width={400} height={400} />
          </div>
        </div>

        {/* Desktop */}
        <div className='hidden h-[calc(100vh-120px)] w-full max-w-[1080px] lg:grid grid-cols-2 items-center justify-between gap-[40px]'>
          <div>
            <H2 className='text-start'>{copy.hero.heading1}</H2>
            <H2 className='text-start'>{copy.hero.heading2}</H2>
            <Description className='mt-[16px] max-w-[500px]'>{copy.hero.description}</Description>
            <Button
              onAction={() => open()}
              className={'mt-[40px] w-[245px] h-[52px] font-bold rounded-[8px]'}
              title={'Connect wallet'}
            >
              {copy.hero.ctaDesktop}
            </Button>
          </div>
          <div className='w-full flex items-center justify-end'>
            <div className='lg:max-w-[480px] '>
              <Image className='aspect-auto' src={'/hero.landing.png'} alt='Welcome Image' width={600} height={400} />
            </div>
          </div>
        </div>

        {/* show only on desktop */}
        <div className='hidden lg:block w-full h-[120px]' />
      </section>

      {/* On-chain Savings Simplified */}
      {/* mobile */}
      <section className='lg:hidden px-[24px] py-[40px] bg-[#ffffff] w-full flex flex-col items-center justify-center'>
        <div className={'max-w-[1080px] w-full flex flex-col justify-center items-center'}>
          <H2 className='w-full text-start font-light'>{copy.savings.heading1}</H2>
          <H2 className='w-full text-start text-[#78E76E]'>{copy.savings.heading2}</H2>
          <Description className='mt-[32px]'>{copy.savings.description}</Description>
        </div>

        <div className='mt-[40px] mb-4 max-w-[1080px] grid gap-[16px]'>
          {copy.cards.map((card) => (
            <BorderCard key={card.title} imgSrc={card.imgSrc} title={card.title} description={card.description} />
          ))}
        </div>
      </section>
      {/* Desktop */}
      <section className='hidden p-[48px] bg-[#ffffff] lg:flex flex-col items-center justify-center'>
        <div className={'mb-[82px] max-w-[1080px] w-full flex flex-col justify-center items-center'}>
          <div className='flex items-center justify-center gap-2'>
            <H2 className='w-fit'>{copy.savings.heading1}</H2>
            <H2 className='text-[#78E76E] w-fit'>{copy.savings.heading2}</H2>
          </div>

          <Description className='mt-[16px] max-w-[600px] text-center'>{copy.savings.description}</Description>
        </div>

        <div className='max-w-[1080px] grid grid-cols-3 gap-[32px]'>
          {copy.cards.map((card) => (
            <BorderCard key={card.title} imgSrc={card.imgSrc} title={card.title} description={card.description} />
          ))}
        </div>
      </section>

      {/* Launch Partner MetaMask Card */}
      <section className='lg:px-12 bg-[#f7feec] flex items-center justify-center'>
        <div className={'mb-12 lg:mb-0 max-w-[1080px] w-full grid lg:grid-cols-2 gap-[32px]'}>
          <div className='px-[24px] lg:px-0 flex flex-col items-start justify-center'>
            <p className='mt-12 lg:mt-0 lg:mb-2 text-[24px] font-base'>{copy.metaMaskCard.label}</p>
            <H2>{copy.metaMaskCard.heading}</H2>
            <Description className='mt-[24px] mb-[24px] lg:mb-[32px] max-w-[500px]'>
              {copy.metaMaskCard.description}
            </Description>

            <Button
              onAction={() => open()}
              className={'w-[140px] lg:w-[245px] h-[44px] lg:h-[52px] font-bold rounded-[8px]'}
              title={copy.metaMaskCard.cta}
            >
              {copy.metaMaskCard.cta}
            </Button>
          </div>
          <div className='my-8 lg:my-0 transition-transform duration-500 lg:size-[800px] flex items-center justify-center'>
            <Image src='/mmcard-hero.png' alt='img' width={800} height={800} />
          </div>
        </div>
      </section>

      {/* Spendable Yield Tokens */}
      <section className='lg:px-12 bg-white flex items-center justify-center'>
        <div className={'mt-12 mb-12 lg:mb-0 lg:mt-0 max-w-[1080px] w-full grid lg:grid-cols-2 gap-[32px]'}>
          <div className='px-[24px] lg:px-0 flex flex-col items-start justify-center'>
            <p className='text-[40px] font-semibold leading-[44px]'>{copy.spendableYield.heading}</p>
            <Description className='mt-[20px] mb-[24px] lg:mb-[32px] max-w-[500px]'>
              {copy.spendableYield.description}
            </Description>

            <Button
              onAction={() => window.open(paths.LearnMoreSYT, '_blank')}
              className={'w-[140px] lg:w-[245px] h-[44px] lg:h-[52px] font-bold rounded-[8px]'}
              title={copy.spendableYield.cta}
              btnStyle='secondary'
            >
              {copy.spendableYield.cta}
            </Button>
          </div>
          <div
            className={`mx-[20px] lg:mx-0 
          transition-transform duration-500 hover:scale-103 lg:size-[700px] 
          flex items-center justify-center 
          max-w-[700px]
          aspect-square rounded-[24px] bg-[#F7FEEC] lg:bg-[#ffffff]
            `}
          >
            <Image className='aspect-auto' src='/syt.png' alt='img' width={700} height={700} />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className='py-[48px] px-[24px] lg:px-[48px] bg-[#f7feec] flex flex-col items-center justify-center'>
        {/* Shadcn carousel */}
        <Carousel
          plugins={[plugin.current]}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
          className='mt-4 lg:mt-0 w-full max-w-[1000px]'
        >
          <CarouselContent>
            {copy.testimonials.map((t) => (
              <CarouselItem key={t.idx}>
                <div className='items-center justify-center p-0 lg:p-6'>
                  <p className='text-[24px] lg:text-[32px] font-base text-center'>{t.text}</p>
                  <div className='mt-[24px] lg:mt-[47px]'>
                    <p className='text-[24px] font-bold'>{t.author}</p>
                    <p className='text-[20px] font-medium'>{t.role}</p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      {/* Recognized by */}
      <section className='py-[48px] px-[24px] bg-[#ffffff] flex flex-col items-center justify-center'>
        <div className={'mb-[40px] lg:mb-[82px] max-w-[1080px] w-full flex flex-col justify-center items-center'}>
          <H2>{copy.recognized.heading}</H2>
        </div>

        <div className='lg:mb-0 mb-4 max-w-[1080px] grid grid-cols-2 gap-[12px] lg:gap-[32px]'>
          <BorderCard2 href={paths.MetaMask} imgSrc='/MetaMask-icon-fox-with-margins.svg' />
          <BorderCard2 href={paths.Circle} imgSrc='/circle-icon.svg' />
          <BorderCard2 href={paths.Arbitrum} imgSrc='/0923_Arbitrum_Logos_Logomark_RGB.svg' />
          <BorderCard2 href={paths.Base} imgSrc='/Base_square_blue.svg' />
        </div>
      </section>

      {/* Setup once, Save forever */}
      <section className='px-[24px] bg-[#f7feec] lg:h-[420px] flex flex-col items-center justify-center'>
        <div className='w-full max-w-[1080px] flex items-center justify-between gap-[60px]'>
          <div className='mt-8 lg:mt-0 mb-12 lg:mb-0'>
            <H2 className='text-start max-w-[600px]'>
              {copy.setup.heading1} <br className='sm:hidden' />
              <span className='text-[#78E76E]'>{copy.setup.heading2}</span>
            </H2>
            <h4 className='mt-[24px] mb-[40px] text-[24px]'>{copy.setup.description}</h4>
            <Button
              onAction={() => open()}
              className={'w-[140px] lg:w-[245px] h-[44px] lg:h-[52px] font-bold rounded-[8px]'}
              title={copy.setup.cta}
            >
              {copy.setup.cta}
            </Button>
          </div>
        </div>
      </section>
      <Footer innerClassName='bg-[#f7feec]' />
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
      className={`border border-[#78E76E] rounded-[16px] p-[16px] flex flex-col items-center justify-center ${className}`}
    >
      <div className='transition-transform duration-500 hover:scale-105 w-[300px] aspect-auto p-4 flex items-center justify-center'>
        <div className='h-[200px] aspect-auto p-4 flex items-center justify-center'>
          <Image className='aspect-auto' src={imgSrc} alt='img' width={287} height={287} />
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
        className={`group relative transition-all duration-500 cursor-pointer hover:scale-105 border border-[#78E76E] rounded-[16px] hover:rounded-[24px] p-[32px] flex flex-col items-center justify-center ${className}`}
      >
        <div className='group-hover:opacity-100 absolute top-4 right-4 group-hover:top-3 group-hover:right-3 opacity-0 transition-all duration-300'>
          <ArrowUpRight size={24} color='#78E76E' />
        </div>

        <Image className='aspect-square select-none' src={imgSrc} alt='img' width={100} height={100} />
      </div>
    </Link>
  );
}

function H2({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-[40px] font-semibold text-center leading-[44px] ${className}`}>{children}</h2>;
}

function Description({ children, className }: { children: React.ReactNode; className?: string }) {
  // leading-[44px]
  return <p className={`text-[#4D4A4A] text-[17px] lg:text-[20px] font-medium  ${className}`}>{children}</p>;
}
