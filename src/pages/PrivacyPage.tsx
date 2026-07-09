import React from 'react';

export const PrivacyPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="bg-transparent border border-white/10 rounded-2xl p-8 md:p-12 shadow-sm space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-gray-400 text-sm">Last Updated: July 8, 2026</p>
        </div>

        <div className="prose max-w-none text-gray-300 space-y-6">
          <p>
            Welcome to E-Sports Pakistan (e-sports.pk). Your privacy is of paramount importance to us. This Privacy Policy document contains types of information that is collected and recorded by E-Sports Pakistan and how we use it.
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">1. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us when registering a profile, creating a team, or applying for sponsorships. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Account Credentials (name, email, password)</li>
              <li>Gaming Profiles (In-game ID, ranks, statistics, screenshots)</li>
              <li>Sponsor / Roster requirements and contact details</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">2. How We Use Your Information</h2>
            <p>
              We use the collected information to maintain and optimize our esports matchmaking system, including:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Connecting players with suitable teams and sponsors</li>
              <li>Displaying game-specific leaderboards and tournament brackets</li>
              <li>Verifying player credentials and rank statistics</li>
              <li>Preventing fraudulent behavior in tournaments</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">3. Information Sharing and Disclosure</h2>
            <p>
              Your public profile information, including gaming name, ranks, achievements, and public statistics, will be visible to other players, teams, and sponsors on the platform. Private contact details are only shared with your explicit consent during active contract negotiations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">4. Contact Us</h2>
            <p>
              If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at <a href="mailto:hello@e-sports.pk" className="text-[#1A73E8] hover:underline">hello@e-sports.pk</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
