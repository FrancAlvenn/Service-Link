import { parseRequiredSkills, scoreCandidate } from '../employeeMatching';

describe('employeeMatching utils', () => {
  test('parseRequiredSkills detects plumbing from text', () => {
    const skills = parseRequiredSkills({
      title: 'Fix the bathroom in the CCS Office',
      description: 'Leak in sink and faucet replacement',
      details: [{ particulars: 'Pipe repair', description: 'Replace leaking pipe' }],
    });
    expect(skills).toContain('Plumbing');
  });

  test('parseRequiredSkills uses job_category fallback', () => {
    const skills = parseRequiredSkills({ title: 'General task', job_category: 'Electrical' });
    expect(skills).toContain('Electrical');
  });

  test('scoreCandidate boosts seniority and specialization', () => {
    const candidate = {
      qualifications: ['Plumbing'],
      experience_level: 'Senior',
      specializations: ['CCS Office']
    };
    const { score, matches } = scoreCandidate(candidate, ['Plumbing'], 'Fix sink at CCS Office');
    expect(matches).toContain('Plumbing');
    expect(score).toBeGreaterThan(3); // 3 for match + 2 senior + 1 specialization = 6
  });
});

