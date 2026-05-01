import Image from 'next/image';

export default function Logo() {
  return (
    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-dim shadow-[0_0_12px_var(--primary-glow)]">
      <Image src="/favicon.png" alt="MusicStory" height={32} width={32} />
    </div>
  );
}
