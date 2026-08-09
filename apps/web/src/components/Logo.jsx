export default function Logo({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 2.5 4.5 5.3v5.8c0 4.8 3.2 8.9 7.5 10.4 4.3-1.5 7.5-5.6 7.5-10.4V5.3L12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8.7 13.6c0-1.9 1.5-3.4 3.3-3.4s3.3 1.5 3.3 3.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="7.6"
        y1="13.6"
        x2="16.4"
        y2="13.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
