export const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
    navigate: (path: string, options?: any) => void
  ) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const selectedColor = formData.get("color") as string; // 선택한 색상 추가
    console.log("selected color : ", selectedColor);
    try {
      const response = await fetch("/api/generate-summary", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch data from the backend");
      }
  
      const data = await response.json();
      // 선택한 색상 정보를 summary_result로 전달
      navigate("/summary_result", { state: { ...data, color: selectedColor } });    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while processing the PDF.");
    }
  };
  