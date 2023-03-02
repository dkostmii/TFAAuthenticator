import { getSeed, getTotpUri } from "../service";
import QRCode, { create } from 'qrcode';

function Seed() {
  const container = document.createElement('div');

  const loadingMsg = document.createElement('p');
  loadingMsg.appendChild(document.createTextNode('Loading...'));
  container.appendChild(loadingMsg);

  const createOrUpdateError = (err: unknown) => {
    if (!(err.toString && err.toString instanceof Function)) {
      throw new Error('This error must never occur');
    }

    let errMsgEl = container.querySelector('.error-msg');

    if (!errMsgEl) {
      errMsgEl = document.createElement('p');
      errMsgEl.classList.add('error-msg');
      container.appendChild(errMsgEl);
    }

    while (errMsgEl.firstChild) {
      errMsgEl.removeChild(errMsgEl.firstChild);
    }

    errMsgEl.appendChild(document.createTextNode(err.toString()));

    container.removeChild(loadingMsg);
  };

  const createQrCode = (data: string) => {
    const img = document.createElement('img');
    const totpUri = getTotpUri(data);

    QRCode.toDataURL(totpUri)
      .then(url => {
        img.src = url;
        container.removeChild(loadingMsg);
        container.appendChild(img);
      })
      .catch(() => {
        createOrUpdateError("Unable to create QR code");
      });
  };

  getSeed()
    .catch(e => {
      createOrUpdateError(e);
    })
    .then(res => {
      if (!(res && res.seed)) {
        return;
      }

      createQrCode(res.seed);
    });
  
  return container;
}

export default Seed;