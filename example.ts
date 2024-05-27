import { launchToken } from './src/launch';

class Example {
    private deployerPrivatekey: string;
    private tokenUri: string;
    private tokenSymbol: string;
    private tokenName: string;


    constructor(deployerPrivatekey: string, tokenUri: string, tokenSymbol: string, tokenName: string) {
        this.deployerPrivatekey = deployerPrivatekey;
        this.tokenUri = tokenUri;
        this.tokenSymbol = tokenSymbol;
        this.tokenName = tokenName;
    }

    async main() {
        try {
            await launchToken(this.deployerPrivatekey, this.tokenName, this.tokenSymbol, this.tokenUri)
        } catch (error) {
            console.error('Error in main function:', error);
        }
    }
}

// Usage
const deployerPrivatekey = 'your_private_key_here'; // Replace with your actual private key
const tokenUri = 'your_token_uri_here'; //Replace with actual token uri
const tokenSymbol = 'your_token_symbol_here'; //Replace with actual token symbol
const tokenName = 'your_token_name_here'; //Replace with actual token name


const example = new Example(deployerPrivatekey,tokenUri, tokenSymbol, tokenName);
example.main();
