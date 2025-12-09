import { Button } from "./Button";

export default {
  component: Button,
  tags: ["autodocs"],
  title: "Components/Button",
};

export const DefaultButton = () => {
  return (
    <Button intent="default" size="md">
      Crate Task
    </Button>
  );
};

export const PrimaryButton = () => {
  return <Button intent="primary">Crate Task</Button>;
};
