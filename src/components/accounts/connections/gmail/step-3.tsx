import { useState, ChangeEvent, FormEvent } from "react";
import GmailIcon from "../../icons/gmail-icon";
import { StepProps } from "../../../../admin/types/account-types";

type FormData = {
  appPassword: string;
  email: string;
  firstName: string;
  lastName: string;
};

type FormErrors = {
  appPassword: string;
  email: string;
  firstName: string;
  lastName: string;
};

export default function Step3({ stepCount }: StepProps) {
  // State to store form data
  const [formData, setFormData] = useState<FormData>({
    appPassword: "",
    email: "",
    firstName: "",
    lastName: "",
  });

  const [errorMessage, setErrorMessage] = useState<string>(
    "Account already exists.",
  );
  const [errorMessageVisiblity, setErrorMessageVisiblity] =
    useState<boolean>(false);
  const [successMessageVisiblity, setSuccessMessageVisiblity] =
    useState<boolean>(false);

  const [formErrors, setFormErrors] = useState<FormErrors>({
    appPassword: "",
    email: "",
    firstName: "",
    lastName: "",
  });

  // Function to validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Function to validate form fields
  const validate = () => {
    const errors: FormErrors = {
      appPassword: "",
      email: "",
      firstName: "",
      lastName: "",
    };
    let isValid = true;

    if (!formData.firstName) {
      errors.firstName = "First name is required";
      isValid = false;
    }

    if (!formData.lastName) {
      errors.lastName = "Last name is required";
      isValid = false;
    }

    if (!formData.email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!isValidEmail(formData.email)) {
      errors.email = "Email is not valid";
      isValid = false;
    }

    if (!formData.appPassword) {
      errors.appPassword = "App password is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle form input
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form subission

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setSuccessMessageVisiblity(false);
    setErrorMessageVisiblity(false);

    // Validate the form
    if (!validate()) {return;}

    try {
      const response = await fetch(
        wordpressPluginBoilerplate.apiUrl + "myplugin/v1/accounts/create",
        {
          body: JSON.stringify(formData),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status) {
        if (data.status === "success") {
          setSuccessMessageVisiblity(true);
          setErrorMessageVisiblity(false);
        }

        if (data.status === "error") {
          setErrorMessageVisiblity(true);
          setSuccessMessageVisiblity(false);
        }
      }
      console.log(data);
      // Handle response or set form submission state
    } catch (error) {
      console.error("Error submitting form", error);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-md overflow-hidden rounded-lg bg-white shadow-md">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <GmailIcon />
              <div className="ml-4">
                <div className="text-lg font-semibold text-gray-900">
                  Connect Your Google Account
                </div>
              </div>
            </div>
          </div>

          {successMessageVisiblity && (
            <div
              className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-gray-800 dark:text-green-400"
              role="alert">
              <span className="font-medium">Success!</span> Accont has been
              created successfully.
            </div>
          )}

          {errorMessageVisiblity && (
            <div
              className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-gray-800 dark:text-red-400"
              role="alert">
              <span className="font-medium">Error!</span>
              {errorMessage}
            </div>
          )}

          <form className="mt-6 space-y-4">
            <div className="flex gap-4">
              <div className="w-1/2">
                <input
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  name="firstName"
                  onChange={handleChange}
                  placeholder="First Name*"
                  type="text"
                  value={formData.firstName}
                />
                {formErrors.firstName && (
                  <p className="text-red-600">{formErrors.firstName}</p>
                )}
              </div>
              <div className="w-1/2">
                <input
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  name="lastName"
                  onChange={handleChange}
                  placeholder="Last Name*"
                  type="text"
                  value={formData.lastName}
                />
                {formErrors.lastName && (
                  <p className="text-red-600">{formErrors.lastName}</p>
                )}
              </div>
            </div>

            <input
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              name="email"
              onChange={handleChange}
              placeholder="Email*"
              type="email"
              value={formData.email}
            />
            {formErrors.email && (
              <p className="text-red-600">{formErrors.email}</p>
            )}
            <input
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              name="appPassword"
              onChange={handleChange}
              placeholder="App Password*"
              type="password"
              value={formData.appPassword}
            />
            {formErrors.appPassword && (
              <p className="text-red-600">{formErrors.appPassword}</p>
            )}
            <button
              className="w-full rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
              onClick={handleSubmit}
              type="submit">
              Connect
            </button>
            <button onClick={() => stepCount(2)}>Back</button>
          </form>
        </div>
      </div>
    </>
  );
}
