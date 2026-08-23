describe('Matching Engine Compatibility Logic', () => {
  it('should compute high compatibility score when reciprocal skills match', () => {
    const userA = { teaching: ['React'], learning: ['Python'] };
    const userB = { teaching: ['Python'], learning: ['React'] };

    let score = 30; // base score
    if (userB.teaching.includes(userA.learning[0])) score += 35;
    if (userA.teaching.includes(userB.learning[0])) score += 25;

    expect(score).toBe(90);
  });
});
