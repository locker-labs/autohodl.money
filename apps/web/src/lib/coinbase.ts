
export const generateCoinbaseOnrampUrl = (
  destinationAddress: string, 
  amount: string,
  asset: string = "USDC",
  network: string = "base"
) => {
  const appId = process.env.NEXT_PUBLIC_COINBASE_APP_ID || "";
  
  const destinationWallets = JSON.stringify([
    {
      address: destinationAddress,
      blockchains: [network], 
      assets: [asset]
    },
  ]);

  const onrampUrl = new URL("https://pay.coinbase.com/buy/select-asset");
  if (appId) onrampUrl.searchParams.append("appId", appId);
  onrampUrl.searchParams.append("destinationWallets", destinationWallets);
  onrampUrl.searchParams.append("presetFiatAmount", amount);
  onrampUrl.searchParams.append("fiatCurrency", "USD");

  return onrampUrl.toString();
};