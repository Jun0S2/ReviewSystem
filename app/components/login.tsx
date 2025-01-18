import React from "react";
import { Form, Input, Select, SelectItem, Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [password, setPassword] = React.useState("");
  const [submitted, setSubmitted] = React.useState(null);
  const [errors, setErrors] = React.useState({});
  const navigate = useNavigate();

  // Real-time password validation
  const getPasswordError = (value) => {
    if (value !== "admin") return "Failed to login";
    return null;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));

    // Custom validation checks
    const newErrors = {};
    const passwordError = getPasswordError(data.password);

    if (passwordError) {
      newErrors.password = passwordError;
    }

    // Username validation
    if (data.name === "admin" && data.password === "admin") {
      navigate("/summary");
      return;
    } 
    // else if (data.name === "admin") {
    //   newErrors.name = "Nice try! Choose a different username";
    // }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (data.terms !== "true") {
      setErrors({ terms: "Please accept the terms" });
      return;
    }

    // Clear errors and submit
    setErrors({});
    setSubmitted(data);
  };

  return (
    <Form
      className="justify-center items-center space-y-4 mx-auto  max-w-4xl" // Added max width and centered the form
      validationBehavior="native"
      validationErrors={errors}
      onReset={() => setSubmitted(null)}
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-4">
        <Input
          size="lg"
          fullWidth
          isRequired
          errorMessage={({ validationDetails }) => {
            if (validationDetails.valueMissing) {
              return "Please enter your name";
            }
            return errors.name;
          }}
          label="Name"
          labelPlacement="outside"
          name="name"
          placeholder="Enter your name"
          className="w-full"
        />

        <Input
          size="lg"
          isRequired
          fullWidth
          errorMessage={({ validationDetails }) => {
            if (validationDetails.valueMissing) {
              return "Please enter your email";
            }
            if (validationDetails.typeMismatch) {
              return "Please enter a valid email address";
            }
          }}
          label="Email"
          labelPlacement="outside"
          name="email"
          placeholder="Enter your email"
          type="email"
          className="w-full"
        />

        <Input
          isRequired
          fullWidth
          size="lg"
          errorMessage={getPasswordError(password)}
          isInvalid={getPasswordError(password) !== null}
          label="Password"
          labelPlacement="outside"
          name="password"
          placeholder="Enter your password"
          type="password"
          value={password}
          onValueChange={setPassword}
          className="w-full"
        />

        <Select
          fullWidth
          size="lg"
          isRequired
          label="Language"
          labelPlacement="outside"
          name="language"
          placeholder="Select Language"
          className="w-full"
        >
          <SelectItem key="kr" value="kr">
            Korean
          </SelectItem>
          <SelectItem key="eng" value="eng">
            English
          </SelectItem>
          <SelectItem key="deutsch" value="deutsch">
            German
          </SelectItem>
        </Select>

        <div className="flex gap-4 py-5">
          <Button className="w-full" color="primary" type="submit">
            Submit
          </Button>
          <Button type="reset" variant="bordered">
            Reset
          </Button>
        </div>
      </div>

      {submitted && (
        <div className="text-small text-default-500 mt-4">
          Submitted data: <pre>{JSON.stringify(submitted, null, 2)}</pre>
        </div>
      )}
    </Form>
  );
}
