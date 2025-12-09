import { useRouteError } from "react-router-dom";

const Error = () => {
  const error: any = useRouteError();
  return (
    <div className="flex size-full flex-col items-center justify-center lg:fixed">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
};

export default Error;
