interface MatchPointLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'white';
  className?: string;
}

export default function MatchPointLogo({ 
  size = 'md', 
  variant = 'default',
  className = '' 
}: MatchPointLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
    xl: 'w-24 h-24 text-5xl'
  };

  const colorClasses = {
    default: 'text-green-600',
    white: 'text-white'
  };

  return (
    <div className={`flex items-center justify-center bg-green-50 rounded-full ${sizeClasses[size]} ${className}`}>
      <div className={`flex items-center justify-center ${colorClasses[variant]}`}>
        <svg 
          viewBox="0 0 100 100" 
          className={`${sizeClasses[size]} drop-shadow-sm`}
          fill="currentColor"
        >
          {/* Tennis ball */}
          <circle cx="50" cy="50" r="35" fill="currentColor" className="opacity-90" />
          
          {/* Tennis ball curved lines */}
          <path 
            d="M25 35 Q50 25 75 35 Q50 45 25 35" 
            fill="none" 
            stroke="white" 
            strokeWidth="2.5"
            className="opacity-80"
          />
          <path 
            d="M25 65 Q50 55 75 65 Q50 75 25 65" 
            fill="none" 
            stroke="white" 
            strokeWidth="2.5"
            className="opacity-80"
          />
          
          {/* Match point "M" overlay */}
          <text 
            x="50" 
            y="60" 
            textAnchor="middle" 
            fill="white" 
            className="text-lg font-bold"
            fontSize="24"
          >
            M
          </text>
        </svg>
      </div>
    </div>
  );
}