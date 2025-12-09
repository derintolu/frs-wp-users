export default function AddWidget() {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center justify-center rounded-lg border-2 border-gray-200 p-4 shadow-md">
      <div className="rounded-full bg-gray-100 p-4">
        <svg
          className="size-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h1 className="mt-4 text-center text-xl font-semibold text-gray-700">
        Add an email account
      </h1>
      <p className="text-center text-sm text-gray-500">
        You need to add email accounts to continue
      </p>
      <button className="focus:shadow-outline mt-4 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600 focus:outline-none">
        Add Email Account
      </button>
    </div>
  );
}
