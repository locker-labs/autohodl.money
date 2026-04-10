import { NextResponse } from 'next/server';
import { processSavingsBatch } from '@/lib/handleScheduleCron';

// This forces Next.js to not cache this route, ensuring it runs fresh every time
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {

  try {
    // 2. Calculate current time in Unix seconds (matching your subgraph logic)
    const currentTime = Math.floor(Date.now() / 1000);

    // 3. The GraphQL Query
    const query = `
      query GetReadyExecutions($currentTime: BigInt!) {
        userSavingStates(
          where: { 
            isActive: true, 
            nextSaving_lte: $currentTime 
          }
          first: 100
        ) {
          id
          token
          nextSaving
          cycle
        }
      }
    `;

    // 4. Fetch data from your Subgraph
    // Replace with your actual Subgraph Studio Query URL from your environment variables
    const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL!; 
    
    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { currentTime: currentTime.toString() },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error('Subgraph query errors:', result.errors);
      return NextResponse.json({ error: 'Failed to fetch from subgraph' }, { status: 500 });
    }

    const readyUsers = result.data.userSavingStates;

    if (readyUsers.length === 0) {
      return NextResponse.json({ message: 'No savings ready to execute.' });
    }

    console.log(`Found ${readyUsers.length} users ready for execution.`);
    
    // Example of mapping out the data you need for the smart contract call
    const usersToExecute = readyUsers.map((user: any) => user.id);
      const tokensToExecute = readyUsers.map((user: any) => user.token);
      const valuesToExecute = readyUsers.map((user: any) => BigInt(user.value));

    
    const chainId = 8453; // Base Mainnet

    // Run the batch execution with the new values array
    const executionResults = await processSavingsBatch(
        usersToExecute, 
        tokensToExecute, 
        valuesToExecute, 
        chainId
    );

    return NextResponse.json({ 
      success: true, 
      executedCount: readyUsers.length,
      users: usersToExecute 
    });

  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}