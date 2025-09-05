import useragent from "useragent";

export const getDeviceInfo = (req) => {
  const agent = useragent.parse(req.headers["user-agent"]);
  return {
    browser: agent.toAgent(),
    os: agent.os.toString(),
    device: agent.device.toString(),
    ip: req.ip,
  };
};
