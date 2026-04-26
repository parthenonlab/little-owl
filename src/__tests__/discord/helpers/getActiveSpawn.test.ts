import { getActiveSpawn } from '@/discord/helpers';

const mockHour = (hour: number) => {
  jest.spyOn(Date.prototype, 'getHours').mockReturnValue(hour);
};

describe('getActiveSpawn', () => {
  afterEach(() => jest.restoreAllMocks());

  it('returns "day" at the start of the day window (4am)', () => {
    mockHour(4);
    expect(getActiveSpawn()).toBe('day');
  });

  it('returns "day" at the end of the day window (5pm)', () => {
    mockHour(17);
    expect(getActiveSpawn()).toBe('day');
  });

  it('returns "day" for midday', () => {
    mockHour(12);
    expect(getActiveSpawn()).toBe('day');
  });

  it('returns "night" just before the day window (3am)', () => {
    mockHour(3);
    expect(getActiveSpawn()).toBe('night');
  });

  it('returns "night" just after the day window (6pm)', () => {
    mockHour(18);
    expect(getActiveSpawn()).toBe('night');
  });

  it('returns "night" at midnight', () => {
    mockHour(0);
    expect(getActiveSpawn()).toBe('night');
  });

  it('returns "night" at the latest hour (11pm)', () => {
    mockHour(23);
    expect(getActiveSpawn()).toBe('night');
  });
});
