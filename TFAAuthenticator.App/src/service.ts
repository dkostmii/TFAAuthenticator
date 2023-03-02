import config from "./config";

interface SeedResponse {
  seed: string,
};

function validateSeedResponse(response: unknown) {
  return (
    typeof response === 'object' &&
    'seed' in response &&
    typeof response.seed === 'string' &&
    response.seed.length > 0
  );
}

export async function getSeed() {
  return new Promise<SeedResponse>((res, rej) => {
    const req = new XMLHttpRequest();

    req.addEventListener('load', () => {
      if (req.status !== 200) {
        rej('Failed to load data');
      }

      const resParsed = JSON.parse(req.response);

      if (!validateSeedResponse(resParsed)) {
        rej('Application error');
      }

      res(resParsed as SeedResponse);
    });

    req.addEventListener('error', () => {
      rej('Failed to load data');
    });

    req.open("GET", `${config.apiUrl}/seed`);
    req.send();
  });
}

export function getTotpUri(secret: string) {
  return `otpauth://totp/TFAAuthenticator:user@example.com?secret=${secret}&issuer=TFAAuthenticator&algorithm=SHA1&digits=6&period=30`;
}

export async function postCode(code: string) {
  return new Promise<string>((res, rej) => {
    fetch(`${config.apiUrl}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code })
    })
    .then(response => {
      if (!(response.status === 200 || response.status === 401)) {
        rej('Failed to upload data');
      }
      
      if (response.status === 200) {
        res("Authorized");
      } else {
        res("Not authorized");
      }
    })
    .catch(() => rej('Failed to upload data'));
  });
}
