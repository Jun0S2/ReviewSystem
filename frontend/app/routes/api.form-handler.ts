export const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
    navigate: (path: string, options?: any) => void
  ) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
  
    try {
      const response = await fetch("/api/generate-summary", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch data from the backend");
      }
  
      const data = await response.json();
      navigate("/summary_result", { state: data }); // Navigate with state
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while processing the PDF.");
    }
  };
  