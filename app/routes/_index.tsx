import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div>
      <h1>Welcome to the Paper Summarizer!</h1>
      <Link to="/summary">
        <button>Go to Summary Page</button>
      </Link>
    </div>
  );
}
