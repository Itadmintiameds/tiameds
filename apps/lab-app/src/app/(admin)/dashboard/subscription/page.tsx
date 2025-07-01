'use client';
import React, { useState } from 'react';
import { FaFlask, FaUsers, FaChartLine, FaCheck, FaRegClock, FaRegCreditCard, FaPlus, FaInfoCircle } from 'react-icons/fa';
import { IoMdPricetag, IoMdHelpCircle } from 'react-icons/io';
import { BsLightningFill, BsArrowRightShort } from 'react-icons/bs';
import { RiTeamFill } from 'react-icons/ri';

interface Plan {
  name: string;
  price: { monthly: number; annual: number };
  features: string[];
  icon: React.ReactNode;
  description: string;
  bestFor: string;
}

const SubscriptionPlans = () => {
  type PlanKey = 'basic' | 'professional' | 'enterprise';
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [activePlan, setActivePlan] = useState<PlanKey>('professional');
  const [teamMembers, setTeamMembers] = useState(5);
  const [email, setEmail] = useState('abhishekritu810219@gmail.com');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [billsUsed] = useState(187);

  const plans: Record<PlanKey, Plan> = {
    basic: {
      name: "Starter",
      price: { monthly: 2000, annual: 20000 },
      features: [
        "200 bills/month", 
        "Basic analytics dashboard", 
        "Email support (48hr response)",
        "Up to 3 team members",
        "Data export (CSV)"
      ],
      icon: <FaFlask className="text-purple-300" />,
      description: "Perfect for small labs getting started with digital management",
      bestFor: "Individual researchers or small teams"
    },
    professional: {
      name: "Professional",
      price: { monthly: 3000, annual: 30000 },
      features: [
        "500 bills/month", 
        "Advanced analytics with trends", 
        "Priority support (24hr response)", 
        "Up to 5 team members", 
        "Custom report generation",
        "Data export (CSV, Excel)"
      ],
      icon: <FaChartLine className="text-purple-500" />,
      description: "Ideal for growing labs needing more capacity and features",
      bestFor: "Research teams and small labs"
    },
    enterprise: {
      name: "Enterprise",
      price: { monthly: 5000, annual: 50000 },
      features: [
        "Unlimited bills", 
        "Premium analytics with predictions", 
        "24/7 dedicated support", 
        "10+ team members (customizable)", 
        "API access",
        "White-label reports",
        "Onboarding specialist",
        "Advanced security controls"
      ],
      icon: <BsLightningFill className="text-purple-700" />,
      description: "Comprehensive solution for large organizations with complex needs",
      bestFor: "Large research institutions and corporations"
    }
  };

  const handleInvite = () => {
    if (teamMembers < 5) {
      setTeamMembers(teamMembers + 1);
      setEmail('');
    }
  };

  const currentPlan = plans[activePlan];
  const maxBills = parseInt(currentPlan.features[0].split('/')[0].replace(/\D/g, '') || '500');

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl shadow-sm">
      {/* Header with animated gradient */}
      <div className="text-center mb-10 relative">
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-2 relative z-10">
          Lab Management <span className="text-purple-600">Subscription</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto relative z-10">
          Select the perfect plan that matches your research team&lsquo;s workflow and budget
        </p>
        
        {/* Billing Toggle with smooth transition */}
        <div className="flex flex-col items-center justify-center mt-8 relative z-10">
          <div className="flex items-center mb-2">
            <span className="mr-4 text-gray-700 font-medium">Billing Cycle:</span>
            <div className="inline-flex bg-white rounded-lg p-1 shadow-sm border border-purple-100 transition-all duration-300">
              <button 
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md transition-all duration-300 flex items-center ${
                  billingCycle === 'monthly' 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-purple-50'
                }`}
              >
                {billingCycle === 'monthly' && <BsArrowRightShort className="mr-1" />}
                Monthly
              </button>
              <button 
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-md transition-all duration-300 flex items-center ${
                  billingCycle === 'annual' 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-purple-50'
                }`}
              >
                {billingCycle === 'annual' && <BsArrowRightShort className="mr-1" />}
                Annual <span className="ml-1 text-xs">(Save 20%)</span>
              </button>
            </div>
          </div>
          <p className="text-sm text-purple-700 bg-purple-100 px-3 py-1 rounded-full flex items-center">
            <FaInfoCircle className="mr-1" /> Annual billing saves you ₹{plans.professional.price.monthly * 12 - plans.professional.price.annual} per year
          </p>
        </div>
      </div>

      {/* Plan Cards with hover effects */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {Object.entries(plans).map(([key, plan]) => {
          const isActive = activePlan === key;
          return (
            <div 
              key={key}
              className={`rounded-xl border-2 p-6 transition-all duration-300 hover:shadow-lg relative overflow-hidden ${
                isActive 
                  ? 'border-purple-500 bg-white shadow-lg transform scale-[1.02]' 
                  : 'border-gray-200 bg-white hover:border-purple-300'
              }`}
              onClick={() => setActivePlan(key as PlanKey)}
            >
              {isActive && (
                <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  CURRENT PLAN
                </div>
              )}
              
              <div className="flex items-start mb-4">
                <div className="text-3xl p-3 mr-4 bg-purple-100 rounded-full">
                  {plan.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{plan.name}</h3>
                  <p className="text-sm text-gray-500">{plan.bestFor}</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-5 text-sm">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-800">
                  ₹{plan.price[billingCycle].toLocaleString()}
                </span>
                <span className="text-gray-500">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                {billingCycle === 'annual' && (
                  <div className="text-purple-700 text-sm flex items-center mt-1">
                    <IoMdPricetag className="mr-1" /> 
                    Save ₹{(plan.price.monthly * 12 - plan.price.annual).toLocaleString()} annually
                  </div>
                )}
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li 
                    key={i} 
                    className="flex items-start"
                    onMouseEnter={() => setShowTooltip(feature)}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <FaCheck className="text-purple-500 mr-2 mt-1 flex-shrink-0" /> 
                    <span className="text-gray-700">{feature}</span>
                    {showTooltip === feature && (
                      <div className="absolute left-0 ml-6 mt-6 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-10 max-w-xs">
                        <p className="text-sm text-gray-700">{feature.includes('bills') 
                          ? 'Number of lab bills you can process each month' 
                          : feature.includes('support') 
                            ? 'Our average response time for your support requests'
                            : 'Included in this plan tier'}</p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              
              <button 
                className={`w-full py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center ${
                  isActive 
                    ? 'bg-purple-600 text-white shadow-inner' 
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                {isActive ? (
                  <>
                    <FaCheck className="mr-2" /> Current Selection
                  </>
                ) : (
                  'Select Plan'
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Team Usage Section with animated progress bars */}
      <div className="mt-12 bg-white p-8 rounded-xl border border-purple-100 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
          <RiTeamFill className="mr-3 text-purple-600" /> 
          Team Management Dashboard
        </h2>
        
        <div className="grid md:grid-cols-2 gap-10">
          {/* Usage Statistics */}
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-5 text-lg flex items-center text-gray-700">
              <FaChartLine className="mr-2 text-purple-500" /> 
              Current Usage Analytics
            </h3>
            
            <div className="space-y-6">
              {/* Team Members Progress */}
              <div className="group">
                <div className="flex justify-between mb-2 items-center">
                  <div className="flex items-center">
                    <span className="font-medium">Team Members</span>
                    <IoMdHelpCircle 
                      className="ml-2 text-purple-400 cursor-help" 
                      onMouseEnter={() => setShowTooltip('team')}
                      onMouseLeave={() => setShowTooltip(null)}
                    />
                  </div>
                  <span className="font-semibold">
                    <span className="text-purple-600">{teamMembers}</span>/5
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${(teamMembers/5)*100}%` }}
                  ></div>
                </div>
                {teamMembers >= 5 && (
                  <p className="text-sm text-purple-700 mt-2 flex items-center">
                    <FaInfoCircle className="mr-1" /> You&lsquo;ve reached the maximum team members for this plan
                  </p>
                )}
              </div>
              
              {/* Monthly Bills Progress */}
              <div className="group">
                <div className="flex justify-between mb-2 items-center">
                  <div className="flex items-center">
                    <span className="font-medium">Monthly Bills Processed</span>
                    <IoMdHelpCircle 
                      className="ml-2 text-purple-400 cursor-help" 
                      onMouseEnter={() => setShowTooltip('bills')}
                      onMouseLeave={() => setShowTooltip(null)}
                    />
                  </div>
                  <span className="font-semibold">
                    <span className="text-purple-600">{billsUsed}</span>/{maxBills}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-300 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${Math.min((billsUsed/maxBills)*100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {billsUsed < maxBills * 0.7 ? (
                    `You have ${maxBills - billsUsed} bills remaining this month`
                  ) : billsUsed < maxBills ? (
                    <span className="text-yellow-600">
                      You&lsquo;ve used {Math.round((billsUsed/maxBills)*100)}% of your monthly allocation
                    </span>
                  ) : (
                    <span className="text-red-600">
                      You&lsquo;ve exceeded your monthly bill limit
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          
          {/* Team Management */}
          <div className="bg-white p-6 border border-purple-100 rounded-lg">
            <h3 className="font-semibold mb-5 text-lg flex items-center text-gray-700">
              <FaUsers className="mr-2 text-purple-500" /> 
              Team Collaboration
            </h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invite New Team Member
              </label>
              <div className="flex">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="team.member@example.com" 
                  className="flex-1 border border-gray-300 rounded-l-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
                <button 
                  onClick={handleInvite}
                  disabled={teamMembers >= 5}
                  className={`px-6 py-3 rounded-r-lg font-medium flex items-center transition ${
                    teamMembers >= 5
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  <FaPlus className="mr-2" /> Invite
                </button>
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-sm text-gray-500">
                  {teamMembers < 5 ? (
                    `You can add ${5 - teamMembers} more team members`
                  ) : (
                    <span className="text-purple-700 font-medium">
                      Upgrade plan to add more members
                    </span>
                  )}
                </p>
                <button className="text-sm text-purple-600 hover:text-purple-800 font-medium">
                  Manage Team
                </button>
              </div>
            </div>
            
            {/* Team Members List (simplified) */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-700 mb-3">Current Team</h4>
              <div className="space-y-3">
                {[...Array(teamMembers)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-2 hover:bg-purple-50 rounded">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium">
                        {i+1}
                      </div>
                      <span className="ml-3 text-gray-700">
                        {i === 0 ? 'abhishekritu810219@gmail.com' : `team.member${i}@example.com`}
                      </span>
                    </div>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      {i === 0 ? 'Admin' : 'Member'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information with card visualization */}
      <div className="mt-8 bg-white p-8 rounded-xl border border-purple-100 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
          <FaRegCreditCard className="mr-3 text-purple-600" /> 
          Payment Information & Billing
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Payment Method */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-700 p-6 rounded-xl text-white">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-sm opacity-80 mb-1">Current Card</p>
                <h3 className="text-xl font-bold">VISA</h3>
              </div>
              <div className="bg-white text-purple-700 p-2 rounded-lg">
                <FaRegCreditCard className="text-2xl" />
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm opacity-80 mb-1">Card Number</p>
              <p className="text-xl tracking-wider">•••• •••• •••• 4242</p>
            </div>
            
            <div className="flex justify-between">
              <div>
                <p className="text-sm opacity-80 mb-1">Card Holder</p>
                <p className="text-lg">Abhishek Ritu</p>
              </div>
              <div>
                <p className="text-sm opacity-80 mb-1">Expires</p>
                <p className="text-lg">04/2025</p>
              </div>
            </div>
          </div>
          
          {/* Billing Details */}
          <div>
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">Next Billing Cycle</h4>
              <div className="flex items-center bg-purple-50 p-4 rounded-lg">
                <FaRegClock className="text-purple-500 text-2xl mr-4" />
                <div>
                  <p className="font-medium">
                    {billingCycle === 'monthly' ? 'Monthly' : 'Annual'} Renewal
                  </p>
                  <p className="text-gray-600">
                    {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <button className="w-full py-3 bg-white border border-purple-600 text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition">
                Update Payment Method
              </button>
              <button className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
                View Billing History
              </button>
              <button className="w-full py-3 bg-white border border-red-200 text-red-500 rounded-lg font-medium hover:bg-red-50 transition">
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-purple-50 p-6 rounded-xl border border-purple-100">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <IoMdHelpCircle className="text-3xl text-purple-500 mr-4" />
            <div>
              <h3 className="font-bold text-gray-800">Need help deciding?</h3>
              <p className="text-gray-600">Our team is happy to help you choose the right plan</p>
            </div>
          </div>
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition whitespace-nowrap">
            Contact Support
          </button>
        </div>
      </div>

      {/* Tooltip container */}
      {showTooltip === 'team' && (
        <div className="fixed bottom-6 right-6 bg-white p-4 rounded-lg shadow-xl border border-gray-200 max-w-xs z-50">
          <h4 className="font-bold text-purple-600 mb-1">Team Members</h4>
          <p className="text-sm text-gray-700">
            This shows how many team members you&lsquo;ve invited versus your plan limit.
            The Professional plan allows up to 5 team members to collaborate.
          </p>
        </div>
      )}
      
      {showTooltip === 'bills' && (
        <div className="fixed bottom-6 right-6 bg-white p-4 rounded-lg shadow-xl border border-gray-200 max-w-xs z-50">
          <h4 className="font-bold text-purple-600 mb-1">Monthly Bills</h4>
          <p className="text-sm text-gray-700">
            Lab bills processed this month. Each test, experiment, or analysis
            generates one bill. Your plan resets on the 1st of each month.
          </p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;