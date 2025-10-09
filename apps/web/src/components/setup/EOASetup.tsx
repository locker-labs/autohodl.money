import Image from "next/image";
import Button from "../subcomponents/Button";
import { useState } from "react";
import SetSavingConfig from "../subcomponents/SetSavingConfig";
import { SupportedAccounts } from "@/lib/constants";
import DetectedCard from "../view/DetectedCard";
const EOASetup: React.FC = () => {
    const pastTxns = 23;
    const possibleSavings = 100;
    const [loading, setLoading] = useState(false);
    const [stepTitle, setStepTitle] = useState("Continue without card, use EOA");
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
            title="Oh no, we didn’t find a MetaMask Card!"
            description={`Auto HODL works whenever you spend with your MetaMask Card. Don’t worry  it only takes a few minutes to get one.`}
            image="/Gear.png"
            imageWidth={200}
            imageHeight={120}
          >
            {/* Link to get a MetaMask Card */}
            <a
              href="./"
              className="underline decoration-black decoration-2 underline-offset-4 hover:decoration-4 transition-colors"
            >
              Get a MetaMask Card
            </a>
          </DetectedCard>
        )}
        {currentStep === 2 && (
          <>
            <SetSavingConfig account={SupportedAccounts.EOA} />
          </>
        )}

        <Button title={stepTitle} onAction={handleButtonClick} />
      </div>
    );
}

export default EOASetup;