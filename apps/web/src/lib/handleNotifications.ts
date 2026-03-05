import type { IERC20Transfer } from '@moralisweb3/streams-typings';
import axios from 'axios';

interface HandleNotificationParams {
    user: `0x${string}`,
    token: `0x${string}`,
    value: string,
    transactionHash: string,
    chainId: string;
}

export async function handleNotifications({user,token,value,transactionHash,chainId}:HandleNotificationParams) {
    await handleTelegram(user, value, chainId);
}

async function handleTelegram(userAddress: string,amount: string, chainId: string) {
    
    
    // Use the internal/public URL where your Bun bot is hosted
    // If on the same VPS, use http://localhost:3000/notify
    const BOT_TRIGGER_URL = process.env.BOT_TRIGGER_URL || "http://localhost:3000/notify";
    const SECRET = process.env.BACKEND_SECRET;

    try {
        await axios.post(BOT_TRIGGER_URL, {
            userAddress,
            amount, // Moralis returns value as a string (wei/atomic units)
            chainId,
            secret: SECRET
        });
        
        console.log(`✅ Telegram trigger sent for ${userAddress}`);
    } catch (error) {
        // Log the error but don't necessarily crash the stream handler
        console.error("❌ Failed to trigger Telegram bot:", error);
    }
}