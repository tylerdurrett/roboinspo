export function VideoPlayButton() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="cursor-pointer"
    >
      <path
        d="M90.32 171.22C135.21 171.22 171.6 134.83 171.6 89.94C171.6 45.0503 135.21 8.66 90.32 8.66C45.4303 8.66 9.04004 45.0503 9.04004 89.94C9.04004 134.83 45.4303 171.22 90.32 171.22Z"
        stroke="#F4E8D3"
        strokeMiterlimit="10"
      />
      <path
        d="M63.3501 120.41V58.26C63.3501 55.46 66.2901 53.65 68.7901 54.89L131.04 85.96C133.82 87.35 133.82 91.31 131.04 92.69L68.7901 123.76C66.2901 125.01 63.3501 123.19 63.3501 120.39V120.41Z"
        fill="#FFC569"
        className="transition-transform duration-300 hover:scale-110 active:scale-95 origin-center"
        style={{ transformOrigin: '100px 90px' }}
      />
      <path
        d="M141.95 178.88H179.26V141.57"
        stroke="#FFC569"
        strokeMiterlimit="10"
      />
      <path
        d="M38.6899 1H1.37988V38.31"
        stroke="#FFC569"
        strokeMiterlimit="10"
      />
    </svg>
  )
}
