import GmailIcon from "../../icons/gmail-icon";
import { StepProps } from "../../../../admin/types/account-types";

export default function Setp1({ setProvider, stepCount }: StepProps) {
  return (
    <div className="mx-auto max-w-md overflow-hidden rounded-lg bg-white shadow-md">
      <div className="px-6 py-4">
        <div className="flex items-center">
          <GmailIcon />

          <div className="ml-4">
            <div className="text-lg font-semibold text-gray-900">
              Connect Your Google Account
            </div>
            <p className="text-gray-600">
              First, let&apos;s enable IMAP access for your Google account.
            </p>
          </div>
        </div>
        <ol className="mt-4 list-inside list-decimal text-gray-700">
          <li>On your computer, open Gmail.</li>
          <li>Click thegear icon in the top right corner.</li>
          <li>Click All Settings.</li>
          <li>Click the Forwarding and POP/IMAP tab.</li>
          <li>In the &quot;IMAP access&quot; section, select Enable IMAP.</li>
          <li>Click Save Changes.</li>
        </ol>
      </div>
      <div className="border-t border-gray-200 px-6 py-4">
        <button
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          onClick={() => stepCount?.(2)}>
          Yes! IMAP has been enabled
        </button>
        <button
          className="bg-transparent px-4 py-2 text-blue-600 hover:underline focus:outline-none"
          onClick={() => setProvider?.("none")}>
          Go Back
        </button>
      </div>
    </div>
  );
}
