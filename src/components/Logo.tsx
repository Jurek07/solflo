'use client';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 36, text: 'text-xl' },
    lg: { icon: 48, text: 'text-2xl' },
  };

  const { icon, text } = sizes[size];

  return (
    <div className="flex items-center gap-2.5">
      {/* Logo Icon - Stylized S with flow lines */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <rect width="48" height="48" rx="12" fill="#00D26A" />
        
        {/* Flow symbol - three curved lines forming an S shape */}
        <path
          d="M14 18C14 18 18 14 24 14C30 14 34 18 34 18"
          stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M14 24C14 24 18 28 24 28C30 28 34 24 34 24"
          stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M14 30C14 30 18 34 24 34C30 34 34 30 34 30"
          stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      {/* Text */}
      {showText && (
        <span className={`font-semibold ${text}`}>
          <span className="text-white">Sol</span>
          <span className="text-[#00D26A]">Flo</span>
        </span>
      )}
    </div>
  );
}
