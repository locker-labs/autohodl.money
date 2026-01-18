import type { Log } from '@moralisweb3/streams-typings';
import { NextResponse } from 'next/server';
import { type Address, getAddress } from 'viem';
import { ChainToMoralisStreamIdMap, type EChainId, EMoralisStreamId, type TUsdcAddress } from '@/lib/constants';
import { getSavingsConfig } from '@/lib/autohodl';
import { addAddressToEoaErc20TransferMoralisStream } from '@/lib/moralis';
import { SavingsMode, type SavingsConfig } from '@/types/autohodl';
import { getUsdcAddress, getViemPublicClientByChain } from '@/lib/helpers';
import { chains } from '@/config';

/**
 * if SavingConfigSet event logs found, then add user address to supported tokens' transfers stream
 */
async function handleSavingConfigSetEvent(configSetLogs: Log[], savingsChainId: EChainId) {
  for (const configSetLog of configSetLogs) {
    if (configSetLog?.topic1 && configSetLog.topic2) {
      const user: Address = getAddress(`0x${configSetLog.topic1.slice(26)}`);
      const token: Address = getAddress(`0x${configSetLog.topic2.slice(26)}`);
      const savingsToken: TUsdcAddress | null = getUsdcAddress(token);

      if (!savingsToken) {
        console.error(`SavingConfigSet event for unsupported token: ${token}`);
        // TODO: send alert to dev team
        continue;
      }

      console.log(`New SavingConfigSet event found for user: ${user}, token: ${savingsToken}`);

      // Fetch savings config
      let savingsConfig: SavingsConfig;
      try {
        savingsConfig = await getSavingsConfig(
          getViemPublicClientByChain(savingsChainId),
          user,
          savingsToken,
          savingsChainId,
        );
        console.log('CONFIG:', savingsConfig);
      } catch (configError) {
        console.error(
          'Error fetching savings config:',
          configError instanceof Error ? configError.message : configError,
        );
        // TODO: Notify dev team
        throw configError;
      }

      if (savingsConfig.mode === SavingsMode.MetamaskCard) {
        // TODO: remove user from EOA stream if exists
        // await removeAddressFromEoaErc20TransferMoralisStream(streamId, user);
      } else if (savingsConfig.mode === SavingsMode.All) {
        // Add user address to Moralis streams for all supported chains
        const addToStreamPromises = chains.map((chain) => {
          const chainId = chain.id as EChainId;
          const streamId = ChainToMoralisStreamIdMap[chainId]?.[EMoralisStreamId.EoaTransfer];

          if (!streamId) {
            console.warn(`No EOA transfer stream ID configured for chain: ${chainId}`);
            return Promise.resolve(false);
          }

          return addAddressToEoaErc20TransferMoralisStream({
            streamId,
            address: user,
            savingsChainId: chainId,
          });
        });

        await Promise.all(addToStreamPromises);
      }
    }
  }

  return NextResponse.json({ message: `Processed ${configSetLogs.length} SavingConfigSet event logs.` });
}

export { handleSavingConfigSetEvent };
