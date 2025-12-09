import React from "react";

function Icon() {
  return (
    <svg
      className="w-10"
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg">
      <rect fill="#fff" height="512" rx="15%" width="512"></rect>
      <path d="M158 391V249l-82-63v175q0 30 30 30" fill="#4285f4"></path>
      <path d="M154 248l102 77 102-77v-98l-102 77-102-77" fill="#ea4335"></path>
      <path d="M354 391V249l82-63v175q0 30-30 30" fill="#34a853"></path>
      <path
        d="M76 188l82 63v-98l-30-23c-27-21-52 0-52 26"
        fill="#c5221f"></path>
      <path
        d="M436 188l-82 63v-98l30-23c27-21 52 0 52 26"
        fill="#fbbc04"></path>
    </svg>
  );
}

export default Icon;
