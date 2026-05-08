import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { useEffect, useState } from "react";
import { TOAST_EVENT } from "./toastEvents";

function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const showToast = (event) => {
      setToast({
        message: event.detail?.message || "Something went wrong.",
        severity: event.detail?.severity || "error",
      });
    };

    window.addEventListener(TOAST_EVENT, showToast);
    return () => window.removeEventListener(TOAST_EVENT, showToast);
  }, []);

  return (
    <>
      {children}
      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={toast?.severity || "error"}
          variant="filled"
          onClose={() => setToast(null)}
          sx={{ width: "100%" }}
        >
          {toast?.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default ToastProvider;
