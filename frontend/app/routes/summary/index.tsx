import { useFetcher } from "@remix-run/react";

export default function SummaryPage() {
  const fetcher = useFetcher();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    fetcher.submit(formData, { method: "post", action: "/api/generate-summary" });
  };

  return (
    <div>
      <h1>Generate Highlighted Sentences and Summary</h1>
      <form onSubmit={handleSubmit}>
        <label>
          PDF URL:
          <input type="url" name="pdf_url" required />
        </label>
        <button type="submit">Generate</button>
      </form>

      {fetcher.data && (
        <div>
          <h2>Highlighted Sentences:</h2>
          <ul>
            {fetcher.data.highlighted_sentences.map((sentence: string, index: number) => (
              <li key={index}>{sentence}</li>
            ))}
          </ul>

          <h2>Summary:</h2>
          <p>{fetcher.data.summary}</p>
        </div>
      )}
    </div>
  );
}
