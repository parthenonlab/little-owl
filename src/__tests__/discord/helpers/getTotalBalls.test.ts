import { getTotalBalls } from '@/discord/helpers/getTotalBalls';

describe('getTotalBalls', () => {
  it('sums all ball types', () => {
    expect(
      getTotalBalls({
        pokeball: 10,
        greatball: 5,
        ultraball: 3,
        masterball: 1,
      }),
    ).toBe(19);
  });

  it('returns 0 when all counts are 0', () => {
    expect(
      getTotalBalls({ pokeball: 0, greatball: 0, ultraball: 0, masterball: 0 }),
    ).toBe(0);
  });

  it('handles a single ball type with the rest at 0', () => {
    expect(
      getTotalBalls({ pokeball: 7, greatball: 0, ultraball: 0, masterball: 0 }),
    ).toBe(7);
  });
});
