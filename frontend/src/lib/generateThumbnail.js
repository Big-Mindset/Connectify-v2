export const generateThumbnail = (url) => {
  return new Promise((resolve) => {
    try {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      video.crossOrigin = "anonymous";
      video.muted = true;
      video.playsInline = true;
      video.src = url;

      const onLoaded = () => {
        const duration = isFinite(video.duration) ? video.duration : 1;
        const seekTime = Math.min(1, duration * 0.1);

        video.currentTime = seekTime;
      };

      const handleSeek = () => {
        try {
          const maxWidth = 400;
          const scale =
            video.videoWidth > maxWidth
              ? maxWidth / video.videoWidth
              : 1;

          canvas.width = Math.round(video.videoWidth * scale);
          canvas.height = Math.round(video.videoHeight * scale);

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const thumbnail = canvas.toDataURL("image/jpeg", 0.7);
          cleanup();
          resolve(thumbnail);
        } catch {
          cleanup();
          resolve(null);
        }
      };

      const onError = () => {
        cleanup();
        resolve(null);
      };

      function cleanup() {
        video.pause();
        video.src = "";
      }

      video.addEventListener("loadedmetadata", onLoaded, { once: true });
      video.addEventListener("seeked", handleSeek, { once: true });
      video.addEventListener("error", onError, { once: true });

    } catch {
      resolve(null);
    }
  });
};