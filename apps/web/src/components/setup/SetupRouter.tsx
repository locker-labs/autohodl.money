import { SupportedAccounts } from "@/lib/constants";
import MetamaskCardSetup from "./MetamaskCardSetup";
import EOASetup from "./EOASetup";

function SetupRouter({accounts}: {accounts: SupportedAccounts[]}) {

    if (accounts.includes(SupportedAccounts.MetaMask)) {
        return <MetamaskCardSetup />;
    } else if (accounts.includes(SupportedAccounts.EOA)) {
        return <EOASetup />;
    } else {
        return <div>Unsupported account type</div>;
    }
}

export { SetupRouter };