import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomToastNotification from "../components/toast_notification/CustomToastNotification"; // Import the WithActions component

class ToastNotification {
  static success(title, message, options = {}) {
    toast.success(<CustomToastNotification title={title} content={message} />, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      icon: false,
      ...options, // Allows override of default options
    });
  }

  static error(title, message, options = {}) {
    toast.error(<CustomToastNotification title={title} content={message} />, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      icon: false,
      ...options,
    });
  }

  static info(title, message, options = {}) {
    toast.info(<CustomToastNotification title={title} content={message} />, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      icon: false,
      ...options,
    });
  }

  static warning(title, message, options = {}) {
    toast.warn(<CustomToastNotification title={title} content={message} />, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      icon: false,
      ...options,
    });
  }

  static configureGlobalSettings(options = {}) {
    toast.configure({
      position: options.position || "top-right",
      autoClose: options.autoClose || 3000,
      hideProgressBar: options.hideProgressBar || false,
      closeOnClick: options.closeOnClick || true,
      pauseOnHover: options.pauseOnHover || true,
      draggable: options.draggable || true,
      progress: options.progress || undefined,
      icon: options.icon || false,
    });
  }
}

export default ToastNotification;
