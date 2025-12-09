import GmailIcon from "./icons/gmail-icon";
import OutlookIcon from "./icons/outlook-icon";
import EmailIcon from "./icons/email-icon";

import GmailAccount from "./connections/gmail";
import { useState } from "react";

export default function ConnectAccount() {
  const [accountProvider, setAccountProvider] = useState("none");

  const handleAccountChange = (provider: string) => {
    setAccountProvider(provider);
  };
  return (
    <div>
      {accountProvider === "none" && (
        <div className="mx-auto flex max-w-sm flex-col items-center rounded-lg bg-white p-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800">
            Connect an account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Choose your email provider to add your email account.
          </p>

          <div className="mt-6 w-full">
            <div
              className="mb-4 flex cursor-pointer items-center justify-between rounded-lg bg-gray-100 p-4"
              onClick={() => handleAccountChange("gmail")}>
              <span className="flex w-full items-center justify-between">
                <GmailIcon />
                {/* <img
              src="/path-to-google-icon.png"
              alt="Google Icon"
              className="w-6 h-6"
            /> */}

                <span className="ml-2 w-full text-gray-700">Gmail</span>
              </span>
            </div>

            <div
              className="mb-4 flex cursor-pointer items-center justify-between rounded-lg bg-gray-100 p-4"
              onClick={() => handleAccountChange("outlook")}>
              <span className="flex items-center">
                {/* <img
              src="/path-to-microsoft-icon.png"
              alt="Microsoft Icon"
              className="w-6 h-6"
            /> */}
                <OutlookIcon />
                <span className="ml-2 text-gray-700">Office 365 / Outlook</span>
              </span>
            </div>

            <div
              className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-100 p-4"
              onClick={() => handleAccountChange("other")}>
              <span className="flex items-center">
                {/* <img
              src="/path-to-generic-email-icon.png"
              alt="Generic Email Icon"
              className="w-6 h-6"
            /> */}
                <EmailIcon />
                <span className="ml-2 text-gray-700">Any Provider</span>
              </span>
              <span className="text-sm text-gray-500">IMAP / SMTP</span>
            </div>
          </div>
        </div>
      )}

      {accountProvider === "gmail" && (
        <GmailAccount setProvider={setAccountProvider} />
      )}
    </div>
  );
}
