![image](https://github.com/user-attachments/assets/168538fe-6f9d-4591-a898-bbd58bb2b593)
# Pump.fun Token Launcher
Update 04-10-2024: Added beta.viper.bot domain with beta functionality supporting up to 25 wallets bundled with launch [showcase](https://streamable.com/6dc5l7). 

Update 03-09-2024: Cmd line bundler now includes token amounts calculator [showcase](https://streamable.com/saj2ro). Price for bundler is flat 10 SOL.
Features of this bundler include:

-Bundle up to 17 buys

-Selling per wallet

-Selling all tokens at once

-Solana vanity generation built in (so it can mine an address ending in pump for you)

-Calculator for sol amounts to buy based on wanted % supply

Update 26-08-2024: There is now also a command-line bundler for sale. Contact me on telegram if you're interested. [showcase](https://streamable.com/46042a)

Update 13-08-2024: We have updated the redacted information required to programatically launch a token on pump.fun. Since there are a lot of bundlers out there, we have decided to open source this information.

Update 26-07-2024: You can now try the bot with a one-time coupon for free on https://viper.bot/. See https://t.me/viper_discussions for more info and to obtain a coupon.

New: There is now also a telegram bot available for my [bundler]([https://nodejs.org/](https://github.com/bilix-software/pump-fun-bundler)) at: https://t.me/viper_pump_bot.  Note: this is a first version so any feedback is appreciated.

This repository provides tools and scripts for programmatically launching `pump.fun` tokens. The project is set up using TypeScript and includes essential modules to facilitate token creation and management.

A showcase of this launcher can now be used on: https://viper.bot
For a fee you can use this bundler to launch a token with your own buys.
It contains the following features:
  - Bundle launch with up to 17 buy transactions
  - Enter mint privatekey to ensure mint ends in pump
  - Buying and Selling
  - Sell single wallet by percentage
  - Sell all wallets completely through Jito Bundle

# Launch showcase
https://github.com/user-attachments/assets/8c415637-0422-42ac-9dd5-79d99b2a273e

# Telegram bot launch showcase
https://github.com/user-attachments/assets/bc6b1a40-96e1-46c1-812e-f2abc17b8ef5

# Trading showcase
https://github.com/bilix-software/pump-fun-bundler/assets/170088768/8ae13af5-23dc-4d02-8c30-d7749415fba8

Services are for hire, contact me at https://t.me/bilixsoftware or info@bilix.io
## Features

- Programmatically launch `pump.fun` tokens.
- Utilities for managing token configurations.
- Easy integration into existing projects.

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14 or later)
- [npm](https://www.npmjs.com/)
- [TypeScript](https://www.typescriptlang.org/)

## Installation

To install the package, clone the repository and install the dependencies:

```bash
git clone https://github.com/bilix-software/pump-fun-token-launcher.git
cd pump-fun-token-launcher
npm install
```

## Usage

To compile and run the scripts:

1. Configure your environment variables as instructed.
2. Compile the TypeScript files:

```bash
npx tsc
```

3. Run the compiled JavaScript file:

```bash
node example.js
```

## Project Structure

- `src/`: Contains the source code for the package.
    - `constants.ts`: Contains constant values used throughout the project.
    - `launch.ts`: Main module for launching tokens.
    - `utils.ts`: Utility functions used in the project.
- `package.json`: Project metadata and dependencies.
- `tsconfig.json`: TypeScript configuration file.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your improvements.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Tips
JATt1ta9GcbVMThdL18rXUqHn3toCMjWkHWtxM5WN3ec

