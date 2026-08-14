export const Logo = ({ size = 32 }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      width={size} 
      height={size}
      style={{ display: 'block' }}
    >
      {/* Outer Sync Loop 1 (Forest Green) */}
      <path 
        d="M 50,14 A 36,36 0 0,1 86,50 A 36,36 0 0,1 75,75" 
        fill="none" 
        stroke="#2c3e2e" 
        strokeWidth="5.5" 
        strokeLinecap="round" 
      />
      {/* Arrow Head 1 */}
      <path 
        d="M 77,66 L 75,75 L 66,73" 
        fill="none" 
        stroke="#2c3e2e" 
        strokeWidth="4.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* Outer Sync Loop 2 (Sage Green) */}
      <path 
        d="M 50,86 A 36,36 0 0,1 14,50 A 36,36 0 0,1 25,25" 
        fill="none" 
        stroke="#4d6b50" 
        strokeWidth="5.5" 
        strokeLinecap="round" 
      />
      {/* Arrow Head 2 */}
      <path 
        d="M 23,34 L 25,25 L 34,27" 
        fill="none" 
        stroke="#4d6b50" 
        strokeWidth="4.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* Central Chat/Message Bubble (Therapy Communication) */}
      <path 
        d="M 36,32 H 64 C 71,32 74,35 74,42 V 54 C 74,61 71,64 64,64 H 46 L 36,71 V 64 C 31,64 26,61 26,54 V 42 C 26,35 31,32 36,32 Z" 
        fill="#2c3e2e" 
      />

      {/* Subtle Medical Cross integrated inside the bubble (Accent Color #d8e5d9) */}
      <path 
        d="M 50,40 V 56 M 42,48 H 58" 
        stroke="#d8e5d9" 
        strokeWidth="5.5" 
        strokeLinecap="round" 
      />
    </svg>
  );
};

export default Logo;
