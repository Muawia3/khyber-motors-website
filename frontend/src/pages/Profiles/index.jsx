import React, { useState, useEffect } from 'react';
import { Container } from '../../components/common/Container';
import { SectionHeading } from '../../components/common/SectionHeading';
import { AnimatedSection } from '../../components/common/AnimatedSection';
import { TeamHierarchy } from '../../components/team/TeamHierarchy';
import { teamService } from '../../services/teamService';
import { Loader2, Users } from 'lucide-react';

export const ProfilesPage = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Our Team | Khyber Motors';
    let isMounted = true;

    const loadTeam = async () => {
      setLoading(true);
      try {
        const data = await teamService.getTeamMembers(true);
        if (isMounted && data) {
          setTeamMembers(data);
        }
      } catch (err) {
        console.error('Failed to load profiles:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadTeam();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6 pt-3 pb-6 bg-gray-50/50 min-h-screen">
      <Container size="xl">

        <AnimatedSection direction="up">
          <SectionHeading
            badge="Leadership & Expertise"
            title="Our Team"
            subtitle="Meet our executive leadership, sales consultants, and after-sales service professionals driving performance and customer satisfaction at Khyber Motors."
            align="center"
          />
        </AnimatedSection>
      </Container>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#C8102E] mx-auto" />
          <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
            Loading Organizational Profiles...
          </p>
        </div>
      ) : teamMembers.length === 0 ? (
        <Container size="xl">
          <div className="bg-white border border-gray-200 rounded-sm p-12 text-center space-y-4 max-w-2xl mx-auto shadow-sm">
            <Users className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">
              No Profiles Available
            </h3>
            <p className="text-xs text-gray-500">
              Team profiles are currently being updated by the dealership administration.
            </p>
          </div>
        </Container>
      ) : (
        <AnimatedSection direction="up" delay={200}>
          <TeamHierarchy teamMembers={teamMembers} hideHeader={true} />
        </AnimatedSection>
      )}
    </div>

  );
};

export default ProfilesPage;
