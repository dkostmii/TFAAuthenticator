import { postCode } from '../service';

function Auth() {
  const container = document.createElement('div');

  const codeInputLabel = document.createElement('label');
  codeInputLabel.appendChild(document.createTextNode('6-digit code'));

  const sendButton = document.createElement('button');
  sendButton.appendChild(document.createTextNode('Send code'));
  sendButton.setAttribute('disabled', '');

  const codeInput = document.createElement('input');
  codeInput.type = "number";
  codeInput.max = "999999";
  codeInput.min = "0";
  codeInput.step = "1";

  codeInputLabel.appendChild(codeInput);

  codeInput.addEventListener('input', () => {
    codeInput.value = codeInput.value.replace(/\D/g, '').substring(0, 7);

    if (codeInput.value.length !== 6) {
      sendButton.setAttribute('disabled', '');
    } else {
      sendButton.removeAttribute('disabled');
    }
  });

  const createOrUpdateResultMsg = (result: unknown) => {
    if (!(result && result.toString instanceof Function)) {
      throw new Error('This error must never occur');
    }

    let resultMsgEl = container.querySelector('.result-msg');

    if (!resultMsgEl) {
      resultMsgEl = document.createElement('p');
      resultMsgEl.classList.add('result-msg');
      container.appendChild(resultMsgEl);
    }

    while (resultMsgEl.firstChild) {
      resultMsgEl.removeChild(resultMsgEl.firstChild);
    }

    resultMsgEl.appendChild(document.createTextNode(result.toString()));
  };

  sendButton.addEventListener('click', () => {
    postCode(codeInput.value)
      .catch(e => {
        createOrUpdateResultMsg(`Error occurred: ${e.toString()}`)
      })
      .then(res => {
        if (typeof res !== 'string') {
          return;
        }

        createOrUpdateResultMsg(res);
      });
  });

  container.appendChild(codeInputLabel);
  container.appendChild(sendButton);

  return container;
}

export default Auth;