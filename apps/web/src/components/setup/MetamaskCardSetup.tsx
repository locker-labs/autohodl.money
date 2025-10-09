import Image from "next/image";
import Button from "../subcomponents/Button";
import { useState } from "react";
import SetSavingConfig from "../subcomponents/SetSavingConfig";
import { SupportedAccounts } from "@/lib/constants";
import DetectedCard from "../view/DetectedCard";
const MetamaskCardSetup: React.FC = () => {
    const pastTxns = 23;
    const possibleSavings = 100;
    const [loading, setLoading] = useState(false);
    const [stepTitle, setStepTitle] = useState("Continue to Setup");
    const [currentStep, setCurrentStep] = useState(1);

    const handleButtonClick = () => {
        setLoading(true);
        setCurrentStep(currentStep + 1);
        setStepTitle("Finish Setup");
        setTimeout(() => {
            setLoading(false);
        }, 100);
    }
    return (
      <div className="flex flex-col items-center gap-8">
            {currentStep === 1 && (
                    <DetectedCard
                        title="MetaMask Card Detected"
                        description={`Based on your history, you could have saved $${possibleSavings} from ${pastTxns} purchases.`}
                    image="/SavingGrowth.png" >
                    
                    </DetectedCard>

            )}
            {currentStep === 2 && (
                <>
                    <SetSavingConfig account={SupportedAccounts.MetaMask} />
                </>
            )}

        <Button title={stepTitle} onAction={handleButtonClick} />
      </div>
    );
}

export default MetamaskCardSetup;