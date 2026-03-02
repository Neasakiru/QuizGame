import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { createConnection } from "../signalr/connection";

const SignalRContext = createContext();

export const SignalRProvider = ({ children }) => {
  const [connection, setConnection] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const connect = createConnection();

    connect.start()
      .then(() => {
        if (cancelled) { connect.stop(); return; }
        setConnection(connect);
        setIsReady(true);
        console.log("SignalR connected");
      })
      .catch(console.error);

    return () => {
      cancelled = true;
      connect.stop();
    };
  }, []);

  const value = useMemo(() => ({ connection, isReady }), [connection, isReady]);

  return (
    <SignalRContext.Provider value={value}>
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalR = () => useContext(SignalRContext);