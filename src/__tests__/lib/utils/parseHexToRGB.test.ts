import { parseHexToRGB } from '@/lib/utils';

describe('parseHexToRGB', () => {
  it('parses a full 6-digit hex with #', () => {
    expect(parseHexToRGB('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('parses a full 6-digit hex without #', () => {
    expect(parseHexToRGB('00ff00')).toEqual({ r: 0, g: 255, b: 0 });
  });

  it('parses a 3-digit shorthand hex with #', () => {
    expect(parseHexToRGB('#fff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('parses a 3-digit shorthand hex without #', () => {
    expect(parseHexToRGB('000')).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('is case-insensitive', () => {
    expect(parseHexToRGB('#FF8800')).toEqual(parseHexToRGB('#ff8800'));
  });

  it('returns null for an invalid hex string', () => {
    expect(parseHexToRGB('zzz')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(parseHexToRGB('')).toBeNull();
  });

  it('returns null for a partial hex', () => {
    expect(parseHexToRGB('#ff')).toBeNull();
  });
});
