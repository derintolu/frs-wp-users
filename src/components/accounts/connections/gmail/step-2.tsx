import GmailIcon from "../../icons/gmail-icon";
import { StepProps } from "../../../../admin/types/account-types";

export default function Step2({ stepCount }: StepProps) {
  return (
    <div className="mx-auto max-w-xl overflow-hidden rounded-lg bg-white shadow-md">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex w-full items-center justify-center">
            <GmailIcon />

            <div className="ml-4">
              <div className="text-lg font-semibold text-gray-900">
                Connect Your Google Account
              </div>
            </div>
          </div>
        </div>

        <h3 className="mt-4 text-center font-semibold text-gray-800">
          Select a connection option
        </h3>

        <div className="mt-6">
          <div
            className="mb-4 cursor-pointer rounded-lg bg-gray-50 p-4 shadow"
            onClick={() => stepCount?.(3)}>
            <div className="flex justify-between">
              <h4 className="font-semibold text-gray-900">Option 1: OAuth</h4>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-500">
                RECOMMENDED
              </span>
            </div>
            <ul className="mt-2">
              <li className="flex items-center">
                {/* Insert check icon SVG here */}
                <span className="ml-2 text-gray-700">
                  Select a connection option
                </span>
              </li>
              <li className="flex items-center">
                {/* Insert check icon SVG here */}
                <span className="ml-2 text-gray-700">
                  By accessing or using any part of the Website
                </span>
              </li>
              <li className="flex items-center">
                {/* Insert check icon SVG here */}
                <span className="ml-2 text-gray-700">
                  By accessing or using any part of the Website
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 shadow">
            <h4 className="font-semibold text-gray-900">
              Option 2: App Password
            </h4>
            <ul className="mt-2">
              <li className="flex items-center">
                {/* Insert check icon SVG here */}
                <span className="ml-2 text-gray-700">
                  Select a connection option
                </span>
              </li>
              <li className="flex items-center">
                {/* Insert warning icon SVG here */}
                <span className="ml-2 text-gray-700">
                  By accessing or using any part of the Website
                </span>
              </li>
              <li className="flex items-center">
                {/* Insert warning icon SVG here */}
                <span className="ml-2 text-gray-700">
                  By accessing or using any part of the Website
                </span>
              </li>
            </ul>
          </div>
        </div>
        <button onClick={() => stepCount?.(1)}>Back</button>
      </div>
    </div>
  );
}
