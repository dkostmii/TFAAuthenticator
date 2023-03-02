# TFAAuthenticator

This project implements simple TOTP authentication with QR code and TOTP using JS application and ASP.Net WebAPI.

For simplicity reasons, user accounts are not implemented.

## Prerequisites

- Visual Studio 2022 or dotnet CLI
- Node.js

## How to start

1. Open solution in Visual Studio and start WebAPI with default configuration.

    You can also use dotnet CLI with `dotnet run`

2. Install dependencies for JS application with `npm install`.
3. Run JS application with `npm run serve`.
4. Scan QR code in authenticator app, such as Google Authenticator.
5. Enter code from authenticator app and click "Send code" button.
