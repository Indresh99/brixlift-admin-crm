import { useEffect, useRef, useState } from "react";
import { emitToast } from "../toast/toastEvents";

function useCrmResource(loader, fallback, refreshKey = 0) {
  const fallbackRef = useRef(fallback);
  const [data, setData] = useState(fallback);

  useEffect(() => {
    let active = true;

    loader()
      .then((payload) => {
        if (active) {
          setData(payload);
        }
      })
      .catch((error) => {
        if (active) {
          setData(fallbackRef.current);
          if (!error.toastShown) {
            emitToast(error.message || "Unable to load data.");
          }
        }
      });

    return () => {
      active = false;
    };
  }, [loader, refreshKey]);

  return data;
}

export default useCrmResource;
