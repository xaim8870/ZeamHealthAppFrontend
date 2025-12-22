import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MuseClient } from "@/services/muse/museClient";
import { useDevice } from "@/context/DeviceContext";
import { useNavigate } from "react-router-dom";

const muse = new MuseClient();

const ConnectMuse = () => {
  const [status, setStatus] = useState("Idle");
  const { setConnection } = useDevice();
  const navigate = useNavigate();

  const connectMuse = async () => {
    try {
      setStatus("Connecting...");
      await muse.connect();

      setConnection(true, "s-athena", null);
      setStatus("Connected");

      navigate("/mind");
    } catch (err) {
      setStatus("Failed to connect");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-96">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-center">
            Connect Muse S Athena
          </h2>

          <p className="text-sm text-center text-gray-500">
            Turn on your Muse S and keep Bluetooth enabled
          </p>

          <Button className="w-full" onClick={connectMuse}>
            Connect via Bluetooth
          </Button>

          <p className="text-center text-sm">{status}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectMuse;
