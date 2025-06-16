document.addEventListener("DOMContentLoaded", () => {
  const statusText = document.getElementById("status");
  const captionText = document.getElementById("caption");

  document.body.addEventListener("click", () => {
    console.log("👆 Screen tapped, opening camera...");
    statusText.textContent = "Opening camera...";

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment"; // mobile camera

    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) {
        console.log("❌ No file selected.");
        return;
      }

      statusText.textContent = "📸 Image captured. Sending...";
      console.log("📸 Image selected:", file.name);

      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await fetch("http://127.0.0.1:5000/caption", {
          method: "POST",
          body: formData,
          mode: "cors" 
        });

        if (!response.ok) {
          throw new Error("Failed to get caption");
        }

        const data = await response.json();
        console.log("📦 Response JSON:", data);

        const caption = data.caption;
        if (!caption) {
          throw new Error("Caption not found in response");
        }

        captionText.textContent = caption;
        statusText.textContent = "✅ Caption received and spoken.";

        const synth = window.speechSynthesis;
        synth.speak(new SpeechSynthesisUtterance(caption));
      } catch (error) {
        console.error("❌ Error during caption fetch:", error);
        statusText.textContent = "❌ Failed to get caption";
        captionText.textContent = "";
      }
    };

    input.click();
  });
});