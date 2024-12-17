import React, { useState } from 'react';
import { Database, MessageCircle, Stamp, Coins, ArrowRightCircle, Gift } from 'lucide-react';
import { ToolCategory } from './ToolCategory';
import { ToolCard } from './ToolCard';
import { LoyaltyStampView } from './loyaltyStamp/LoyaltyStampView';
import { LoyaltyPointsView } from './loyaltyPoints/LoyaltyPointsView';
import { LuckyDrawView } from './luckyDraw/LuckyDrawView';
import { WhatsAppBlasterView } from './whatsappBlaster/WhatsAppBlasterView';
import { WhatsAppFollowupView } from './whatsappFollowup/WhatsAppFollowupView';

interface ToolsProps {
  onNavigate: (view: string) => void;
}

export function Tools({ onNavigate }: ToolsProps) {
  const [activeView, setActiveView] = useState<string>('main');

  const handleToolClick = (tool: string) => {
    setActiveView(tool);
  };

  const handleBack = () => {
    setActiveView('main');
  };
  
  if (activeView === 'loyalty-stamp') {
    return <LoyaltyStampView onBack={handleBack} />;
  }
  
  if (activeView === 'loyalty-points') {
    return <LoyaltyPointsView onBack={handleBack} />;
  }
  
  if (activeView === 'lucky-draw') {
    return <LuckyDrawView onBack={handleBack} />;
  }
  
  if (activeView === 'whatsapp-blaster') {
    return <WhatsAppBlasterView onBack={handleBack} />;
  }
  
  if (activeView === 'whatsapp-followup') {
    return <WhatsAppFollowupView onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="max-w-7xl mx-auto p-8 pb-32">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Tools</h1>
        
        <ToolCategory title="Loyalty" icon={Stamp}>
          <ToolCard
            title="Loyalty Stamp"
            description="Create and manage digital loyalty stamp cards"
            icon={Stamp}
            onClick={() => handleToolClick('loyalty-stamp')}
          />
          <ToolCard
            title="Loyalty Points"
            description="Set up points-based rewards program"
            icon={Coins}
            onClick={() => handleToolClick('loyalty-points')} 
          />
          <ToolCard
            title="Lucky Draw"
            description="Run exciting lucky draw campaigns"
            icon={Gift}
            onClick={() => handleToolClick('lucky-draw')}
          />
        </ToolCategory>

        <ToolCategory title="Monetization" icon={Database}>
          <ToolCard
            title="WhatsApp Blaster"
            description="Send bulk WhatsApp messages to your customers"
            icon={MessageCircle}
            onClick={() => handleToolClick('whatsapp-blaster')}
          />
          <ToolCard
            title="WhatsApp Auto-Followup"
            description="Automate follow-up messages to customers"
            icon={ArrowRightCircle}
            onClick={() => handleToolClick('whatsapp-followup')} 
          />
        </ToolCategory>
      </div>
    </div>
  );
}