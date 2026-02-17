"use client";

import ReCAPTCHA from "react-google-recaptcha";

export default function Captcha({ onChange, onErrored }) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!siteKey) {
    console.warn("reCAPTCHA site key is not configured");
    return null;
  }

  return (
    <div className="flex justify-center my-4">
      <ReCAPTCHA sitekey={siteKey} onChange={onChange} onErrored={onErrored} />
    </div>
  );
}
