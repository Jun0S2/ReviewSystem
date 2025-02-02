import React from "react";
import { Form, Input, Select, SelectItem, Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";

export default function App() {
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
    // test 
    navigate("/summary");
    return;

    // Username validation
    if (data.name === "admin" && data.password === "admin") {
      navigate("/summary");
      return;
    }

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
    // md:flex-nowrap 
    <Form
    className="justify-center items-center space-y-4 max-w-4xl w-full" // Use max-w-4xl to limit width on larger screens
    validationBehavior="native"
    validationErrors={errors}
    // onReset={() => setSubmitted(null)}
    onSubmit={onSubmit}
  >
    <div className="flex w-full flex-wrap gap-4">
    <Input
          size="lg"
          isRequired
          fullWidth
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
        />

        <Input
          isRequired
          size="lg"
          fullWidth
          errorMessage={getPasswordError(password)}
          isInvalid={getPasswordError(password) !== null}
          label="Password"
          labelPlacement="outside"
          name="password"
          placeholder="Enter your password"
          type="password"
          value={password}
          onValueChange={setPassword}
        />

        <Select
          fullWidth
          size="lg"
          isRequired
          label="Language"
          labelPlacement="outside"
          name="language"
          placeholder="Select Language"
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
       
          <Button size="lg" fullWidth color="primary" type="submit">
            Submit
          </Button>
        </div>

      {submitted && (
        <div className="text-small text-default-500 mt-4">
          Submitted data: <pre>{JSON.stringify(submitted, null, 2)}</pre>
        </div>
      )}

    </Form>
  );
}
