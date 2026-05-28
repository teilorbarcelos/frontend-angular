interface WindowWithEnv extends Window {
  env?: {
    API_URL?: string;
  };
}

export const getApiUrl = (): string => {
  const env = (window as WindowWithEnv).env;

  if (env?.API_URL) {
    return env.API_URL;
  }

  return 'http://localhost:8888'; // nosonar
};
