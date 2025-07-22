import { Button } from "@material-tailwind/react";
import { Download } from "@phosphor-icons/react";
import { useState, useEffect } from "react";

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted PWA install");
        }
        setDeferredPrompt(null);
      });
    }
  };

  return deferredPrompt ? (
    <Button
    onClick={handleInstallClick}
    color="blue"
    ripple={true}
    className="flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
    >
    Install App
    </Button>
  ) : null;
};

export default InstallPWA;
