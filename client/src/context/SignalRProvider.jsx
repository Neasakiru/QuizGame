import { createContext, useContext, useEffect, useState } from "react";
import { createConnection } from "../signalr/connection";

const SignalRContext = createContext();

export const SignalRProvider = ({ children }) => {
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    const connect = createConnection();

    connect.start()
      .then(() => console.log("SignalR connected"))
      .catch(console.error);

    setConnection(connect);

    return () => connect.stop();
  }, []);

  return (
    <SignalRContext.Provider value={connection}>
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalR = () => useContext(SignalRContext);