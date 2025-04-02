export interface DeviceInfo {
  browser: {
    name: string;
    version: string;
  };
  os: {
    name: string;
    version: string;
  };
  device: {
    type: string;
    model: string | undefined;
  };
  userAgent: string;
} 