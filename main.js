document.addEventListener("DOMContentLoaded", () => {
  const statusText = document.getElementById("status");
  const captionText = document.getElementById("caption");

  let stream;
  let video;

  // Helper to detect if it's mobile
  function isMobileDevice() {
    return /Mobi|Android|iPhone/i.test(navigator.userAgent);
  }

  document.body.addEventListener("click", async () => {
    if (stream) return;

    try {
      const facingMode = isMobileDevice() ? { exact: "environment" } : "user";
      statusText.textContent = `🔄 Opening ${isMobileDevice() ? "rear" : "web"} camera...`;

      // Get the camera stream
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false
      });

      video = document.createElement("video");
      video.style.display = "none"; // hide the video preview
      document.body.appendChild(video);

      video.srcObject = stream;
      await video.play();

      statusText.textContent = "📸 Tap again to capture image";

      // Wait for the second tap to capture image
      document.body.addEventListener("click", async () => {
        try {
          statusText.textContent = "⏳ Capturing image...";

          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(async (blob) => {
            const formData = new FormData();
            formData.append("image", blob, "capture.jpg");

            const response = await fetch("http://127.0.0.1:5000/caption", {
              method: "POST",
              body: formData,
              mode: "cors"
            });

            if (!response.ok) throw new Error("Failed to get caption");

            const data = await response.json();
            const caption = data.caption;
            if (!caption) throw new Error("No caption in response");

            captionText.textContent = caption;
            statusText.textContent = "✅ Caption received and spoken";
            speechSynthesis.speak(new SpeechSynthesisUtterance(caption));

            // Clean up camera
            stream.getTracks().forEach(track => track.stop());
            stream = null;
            video.remove();
          }, "image/jpeg");

        } catch (err) {
          console.error("❌ Capture error:", err);
          statusText.textContent = "❌ Failed to capture image";
        }
      }, { once: true });

    } catch (error) {
      console.error("❌ Camera access error:", error);
      statusText.textContent = "❌ Could not open camera";
    }
  }, { once: true });
});
