import EmailIcon from "../../icons/email-icon";

export default function Add() {
  return (
    <div className="mx-auto max-w-md overflow-hidden rounded-lg bg-white shadow-md">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <EmailIcon />
            <div className="ml-4">
              <div className="text-lg font-semibold text-gray-900">
                Any Provider IMAP / SMTP
              </div>
            </div>
          </div>
        </div>

        <form className="mt-6 space-y-4">
          <div className="flex gap-4">
            <input
              className="w-1/2 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
              placeholder="First Name*"
              type="text"
            />
            <input
              className="w-1/2 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
              placeholder="Last Name*"
              type="text"
            />
          </div>
          <input
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
            placeholder="Email*"
            type="email"
          />
          <input
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
            placeholder="Password"
            type="password"
          />
          <div className="flex gap-4">
            <input
              className="w-1/2 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
              placeholder="IMAP Host*"
              type="text"
            />
            <input
              className="w-1/2 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
              placeholder="IMAP Port*"
              type="text"
            />
          </div>
          <div className="flex items-center">
            {/* <label className="flex items-center">
              <input
                type="radio"
                name="encryption"
                className="form-radio"
                value="none"
              />
              <span className="ml-2">None</span>
            </label>
            <label className="flex items-center ml-6">
              <input
                type="radio"
                name="encryption"
                className="form-radio"
                value="ssl"
              />
              <span className="ml-2">SSL</span>
            </label>
            <label className="flex items-center ml-6">
              <input
                type="radio"
                name="encryption"
                className="form-radio"
                value="tls"
              />
              <span className="ml-2">TLS</span>
            </label> */}

            <ul className="w-full items-center rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:flex">
              <li className="w-full border-b border-gray-200 dark:border-gray-600 sm:border-b-0 sm:border-r">
                <div className="flex items-center ps-3">
                  <input
                    className="size-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-700"
                    id="horizontal-list-radio-id"
                    name="list-radio"
                    type="radio"
                    value="ssl"
                  />
                  <label
                    className="ms-2 w-full py-3 text-sm font-medium text-gray-900 dark:text-gray-300"
                    htmlFor="horizontal-list-radio-id">
                    SSL
                  </label>
                </div>
              </li>
              <li className="w-full border-b border-gray-200 dark:border-gray-600 sm:border-b-0 sm:border-r">
                <div className="flex items-center ps-3">
                  <input
                    className="size-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-700"
                    id="horizontal-list-radio-military"
                    name="list-radio"
                    type="radio"
                    value="tls"
                  />
                  <label
                    className="ms-2 w-full py-3 text-sm font-medium text-gray-900 dark:text-gray-300"
                    htmlFor="horizontal-list-radio-military">
                    TLS
                  </label>
                </div>
              </li>
              <li className="w-full border-b border-gray-200 dark:border-gray-600 sm:border-b-0 sm:border-r">
                <div className="flex items-center ps-3">
                  <input
                    className="size-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-700"
                    id="horizontal-list-radio-license"
                    name="list-radio"
                    type="radio"
                    value="none"
                  />
                  <label
                    className="ms-2 w-full py-3 text-sm font-medium text-gray-900 dark:text-gray-300"
                    htmlFor="horizontal-list-radio-license">
                    None
                  </label>
                </div>
              </li>
            </ul>
          </div>
          <div className="mt-4 flex items-center">
            {/* <label className="flex items-center">
          <input type="checkbox" className="form-checkbox" />
          <span className="ml-2">Authentication</span>
        </label> */}

            <label className="relative inline-flex cursor-pointer items-center">
              <input className="peer sr-only" type="checkbox" value="" />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800 rtl:peer-checked:after:-translate-x-full"></div>
              <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                Authentication
              </span>
            </label>
          </div>
          <button
            className="w-full rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            type="submit">
            Connect
          </button>
        </form>
      </div>
    </div>
  );
}
