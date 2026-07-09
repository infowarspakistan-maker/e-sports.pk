import React from 'react';

export const TermsPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="bg-transparent border border-white/10 rounded-2xl p-8 md:p-12 shadow-sm space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Terms of Service</h1>
          <p className="text-gray-400 text-sm">Last Updated: July 8, 2026</p>
        </div>

        <div className="prose max-w-none text-gray-300 space-y-6">
          <p>
            Welcome to E-Sports Pakistan. By accessing our platform (e-sports.pk), you agree to be bound by these Terms of Service. Please read them carefully.
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">1. Acceptable Use</h2>
            <p>
              You agree to use the platform only for lawful competitive and community purposes. You must not:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Cheat, hack, or exploit any game mechanics or tournament systems</li>
              <li>Impersonate other players or falsely claim ranks or tournament winnings</li>
              <li>Engage in toxic or abusive behavior towards other members of the community</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">2. Profiles and Teams</h2>
            <p>
              You are responsible for maintaining the accuracy of your profile information. Teams and players must verify their stats and ranks before taking part in official tournaments. E-Sports Pakistan reserves the right to suspend or remove any profile that contains fraudulent information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">3. Tournaments and Prize Pools</h2>
            <p>
              Prize pools, rules, brackets, and eligibility criteria are determined per tournament. Decisions made by the platform admins or tournament organizers are final and binding. E-Sports Pakistan is not liable for external organizer disputes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">4. Modifications to Service</h2>
            <p>
              We reserve the right to modify, suspend, or discontinue any aspect of the platform at any time without notice. We will not be liable to you or any third party for any such modification.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">5. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with the laws of Pakistan, without regard to its conflict of law provisions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
