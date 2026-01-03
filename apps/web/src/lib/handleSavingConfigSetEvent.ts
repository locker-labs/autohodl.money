import type { Log } from '@moralisweb3/streams-typings';
import { NextResponse } from 'next/server';
import { type Address, getAddress } from 'viem';
import { type EChainId, TokenToTransferStreamIdMap, type TUsdcAddress } from '@/lib/constants';
import { getSavingsConfig } from '@/lib/autohodl';
import { addAddressToEoaErc20TransferMoralisStream } from '@/lib/moralis';
import { SavingsMode, type SavingsConfig } from '@/types/autohodl';
import { getUsdcAddress, getViemPublicClientByChain } from '@/lib/helpers';

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

      const streamId: string | undefined = TokenToTransferStreamIdMap[savingsToken];
      if (!streamId) {
        console.error(`No stream ID configured for token: ${savingsToken}`);
        // TODO: send alert to dev team
      }

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
        // For now, we support only one token per chain.
        await addAddressToEoaErc20TransferMoralisStream({
          streamId,
          address: user,
          savingsChainId,
        });
      }
    }
  }

  return NextResponse.json({ message: `Processed ${configSetLogs.length} SavingConfigSet event logs.` });
}

export { handleSavingConfigSetEvent };
